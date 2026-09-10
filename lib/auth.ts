// Authentication service for handling login, token management, and refresh

import { parseBackendError, formatErrorMessage } from './error-utils'

export interface User {
  uid: string;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  email_verified: boolean;
  phone_verified: boolean;
  display_name: string;
  is_verified: boolean;
  contact_method: string;
  created_at: string;
  updated_at: string;
  // Permissions
  can_use_momo_pay?: boolean;
  can_use_mobcash_betting?: boolean;
  can_use_transfer?: boolean;
  can_process_ussd_transaction?: boolean;
  can_process_momo?: boolean;
  can_process_mobcash?: boolean;
  can_process_bulk_payment?: boolean;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface RefreshResponse {
  access: string;
  refresh?: string;
}

export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface RefreshPayload {
  refresh: string;
}

/** Result of cold-start / session validation — never treat network blips as logout. */
export type SessionValidationResult =
  | { status: 'authenticated'; user: User }
  | { status: 'unauthenticated' }
  | { status: 'transient_error'; error: unknown };

class AuthService {
  private baseUrl: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private refreshTimer: ReturnType<typeof setTimeout> | null = null;
  private logoutListeners: Set<() => void> = new Set();
  private refreshingPromise: Promise<RefreshResponse> | null = null;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('access_token');
      this.refreshToken = localStorage.getItem('refresh_token');

