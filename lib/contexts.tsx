"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { translations, type Language, type TranslationKey } from "./translations"
import { authService, type User, type AuthResponse } from "./auth"
import { accountService, type AccountData } from "./account"
import { transactionsService, type Transaction } from "./transactions"
import { networksService, type Network } from "./networks"
import { createTransactionService, type CreateTransactionPayload } from "./create-transaction"
import { rechargeService, type RechargeData, type CreateRechargePayload } from "./recharge"
import { partnerV2Service, type PartnerV2ActivityItem } from "./partner-v2"

// Theme Context
type Theme = "light" | "dark" | "system"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: "light" | "dark"
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Cahier / PDF : design livré en clair (fond #EEF2F8). Dark = option réglages.
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme") as Theme
      if (stored === "light" || stored === "dark" || stored === "system") return stored
    }
    return "light"
  })
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light")

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme") as Theme
      if (stored && stored !== theme && (stored === "light" || stored === "dark" || stored === "system")) {
        setTheme(stored)
      }
    }
  }, [])

  useEffect(() => {
    // Only run this effect on client side
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", theme)

      if (theme === "system") {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
        const systemTheme = mediaQuery.matches ? "dark" : "light"
        setResolvedTheme(systemTheme)
        document.documentElement.classList.toggle("dark", systemTheme === "dark")

        // Listen for system theme changes
        const handleSystemThemeChange = (e: MediaQueryListEvent) => {
          const newSystemTheme = e.matches ? "dark" : "light"
          setResolvedTheme(newSystemTheme)
          document.documentElement.classList.toggle("dark", newSystemTheme === "dark")
        }

        mediaQuery.addEventListener("change", handleSystemThemeChange)
        return () => mediaQuery.removeEventListener("change", handleSystemThemeChange)
      } else {
        setResolvedTheme(theme)
        document.documentElement.classList.toggle("dark", theme === "dark")
      }
    }
  }, [theme])

  return <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

// Language Context
interface LanguageContextType {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string, params?: Record<string, any>) => string
  isHydrated: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("fr") // Always start with default
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    const stored = localStorage.getItem("language") as Language
    if (stored === "en" || stored === "fr") {
      setLanguage(stored)
    }
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    // Ne pas écraser le localStorage avant hydratation (sinon FR écrase EN au boot)
    if (typeof window === "undefined" || !isHydrated) return
    localStorage.setItem("language", language)
  }, [language, isHydrated])

  const t = (key: string, params?: Record<string, any>): string => {
    const keys = key.split('.')
    let value: any = translations[language]

    for (const k of keys) {
      value = value?.[k]
    }

    if (value === undefined) {
      value = translations.en
      for (const k of keys) {
        value = value?.[k]
      }
    }

    if (typeof value === 'string') {
      return params ? value.replace(/\{\{(\w+)\}\}/g, (_, param) => params[param] || '') : value
    }

    return key
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t, isHydrated }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}

export const useTranslation = useLanguage

