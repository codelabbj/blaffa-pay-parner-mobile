// "use client"

// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import {
//   TrendingUp,
//   TrendingDown,
//   Zap,
//   Settings,
//   Bell,
//   Eye,
//   EyeOff,
//   MoreHorizontal,
//   TrendingUp as TrendingUpIcon,
//   History,
//   Copy,
//   Battery,
// } from "lucide-react"
// import { useState, useEffect, useRef } from "react"
// import { useTheme } from "@/lib/contexts"
// import { useTranslation } from "@/lib/contexts"
// import { useToast } from "@/hooks/use-toast"
// import { useAuth } from "@/lib/contexts"
// // Updated icons to match button functionality

// interface DashboardScreenProps {
//   onNavigateToSettings: () => void
//   onNavigateToDeposit: () => void
//   onNavigateToWithdraw: () => void
//   onNavigateToRecharge: () => void
//   onNavigateToTransactionHistory: () => void
//   onNavigateToRechargeHistory: () => void
//   onLogout: () => void
// }

// export function DashboardScreen({ onNavigateToSettings, onNavigateToDeposit, onNavigateToWithdraw, onNavigateToRecharge, onNavigateToTransactionHistory, onNavigateToRechargeHistory, onLogout }: DashboardScreenProps) {
//   const [showBalance, setShowBalance] = useState(true)
//   const [showDropdown, setShowDropdown] = useState(false)
//   const dropdownRef = useRef<HTMLDivElement>(null)
//   const { theme } = useTheme()
//   const { t } = useTranslation()
//   const { user, accountData, transactions } = useAuth()
//   const { toast } = useToast()

//   // Copy reference to clipboard
//   const copyReference = async (reference: string) => {
//     try {
//       await navigator.clipboard.writeText(reference)
//       toast({
//         title: t("dashboard.referenceCopied"),
//         description: `${t("dashboard.referenceCopiedDesc")}: ${reference}`,
//       })
//     } catch (error) {
//       console.error('Failed to copy reference:', error)
//       toast({
//         title: t("dashboard.copyFailed"),
//         description: t("dashboard.copyFailedDesc"),
//         variant: "destructive",
//       })
//     }
//   }

//   // Close dropdown when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
//         setShowDropdown(false)
//       }
//     }

//     if (showDropdown) {
//       document.addEventListener('mousedown', handleClickOutside)
//     }

//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside)
//     }
//   }, [showDropdown])

//   // Helper function to format transaction date
//   const formatTransactionDate = (dateString: string) => {
//     const date = new Date(dateString)
//     const now = new Date()
//     const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

//     if (diffInHours < 1) {
//       return "À l'instant"
//     } else if (diffInHours < 24) {
//       return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`
//     } else {
//       const diffInDays = Math.floor(diffInHours / 24)
//       return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`
//     }
//   }

//   // Helper function to format transaction amount
//   const formatTransactionAmount = (amount: string, type: string) => {
//     const formattedAmount = parseFloat(amount).toLocaleString()
//     return type === "deposit" ? `+${formattedAmount}` : `-${formattedAmount}`
//   }

//   // Helper function to get transaction status color
//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case "success":
//       case "sent_to_user":
//         return "text-green-500"
//       case "pending":
//         return "text-yellow-500"
//       case "failed":
//         return "text-red-500"
//       default:
//         return "text-gray-500"
//     }
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
//       {/* Mobile Header */}
//       <div className="px-4 pt-12 pb-6">
//         <div className="flex items-center justify-between mb-6">
//           <div className="flex items-center gap-3">
//             <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl">
//               <img src="/logo.png" alt="BlaffaPay" className="w-8 h-8" />
//             </div>
//             <div>
//               <h1 className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
//                 BlaffaPay
//               </h1>
//               <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
//                 Digital Wallet
//               </p>
//             </div>
//           </div>
//           <div className="flex items-center gap-2">
//             <Button
//               variant="ghost"
//               size="sm"
//               className={`h-11 w-11 p-0 rounded-2xl ${
//                 theme === "dark" 
//                   ? "text-gray-300 hover:bg-gray-700/50 hover:text-white" 
//                   : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
//               } transition-all duration-200`}
//             >
//               <Bell className="w-5 h-5" />
//             </Button>
//             <Button
//               variant="ghost"
//               size="sm"
//               className={`h-11 w-11 p-0 rounded-2xl ${
//                 theme === "dark" 
//                   ? "text-gray-300 hover:bg-gray-700/50 hover:text-white" 
//                   : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
//               } transition-all duration-200`}
//               onClick={onNavigateToSettings}
//             >
//               <Settings className="w-5 h-5" />
//             </Button>
//           </div>
//         </div>

//         {/* Mobile Balance Card */}
//         <div className="relative mb-6">
//           <div className={`rounded-3xl p-6 shadow-xl ${
//             theme === "dark" 
//               ? "bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700" 
//               : "bg-gradient-to-br from-white to-indigo-50/50 border border-indigo-100"
//           }`}>
//             {/* Decorative Elements */}
//             <div className="absolute top-0 right-0 w-24 h-24 opacity-20">
//               <div className={`w-full h-full rounded-full blur-2xl ${
//                 theme === "dark" ? "bg-indigo-500/30" : "bg-indigo-400/20"
//               }`}></div>
//             </div>
//             <div className="absolute bottom-0 left-0 w-20 h-20 opacity-20">
//               <div className={`w-full h-full rounded-full blur-xl ${
//                 theme === "dark" ? "bg-purple-500/30" : "bg-purple-400/20"
//               }`}></div>
//             </div>

//             <div className="relative z-10">
//               <div className="flex items-center justify-between mb-4">
//                 <div>
//                   <p className={`text-sm font-medium ${
//                     theme === "dark" ? "text-gray-400" : "text-gray-600"
//                   }`}>
//                     {t("dashboard.totalBalance")}
//                   </p>
//                   <p className={`text-4xl font-black mt-1 ${
//                     theme === "dark" ? "text-white" : "text-gray-900"
//                   }`}>
//                     {showBalance ? (accountData?.formatted_balance || "••••••") : "••••••"}
//                   </p>
//                 </div>
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   className={`h-10 w-10 p-0 rounded-2xl transition-all duration-300 ${
//                     theme === "dark" 
//                       ? "hover:bg-gray-700/50 text-gray-300 hover:text-white" 
//                       : "hover:bg-indigo-100 text-gray-600 hover:text-indigo-600"
//                   } hover:scale-110`}
//                   onClick={() => setShowBalance(!showBalance)}
//                 >
//                   {showBalance ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
//                 </Button>
//               </div>

