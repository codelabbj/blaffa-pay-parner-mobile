"use client"

import { useState, useEffect } from "react"
import { SplashScreen } from "@/components/splash-screen"
import { LoginScreen } from "@/components/login-screen"
import { DashboardScreen } from "@/components/dashboard-screen"
import { DepositScreen } from "@/components/deposit-screen"
import { WithdrawScreen } from "@/components/withdraw-screen"
import { RechargeScreen } from "@/components/recharge-screen"
import { SettingsScreen } from "@/components/settings-screen"
import { ProfileScreen } from "@/components/profile-screen"
import { TransactionHistoryScreen } from "@/components/transaction-history-screen"
import { RechargeHistoryScreen } from "@/components/recharge-history-screen"
import { TransferScreen } from "@/components/transfer-screen"
import { TransferHistoryScreen } from "@/components/transfer-history-screen"
import { BettingPlatformsScreen } from "@/components/betting-platforms-screen"
import { BettingDepositScreen } from "@/components/betting-deposit-screen"
import { BettingWithdrawScreen } from "@/components/betting-withdraw-screen"
import { BettingTransactionsScreen } from "@/components/betting-transactions-screen"
import { BettingCommissionsScreen } from "@/components/betting-commissions-screen"
import { NotificationScreen } from "@/components/notification-screen"
import { PermissionDeniedScreen } from "@/components/permission-denied-screen"
import { ErrorBoundary } from "@/components/error-boundary"
import { useTheme } from "@/lib/contexts"
import { useAuth } from "@/lib/contexts"
import { mobileBackButtonHandler } from "@/lib/mobile-back-button"
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  CreditCard, 
  Settings, 
  Bell, 
  Clock, 
  LogOut 
} from "lucide-react"

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<"splash" | "login" | "dashboard" | "deposit" | "withdraw" | "recharge" | "settings" | "profile" | "transaction-history" | "recharge-history" | "transfer" | "transfer-history" | "betting-platforms" | "betting-deposit" | "betting-withdraw" | "betting-transactions" | "betting-commissions" | "notifications" | "permission-denied">("splash")
  const [selectedPlatformUid, setSelectedPlatformUid] = useState<string | undefined>(undefined)
  const [splashCompleted, setSplashCompleted] = useState(false)
  const [navigationHistory, setNavigationHistory] = useState<string[]>([])
  const [bettingTransactionType, setBettingTransactionType] = useState<"deposit" | "withdraw" | undefined>(undefined)
  const { theme } = useTheme()
  const { isAuthenticated, isLoading, logout, user, refreshAccountData, refreshTransactions, refreshRecharges } = useAuth()

  const handleSplashComplete = () => {
    setSplashCompleted(true)
  }

  const handleLogin = () => {
    setCurrentScreen("dashboard")
    setNavigationHistory(["dashboard"])
  }

  const handleLogout = () => {
    logout()
    setCurrentScreen("login")
    setNavigationHistory([])
  }

  // Handle successful transaction - refresh all dashboard data
  const handleTransactionSuccess = async () => {
    try {
      // Refresh all dashboard data in parallel
      await Promise.all([
        refreshAccountData(),
        refreshTransactions(),
        refreshRecharges()
      ])
    } catch (error) {
      console.error('Failed to refresh dashboard data after transaction:', error)
    }
  }

  // Navigation helper functions
  const navigateToScreen = (screen: string) => {
    setNavigationHistory(prev => [...prev, currentScreen])
    setCurrentScreen(screen as any)
  }

  const navigateBack = () => {
    if (navigationHistory.length > 0) {
      const previousScreen = navigationHistory[navigationHistory.length - 1]
      setNavigationHistory(prev => prev.slice(0, -1))
      setCurrentScreen(previousScreen as any)
    } else {
      // Fallback to dashboard if no history
      setCurrentScreen("dashboard")
    }
  }

  // Permission check functions
  const checkUSSDTransactionPermission = () => {
    return user && user.can_process_ussd_transaction !== false
  }

  const handlePermissionDenied = () => {
    setCurrentScreen("permission-denied")
  }

  // Handle authentication state changes
  useEffect(() => {
    if (!isLoading && splashCompleted) {
      if (isAuthenticated) {
        setCurrentScreen("dashboard")
        setNavigationHistory(["dashboard"])
      } else {
        setCurrentScreen("login")
        setNavigationHistory([])
      }
    }
  }, [isAuthenticated, isLoading, splashCompleted])

  // Handle mobile hardware back button
  useEffect(() => {
    const handleBackButton = () => {
      // Check if we have navigation history
      if (navigationHistory.length > 0) {
        navigateBack()
      } else if (currentScreen !== "dashboard" && currentScreen !== "login") {
        // If no history but not on main screens, go to dashboard
        setCurrentScreen("dashboard")
        setNavigationHistory(["dashboard"])
      }
      // If on login or dashboard with no history, do nothing (stay in app)
    }

    // Initialize mobile back button handler
    mobileBackButtonHandler.initialize(handleBackButton)

    // Cleanup
    return () => {
      mobileBackButtonHandler.cleanup()
    }
  }, [navigationHistory, currentScreen, navigateBack])

  // Initialize browser history on first load
  useEffect(() => {
    if (currentScreen !== "splash" && window.history.state === null) {
      window.history.replaceState({ screen: currentScreen }, '', window.location.href)
    }
  }, [currentScreen])

  // Show splash screen until it's completed
  if (currentScreen === "splash") {
    return <SplashScreen onComplete={handleSplashComplete} />
  }

  // Show loading state while checking authentication after splash
  if (!splashCompleted || isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-sm opacity-70">Loading...</p>
        </div>
      </div>
    )
  }

  // Show login screen if not authenticated
  if (!isAuthenticated && currentScreen === "login") {
    return <LoginScreen onLogin={handleLogin} />
  }

  return (
    <ErrorBoundary>
      <div className={`min-h-screen transition-colors duration-300 ${
        theme === "dark" 
          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" 
          : "bg-gradient-to-br from-blue-50 via-white to-blue-50"
      }`}>
        {/* Mobile-First Layout Structure */}
        <div className="flex flex-col min-h-screen">
          {/* Top Bar - Only show when authenticated */}
          {/* {isAuthenticated && currentScreen !== "login" && (
            <div className={`h-16 flex items-center justify-between px-4 ${
              theme === "dark" 
                ? "bg-slate-800/90 backdrop-blur-sm border-b border-slate-700" 
                : "bg-white/90 backdrop-blur-sm border-b border-gray-200"
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl ${
                  theme === "dark" 
                    ? "bg-gradient-to-br from-blue-500 to-purple-600" 
                    : "bg-gradient-to-br from-blue-500 to-purple-600"
                } flex items-center justify-center`}>
                  <img src="/logo.png" alt="BlaffaPay" className="w-5 h-5" />
                </div>
                <div>
                  <h2 className={`text-lg font-semibold ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}>
                    {currentScreen === "dashboard" && "Dashboard"}
                    {currentScreen === "deposit" && "Deposit"}
                    {currentScreen === "withdraw" && "Withdraw"}
                    {currentScreen === "recharge" && "Recharge"}
                    {currentScreen === "transaction-history" && "History"}
                    {currentScreen === "recharge-history" && "Recharge History"}
                    {currentScreen === "transfer" && "Transfert UV"}
                    {currentScreen === "transfer-history" && "Historique des transferts"}
                    {currentScreen === "settings" && "Settings"}
                    {currentScreen === "profile" && "Profile"}
                  </h2>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className={`p-2 rounded-lg ${
                  theme === "dark" 
                    ? "hover:bg-slate-700 text-slate-300" 
                    : "hover:bg-gray-100 text-gray-600"
                }`}>
                  <Bell className="w-5 h-5" />
                </button>
                <button
                  onClick={handleLogout}
                  className={`p-2 rounded-lg ${
                    theme === "dark" 
                      ? "hover:bg-slate-700 text-slate-300" 
                      : "hover:bg-gray-100 text-gray-600"
                  }`}
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          )} */}

          {/* Main Content Area */}
          <div className="flex-1 overflow-auto ">
            {currentScreen === "dashboard" && (
              <DashboardScreen 
                onNavigateToSettings={() => navigateToScreen("settings")} 
                onNavigateToDeposit={() => {
                  if (checkUSSDTransactionPermission()) {
                    navigateToScreen("deposit")
                  } else {
                    handlePermissionDenied()
                  }
                }}
                onNavigateToWithdraw={() => {
                  if (checkUSSDTransactionPermission()) {
                    navigateToScreen("withdraw")
                  } else {
                    handlePermissionDenied()
                  }
                }}
                onNavigateToRecharge={() => navigateToScreen("recharge")}
                onNavigateToTransfer={() => navigateToScreen("transfer")}
                onNavigateToTransactionHistory={() => {
                  if (checkUSSDTransactionPermission()) {
                    navigateToScreen("transaction-history")
                  } else {
                    handlePermissionDenied()
                  }
                }}
                onNavigateToRechargeHistory={() => navigateToScreen("recharge-history")}
                onNavigateToTransferHistory={() => navigateToScreen("transfer-history")}
                onNavigateToBettingPlatforms={(transactionType) => {
                  setBettingTransactionType(transactionType)
                  navigateToScreen("betting-platforms")
                }}
                onNavigateToBettingTransactions={() => navigateToScreen("betting-transactions")}
                onNavigateToBettingCommissions={() => navigateToScreen("betting-commissions")}
                onNavigateToBettingDeposit={() => navigateToScreen("betting-deposit")}
                onNavigateToBettingWithdraw={() => navigateToScreen("betting-withdraw")}
                onNavigateToNotifications={() => navigateToScreen("notifications")}
                onLogout={handleLogout} 
              />
            )}
            {currentScreen === "deposit" && (
              <DepositScreen 
                onNavigateBack={navigateBack} 
                onTransactionSuccess={handleTransactionSuccess}
              />
            )}
            {currentScreen === "withdraw" && (
              <WithdrawScreen 
                onNavigateBack={navigateBack} 
                onTransactionSuccess={handleTransactionSuccess}
              />
            )}
            {currentScreen === "recharge" && (
              <RechargeScreen 
                onNavigateBack={navigateBack} 
                onTransactionSuccess={handleTransactionSuccess}
              />
            )}
            {currentScreen === "settings" && (
              <SettingsScreen 
                onNavigateBack={navigateBack} 
                onNavigateToProfile={() => navigateToScreen("profile")}
                onLogout={handleLogout} 
              />
            )}
            {currentScreen === "profile" && (
              <ProfileScreen onNavigateBack={navigateBack} />
            )}
            {currentScreen === "transaction-history" && (
              <TransactionHistoryScreen onNavigateBack={navigateBack} />
            )}
            {currentScreen === "recharge-history" && (
              <RechargeHistoryScreen onNavigateBack={navigateBack} />
            )}
            {currentScreen === "transfer" && (
              <TransferScreen 
                onNavigateBack={navigateBack} 
                onTransactionSuccess={handleTransactionSuccess}
              />
            )}
            {currentScreen === "transfer-history" && (
              <TransferHistoryScreen onNavigateBack={navigateBack} />
            )}
            {currentScreen === "betting-platforms" && (
              <BettingPlatformsScreen 
                onNavigateBack={navigateBack}
                transactionType={bettingTransactionType}
                onNavigateToBettingDeposit={(platformUid) => {
                  setSelectedPlatformUid(platformUid)
                  navigateToScreen("betting-deposit")
                }}
                onNavigateToBettingWithdraw={(platformUid) => {
                  setSelectedPlatformUid(platformUid)
                  navigateToScreen("betting-withdraw")
                }}
              />
            )}
            {currentScreen === "betting-deposit" && (
              <BettingDepositScreen 
                onNavigateBack={navigateBack}
                platformUid={selectedPlatformUid}
                onTransactionSuccess={handleTransactionSuccess}
              />
            )}
            {currentScreen === "betting-withdraw" && (
              <BettingWithdrawScreen 
                onNavigateBack={navigateBack}
                platformUid={selectedPlatformUid}
                onTransactionSuccess={handleTransactionSuccess}
              />
            )}
            {currentScreen === "betting-transactions" && (
              <BettingTransactionsScreen onNavigateBack={navigateBack} />
            )}
            {currentScreen === "betting-commissions" && (
              <BettingCommissionsScreen onNavigateBack={navigateBack} />
            )}
            {currentScreen === "notifications" && (
              <NotificationScreen onNavigateBack={navigateBack} />
            )}
            {currentScreen === "permission-denied" && (
              <PermissionDeniedScreen 
                onNavigateBack={navigateBack}
                message="Vous n'êtes pas autorisé à accéder aux transactions USSD. Contactez votre administrateur pour obtenir les permissions nécessaires."
              />
            )}
          </div>

          {/* Bottom Navigation Bar - Only show when authenticated */}
          {/* {isAuthenticated && currentScreen !== "login" && (
            <div className={`fixed bottom-0 left-0 right-0 h-20 ${
              theme === "dark" 
                ? "bg-slate-800/95 backdrop-blur-sm border-t border-slate-700" 
                : "bg-white/95 backdrop-blur-sm border-t border-gray-200"
            }`}>
              <div className="flex items-center justify-around h-full px-2">
                <button
                  onClick={() => setCurrentScreen("dashboard")}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                    currentScreen === "dashboard"
                      ? theme === "dark"
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-blue-500/10 text-blue-600"
                      : theme === "dark"
                        ? "text-slate-400 hover:text-white"
                        : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <ArrowUpCircle className="w-6 h-6" />
                  <span className="text-xs font-medium">Home</span>
                </button>

                <button
                  onClick={() => setCurrentScreen("deposit")}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                    currentScreen === "deposit"
                      ? theme === "dark"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-emerald-500/10 text-emerald-600"
                      : theme === "dark"
                        ? "text-slate-400 hover:text-white"
                        : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <ArrowUpCircle className="w-6 h-6" />
                  <span className="text-xs font-medium">Deposit</span>
                </button>

                <button
                  onClick={() => setCurrentScreen("withdraw")}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                    currentScreen === "withdraw"
                      ? theme === "dark"
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-blue-500/10 text-blue-600"
                      : theme === "dark"
                        ? "text-slate-400 hover:text-white"
                        : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <ArrowDownCircle className="w-6 h-6" />
                  <span className="text-xs font-medium">Withdraw</span>
                </button>

                <button
                  onClick={() => setCurrentScreen("recharge")}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                    currentScreen === "recharge"
                      ? theme === "dark"
                        ? "bg-purple-500/20 text-purple-400"
                        : "bg-purple-500/10 text-purple-600"
                      : theme === "dark"
                        ? "text-slate-400 hover:text-white"
                        : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <CreditCard className="w-6 h-6" />
                  <span className="text-xs font-medium">Recharge</span>
                </button>

                <button
                  onClick={() => setCurrentScreen("settings")}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                    currentScreen === "settings"
                      ? theme === "dark"
                        ? "bg-gray-500/20 text-gray-400"
                        : "bg-gray-500/10 text-gray-600"
                      : theme === "dark"
                        ? "text-slate-400 hover:text-white"
                        : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <Settings className="w-6 h-6" />
                  <span className="text-xs font-medium">Settings</span>
                </button>
              </div>
            </div>
          )} */}
        </div>
      </div>
    </ErrorBoundary>
  )
}
