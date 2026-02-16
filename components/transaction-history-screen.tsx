// "use client"

// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import {
//   ArrowUpCircle,
//   ArrowDownCircle,
//   ArrowLeft,
//   ChevronLeft,
//   ChevronRight,
//   Filter,
//   Search,
//   Calendar,
//   Download,
//   Copy,
// } from "lucide-react"
// import { useState, useEffect } from "react"
// import { useTheme } from "@/lib/contexts"
// import { useTranslation } from "@/lib/contexts"
// import { useAuth } from "@/lib/contexts"
// import { transactionsService, Transaction, TransactionsResponse } from "@/lib/transactions"

// interface TransactionHistoryScreenProps {
//   onNavigateBack: () => void
// }

// export function TransactionHistoryScreen({ onNavigateBack }: TransactionHistoryScreenProps): JSX.Element {
//   const [currentPage, setCurrentPage] = useState(1)
//   const [filterType, setFilterType] = useState<"all" | "deposit" | "withdrawal">("all")
//   const [searchTerm, setSearchTerm] = useState("")
//   const { theme } = useTheme()
//   const { t } = useTranslation()
//   const { user, transactions, isLoading, refreshTransactions } = useAuth()

//   const itemsPerPage = 10

//   // Copy to clipboard function
//   const copyToClipboard = async (text: string) => {
//     try {
//       await navigator.clipboard.writeText(text)
//       // You could add a toast notification here if you have one
//       console.log('Copied to clipboard:', text)
//     } catch (err) {
//       console.error('Failed to copy text: ', err)
//     }
//   }

//   // Use transactions from context instead of separate API calls
//   useEffect(() => {
//     console.log('Transaction History - User:', user)
//     console.log('Transaction History - Transactions from context:', transactions)
//     console.log('Transaction History - Total transactions:', transactions.length)
//   }, [user, transactions])

//   // Helper function to format transaction date
//   const formatTransactionDate = (dateString: string) => {
//     const date = new Date(dateString)
//     return date.toLocaleDateString('fr-FR', {
//       day: '2-digit',
//       month: '2-digit',
//       year: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     })
//   }

//   // Helper function to format transaction amount
//   const formatTransactionAmount = (amount: string, type: string) => {
//     const formattedAmount = parseFloat(amount).toLocaleString('fr-FR')
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

//   // Filter transactions based on type and search term
//   const filteredTransactions = transactions.filter(transaction => {
//     const matchesType = filterType === "all" || transaction.type === filterType
//     const matchesSearch = searchTerm === "" || 
//       transaction.display_recipient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       transaction.recipient_phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       transaction.reference?.toLowerCase().includes(searchTerm.toLowerCase())
//     return matchesType && matchesSearch
//   })

//   // Calculate pagination
//   const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
//   const startIndex = (currentPage - 1) * itemsPerPage
//   const endIndex = startIndex + itemsPerPage
//   const currentTransactions = filteredTransactions.slice(startIndex, endIndex)

//   // Reset to first page when filters change
//   useEffect(() => {
//     setCurrentPage(1)
//   }, [filterType, searchTerm])

//   return (
//     <div
//       className={`min-h-screen transition-colors duration-300 ${
//         theme === "dark"
//           ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
//           : "bg-gradient-to-br from-blue-50 via-white to-blue-100"
//       }`}
//     >
//       {/* Header */}
//       <div className="px-4 pt-12 pb-6 safe-area-inset-top">
//         <div className="flex items-center gap-4 mb-6">
//           <Button
//             variant="ghost"
//             size="sm"
//             className={`h-10 w-10 p-0 rounded-full transition-colors duration-300 ${
//               theme === "dark" 
//                 ? "hover:bg-gray-700/50 text-gray-300" 
//                 : "hover:bg-gray-100/50 text-gray-600"
//             }`}
//             onClick={onNavigateBack}
//           >
//             <ArrowLeft className="w-5 h-5" />
//           </Button>
//           <div>
//             <h1 className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
//               {t("transactionHistory.title")}
//             </h1>
//             <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
//               {t("transactionHistory.subtitle")}
//             </p>
//           </div>
//         </div>