//               <div className="flex items-center gap-3">
//                 <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
//                   theme === "dark" ? "bg-emerald-500/20" : "bg-emerald-100"
//                 }`}>
//                   <TrendingUp className={`w-4 h-4 ${theme === "dark" ? "text-emerald-400" : "text-emerald-600"}`} />
//                   <p className={`text-sm font-semibold ${theme === "dark" ? "text-emerald-400" : "text-emerald-600"}`}>
//                     {accountData ? `${accountData.utilization_rate.toFixed(1)}% utilization` : t("dashboard.growth")}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Mobile Action Buttons */}
//       <div className="px-4 mb-6">
//         <div className="grid grid-cols-3 gap-3">
//           {/* Deposit Button */}
//           <button
//             onClick={onNavigateToDeposit}
//             className={`group relative p-4 rounded-2xl transition-all duration-300 ${
//               theme === "dark" 
//                 ? "bg-gradient-to-br from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600" 
//                 : "bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500"
//             } shadow-lg hover:shadow-xl hover:scale-105 active:scale-95`}
//           >
//             <div className="flex flex-col items-center gap-2">
//               <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
//                 <TrendingUp className="w-5 h-5 text-white" />
//               </div>
//               <p className="text-white text-xs font-semibold text-center">
//                 {t("dashboard.actions.deposit")}
//               </p>
//             </div>
//           </button>

//           {/* Withdraw Button */}
//           <button
//             onClick={onNavigateToWithdraw}
//             className={`group relative p-4 rounded-2xl transition-all duration-300 ${
//               theme === "dark" 
//                 ? "bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600" 
//                 : "bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500"
//             } shadow-lg hover:shadow-xl hover:scale-105 active:scale-95`}
//           >
//             <div className="flex flex-col items-center gap-2">
//               <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
//                 <TrendingDown className="w-5 h-5 text-white" />
//               </div>
//               <p className="text-white text-xs font-semibold text-center">
//                 {t("dashboard.actions.withdraw")}
//               </p>
//             </div>
//           </button>

//           {/* Recharge Button */}
//           <button
//             onClick={onNavigateToRecharge}
//             className={`group relative p-4 rounded-2xl transition-all duration-300 ${
//               theme === "dark" 
//                 ? "bg-gradient-to-br from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600" 
//                 : "bg-gradient-to-br from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500"
//             } shadow-lg hover:shadow-xl hover:scale-105 active:scale-95`}
//           >
//             <div className="flex flex-col items-center gap-2">
//               <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
//                 <Zap className="w-5 h-5 text-white" />
//               </div>
//               <p className="text-white text-xs font-semibold text-center">
//                 {t("dashboard.actions.recharge")}
//               </p>
//             </div>
//           </button>
//         </div>
//       </div>

//       {/* Mobile Transactions Section */}
//       <div className="px-4 pb-8">
//         <Card
//           className={`rounded-2xl border-0 shadow-xl transition-colors duration-300 ${
//             theme === "dark" 
//               ? "bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 text-white" 
//               : "bg-gradient-to-br from-white to-indigo-50/30 border border-indigo-100 text-gray-900"
//           }`}
//         >
//           <CardHeader className="pb-4">
//             <div className="flex items-center justify-between">
//               <CardTitle className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
//                 {t("dashboard.recentTransactions")}
//               </CardTitle>
//               <div className="relative" ref={dropdownRef}>
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   className={`h-8 w-8 p-0 rounded-full transition-colors duration-300 ${
//                     theme === "dark" ? "hover:bg-gray-700/50 text-gray-300" : "hover:bg-gray-100/50 text-gray-600"
//                   }`}
//                   onClick={() => {
//                     console.log("Dropdown trigger clicked");
//                     setShowDropdown(!showDropdown);
//                   }}
//                 >
//                   <MoreHorizontal style={{ width: '30px', height: '30px' }} />
//                 </Button>

//                 {showDropdown && (
//                   <div className={`absolute right-0 top-10 w-56 rounded-md border shadow-lg z-[9999] ${
//                     theme === "dark" 
//                       ? "bg-gray-800 border-gray-700" 
//                       : "bg-white border-gray-200"
//                   }`}>
//                     <div className="py-1">
//                       <button
//                         className={`w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-opacity-50 transition-colors ${
//                           theme === "dark" 
//                             ? "hover:bg-gray-700 text-gray-200" 
//                             : "hover:bg-gray-100 text-gray-900"
//                         }`}
//                         onClick={() => {
//                           console.log("Transaction History clicked");
//                           onNavigateToTransactionHistory();
//                           setShowDropdown(false);
//                         }}
//                       >
//                         <History className="w-4 h-4" />
//                         {t("dashboard.transactionHistory")}
//                       </button>
//                       <button
//                         className={`w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-opacity-50 transition-colors ${
//                           theme === "dark" 
//                             ? "hover:bg-gray-700 text-gray-200" 
//                             : "hover:bg-gray-100 text-gray-900"
//                         }`}
//                         onClick={() => {
//                           console.log("Recharge History clicked");
//                           onNavigateToRechargeHistory();
//                           setShowDropdown(false);
//                         }}
//                       >
//                         <Battery className="w-4 h-4" />
//                         {t("dashboard.rechargeHistory")}
//                       </button>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </CardHeader>
//           <CardContent className="space-y-1">
//             {transactions.length > 0 ? (
//               transactions.slice(0, 5).map((transaction, index) => (
//               <div
//                   key={transaction.uid}
//                 className={`flex items-center justify-between py-4 px-2 rounded-xl transition-colors duration-300 ${
//                   theme === "dark" ? "hover:bg-gray-700/30" : "hover:bg-gray-100/30"
//                 } ${
//                   index !== transactions.length - 1
//                     ? theme === "dark"
//                       ? "border-b border-gray-700/50"
//                       : "border-b border-gray-200/50"
//                     : ""
//                 }`}
//               >
//                 <div className="flex items-center gap-4">
//                   <div
//                     className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${
//                         transaction.type === "deposit"
//                         ? "bg-gradient-to-br from-green-500/20 to-green-500/10 text-green-500"
//                         : theme === "dark"
//                           ? "bg-gradient-to-br from-gray-700 to-gray-600 text-gray-300"
//                           : "bg-gradient-to-br from-gray-200 to-gray-100 text-gray-600"
//                     }`}
//                   >
//                       {transaction.type === "deposit" ? (
//                         <TrendingUp className="w-5 h-5" />
//                     ) : (
//                         <TrendingDown className="w-5 h-5" />
//                     )}
//                   </div>
//                   <div>
//                     <p className={`font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
//                         {transaction.display_recipient_name || transaction.recipient_phone }
//                     </p>
//                     <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
//                         {formatTransactionDate(transaction.created_at)}
//                       </p>
//                       <div className="flex items-center">
//                         <p className={`text-xs ${getStatusColor(transaction.status)}`}>
//                           {transaction.status_display} • {transaction.reference}
//                         </p>
//                         <button
//                           onClick={() => copyReference(transaction.reference)}
//                           className={`p-1 rounded transition-colors duration-200 ${
//                             theme === "dark" 
//                               ? "hover:bg-gray-600/50 text-gray-400 hover:text-gray-300" 
//                               : "hover:bg-gray-200/50 text-gray-500 hover:text-gray-700"
//                           }`}
//                           title={t("common.copy")}
//                         >
//                           <Copy className="w-3 h-3" />
//                         </button>
//                       </div>
//                   </div>
//                 </div>
//                 <div className="text-right">
//                   <p
//                     className={`font-bold ${
//                         transaction.type === "deposit"
//                         ? "text-green-500"
//                         : theme === "dark"
//                           ? "text-white"
//                           : "text-gray-900"
//                     }`}
//                   >
//                       {formatTransactionAmount(transaction.amount, transaction.type)}
//                     </p>
//                     <div className={`w-2 h-2 rounded-full ml-auto mt-2 ${
//                       transaction.status === "success" || transaction.status === "sent_to_user"
//                         ? "bg-green-500"
//                         : transaction.status === "pending"
//                         ? "bg-yellow-500"
//                         : "bg-red-500"
//                     }`}></div>
//                   </div>
//                 </div>
//               ))
//             ) : (
//               <div className="text-center py-8">
//                 <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
//                   {t("dashboard.noTransactions")}
//                 </p>
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   )
// }


