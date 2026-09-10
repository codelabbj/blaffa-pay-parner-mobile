"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { translations, type Language, type TranslationKey } from "./translations"
import { authService, type User, type AuthResponse } from "./auth"
import { accountService, type AccountData } from "./account"
import { transactionsService, type Transaction } from "./transactions"
import { networksService, type Network } from "./networks"
import { createTransactionService, type CreateTransactionPayload } from "./create-transaction"
import { rechargeService, type RechargeData, type CreateRechargePayload } from "./recharge"

// Theme Context
type Theme = "light" | "dark" | "system"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: "light" | "dark"
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Initialize theme from localStorage if available, otherwise default to "system"
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme") as Theme
      return stored || "system"
    }
    return "system"
  })
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light")

  useEffect(() => {
    // Only run this effect on client side
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme") as Theme
      if (stored && stored !== theme) {
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
    // Only run this effect on client side
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("language") as Language
      if (stored && (stored === "en" || stored === "fr")) {
        setLanguage(stored)
      }
      setIsHydrated(true)
    }
  }, [])

  useEffect(() => {
    // Only run this effect on client side
    if (typeof window !== "undefined") {
      localStorage.setItem("language", language)
    }
  }, [language])

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
  isAuthenticated: boolean
  isLoading: boolean
  login: (identifier: string, password: string) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<void>
  refreshUser: () => Promise<void>
  refreshAccountData: () => Promise<void>
  refreshTransactions: () => Promise<void>
  refreshNetworks: () => Promise<void>
  refreshRecharges: () => Promise<void>
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
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const clearLocalAuthState = () => {
    setUser(null)
    setAccountData(null)
    setTransactions([])
    setNetworks([])
    setRecharges([])
    setIsAuthenticated(false)
  }

  const loadSecondaryBootstrapData = async (accessToken: string) => {
    try {
      const accountData = await accountService.getAccountData(accessToken)
      setAccountData(accountData)
    } catch (error) {
      console.error('Failed to fetch account data:', error)
    }

    try {
      const transactionsData = await transactionsService.getTransactions(accessToken, 1, 10)
      setTransactions(transactionsData.results)
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
    }

    try {
      const networksData = await networksService.getNetworks(accessToken)
      setNetworks(networksData.results)
    } catch (error) {
      console.error('Failed to fetch networks:', error)
    }

    try {
      const rechargesData = await rechargeService.getRecharges(accessToken, 1, 10)
      setRecharges(rechargesData.results)
    } catch (error) {
      console.error('Failed to fetch recharges:', error)
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

        const session = await authService.validateSession()

        if (session.status === 'unauthenticated') {
          // Tokens already cleared inside authService when definitive.
          clearLocalAuthState()
          return
        }

        if (session.status === 'transient_error') {
          // Keep tokens; stay "logged in" so the user is not bounced to login.
          console.warn('Auth check transient error, keeping session:', session.error)
          setIsAuthenticated(true)

          // Retry once in background to populate profile/data when network recovers.
          window.setTimeout(async () => {
            try {
              const retry = await authService.validateSession()
              if (retry.status === 'authenticated') {
                setUser(retry.user)
                const token = authService.getAccessToken()
                if (token) {
                  await loadSecondaryBootstrapData(token)
                }
              } else if (retry.status === 'unauthenticated') {
                clearLocalAuthState()
              }
            } catch (retryError) {
              console.warn('Auth retry failed, session kept:', retryError)
            }
          }, 2500)
          return
        }

        setUser(session.user)
        setIsAuthenticated(true)

        const accessToken = authService.getAccessToken()
        if (accessToken) {
          await loadSecondaryBootstrapData(accessToken)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        // Keep session if tokens are still present (network blip).
        if (authService.isAuthenticated()) {
          setIsAuthenticated(true)
        }
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (identifier: string, password: string): Promise<void> => {
    try {
      setIsLoading(true)
      await authService.login(identifier, password)

      const userProfile = await authService.getUserProfile()
      setUser(userProfile)

      const accessToken = authService.getAccessToken()
      if (accessToken) {
        await loadSecondaryBootstrapData(accessToken)
      }

      setIsAuthenticated(true)
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
        const data = await networksService.getNetworks(accessToken)
        setNetworks(data.results)
      }
    } catch (error) {
      console.error('Failed to refresh networks:', error)
      throw error
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
      setUser(result.user)
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
      isAuthenticated,
      isLoading,
      login,
      logout,
      refreshToken,
      refreshUser,
      refreshAccountData,
      refreshTransactions,
      refreshNetworks,
      refreshRecharges,
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