//         {/* Filters and Search */}
//         <div className="space-y-4 mb-6">
//           {/* Search Bar */}
//           <div className="relative">
//             <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
//               theme === "dark" ? "text-gray-400" : "text-gray-500"
//             }`} />
//             <input
//               type="text"
//               placeholder={t("transactionHistory.searchPlaceholder")}
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className={`w-full pl-10 pr-4 py-3 rounded-xl border-0 transition-colors duration-300 ${
//                 theme === "dark" 
//                   ? "bg-gray-800/80 text-white placeholder-gray-400" 
//                   : "bg-white/80 text-gray-900 placeholder-gray-500"
//               } focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
//             />
//           </div>

//           {/* Filter Buttons */}
//           <div className="flex gap-2 overflow-x-auto pb-2">
//             <Button
//               variant={filterType === "all" ? "default" : "outline"}
//               size="sm"
//               onClick={() => setFilterType("all")}
//               className={`whitespace-nowrap ${
//                 filterType === "all" 
//                   ? "bg-blue-500 text-white" 
//                   : theme === "dark" 
//                     ? "border-gray-600 text-gray-300" 
//                     : "border-gray-300 text-gray-700"
//               }`}
//             >
//               {t("transactionHistory.filters.all")}
//             </Button>
//             <Button
//               variant={filterType === "deposit" ? "default" : "outline"}
//               size="sm"
//               onClick={() => setFilterType("deposit")}
//               className={`whitespace-nowrap ${
//                 filterType === "deposit" 
//                   ? "bg-green-500 text-white" 
//                   : theme === "dark" 
//                     ? "border-gray-600 text-gray-300" 
//                     : "border-gray-300 text-gray-700"
//               }`}
//             >
//               {t("transactionHistory.filters.deposits")}
//             </Button>
//             <Button
//               variant={filterType === "withdrawal" ? "default" : "outline"}
//               size="sm"
//               onClick={() => setFilterType("withdrawal")}
//               className={`whitespace-nowrap ${
//                 filterType === "withdrawal" 
//                   ? "bg-red-500 text-white" 
//                   : theme === "dark" 
//                     ? "border-gray-600 text-gray-300" 
//                     : "border-gray-300 text-gray-700"
//               }`}
//             >
//               {t("transactionHistory.filters.withdrawals")}
//             </Button>
//           </div>
//         </div>
//       </div>

//       {/* Transactions List */}
//       <div className="px-4 pb-8">
//         <Card
//           className={`border-0 shadow-xl backdrop-blur-sm transition-colors duration-300 ${
//             theme === "dark" ? "bg-gray-800/95 text-white" : "bg-white/95 text-gray-900"
//           }`}
//         >
//           <CardHeader className="pb-4">
//             <div className="flex items-center justify-between">
//               <CardTitle className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
//                 Transactions ({filteredTransactions.length})
//               </CardTitle>
//               <div className="flex gap-2">
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   className={`h-8 w-8 p-0 rounded-full transition-colors duration-300 ${
//                     theme === "dark" ? "hover:bg-gray-700/50 text-gray-300" : "hover:bg-gray-100/50 text-gray-600"
//                   }`}
//                   onClick={refreshTransactions}
//                 >
//                   <Search className="w-4 h-4" />
//                 </Button>
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   className={`h-8 w-8 p-0 rounded-full transition-colors duration-300 ${
//                     theme === "dark" ? "hover:bg-gray-700/50 text-gray-300" : "hover:bg-gray-100/50 text-gray-600"
//                   }`}
//                 >
//                   <Download className="w-4 h-4" />
//                 </Button>
//               </div>
//             </div>
//           </CardHeader>
//           <CardContent className="space-y-1">
//             {isLoading ? (
//               <div className="text-center py-8">
//                 <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
//                   {t("transactionHistory.loading")}
//                 </p>
//               </div>
//             ) : currentTransactions.length > 0 ? (
//               currentTransactions.map((transaction, index) => (
//                 <div
//                   key={transaction.uid}
//                   className={`py-3 px-2 rounded-lg transition-colors duration-300 ${
//                     theme === "dark" ? "hover:bg-gray-700/30" : "hover:bg-gray-100/30"
//                   } ${
//                     index !== currentTransactions.length - 1
//                       ? theme === "dark"
//                         ? "border-b border-gray-700/50"
//                         : "border-b border-gray-200/50"
//                       : ""
//                   }`}
//                 >
//                   {/* Header Row */}
//                   <div className="flex items-center justify-between mb-2">
//                     <div className="flex items-center gap-3">
//                       <div
//                         className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0 ${
//                           transaction.type === "deposit"
//                             ? "bg-gradient-to-br from-green-500/20 to-green-500/10 text-green-500"
//                             : theme === "dark"
//                               ? "bg-gradient-to-br from-gray-700 to-gray-600 text-gray-300"
//                               : "bg-gradient-to-br from-gray-200 to-gray-100 text-gray-600"
//                         }`}
//                       >
//                         {transaction.type === "deposit" ? (
//                           <ArrowUpCircle className="w-3.5 h-3.5" />
//                         ) : (
//                           <ArrowDownCircle className="w-3.5 h-3.5" />
//                         )}
//                       </div>
//                       <div className="flex-1 min-w-0">
//                         <p className={`font-medium text-sm ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
//                           {transaction.display_recipient_name || transaction.recipient_phone}
//                         </p>
//                         <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
//                           {formatTransactionDate(transaction.created_at)}
//                         </p>
//                       </div>
//                     </div>
//                     <div className="text-right flex-shrink-0">
//                       <p
//                         className={`font-bold text-sm ${
//                           transaction.type === "deposit"
//                             ? "text-green-500"
//                             : theme === "dark"
//                               ? "text-white"
//                               : "text-gray-900"
//                         }`}
//                       >
//                         {transaction.type === "deposit" ? `+${transaction.formatted_amount}` : `-${transaction.formatted_amount}`}
//                       </p>
//                     </div>
//                   </div>
                  
//                   {/* Details Row */}
//                   <div className="flex items-center justify-between">
//                     <div className="flex-1">
//                       <p className={`text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-500"}`}>
//                         <span className="font-medium">{t("transactionHistory.network")}:</span> {transaction.network.nom}
//                       </p>
//                       <div className="flex items-center gap-2">
//                         <p className={`text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-500"}`}>
//                           <span className="font-medium">{t("transactionHistory.reference")}:</span> {transaction.reference}
//                         </p>
//                         <Button
//                           variant="ghost"
//                           size="sm"
//                           className={`h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-700`}
//                           onClick={() => copyToClipboard(transaction.reference)}
//                         >
//                           <Copy className="w-3 h-3" />
//                         </Button>
//                       </div>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <div className={`w-2 h-2 rounded-full ${
//                         transaction.status === "success" || transaction.status === "sent_to_user"
//                           ? "bg-green-500"
//                           : transaction.status === "pending"
//                           ? "bg-yellow-500"
//                           : "bg-red-500"
//                       }`}></div>
//                       <p className={`text-xs ${getStatusColor(transaction.status)}`}>
//                         {transaction.status_display}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               ))
//             ) : (
//               <div className="text-center py-8">
//                 <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
//                   {t("transactionHistory.noTransactions")}
//                 </p>
//               </div>
//             )}
//           </CardContent>
//         </Card>

//         {/* Pagination */}
//         {totalPages > 1 && (
//           <div className="flex items-center justify-between mt-6">
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
//               disabled={currentPage === 1}
//               className={`${
//                 theme === "dark" 
//                   ? "border-gray-600 text-gray-300 disabled:text-gray-600" 
//                   : "border-gray-300 text-gray-700 disabled:text-gray-400"
//               }`}
//             >
//               <ChevronLeft className="w-4 h-4 mr-1" />
//               {t("transactionHistory.previous")}
//             </Button>
            
//             <div className="flex items-center gap-2">
//               {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
//                 let pageNum;
//                 if (totalPages <= 5) {
//                   pageNum = i + 1;
//                 } else if (currentPage <= 3) {
//                   pageNum = i + 1;
//                 } else if (currentPage >= totalPages - 2) {
//                   pageNum = totalPages - 4 + i;
//                 } else {
//                   pageNum = currentPage - 2 + i;
//                 }
                
//                 return (
//                   <Button
//                     key={pageNum}
//                     variant={currentPage === pageNum ? "default" : "outline"}
//                     size="sm"
//                     onClick={() => setCurrentPage(pageNum)}
//                     className={`w-10 h-10 p-0 ${
//                       currentPage === pageNum 
//                         ? "bg-blue-500 text-white" 
//                         : theme === "dark" 
//                           ? "border-gray-600 text-gray-300" 
//                           : "border-gray-300 text-gray-700"
//                     }`}
//                   >
//                     {pageNum}
//                   </Button>
//                 );
//               })}
//             </div>

//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
//               disabled={currentPage === totalPages}
//               className={`${
//                 theme === "dark" 
//                   ? "border-gray-600 text-gray-300 disabled:text-gray-600" 
//                   : "border-gray-300 text-gray-700 disabled:text-gray-400"
//               }`}
//             >
//               {t("transactionHistory.next")}
//               <ChevronRight className="w-4 h-4 ml-1" />
//             </Button>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }

"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ArrowUpCircle,
  ArrowDownCircle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Calendar,
  Download,
  Copy,
  History,
  RefreshCw,
  TrendingUp,
  TrendingDown
} from "lucide-react"
import { useState, useEffect } from "react"
import { useTheme } from "@/lib/contexts"
import { useTranslation } from "@/lib/contexts"
import { useAuth } from "@/lib/contexts"
import { transactionsService, Transaction, TransactionsResponse } from "@/lib/transactions"
import { formatNumberWithSpaces } from "@/lib/utils"
import { TransactionDetailsModal } from "@/components/transaction-details-modal"

interface TransactionHistoryScreenProps {
  onNavigateBack: () => void
}

export function TransactionHistoryScreen({ onNavigateBack }: TransactionHistoryScreenProps): JSX.Element {
  const [currentPage, setCurrentPage] = useState(1)
  const [filterType, setFilterType] = useState<"all" | "deposit" | "withdrawal">("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
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
  
  const { theme } = useTheme()
  const { t } = useTranslation()
  const { user, transactions, isLoading, refreshTransactions } = useAuth()

  const itemsPerPage = 10

  // Copy to clipboard function
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      console.log('Copied to clipboard:', text)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  // Handle refresh with loading state
  const handleRefreshButton = async () => {
    setIsRefreshing(true)
    await refreshTransactions()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  // Helper function to format transaction date
  const formatTransactionDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      return t("additional.time.justNow")
    } else if (diffInHours < 24) {
      return t("additional.time.hoursAgo").replace("{{count}}", diffInHours.toString())
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return t("additional.time.daysAgo").replace("{{count}}", diffInDays.toString())
    }
  }

  // Helper function to format full date
  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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

  // Filter transactions based on type and search term
  const filteredTransactions = transactions.filter(transaction => {
    const matchesType = filterType === "all" || transaction.type === filterType
    const matchesSearch = searchTerm === "" || 
      transaction.display_recipient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.recipient_phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.reference?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesType && matchesSearch
  })

  // Calculate pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex)

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filterType, searchTerm])

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

  const handleRefresh = async () => {
    setPullToRefreshState(prev => ({ ...prev, isRefreshing: true }))
    setIsRefreshing(true)
    await refreshTransactions()
    setTimeout(() => {
      setPullToRefreshState(prev => ({ ...prev, isRefreshing: false, pullDistance: 0 }))
      setIsRefreshing(false)
    }, 500)
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

  return (
    <div 
      className={`min-h-screen relative overflow-hidden ${
        theme === "dark"
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
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            theme === "dark" 
              ? "bg-gray-800/90 backdrop-blur-sm border border-gray-700/50" 
              : "bg-white/90 backdrop-blur-sm border border-gray-200/50"
          } shadow-lg`}>
            <RefreshCw className={`w-5 h-5 ${
              pullToRefreshState.isRefreshing ? 'animate-spin' : ''
            } ${theme === "dark" ? "text-blue-400" : "text-blue-500"}`} />
          </div>
        </div>
      )}

      {/* Mobile-optimized background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-20 right-4 w-32 h-32 rounded-full opacity-10 ${
          theme === "dark" ? "bg-blue-500" : "bg-blue-300"
        } blur-2xl animate-pulse`}></div>
        <div className={`absolute bottom-40 left-4 w-40 h-40 rounded-full opacity-10 ${
          theme === "dark" ? "bg-blue-500" : "bg-blue-300"
        } blur-2xl animate-pulse`} style={{animationDelay: '1.5s'}}></div>
      </div>

      {/* Mobile-first header with safe area */}
      <div className="relative z-10 px-4 pt-safe-area-inset-top pt-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="sm"
            className={`h-11 w-11 p-0 rounded-xl active:scale-95 transition-all duration-200 ${
              theme === "dark" 
                ? "text-gray-300 hover:bg-white/10 active:bg-white/20" 
                : "text-gray-600 hover:bg-black/5 active:bg-black/10"
            }`}
            onClick={onNavigateBack}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div className="text-center flex-1 mx-4">
            <h1 className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              {t("transactionHistory.title")}
            </h1>
            <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              {filteredTransactions.length} {t("additional.transactionHistory.transactions")}
            </p>
          </div>
          
          <div className={`p-2.5 rounded-xl ${
            theme === "dark" ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600"
          }`}>
            <History className="w-5 h-5" />
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="space-y-4 mb-6">
          {/* Search Bar Card */}
          <div className={`p-4 rounded-2xl border transition-all duration-300 ${
            theme === "dark" 
              ? "bg-gray-800/60 border-gray-700/50 backdrop-blur-sm" 
              : "bg-white/80 border-gray-200/50 backdrop-blur-sm shadow-sm"
          }`}>
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`} />
              <input
                type="text"
                placeholder={t("transactionHistory.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border-0 bg-transparent transition-all duration-300 ${
                  theme === "dark" 
                    ? "text-white placeholder-gray-400" 
                    : "text-gray-900 placeholder-gray-500"
                } focus:outline-none`}
              />
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={() => setFilterType("all")}
              className={`flex-1 h-11 rounded-xl font-semibold transition-all duration-200 active:scale-95 ${
                filterType === "all" 
                  ? "bg-blue-500 text-white shadow-lg" 
                  : theme === "dark" 
                    ? "bg-gray-700/50 border border-gray-600 text-gray-300 hover:bg-gray-600"
                    : "bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {t("additional.transactionHistory.all")}
            </Button>
            <Button
              onClick={() => setFilterType("deposit")}
              className={`flex-1 h-11 rounded-xl font-semibold transition-all duration-200 active:scale-95 ${
                filterType === "deposit" 
                  ? "bg-green-500 text-white shadow-lg" 
                  : theme === "dark" 
                    ? "bg-gray-700/50 border border-gray-600 text-gray-300 hover:bg-gray-600"
                    : "bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <TrendingUp className="w-4 h-4 mr-1" />
              {t("additional.transactionHistory.deposits")}
            </Button>
            <Button
              onClick={() => setFilterType("withdrawal")}
              className={`flex-1 h-11 rounded-xl font-semibold transition-all duration-200 active:scale-95 ${
                filterType === "withdrawal" 
                  ? "bg-red-500 text-white shadow-lg" 
                  : theme === "dark" 
                    ? "bg-gray-700/50 border border-gray-600 text-gray-300 hover:bg-gray-600"
                    : "bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <TrendingDown className="w-4 h-4 mr-1" />
              {t("additional.transactionHistory.withdrawals")}
            </Button>
          </div>
        </div>
      </div>

      {/* Scrollable content area */}
      <div className="relative z-10 px-4 pb-24 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
        {/* Action Bar */}
        <div className="flex items-center justify-between mb-4">
          <p className={`text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
            {currentTransactions.length} {t("additional.transactionHistory.of")} {filteredTransactions.length} {t("additional.transactionHistory.transactions")}
          </p>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefreshButton}
              disabled={isRefreshing}
              className={`h-9 w-9 p-0 rounded-xl active:scale-95 transition-all duration-200 ${
                theme === "dark" 
                  ? "hover:bg-gray-700/50 text-gray-300 hover:text-white" 
                  : "hover:bg-gray-100 text-gray-600 hover:text-gray-800"
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            {/* <Button
              variant="ghost"
              size="sm"
              className={`h-9 w-9 p-0 rounded-xl active:scale-95 transition-all duration-200 ${
                theme === "dark" 
                  ? "hover:bg-gray-700/50 text-gray-300 hover:text-white" 
                  : "hover:bg-gray-100 text-gray-600 hover:text-gray-800"
              }`}
            >
              <Download className="w-4 h-4" />
            </Button> */}
          </div>
        </div>

        {/* Transactions List */}
        <div className={`rounded-2xl border transition-all duration-300 ${
          theme === "dark" 
            ? "bg-gray-800/60 border-gray-700/50 backdrop-blur-sm" 
            : "bg-white/80 border-gray-200/50 backdrop-blur-sm shadow-sm"
        }`}>
          <div className="p-4">
            {isLoading ? (
              <div className="text-center py-12">
                <div className={`w-8 h-8 border-2 border-transparent border-t-current rounded-full animate-spin mx-auto mb-4 ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}></div>
                <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  {t("additional.transactionHistory.loadingTransactions")}
                </p>
              </div>
            ) : currentTransactions.length > 0 ? (
              <div className="space-y-1">
                {currentTransactions.map((transaction, index) => (
                  <div
                    key={transaction.uid}
                    onClick={() => {
                      setSelectedTransaction(transaction)
                      setShowTransactionDetails(true)
                    }}
                    className={`p-4 rounded-2xl transition-all duration-200 active:scale-98 cursor-pointer ${
                      theme === "dark" ? "hover:bg-gray-700/30" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                          transaction.type === "deposit"
                            ? theme === "dark"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-green-100 text-green-600"
                            : theme === "dark"
                              ? "bg-red-500/20 text-red-400"
                              : "bg-red-100 text-red-600"
                        }`}>
                          {transaction.type === "deposit" ? (
                            <TrendingUp className="w-5 h-5" />
                          ) : (
                            <TrendingDown className="w-5 h-5" />
                          )}
                        </div>
                        
                        <div>
                          <p className={`font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                            {transaction.display_recipient_name || transaction.recipient_phone}
                          </p>
                          <div className="flex items-center gap-2">
                            <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                              {formatTransactionDate(transaction.created_at)}
                            </p>
                            <div className={`w-1 h-1 rounded-full ${
                              theme === "dark" ? "bg-gray-600" : "bg-gray-400"
                            }`}></div>
                            <p className={`text-sm ${getStatusColor(transaction.status)}`}>
                              {transaction.status_display}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className={`font-bold ${
                          transaction.type === "deposit"
                            ? "text-green-500"
                            : theme === "dark"
                              ? "text-red-400"
                              : "text-red-600"
                        }`}>
                          {transaction.type === "deposit" 
                            ? `+${transaction.formatted_amount || transaction.amount}` 
                            : `-${transaction.formatted_amount || transaction.amount}`}
                        </p>
                        <div className={`w-2 h-2 rounded-full ml-auto mt-2 ${
                          transaction.status === "success" || transaction.status === "sent_to_user"
                            ? "bg-green-500"
                            : transaction.status === "pending"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}></div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className={`text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-500"}`}>
                          <span className="font-medium">{t("additional.transactionHistory.network")}:</span> {transaction.network?.nom || 'N/A'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className={`text-xs font-mono ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                            {transaction.reference}
                          </p>
                          <button
                            onClick={() => copyToClipboard(transaction.reference)}
                            className={`p-1 rounded-lg transition-all duration-200 active:scale-90 ${
                              theme === "dark" 
                                ? "hover:bg-gray-600/50 text-gray-400 hover:text-gray-300" 
                                : "hover:bg-gray-200/50 text-gray-500 hover:text-gray-700"
                            }`}
                            title={t("additional.transactionHistory.copyReference")}
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      
                      <p className={`text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                        {formatFullDate(transaction.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center ${
                  theme === "dark" ? "bg-gray-700/50" : "bg-gray-100"
                }`}>
                  <Search className={`w-8 h-8 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`} />
                </div>
                <p className={`text-sm font-medium ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  {t("additional.transactionHistory.noTransactionsFound")}
                </p>
                <p className={`text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-500"}`}>
                  {t("additional.transactionHistory.tryAdjustingSearchOrFilters")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fixed bottom pagination */}
      {totalPages > 1 && (
        <div className={`fixed bottom-0 left-0 right-0 z-50 p-4 ${
          theme === "dark" 
            ? "bg-slate-900/95 border-t border-gray-700/50" 
            : "bg-white/95 border-t border-gray-200/50"
        } backdrop-blur-lg`}>
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`h-10 rounded-xl font-semibold transition-all duration-200 active:scale-95 ${
                theme === "dark" 
                  ? "border-gray-600 text-gray-300 disabled:text-gray-600 disabled:border-gray-700" 
                  : "border-gray-300 text-gray-700 disabled:text-gray-400 disabled:border-gray-200"
              }`}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              {t("additional.transactionHistory.previous")}
            </Button>
            
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                {t("additional.transactionHistory.pageOf").replace("{{current}}", currentPage.toString()).replace("{{total}}", totalPages.toString())}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`h-10 rounded-xl font-semibold transition-all duration-200 active:scale-95 ${
                theme === "dark" 
                  ? "border-gray-600 text-gray-300 disabled:text-gray-600 disabled:border-gray-700" 
                  : "border-gray-300 text-gray-700 disabled:text-gray-400 disabled:border-gray-200"
              }`}
            >
              {t("additional.transactionHistory.next")}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Transaction Details Modal */}
      <TransactionDetailsModal
        isOpen={showTransactionDetails}
        onClose={() => {
          setShowTransactionDetails(false)
          setSelectedTransaction(null)
        }}
        transaction={selectedTransaction ? {
          ...selectedTransaction,
          historyType: 'transaction',
          typeIcon: selectedTransaction.type === "deposit" ? TrendingUp : TrendingDown,
          typeColor: selectedTransaction.type === "deposit" 
            ? (theme === "dark" ? "bg-green-500/20 text-green-400" : "bg-green-100 text-green-600")
            : (theme === "dark" ? "bg-red-500/20 text-red-400" : "bg-red-100 text-red-600"),
          typeLabel: selectedTransaction.type === "deposit" ? "Dépôt Mobile" : "Retrait Mobile"
        } : null}
      />
    </div>
  )
}