      // Access tokens last ~300 days server-side — only schedule near real JWT exp.
      if (this.accessToken && this.refreshToken) {
        this.scheduleTokenRefresh();
      }
    }
  }

  /** Sync React (or other) state when tokens are cleared. */
  onLogout(listener: () => void): () => void {
    this.logoutListeners.add(listener);
    return () => {
      this.logoutListeners.delete(listener);
    };
  }

  async login(identifier: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier,
          password,
        }),
      });

      if (!response.ok) {
        const errorData = await this.safeJson(response);

        if (response.status === 401) {
          throw new Error('Invalid credentials. Please check your email/phone and password.');
        } else if (response.status === 400) {
          const parsedError = parseBackendError(errorData)
          const formattedMessage = formatErrorMessage(parsedError)
          throw new Error(formattedMessage)
        } else if (response.status === 429) {
          throw new Error('Too many login attempts. Please try again later.');
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        } else {
          throw new Error((errorData as { detail?: string })?.detail || 'Login failed. Please try again.');
        }
      }

      const data: AuthResponse = await response.json();
      this.setTokens(data.access, data.refresh);
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Refresh access token.
   * Only clears the session on definitive auth failures (401/403 from refresh endpoint).
   * Network / 5xx errors keep tokens so the user is not kicked offline.
   */
  async refreshAccessToken(): Promise<RefreshResponse> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    // Dedupe concurrent refresh calls (rotation + blacklist would invalidate siblings).
    if (this.refreshingPromise) {
      return this.refreshingPromise;
    }

    this.refreshingPromise = this.doRefreshAccessToken().finally(() => {
      this.refreshingPromise = null;
    });

    return this.refreshingPromise;
  }

  private async doRefreshAccessToken(): Promise<RefreshResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh: this.refreshToken,
        }),
      });

      if (!response.ok) {
        const errorData = await this.safeJson(response);
        const message =
          (errorData as { detail?: string })?.detail || 'Token refresh failed';

        // Only definitive invalid-refresh responses should wipe the session.
        if (response.status === 401 || response.status === 403) {
          this.logout();
        }

        throw new Error(message);
      }

      const data: RefreshResponse = await response.json();
      const nextRefresh = data.refresh || this.refreshToken;
      if (!nextRefresh) {
        throw new Error('Token refresh returned no refresh token');
      }
      this.setTokens(data.access, nextRefresh);
      return data;
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  }

  async getUserProfile(): Promise<User> {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/auth/profile/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await this.safeJson(response);
        throw new Error((errorData as { detail?: string })?.detail || 'Failed to get user profile');
      }

      return await response.json();
    } catch (error) {
      console.error('Get user profile error:', error);
      throw error;
    }
  }

  /**
   * Validate session for app bootstrap.
   * - authenticated: profile OK (possibly after one refresh)
   * - unauthenticated: no tokens or refresh rejected as invalid
   * - transient_error: network / server issues — keep tokens
   */
  async validateSession(): Promise<SessionValidationResult> {
    if (!this.accessToken || !this.refreshToken) {
      return { status: 'unauthenticated' };
    }

    try {
      const first = await this.fetchProfile();
      if (first.ok) {
        return { status: 'authenticated', user: first.user };
      }

      if (first.status === 401 || first.status === 403) {
        try {
          await this.refreshAccessToken();
        } catch (refreshError) {
          // refreshAccessToken already logged out on 401/403
          if (!this.isAuthenticated()) {
            return { status: 'unauthenticated' };
          }
          return { status: 'transient_error', error: refreshError };
        }

        const second = await this.fetchProfile();
        if (second.ok) {
          return { status: 'authenticated', user: second.user };
        }
        if (second.status === 401 || second.status === 403) {
          this.logout();
          return { status: 'unauthenticated' };
        }
        return {
          status: 'transient_error',
          error: new Error(`Profile check failed after refresh (${second.status})`),
        };
      }

      // 5xx / other — do not clear session
      return {
        status: 'transient_error',
        error: new Error(`Profile check failed (${first.status})`),
      };
    } catch (error) {
      console.error('Token validation error:', error);
      return { status: 'transient_error', error };
    }
  }

  /** @deprecated Prefer validateSession — kept for callers that only need User | null */
  async validateToken(): Promise<User | null> {
    const result = await this.validateSession();
    if (result.status === 'authenticated') {
      return result.user;
    }
    return null;
  }

  private async fetchProfile(): Promise<
    | { ok: true; user: User }
    | { ok: false; status: number }
  > {
    const response = await fetch(`${this.baseUrl}/api/auth/profile/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      return { ok: false, status: response.status };
    }

    const user: User = await response.json();
    return { ok: true, user };
  }

  private async safeJson(response: Response): Promise<unknown> {
    try {
      return await response.json();
    } catch {
      return {};
    }
  }

  private setTokens(access: string, refresh: string): void {
    this.accessToken = access;
    this.refreshToken = refresh;

    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
    }

    this.scheduleTokenRefresh();
  }

  /**
   * Schedule a single refresh near JWT `exp`.
   * Backend access TTL is ~300 days — do NOT refresh every 55 minutes
   * (that caused logouts under ROTATE_REFRESH_TOKENS + blacklist).
   * setTimeout max is ~24.8 days; if further out, skip until next app open.
   */
  private scheduleTokenRefresh(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }

    if (!this.accessToken || !this.refreshToken) {
      return;
    }

    const expMs = this.getJwtExpiryMs(this.accessToken);
    if (!expMs) {
      return;
    }

    const refreshSkewMs = 24 * 60 * 60 * 1000; // 1 day before expiry
    const delayMs = expMs - Date.now() - refreshSkewMs;
    const maxTimeout = 2147483647; // ~24.8 days

    // Token still valid for a long time — next cold start will reschedule.
    if (delayMs > maxTimeout) {
      return;
    }

    // Already past skew window: refresh soon (not immediately in a tight loop).
    const wait = Math.max(delayMs, 60_000);

    this.refreshTimer = setTimeout(async () => {
      try {
        await this.refreshAccessToken();
      } catch (error) {
        // Do not logout on transient errors — refreshAccessToken already
        // clears tokens only on definitive 401/403.
        console.error('Scheduled token refresh failed:', error);
      }
    }, wait);
  }

  private getJwtExpiryMs(token: string): number | null {
    try {
      const parts = token.split('.');
      if (parts.length < 2) return null;
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      if (typeof payload.exp !== 'number') return null;
      return payload.exp * 1000;
    } catch {
      return null;
    }
  }

  logout(): void {
    const hadSession = !!(this.accessToken || this.refreshToken);

    this.accessToken = null;
    this.refreshToken = null;

    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }

    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }

    if (hadSession) {
      this.logoutListeners.forEach((listener) => {
        try {
          listener();
        } catch (e) {
          console.error('Logout listener error:', e);
        }
      });
    }
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  isAuthenticated(): boolean {
    return !!this.accessToken && !!this.refreshToken;
  }

  getAuthHeaders(): Record<string, string> {
    if (!this.accessToken) {
      return {
        'Content-Type': 'application/json',
      };
    }

    return {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    };
  }

  async requestPasswordReset(identifier: string): Promise<{ message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/password-reset/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier }),
      });

      const data = await response.json();

      if (!response.ok) {
        const parsedError = parseBackendError(data);
        const formattedMessage = formatErrorMessage(parsedError);
        throw new Error(formattedMessage);
      }

      return data;
    } catch (error) {
      console.error('Password reset request error:', error);
      throw error;
    }
  }

  async confirmPasswordReset(payload: { identifier: string, code: string, new_password: string }): Promise<{ message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/password-reset/confirm/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        const parsedError = parseBackendError(data);
        const formattedMessage = formatErrorMessage(parsedError);
        throw new Error(formattedMessage);
      }

      return data;
    } catch (error) {
      console.error('Password reset confirm error:', error);
      throw error;
    }
  }

  async updateProfile(updates: Partial<User>): Promise<{ message: string, user: User, changes: string[] }> {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/auth/profile/`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (!response.ok) {
        const parsedError = parseBackendError(data);
        const formattedMessage = formatErrorMessage(parsedError);
        throw new Error(formattedMessage);
      }

      return data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  async updatePassword(payload: { old_password: string, new_password: string }): Promise<{ message: string }> {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/auth/password-update/`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        const parsedError = parseBackendError(data);
        const formattedMessage = formatErrorMessage(parsedError);
        throw new Error(formattedMessage);
      }

      return data;
    } catch (error) {
      console.error('Update password error:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();
