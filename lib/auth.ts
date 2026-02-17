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
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface RefreshResponse {
  access: string;
  refresh: string;
}

export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface RefreshPayload {
  refresh: string;
}

class AuthService {
  private baseUrl: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private refreshTimer: NodeJS.Timeout | null = null;

  constructor() {
    // You can set this from environment variables
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

    // Load tokens from localStorage on initialization
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('access_token');
      this.refreshToken = localStorage.getItem('refresh_token');

      // Start automatic refresh if we have tokens
      if (this.accessToken && this.refreshToken) {
        this.startTokenRefresh();
      }
    }
  }

  // Login method
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
        const errorData = await response.json();

        // Handle different types of errors
        if (response.status === 401) {
          throw new Error('Invalid credentials. Please check your email/phone and password.');
        } else if (response.status === 400) {
          // Handle validation errors using structured error parsing
          const parsedError = parseBackendError(errorData)
          const formattedMessage = formatErrorMessage(parsedError)
          throw new Error(formattedMessage)
        } else if (response.status === 429) {
          throw new Error('Too many login attempts. Please try again later.');
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        } else {
          throw new Error(errorData.detail || 'Login failed. Please try again.');
        }
      }

      const data: AuthResponse = await response.json();

      // Store tokens
      this.setTokens(data.access, data.refresh);

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Refresh token method
  async refreshAccessToken(): Promise<RefreshResponse> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

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
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Token refresh failed');
      }

      const data: RefreshResponse = await response.json();

      // Update tokens
      this.setTokens(data.access, data.refresh);

      return data;
    } catch (error) {
      console.error('Token refresh error:', error);
      // If refresh fails, clear tokens and redirect to login
      this.logout();
      throw error;
    }
  }

  // Get user profile
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
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to get user profile');
      }

      const user: User = await response.json();
      return user;
    } catch (error) {
      console.error('Get user profile error:', error);
      throw error;
    }
  }

  // Validate token method
  async validateToken(): Promise<boolean> {
    if (!this.accessToken) {
      return false;
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/auth/profile/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }

  // Set tokens and store in localStorage
  private setTokens(access: string, refresh: string): void {
    this.accessToken = access;
    this.refreshToken = refresh;

    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
    }

    // Start automatic refresh
    this.startTokenRefresh();
  }

  // Start automatic token refresh
  private startTokenRefresh(): void {
    // Clear existing timer
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    // Refresh token 5 minutes before expiry (assuming 1 hour expiry)
    const refreshInterval = 55 * 60 * 1000; // 55 minutes in milliseconds

    this.refreshTimer = setTimeout(async () => {
      try {
        await this.refreshAccessToken();
      } catch (error) {
        console.error('Automatic token refresh failed:', error);
        this.logout();
      }
    }, refreshInterval);
  }

  // Logout method
  logout(): void {
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
  }

  // Get current access token
  getAccessToken(): string | null {
    return this.accessToken;
  }

  // Get current refresh token
  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.accessToken && !!this.refreshToken;
  }

  // Get authenticated headers for API calls
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

  // Request password reset OTP
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

  // Confirm password reset with OTP
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

  // Update user profile
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

  // Update password (while logged in)
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

// Create singleton instance
export const authService = new AuthService();