"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  TrendingUp,
  TrendingDown,
  Zap,
  Settings,
  Bell,
  Eye,
  EyeOff,
  MoreHorizontal,
  History,
  Copy,
  Battery,
  Plus,
  Minus,
  Wallet,
  ChevronRight,
  User,
  RefreshCw,
  Send,
  X,
  Sparkles,
  Activity,
  BarChart3,
  CreditCard,
  LayoutDashboard,
  Gamepad2,
  Shield,
  DollarSign,
  LogOut
} from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useTheme } from "@/lib/contexts"
import { useTranslation } from "@/lib/contexts"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/contexts"
import { authService } from "@/lib/auth"
import { transferService, Transfer } from "@/lib/transfers"
import { bettingService } from "@/lib/betting"
import { formatNumberWithSpaces } from "@/lib/utils"
import { TransactionTypeSelectionScreen } from "@/components/transaction-type-selection-screen"
import { TransactionDetailsModal } from "@/components/transaction-details-modal"

interface DashboardScreenProps {
  onNavigateToSettings: () => void
  onNavigateToDeposit: () => void
  onNavigateToWithdraw: () => void
  onNavigateToRecharge: () => void
  onNavigateToTransfer: () => void
  onNavigateToTransactionHistory: () => void
  onNavigateToRechargeHistory: () => void
  onNavigateToTransferHistory: () => void
  onNavigateToBettingPlatforms: (transactionType?: "deposit" | "withdraw") => void
  onNavigateToBettingTransactions: () => void
  onNavigateToBettingCommissions: () => void
  onNavigateToBettingDeposit: () => void
  onNavigateToBettingWithdraw: () => void
  onNavigateToNotifications: () => void
  onLogout: () => void
}