// Authentication Context
interface AuthContextType {
  user: User | null
  accountData: AccountData | null
  transactions: Transaction[]
  networks: Network[]
  recharges: RechargeData[]
  activity: PartnerV2ActivityItem[]
  isAuthenticated: boolean
  isLoading: boolean
  isAuthChecking: boolean
  login: (identifier: string, password: string) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<void>
  refreshUser: () => Promise<void>
  refreshAccountData: () => Promise<void>
  refreshTransactions: () => Promise<void>
  refreshNetworks: () => Promise<void>
  refreshRecharges: () => Promise<void>
  refreshBootstrap: () => Promise<void>
  createTransaction: (payload: CreateTransactionPayload) => Promise<void>
  createRecharge: (payload: CreateRechargePayload) => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<void>
  updatePassword: (payload: { old_password: string, new_password: string }) => Promise<void>
  requestPasswordReset: (identifier: string) => Promise<{ message: string }>
  confirmPasswordReset: (payload: { identifier: string, code: string, new_password: string }) => Promise<{ message: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [accountData, setAccountData] = useState<AccountData | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [networks, setNetworks] = useState<Network[]>([])
  const [recharges, setRecharges] = useState<RechargeData[]>([])
  const [activity, setActivity] = useState<PartnerV2ActivityItem[]>([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthChecking, setIsAuthChecking] = useState(true)

  const clearLocalAuthState = () => {
    setUser(null)
    setAccountData(null)
    setTransactions([])
    setNetworks([])
    setRecharges([])
    setActivity([])
    setIsAuthenticated(false)
  }

  const loadLazyData = async (accessToken: string) => {
    try {
      const networksData = await partnerV2Service.getNetworks(accessToken)
      setNetworks(networksData.results)
    } catch (error) {
      try {
        const networksData = await networksService.getNetworks(accessToken)
        setNetworks(networksData.results)
      } catch (fallbackError) {
        console.error('Failed to fetch networks:', fallbackError)
      }
    }
  }

  const applyBootstrap = (data: { user: User; account: AccountData; activity: PartnerV2ActivityItem[] }) => {
    setUser(data.user)
    setAccountData(data.account)
    setActivity(data.activity || [])
    setIsAuthenticated(true)
  }

  const loadBootstrap = async (accessToken: string): Promise<boolean> => {
    try {
      const data = await partnerV2Service.getBootstrap(accessToken)
      applyBootstrap(data)
      void loadLazyData(accessToken)
      return true
    } catch (error) {
      console.error('Partner v2 bootstrap failed:', error)
      try {
        const [profile, account] = await Promise.all([
          authService.getUserProfile(),
          accountService.getAccountData(accessToken),
        ])
        setUser(profile)
        setAccountData(account)
        setIsAuthenticated(true)
        void loadLazyData(accessToken)
        return true
      } catch (fallbackError) {
        console.error('Bootstrap fallback failed:', fallbackError)
        return false
      }
    }
  }

  useEffect(() => {
    // Keep React state in sync if authService clears tokens (e.g. invalid refresh).
    return authService.onLogout(() => {
      clearLocalAuthState()
    })
  }, [])

  useEffect(() => {
    // Check if user is already authenticated on app load.
    // Do NOT wipe tokens on slow network / bootstrap timeouts.
    const checkAuth = async () => {
      try {
        if (!authService.isAuthenticated()) {
          return
        }

        const accessToken = authService.getAccessToken()
        if (accessToken) {
          const bootstrapped = await loadBootstrap(accessToken)
          if (bootstrapped) {
            return
          }
        }

        const session = await authService.validateSession()

        if (session.status === 'unauthenticated') {
          clearLocalAuthState()
          return
        }

        if (session.status === 'transient_error') {
          console.warn('Auth check transient error, keeping session:', session.error)
          setIsAuthenticated(true)
          window.setTimeout(async () => {
            try {
              const token = authService.getAccessToken()
              if (token) {
                await loadBootstrap(token)
              }
            } catch (retryError) {
              console.warn('Auth retry failed, session kept:', retryError)
            }
          }, 2500)
          return
        }

        setUser(session.user)
        setIsAuthenticated(true)
        const retryToken = authService.getAccessToken()
        if (retryToken) {
          await loadBootstrap(retryToken)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        if (authService.isAuthenticated()) {
          setIsAuthenticated(true)
        }
      } finally {
        setIsAuthChecking(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (identifier: string, password: string): Promise<void> => {
    try {
      setIsLoading(true)
      const authResponse = await authService.login(identifier, password)
      setUser(authResponse.user)
      setIsAuthenticated(true)

      const accessToken = authService.getAccessToken()
      if (accessToken) {
        await loadBootstrap(accessToken)
      }
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = (): void => {
    authService.logout()
    clearLocalAuthState()
  }

  const refreshToken = async (): Promise<void> => {
    try {
      await authService.refreshAccessToken()
    } catch (error) {
      console.error('Token refresh failed:', error)
      // authService already logs out on definitive 401/403; do not wipe on network errors.
      if (!authService.isAuthenticated()) {
        clearLocalAuthState()
      }
      throw error
    }
  }

  const refreshUser = async (): Promise<void> => {
    try {
      const accessToken = authService.getAccessToken()
      if (accessToken) {
        const userProfile = await authService.getUserProfile()
        setUser(userProfile)
      }
    } catch (error) {
      console.error('Failed to refresh user profile:', error)
      throw error
    }
  }

  const refreshAccountData = async (): Promise<void> => {
    try {
      const accessToken = authService.getAccessToken()
      if (accessToken) {
        const data = await accountService.getAccountData(accessToken)
        setAccountData(data)
      }
    } catch (error) {
      console.error('Failed to refresh account data:', error)
      throw error
    }
  }

  const refreshTransactions = async (): Promise<void> => {
    try {
      const accessToken = authService.getAccessToken()
      if (accessToken) {
        const data = await transactionsService.getTransactions(accessToken, 1, 10)
        setTransactions(data.results)
      }
    } catch (error) {
      console.error('Failed to refresh transactions:', error)
      throw error
    }
  }

  const refreshNetworks = async (): Promise<void> => {
    try {
      const accessToken = authService.getAccessToken()
      if (accessToken) {
        try {
          const data = await partnerV2Service.getNetworks(accessToken)
          setNetworks(data.results)
        } catch {
          const data = await networksService.getNetworks(accessToken)
          setNetworks(data.results)
        }
      }
    } catch (error) {
      console.error('Failed to refresh networks:', error)
      throw error
    }
  }

  const refreshBootstrap = async (): Promise<void> => {
    const accessToken = authService.getAccessToken()
    if (!accessToken) return
    const ok = await loadBootstrap(accessToken)
    if (!ok) {
      await refreshAccountData()
    }
  }

  const refreshRecharges = async (): Promise<void> => {
    try {
      const accessToken = authService.getAccessToken()
      if (accessToken) {
        const data = await rechargeService.getRecharges(accessToken, 1, 10)
        setRecharges(data.results)
      }
    } catch (error) {
      console.error('Failed to refresh recharges:', error)
      throw error
    }
  }

  const createTransaction = async (payload: CreateTransactionPayload): Promise<void> => {
    try {
      const accessToken = authService.getAccessToken()
      if (accessToken) {
        await createTransactionService.createTransaction(accessToken, payload)
        // Refresh transactions after creating a new one
        await refreshTransactions()
        // Refresh account data to update balance
        await refreshAccountData()
      }
    } catch (error) {
      console.error('Failed to create transaction:', error)
      throw error
    }
  }

  const createRecharge = async (payload: CreateRechargePayload) => {
    try {
      const accessToken = authService.getAccessToken()
      if (accessToken) {
        await rechargeService.createRecharge(accessToken, payload)
        // Refresh recharges after creating a new one
        await refreshRecharges()
        // Refresh account data to update balance
        await refreshAccountData()
      }
    } catch (error) {
      console.error('Failed to create recharge:', error)
      throw error
    }
  }

  const updateProfile = async (updates: Partial<User>) => {
    try {
      const result = await authService.updateProfile(updates)
      if (result?.user) {
        setUser(result.user)
      } else {
        setUser((prev) => (prev ? { ...prev, ...updates } : prev))
      }
    } catch (error) {
      console.error('Failed to update profile:', error)
      throw error
    }
  }

  const updatePassword = async (payload: { old_password: string, new_password: string }) => {
    try {
      await authService.updatePassword(payload)
    } catch (error) {
      console.error('Failed to update password:', error)
      throw error
    }
  }

  const requestPasswordReset = async (identifier: string) => {
    try {
      return await authService.requestPasswordReset(identifier)
    } catch (error) {
      console.error('Failed to request password reset:', error)
      throw error
    }
  }

  const confirmPasswordReset = async (payload: { identifier: string, code: string, new_password: string }) => {
    try {
      return await authService.confirmPasswordReset(payload)
    } catch (error) {
      console.error('Failed to confirm password reset:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      accountData,
      transactions,
      networks,
      recharges,
      activity,
      isAuthenticated,
      isLoading,
      isAuthChecking,
      login,
      logout,
      refreshToken,
      refreshUser,
      refreshAccountData,
      refreshTransactions,
      refreshNetworks,
      refreshRecharges,
      refreshBootstrap,
      createTransaction,
      createRecharge,
      updateProfile,
      updatePassword,
      requestPasswordReset,
      confirmPasswordReset
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