export function DashboardScreen({
  onNavigateToSettings,
  onNavigateToDeposit,
  onNavigateToWithdraw,
  onNavigateToRecharge,
  onNavigateToTransfer,
  onNavigateToTransactionHistory,
  onNavigateToRechargeHistory,
  onNavigateToTransferHistory,
  onNavigateToBettingPlatforms,
  onNavigateToBettingTransactions,
  onNavigateToBettingCommissions,
  onNavigateToBettingDeposit,
  onNavigateToBettingWithdraw,
  onNavigateToNotifications,
  onLogout
}: DashboardScreenProps) {
  const [showBalance, setShowBalance] = useState(true)
  const [showDropdown, setShowDropdown] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [recentHistory, setRecentHistory] = useState<any[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showTransactionTypeSelection, setShowTransactionTypeSelection] = useState(false)
  const [currentTransactionTypeSelection, setCurrentTransactionTypeSelection] = useState<"deposit" | "withdraw" | null>(null)
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)
  const [showTransactionDetails, setShowTransactionDetails] = useState(false)

  // Pull-to-refresh state
  const [pullToRefreshState, setPullToRefreshState] = useState({
    isPulling: false,
    pullDistance: 0,
    isRefreshing: false,
    startY: 0,
    currentY: 0,
    canPull: true
  })
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()
  const { t } = useTranslation()
  const { user, accountData, transactions, recharges, refreshTransactions, refreshRecharges, refreshAccountData } = useAuth()
  const { toast } = useToast()

  // Copy reference to clipboard
  const copyReference = async (reference: string) => {
    try {
      await navigator.clipboard.writeText(reference)
      toast({
        title: t("dashboard.referenceCopied"),
        description: `${t("dashboard.referenceCopiedDesc")}: ${reference}`,
      })
    } catch (error) {
      console.error('Failed to copy reference:', error)
      toast({
        title: t("dashboard.copyFailed"),
        description: t("dashboard.copyFailedDesc"),
        variant: "destructive",
      })
    }
  }


  // Load unified recent history
  const loadRecentHistory = async () => {
    setIsLoadingHistory(true)
    try {
      const accessToken = authService.getAccessToken()
      if (!accessToken) return

      // Fetch transfers and betting transactions
      const [transfersResponse, bettingTransactions] = await Promise.all([
        transferService.getTransfers(accessToken, {
          type: "sent",
          status: "completed",
          minAmount: "",
          maxAmount: "",
          dateFrom: "2025-03-01",
          dateTo: "2025-09-30"
        }),
        bettingService.getTransactions(accessToken, "", "", "", "-created_at", 1).catch(() => ({ results: [] }))
      ])

      // Combine all history types with type indicators
      const combinedHistory = [
        // Add mobile transactions with type indicator
        ...transactions.slice(0, 10).map(transaction => ({
          ...transaction,
          historyType: 'transaction',
          typeIcon: transaction.type === "deposit" ? TrendingUp : TrendingDown,
          typeColor: transaction.type === "deposit"
            ? (theme === "dark" ? "bg-green-500/20 text-green-400" : "bg-green-100 text-green-600")
            : (theme === "dark" ? "bg-red-500/20 text-red-400" : "bg-red-100 text-red-600"),
          typeLabel: transaction.type === "deposit" ? "Dépôt Mobile" : "Retrait Mobile"
        })),

        // Add betting transactions with type indicator
        ...bettingTransactions.results.slice(0, 10).map(bettingTransaction => ({
          ...bettingTransaction,
          historyType: 'betting',
          typeIcon: bettingTransaction.transaction_type === "deposit" ? TrendingUp : TrendingDown,
          typeColor: bettingTransaction.transaction_type === "deposit"
            ? (theme === "dark" ? "bg-purple-500/20 text-purple-400" : "bg-purple-100 text-purple-600")
            : (theme === "dark" ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600"),
          typeLabel: `${bettingTransaction.transaction_type === "deposit" ? "Dépôt" : "Retrait"} Paris`,
          // Override display fields for consistent rendering
          display_recipient_name: bettingTransaction.partner_name,
          recipient_phone: bettingTransaction.betting_user_id,
          recipient_name: bettingTransaction.partner_name,
          amount: parseFloat(bettingTransaction.amount).toString(),
          type: bettingTransaction.transaction_type
        })),

        // Add recharges with type indicator
        ...recharges.slice(0, 10).map(recharge => ({
          ...recharge,
          historyType: 'recharge',
          typeIcon: Battery,
          typeColor: theme === "dark" ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600",
          typeLabel: "Recharge Mobile"
        })),

        // Add transfers with type indicator
        ...transfersResponse.transfers.slice(0, 10).map(transfer => {
          const isReceived = transfer.receiver_email === user?.email;
          return {
            ...transfer,
            historyType: 'transfer',
            typeIcon: Send,
            typeColor: isReceived
              ? (theme === "dark" ? "bg-green-500/20 text-green-400" : "bg-green-100 text-green-600")
              : (theme === "dark" ? "bg-red-500/20 text-red-400" : "bg-red-100 text-red-600"),
            typeLabel: isReceived ? "Transfert Reçu" : "Transfert Envoyé",
            receiver_name: transfer.receiver_name,
            isTransferReceived: isReceived
          };
        })
      ]

      // Sort by date (most recent first) and take top 10
      const sortedHistory = combinedHistory
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10)

      setRecentHistory(sortedHistory)
    } catch (error) {
      console.error('Load recent history error:', error)
    } finally {
      setIsLoadingHistory(false)
    }
  }

  // Handle refresh with loading state
  const handleRefresh = async () => {
    setIsRefreshing(true)
    setPullToRefreshState(prev => ({ ...prev, isRefreshing: true }))
    await Promise.all([
      refreshAccountData(),
      refreshTransactions(),
      refreshRecharges(),
      loadRecentHistory()
    ])
    setTimeout(() => {
      setIsRefreshing(false)
      setPullToRefreshState(prev => ({ ...prev, isRefreshing: false, pullDistance: 0 }))
    }, 500)
  }

  // Pull-to-refresh handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!pullToRefreshState.canPull || pullToRefreshState.isRefreshing) return

    const startY = e.touches[0].clientY
    setPullToRefreshState(prev => ({
      ...prev,
      startY,
      currentY: startY,
      isPulling: false
    }))
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!pullToRefreshState.canPull || pullToRefreshState.isRefreshing) return

    const currentY = e.touches[0].clientY
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop

    // Only allow pull-to-refresh when at the top of the page
    if (scrollTop > 0) {
      setPullToRefreshState(prev => ({ ...prev, canPull: false }))
      return
    }

    const pullDistance = Math.max(0, currentY - pullToRefreshState.startY)
    const maxPullDistance = 120

    if (pullDistance > 0) {
      e.preventDefault() // Prevent default scroll behavior
      setPullToRefreshState(prev => ({
        ...prev,
        currentY,
        pullDistance: Math.min(pullDistance, maxPullDistance),
        isPulling: pullDistance > 10
      }))
    }
  }

  const handleTouchEnd = () => {
    if (!pullToRefreshState.canPull || pullToRefreshState.isRefreshing) return

    const { pullDistance } = pullToRefreshState
    const refreshThreshold = 80

    if (pullDistance >= refreshThreshold && pullToRefreshState.isPulling) {
      handleRefresh()
    } else {
      // Reset pull state
      setPullToRefreshState(prev => ({
        ...prev,
        isPulling: false,
        pullDistance: 0,
        canPull: true
      }))
    }
  }

  // Reset canPull when scroll position changes
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      if (scrollTop === 0) {
        setPullToRefreshState(prev => ({ ...prev, canPull: true }))
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Load recent history on component mount
  useEffect(() => {
    loadRecentHistory()
  }, [transactions, recharges])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDropdown])


  // Helper function to format transaction date
  const formatTransactionDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) {
      return t("additional.time.justNow")
    } else if (diffInHours < 24) {
      return t("additional.time.hoursAgoFull").replace("{{count}}", diffInHours.toString()).replace("{{plural}}", diffInHours > 1 ? 's' : '')
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return t("additional.time.daysAgoFull").replace("{{count}}", diffInDays.toString()).replace("{{plural}}", diffInDays > 1 ? 's' : '')
    }
  }

  // Helper function to format transaction amount
  const formatTransactionAmount = (amount: string, type: string) => {
    const formattedAmount = formatNumberWithSpaces(amount)
    return type === "deposit" ? `+${formattedAmount}` : `-${formattedAmount}`
  }

  // Helper function to get transaction status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
      case "sent_to_user":
        return "text-green-500"
      case "pending":
        return "text-yellow-500"
      case "failed":
        return "text-red-500"
      default:
        return "text-gray-500"
    }
  }

  return (
    <div
      className={`min-h-screen relative overflow-hidden ${theme === "dark"
        ? "bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900"
        : "bg-gradient-to-b from-blue-50 via-white to-blue-50"
        }`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: `translateY(${pullToRefreshState.pullDistance}px)`,
        transition: pullToRefreshState.isPulling ? 'none' : 'transform 0.3s ease-out'
      }}
    >
      {/* Pull-to-refresh indicator */}
      {(pullToRefreshState.isPulling || pullToRefreshState.isRefreshing) && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-40">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${theme === "dark"
            ? "bg-gray-800/90 backdrop-blur-sm border border-gray-700/50"
            : "bg-white/90 backdrop-blur-sm border border-gray-200/50"
            } shadow-lg`}>
            <RefreshCw className={`w-5 h-5 ${pullToRefreshState.isRefreshing ? 'animate-spin' : ''
              } ${theme === "dark" ? "text-blue-400" : "text-blue-500"}`} />
          </div>
        </div>
      )}

      {/* Mobile-optimized background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-20 right-4 w-40 h-40 rounded-full opacity-10 ${theme === "dark" ? "bg-blue-500" : "bg-blue-300"
          } blur-3xl animate-pulse`}></div>
        <div className={`absolute bottom-60 left-4 w-32 h-32 rounded-full opacity-10 ${theme === "dark" ? "bg-blue-500" : "bg-blue-300"
          } blur-2xl animate-pulse`} style={{ animationDelay: '2s' }}></div>
        <div className={`absolute top-1/2 right-8 w-24 h-24 rounded-full opacity-10 ${theme === "dark" ? "bg-green-500" : "bg-green-300"
          } blur-xl animate-pulse`} style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Mobile Header */}
      <div className="relative z-10 px-4 pt-safe-area-inset-top pt-12 pb-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setSidebarOpen(true)}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 active:scale-95 ${theme === "dark"
                  ? "bg-gradient-to-br from-blue-600 to-blue-600 hover:from-blue-500 hover:to-blue-500"
                  : "bg-gradient-to-br from-blue-500 to-blue-500 hover:from-blue-400 hover:to-blue-400"
                  } shadow-lg hover:shadow-xl`}
              >
                <User className="w-6 h-6 text-white" />
              </button>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
            </div>
            <div>
              <h1 className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                {user?.first_name ? `${t("additional.hello")} ${user.first_name}` : t("additional.welcome")}
              </h1>
              <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                {new Date().toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className={`h-11 w-11 p-0 rounded-xl active:scale-95 transition-all duration-200 relative ${theme === "dark"
                ? "text-gray-300 hover:bg-white/10 active:bg-white/20"
                : "text-gray-600 hover:bg-black/5 active:bg-black/10"
                }`}
              onClick={onNavigateToNotifications}
            >
              <Bell className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`h-11 w-11 p-0 rounded-xl active:scale-95 transition-all duration-200 ${theme === "dark"
                ? "text-gray-300 hover:bg-white/10 active:bg-white/20"
                : "text-gray-600 hover:bg-black/5 active:bg-black/10"
                }`}
              onClick={onNavigateToSettings}
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>


        {/* Balance Card */}
        <div className={`p-6 rounded-3xl border transition-all duration-300 mb-8 ${theme === "dark"
          ? "bg-gray-800/60 border-gray-700/50 backdrop-blur-sm"
          : "bg-white/80 border-gray-200/50 backdrop-blur-sm shadow-xl"
          }`}>
          {/* Decorative gradient overlay */}
          <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 ${theme === "dark" ? "bg-gradient-to-br from-blue-400 to-blue-500" : "bg-gradient-to-br from-blue-300 to-blue-400"
              } blur-2xl`}></div>
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-xl ${theme === "dark" ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600"
                  }`}>
                  <Wallet className="w-4 h-4" />
                </div>
                <p className={`text-sm font-semibold ${theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}>
                  {t("dashboard.totalBalance")}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className={`h-9 w-9 p-0 rounded-xl active:scale-95 transition-all duration-200 ${theme === "dark"
                  ? "hover:bg-gray-700/50 text-gray-300 hover:text-white"
                  : "hover:bg-gray-100 text-gray-600 hover:text-gray-800"
                  }`}
                onClick={() => setShowBalance(!showBalance)}
              >
                {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </Button>
            </div>

            <p className={`text-3xl font-black mb-4 ${theme === "dark" ? "text-white" : "text-gray-900"
              }`}>
              {showBalance ? (accountData?.formatted_balance || "Loading...") : "••••••••"}
            </p>

            <div className="flex items-center justify-between">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${theme === "dark" ? "bg-emerald-500/20" : "bg-emerald-100"
                }`}>
                <TrendingUp className={`w-4 h-4 ${theme === "dark" ? "text-emerald-400" : "text-emerald-600"}`} />
                <p className={`text-sm font-semibold ${theme === "dark" ? "text-emerald-400" : "text-emerald-600"}`}>
                  {accountData ? `${accountData.utilization_rate.toFixed(1)}%` : t("additional.active")}
                </p>
              </div>

              <button
                onClick={onNavigateToRecharge}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all duration-200 active:scale-95 ${theme === "dark"
                  ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                  : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                  }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold">{t("dashboard.actions.recharge")}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable content area */}
      <div className="relative z-10 px-4 pb-24 overflow-y-auto">
        {/* Quick Actions */}
        <div className="mb-6 sm:mb-8">
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {/* Deposit Button */}
            <button
              onClick={() => {
                // If user doesn't have USSD permission, go directly to MobCash
                if (user && user.can_process_ussd_transaction === false) {
                  onNavigateToBettingPlatforms("deposit")
                } else {
                  setCurrentTransactionTypeSelection("deposit")
                  setShowTransactionTypeSelection(true)
                }
              }}
              className={`group relative p-4 sm:p-5 rounded-2xl transition-all duration-300 active:scale-95 ${theme === "dark"
                ? "bg-gray-800/60 border border-gray-700/50 backdrop-blur-sm hover:bg-gray-700/60"
                : "bg-white/80 border border-gray-200/50 backdrop-blur-sm shadow-sm hover:shadow-md hover:bg-white"
                }`}
            >
              <div className="flex flex-col items-center gap-2 sm:gap-3">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center ${theme === "dark" ? "bg-green-500/20 text-green-400" : "bg-green-100 text-green-600"
                  } group-hover:scale-110 transition-transform duration-200`}>
                  <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <p className={`text-xs sm:text-sm font-semibold text-center ${theme === "dark" ? "text-gray-200" : "text-gray-800"
                  }`}>
                  {t("dashboard.actions.deposit")}
                </p>
              </div>
            </button>

            {/* Withdraw Button */}
            <button
              onClick={() => {
                // If user doesn't have USSD permission, go directly to MobCash
                if (user && user.can_process_ussd_transaction === false) {
                  onNavigateToBettingPlatforms("withdraw")
                } else {
                  setCurrentTransactionTypeSelection("withdraw")
                  setShowTransactionTypeSelection(true)
                }
              }}
              className={`group relative p-4 sm:p-5 rounded-2xl transition-all duration-300 active:scale-95 ${theme === "dark"
                ? "bg-gray-800/60 border border-gray-700/50 backdrop-blur-sm hover:bg-gray-700/60"
                : "bg-white/80 border border-gray-200/50 backdrop-blur-sm shadow-sm hover:shadow-md hover:bg-white"
                }`}
            >
              <div className="flex flex-col items-center gap-2 sm:gap-3">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center ${theme === "dark" ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600"
                  } group-hover:scale-110 transition-transform duration-200`}>
                  <Minus className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <p className={`text-xs sm:text-sm font-semibold text-center ${theme === "dark" ? "text-gray-200" : "text-gray-800"
                  }`}>
                  {t("dashboard.actions.withdraw")}
                </p>
              </div>
            </button>

            {/* Recharge Button */}
            {/* <button
            onClick={onNavigateToRecharge}
              className={`group relative p-4 sm:p-5 rounded-2xl transition-all duration-300 active:scale-95 ${
              theme === "dark" 
                  ? "bg-gray-800/60 border border-gray-700/50 backdrop-blur-sm hover:bg-gray-700/60" 
                  : "bg-white/80 border border-gray-200/50 backdrop-blur-sm shadow-sm hover:shadow-md hover:bg-white"
              }`}
            >
              <div className="flex flex-col items-center gap-2 sm:gap-3">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center ${
                  theme === "dark" ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600"
                } group-hover:scale-110 transition-transform duration-200`}>
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <p className={`text-xs sm:text-sm font-semibold text-center ${
                  theme === "dark" ? "text-gray-200" : "text-gray-800"
                }`}>
              {t("dashboard.actions.recharge")}
                </p>
              </div>
            </button> */}

            {/* Transfer Button */}
            <button
              onClick={onNavigateToTransfer}
              className={`group relative p-4 sm:p-5 rounded-2xl transition-all duration-300 active:scale-95 ${theme === "dark"
                ? "bg-gray-800/60 border border-gray-700/50 backdrop-blur-sm hover:bg-gray-700/60"
                : "bg-white/80 border border-gray-200/50 backdrop-blur-sm shadow-sm hover:shadow-md hover:bg-white"
                }`}
            >
              <div className="flex flex-col items-center gap-2 sm:gap-3">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center ${theme === "dark" ? "bg-purple-500/20 text-purple-400" : "bg-purple-100 text-purple-600"
                  } group-hover:scale-110 transition-transform duration-200`}>
                  <Send className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <p className={`text-xs sm:text-sm font-semibold text-center ${theme === "dark" ? "text-gray-200" : "text-gray-800"
                  }`}>
                  Transfert UV
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Recent Transactions Card */}
        <div className={`rounded-2xl border transition-all duration-300 ${theme === "dark"
          ? "bg-gray-800/60 border-gray-700/50 backdrop-blur-sm"
          : "bg-white/80 border-gray-200/50 backdrop-blur-sm shadow-sm"
          }`}>
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className={`text-base sm:text-lg font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                Activité récente
              </h2>
              <div className="flex items-center gap-1 sm:gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className={`h-8 w-8 sm:h-9 sm:w-9 p-0 rounded-xl active:scale-95 transition-all duration-200 ${theme === "dark"
                    ? "hover:bg-gray-700/50 text-gray-300 hover:text-white"
                    : "hover:bg-gray-100 text-gray-600 hover:text-gray-800"
                    }`}
                >
                  <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
                <div className="relative" ref={dropdownRef}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 w-8 sm:h-9 sm:w-9 p-0 rounded-xl active:scale-95 transition-all duration-200 ${theme === "dark"
                      ? "hover:bg-gray-700/50 text-gray-300 hover:text-white"
                      : "hover:bg-gray-100 text-gray-600 hover:text-gray-800"
                      }`}
                    onClick={() => setShowDropdown(!showDropdown)}
                  >
                    <MoreHorizontal className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>

                  {showDropdown && (
                    <div className={`absolute right-0 top-10 w-48 sm:w-56 rounded-2xl border shadow-xl z-50 ${theme === "dark"
                      ? "bg-gray-800/95 border-gray-700/50 backdrop-blur-lg"
                      : "bg-white/95 border-gray-200/50 backdrop-blur-lg"
                      }`}>
                      <div className="p-2">
                        <button
                          className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 active:scale-95 ${theme === "dark"
                            ? "hover:bg-gray-700/50 text-gray-200"
                            : "hover:bg-gray-100 text-gray-900"
                            }`}
                          onClick={() => {
                            onNavigateToTransactionHistory();
                            setShowDropdown(false);
                          }}
                        >
                          <History className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="truncate">{t("dashboard.transactionHistory")}</span>
                          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-auto flex-shrink-0" />
                        </button>
                        <button
                          className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 active:scale-95 ${theme === "dark"
                            ? "hover:bg-gray-700/50 text-gray-200"
                            : "hover:bg-gray-100 text-gray-900"
                            }`}
                          onClick={() => {
                            onNavigateToRechargeHistory();
                            setShowDropdown(false);
                          }}
                        >
                          <Battery className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="truncate">{t("dashboard.rechargeHistory")}</span>
                          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-auto flex-shrink-0" />
                        </button>
                        <button
                          className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 active:scale-95 ${theme === "dark"
                            ? "hover:bg-gray-700/50 text-gray-200"
                            : "hover:bg-gray-100 text-gray-900"
                            }`}
                          onClick={() => {
                            onNavigateToTransferHistory();
                            setShowDropdown(false);
                          }}
                        >
                          <Send className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="truncate">Historique des transferts</span>
                          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-auto flex-shrink-0" />
                        </button>
                        <button
                          className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 active:scale-95 ${theme === "dark"
                            ? "hover:bg-gray-700/50 text-gray-200"
                            : "hover:bg-gray-100 text-gray-900"
                            }`}
                          onClick={() => {
                            onNavigateToBettingTransactions();
                            setShowDropdown(false);
                          }}
                        >
                          <Activity className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="truncate">Transactions de Paris</span>
                          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-auto flex-shrink-0" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Unified Recent History List */}
            <div className="space-y-2 sm:space-y-1">
              {isLoadingHistory ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
                </div>
              ) : recentHistory.length > 0 ? (
                recentHistory.map((item, index) => {
                  const TypeIcon = item.typeIcon
                  return (
                    <div
                      key={`${item.historyType}-${item.uid}`}
                      onClick={() => {
                        setSelectedTransaction(item)
                        setShowTransactionDetails(true)
                      }}
                      className={`p-3 sm:p-4 rounded-2xl transition-all duration-200 active:scale-98 cursor-pointer ${theme === "dark" ? "hover:bg-gray-700/30" : "hover:bg-gray-50"
                        }`}
                    >
                      {/* Mobile-first responsive layout */}
                      <div className="flex flex-row justify-between items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                        {/* Left section - Icon and main info */}
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${item.typeColor}`}>
                            <TypeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>

                          <div className="flex-1 min-w-0">
                            {/* Title and type badge - responsive layout */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                              <div className="flex flex-col">
                                <p className={`font-semibold text-sm sm:text-base truncate ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                                  {item.historyType === 'transaction'
                                    ? (item.display_recipient_name || item.recipient_phone)
                                    : item.historyType === 'betting'
                                      ? item.partner_name
                                      : item.historyType === 'recharge'
                                        ? item.recipient_phone
                                        : item.receiver_name
                                  }
                                </p>
                                {item.historyType === 'betting' && (
                                  <>
                                    <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"} truncate`}>
                                      {item.platform_name}
                                    </p>
                                    {item.betting_user_id && (
                                      <p className={`text-xs font-mono ${theme === "dark" ? "text-gray-500" : "text-gray-500"} truncate`}>
                                        ID Paris: {item.betting_user_id}
                                      </p>
                                    )}
                                  </>
                                )}
                                {item.historyType !== 'betting' && item.betting_user_id && (
                                  <p className={`text-xs font-mono ${theme === "dark" ? "text-gray-500" : "text-gray-500"} truncate`}>
                                    ID Paris: {item.betting_user_id}
                                  </p>
                                )}
                              </div>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium self-start ${theme === "dark"
                                ? "bg-gray-700 text-gray-300"
                                : "bg-gray-100 text-gray-600"
                                }`}>
                                {item.typeLabel}
                              </span>
                            </div>

                            {/* Date and status - mobile optimized */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                              <p className={`text-xs sm:text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                                {formatTransactionDate(item.created_at)}
                              </p>
                              <div className="hidden sm:block w-1 h-1 rounded-full bg-gray-400"></div>
                              <p className={`text-xs ${getStatusColor(item.status)}`}>
                                {item.status_display || item.status}
                              </p>
                            </div>

                            {/* Reference - mobile optimized */}
                            <div className="flex items-center gap-2 mt-1">
                              <p className={`text-xs font-mono truncate ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                                {item.reference}
                              </p>
                              <button
                                onClick={() => copyReference(item.reference)}
                                className={`p-1 rounded-lg transition-all duration-200 active:scale-90 flex-shrink-0 ${theme === "dark"
                                  ? "hover:bg-gray-600/50 text-gray-400 hover:text-gray-300"
                                  : "hover:bg-gray-200/50 text-gray-500 hover:text-gray-700"
                                  }`}
                                title={t("common.copy")}
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Right section - Amount and status */}
                        <div className="flex flex-col items-end gap-1 ml-auto text-right sm:gap-2">
                          <div>
                            <p className={`font-bold text-sm sm:text-base ${(item.historyType === 'transaction' && item.type === "deposit") ||
                              (item.historyType === 'transfer' && item.isTransferReceived)
                              ? "text-green-500"
                              : item.historyType === 'transaction'
                                ? (theme === "dark" ? "text-red-400" : "text-red-600")
                                : item.historyType === 'betting' && item.transaction_type === "deposit"
                                  ? "text-purple-500"
                                  : item.historyType === 'betting'
                                    ? (theme === "dark" ? "text-blue-400" : "text-blue-600")
                                    : item.historyType === 'recharge'
                                      ? "text-blue-500"
                                      : item.historyType === 'transfer'
                                        ? (theme === "dark" ? "text-red-400" : "text-red-600")
                                        : "text-cyan-500"
                              }`}>
                              {item.historyType === 'transaction'
                                ? formatTransactionAmount(item.amount, item.type)
                                : item.historyType === 'betting'
                                  ? formatTransactionAmount(item.amount, item.transaction_type)
                                  : item.historyType === 'recharge'
                                    ? `+${formatNumberWithSpaces(item.amount)} FCFA`
                                    : item.historyType === 'transfer'
                                      ? `${item.isTransferReceived ? '+' : '-'}${formatNumberWithSpaces(item.amount)} FCFA`
                                      : `-${formatNumberWithSpaces(item.amount)} FCFA`
                              }
                            </p>
                          </div>
                          <div className={`w-2 h-2 rounded-full ${item.status === "success" || item.status === "sent_to_user" || item.status === "completed"
                            ? "bg-green-500"
                            : item.status === "pending"
                              ? "bg-yellow-500"
                              : "bg-red-500"
                            }`}></div>
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-12">
                  <div className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center ${theme === "dark" ? "bg-gray-700/50" : "bg-gray-100"
                    }`}>
                    <History className={`w-8 h-8 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`} />
                  </div>
                  <p className={`text-sm font-medium ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    Aucune activité récente
                  </p>
                  <p className={`text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-500"}`}>
                    Vos transactions, recharges et transferts apparaîtront ici
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ease-in-out ${sidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}>
        {/* Backdrop with improved touch handling */}
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-md transition-all duration-300"
          onClick={() => setSidebarOpen(false)}
        />

        {/* Sidebar with mobile-optimized design */}
        <div className={`fixed inset-y-0 left-0 flex w-80 max-w-[85vw] flex-col h-full shadow-2xl transition-all duration-300 ease-in-out ${theme === "dark"
          ? "bg-gray-900/95 backdrop-blur-xl border-r border-gray-700/50"
          : "bg-white/95 backdrop-blur-xl border-r border-gray-200/50"
          } ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>

          {/* Header with improved mobile spacing */}
          <div className={`flex h-16 sm:h-20 items-center justify-between px-4 sm:px-6 border-b ${theme === "dark" ? "border-gray-700/50" : "border-gray-200/50"
            }`}>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img src="/logo.png" alt="Blaffa Pay Logo" className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl shadow-lg" />
                <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
              </div>
              <div>
                <span className="text-base sm:text-lg font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
                  Blaffa Pay
                </span>
                <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                  {t("app.subtitle")}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              className="h-10 w-10 rounded-xl active:scale-95 transition-all duration-200"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation with custom scroll behavior for dashboard */}
          <nav
            className="flex-1 space-y-1 px-3 sm:px-4 py-4 sm:py-6 overflow-y-auto overflow-x-hidden scroll-smooth"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: theme === "dark" ? '#4B5563 #1F2937' : '#D1D5DB #F3F4F6',
              scrollBehavior: 'smooth'
            }}
            onScroll={(e) => {
              // Custom scroll behavior - slight elasticity effect
              const element = e.currentTarget;
              if (element.scrollTop < 0) {
                element.scrollTop = 0;
              }
            }}
          >
            {/* General Section */}


            {/* Transaction Management Section */}
            <div className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider mt-6 ${theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}>
              <Activity className="h-4 w-4" />
              {t("nav.transactionManagement")}
            </div>



            {/* <button
              className={`w-full flex items-center gap-3 px-3 py-4 rounded-2xl text-sm font-medium transition-all duration-200 active:scale-98 ${
                theme === "dark" 
                  ? "hover:bg-gray-800/50 active:bg-gray-800 text-gray-200" 
                  : "hover:bg-gray-100/50 active:bg-gray-100 text-gray-700"
              }`}
              onClick={() => {
                setSidebarOpen(false)
                // Navigate to account transaction if needed
              }}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                theme === "dark" ? "bg-purple-500/20 text-purple-400" : "bg-purple-100 text-purple-600"
              }`}>
                <LayoutDashboard className="h-4 w-4" />
              </div>
              <span className="flex-1 text-left">{t("nav.accountTransaction")}</span>
            </button> */}

            <button
              className={`w-full flex items-center gap-3 px-3 py-4 rounded-2xl text-sm font-medium transition-all duration-200 active:scale-98 ${theme === "dark"
                ? "hover:bg-gray-800/50 active:bg-gray-800 text-gray-200"
                : "hover:bg-gray-100/50 active:bg-gray-100 text-gray-700"
                }`}
              onClick={() => {
                setSidebarOpen(false)
                onNavigateToRecharge()
              }}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${theme === "dark" ? "bg-yellow-500/20 text-yellow-400" : "bg-yellow-100 text-yellow-600"
                }`}>
                <Zap className="h-4 w-4" />
              </div>
              <span className="flex-1 text-left">{t("nav.topup")}</span>
            </button>

            <button
              className={`w-full flex items-center gap-3 px-3 py-4 rounded-2xl text-sm font-medium transition-all duration-200 active:scale-98 ${theme === "dark"
                ? "hover:bg-gray-800/50 active:bg-gray-800 text-gray-200"
                : "hover:bg-gray-100/50 active:bg-gray-100 text-gray-700"
                }`}
              onClick={() => {
                setSidebarOpen(false)
                onNavigateToTransfer()
              }}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${theme === "dark" ? "bg-cyan-500/20 text-cyan-400" : "bg-cyan-100 text-cyan-600"
                }`}>
                <Send className="h-4 w-4" />
              </div>
              <span className="flex-1 text-left">{t("nav.transfer")}</span>
            </button>

            {/* History Section */}
            <div className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider mt-6 ${theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}>
              <History className="h-4 w-4" />
              {t("nav.history")}
            </div>

            {/* Only show transaction history if user has USSD permission */}
            {user && user.can_process_ussd_transaction !== false && (
              <button
                className={`w-full flex items-center gap-3 px-3 py-4 rounded-2xl text-sm font-medium transition-all duration-200 active:scale-98 ${theme === "dark"
                  ? "hover:bg-gray-800/50 active:bg-gray-800 text-gray-200"
                  : "hover:bg-gray-100/50 active:bg-gray-100 text-gray-700"
                  }`}
                onClick={() => {
                  setSidebarOpen(false)
                  onNavigateToTransactionHistory()
                }}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${theme === "dark" ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600"
                  }`}>
                  <TrendingUp className="h-4 w-4" />
                </div>
                <span className="flex-1 text-left">{t("nav.accountTransaction")}</span>
              </button>
            )}

            <button
              className={`w-full flex items-center gap-3 px-3 py-4 rounded-2xl text-sm font-medium transition-all duration-200 active:scale-98 ${theme === "dark"
                ? "hover:bg-gray-800/50 active:bg-gray-800 text-gray-200"
                : "hover:bg-gray-100/50 active:bg-gray-100 text-gray-700"
                }`}
              onClick={() => {
                setSidebarOpen(false)
                onNavigateToRechargeHistory()
              }}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${theme === "dark" ? "bg-yellow-500/20 text-yellow-400" : "bg-yellow-100 text-yellow-600"
                }`}>
                <Battery className="h-4 w-4" />
              </div>
              <span className="flex-1 text-left">{t("nav.topupHistory")}</span>
            </button>

            <button
              className={`w-full flex items-center gap-3 px-3 py-4 rounded-2xl text-sm font-medium transition-all duration-200 active:scale-98 ${theme === "dark"
                ? "hover:bg-gray-800/50 active:bg-gray-800 text-gray-200"
                : "hover:bg-gray-100/50 active:bg-gray-100 text-gray-700"
                }`}
              onClick={() => {
                setSidebarOpen(false)
                onNavigateToTransferHistory()
              }}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${theme === "dark" ? "bg-cyan-500/20 text-cyan-400" : "bg-cyan-100 text-cyan-600"
                }`}>
                <Send className="h-4 w-4" />
              </div>
              <span className="flex-1 text-left">{t("nav.transferHistory")}</span>
            </button>

            {/* Betting Platforms Section */}
            <div className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider mt-6 ${theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}>
              <Gamepad2 className="h-4 w-4" />
              {t("nav.bettingPlatforms")}
            </div>

            <button
              className={`w-full flex items-center gap-3 px-3 py-4 rounded-2xl text-sm font-medium transition-all duration-200 active:scale-98 ${theme === "dark"
                ? "hover:bg-gray-800/50 active:bg-gray-800 text-gray-200"
                : "hover:bg-gray-100/50 active:bg-gray-100 text-gray-700"
                }`}
              onClick={() => {
                setSidebarOpen(false)
                onNavigateToBettingPlatforms()
              }}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${theme === "dark" ? "bg-indigo-500/20 text-indigo-400" : "bg-indigo-100 text-indigo-600"
                }`}>
                <Shield className="h-4 w-4" />
              </div>
              <span className="flex-1 text-left">{t("nav.platforms")}</span>
            </button>

            <button
              className={`w-full flex items-center gap-3 px-3 py-4 rounded-2xl text-sm font-medium transition-all duration-200 active:scale-98 ${theme === "dark"
                ? "hover:bg-gray-800/50 active:bg-gray-800 text-gray-200"
                : "hover:bg-gray-100/50 active:bg-gray-100 text-gray-700"
                }`}
              onClick={() => {
                setSidebarOpen(false)
                onNavigateToBettingTransactions()
              }}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${theme === "dark" ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600"
                }`}>
                <Activity className="h-4 w-4" />
              </div>
              <span className="flex-1 text-left">{t("nav.transactions")}</span>
            </button>

            <button
              className={`w-full flex items-center gap-3 px-3 py-4 rounded-2xl text-sm font-medium transition-all duration-200 active:scale-98 ${theme === "dark"
                ? "hover:bg-gray-800/50 active:bg-gray-800 text-gray-200"
                : "hover:bg-gray-100/50 active:bg-gray-100 text-gray-700"
                }`}
              onClick={() => {
                setSidebarOpen(false)
                onNavigateToBettingCommissions()
              }}
            >

              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${theme === "dark" ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-600"
                }`}>
                <DollarSign className="h-4 w-4" />
              </div>
              <span className="flex-1 text-left">{t("nav.commissions")}</span>
            </button>
          </nav>

          {/* Fixed Footer with logout button */}
          <div className={`mt-auto border-t ${theme === "dark" ? "border-gray-700/50 bg-gray-900/95" : "border-gray-200/50 bg-white/95"
            } p-4 sm:p-6`}>
            <Button
              variant="ghost"
              className="w-full justify-start rounded-2xl h-12 text-sm font-medium transition-all duration-200 active:scale-98 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
              onClick={() => {
                setSidebarOpen(false)
                onLogout()
              }}
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-red-500/20 text-red-500 mr-3">
                <LogOut className="h-4 w-4" />
              </div>
              {t("nav.logout")}
            </Button>
          </div>
        </div>
      </div>

      {/* Transaction Details Modal */}
      <TransactionDetailsModal
        isOpen={showTransactionDetails}
        onClose={() => {
          setShowTransactionDetails(false)
          setSelectedTransaction(null)
        }}
        transaction={selectedTransaction}
      />

      {/* Transaction Type Selection Modal */}
      {showTransactionTypeSelection && currentTransactionTypeSelection && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative h-full flex flex-col">
            <TransactionTypeSelectionScreen
              transactionType={currentTransactionTypeSelection}
              user={user || undefined}
              onNavigateBack={() => {
                setShowTransactionTypeSelection(false)
                setCurrentTransactionTypeSelection(null)
              }}
              onSelectMobileMoney={() => {
                setShowTransactionTypeSelection(false)
                if (currentTransactionTypeSelection === "deposit") {
                  onNavigateToDeposit()
                } else {
                  onNavigateToWithdraw()
                }
              }}
              onSelectBetting={() => {
                setShowTransactionTypeSelection(false)
                // Pass transaction type to betting platforms
                onNavigateToBettingPlatforms(currentTransactionTypeSelection)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}