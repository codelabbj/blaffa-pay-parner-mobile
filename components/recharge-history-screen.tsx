// "use client"

// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import {
//   Smartphone,
//   ArrowLeft,
//   ChevronLeft,
//   ChevronRight,
//   Filter,
//   Search,
//   Calendar,
//   Download,
//   CreditCard,
//   CheckCircle,
//   XCircle,
//   Clock,
//   Copy,
// } from "lucide-react"
// import { useState, useEffect } from "react"
// import { useTheme } from "@/lib/contexts"
// import { useTranslation } from "@/lib/contexts"
// import { useAuth } from "@/lib/contexts"
// import { rechargeService, RechargeData, RechargesResponse } from "@/lib/recharge"

// interface RechargeHistoryScreenProps {
//   onNavigateBack: () => void
// }

// export function RechargeHistoryScreen({ onNavigateBack }: RechargeHistoryScreenProps): JSX.Element {
//   const [currentPage, setCurrentPage] = useState(1)
//   const [filterStatus, setFilterStatus] = useState<"all" | "approved" | "pending" | "rejected" | "proof_submitted">("all")
//   const [searchTerm, setSearchTerm] = useState("")
//   const { theme } = useTheme()
//   const { t } = useTranslation()
//   const { user, recharges, isLoading, refreshRecharges } = useAuth()

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

//   // Use recharges from context instead of separate API calls
//   useEffect(() => {
//     console.log('Recharge History - User:', user)
//     console.log('Recharge History - Recharges from context:', recharges)
//     console.log('Recharge History - Total recharges:', recharges.length)
//   }, [user, recharges])

//   // Helper function to format recharge date
//   const formatRechargeDate = (dateString: string) => {
//     const date = new Date(dateString)
//     return date.toLocaleDateString('fr-FR', {
//       day: '2-digit',
//       month: '2-digit',
//       year: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     })
//   }

//   // Helper function to format recharge amount
//   const formatRechargeAmount = (amount: string) => {
//     return `${parseFloat(amount).toLocaleString('fr-FR')} €`
//   }

//   // Helper function to get status color and icon
//   const getStatusInfo = (status: string) => {
//     switch (status) {
//       case "approved":
//         return {
//           color: "text-green-500",
//           bgColor: "bg-green-500/10",
//           icon: CheckCircle,
//           text: "Approuvée"
//         }
//       case "pending":
//         return {
//           color: "text-yellow-500",
//           bgColor: "bg-yellow-500/10",
//           icon: Clock,
//           text: "En attente"
//         }
//       case "rejected":
//         return {
//           color: "text-red-500",
//           bgColor: "bg-red-500/10",
//           icon: XCircle,
//           text: "Rejetée"
//         }
//       case "proof_submitted":
//         return {
//           color: "text-blue-500",
//           bgColor: "bg-blue-500/10",
//           icon: CheckCircle,
//           text: "Preuve soumise"
//         }
//       default:
//         return {
//           color: "text-gray-500",
//           bgColor: "bg-gray-500/10",
//           icon: Clock,
//           text: "Inconnu"
//         }
//     }
//   }

//   // Filter recharges based on status and search term
//   const filteredRecharges = recharges.filter(recharge => {
//     const matchesStatus = filterStatus === "all" || recharge.status === filterStatus
//     const matchesSearch = searchTerm === "" || 
//       recharge.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       recharge.formatted_amount.toLowerCase().includes(searchTerm.toLowerCase())
//     return matchesStatus && matchesSearch
//   })

//   // Calculate pagination
//   const totalPages = Math.ceil(filteredRecharges.length / itemsPerPage)
//   const startIndex = (currentPage - 1) * itemsPerPage
//   const endIndex = startIndex + itemsPerPage
//   const currentRecharges = filteredRecharges.slice(startIndex, endIndex)

//   // Reset to first page when filters change
//   useEffect(() => {
//     setCurrentPage(1)
//   }, [filterStatus, searchTerm])

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
//               {t("rechargeHistory.title")}
//             </h1>
//             <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
//               {t("rechargeHistory.subtitle")}
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
//               placeholder={t("rechargeHistory.searchPlaceholder")}
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
//               variant={filterStatus === "all" ? "default" : "outline"}
//               size="sm"
//               onClick={() => setFilterStatus("all")}
//               className={`whitespace-nowrap ${
//                 filterStatus === "all" 
//                   ? "bg-blue-500 text-white" 
//                   : theme === "dark" 
//                     ? "border-gray-600 text-gray-300" 
//                     : "border-gray-300 text-gray-700"
//               }`}
//             >
//               {t("rechargeHistory.filters.all")}
//             </Button>
//             <Button
//               variant={filterStatus === "approved" ? "default" : "outline"}
//               size="sm"
//               onClick={() => setFilterStatus("approved")}
//               className={`whitespace-nowrap ${
//                 filterStatus === "approved" 
//                   ? "bg-green-500 text-white" 
//                   : theme === "dark" 
//                     ? "border-gray-600 text-gray-300" 
//                     : "border-gray-300 text-gray-700"
//               }`}
//             >
//               {t("rechargeHistory.filters.approved")}
//             </Button>
//             <Button
//               variant={filterStatus === "pending" ? "default" : "outline"}
//               size="sm"
//               onClick={() => setFilterStatus("pending")}
//               className={`whitespace-nowrap ${
//                 filterStatus === "pending" 
//                   ? "bg-yellow-500 text-white" 
//                   : theme === "dark" 
//                     ? "border-gray-600 text-gray-300" 
//                     : "border-gray-300 text-gray-700"
//               }`}
//             >
//               {t("rechargeHistory.filters.pending")}
//             </Button>
//             <Button
//               variant={filterStatus === "rejected" ? "default" : "outline"}
//               size="sm"
//               onClick={() => setFilterStatus("rejected")}
//               className={`whitespace-nowrap ${
//                 filterStatus === "rejected" 
//                   ? "bg-red-500 text-white" 
//                   : theme === "dark" 
//                     ? "border-gray-600 text-gray-300" 
//                     : "border-gray-300 text-gray-700"
//               }`}
//             >
//               {t("rechargeHistory.filters.rejected")}
//             </Button>
//             <Button
//               variant={filterStatus === "proof_submitted" ? "default" : "outline"}
//               size="sm"
//               onClick={() => setFilterStatus("proof_submitted")}
//               className={`whitespace-nowrap ${
//                 filterStatus === "proof_submitted" 
//                   ? "bg-blue-500 text-white" 
//                   : theme === "dark" 
//                     ? "border-gray-600 text-gray-300" 
//                     : "border-gray-300 text-gray-700"
//               }`}
//             >
//               {t("rechargeHistory.filters.proofSubmitted")}
//             </Button>
//           </div>
//         </div>
//       </div>

//       {/* Recharges List */}
//       <div className="px-4 pb-8">
//         <Card
//           className={`border-0 shadow-xl backdrop-blur-sm transition-colors duration-300 ${
//             theme === "dark" ? "bg-gray-800/95 text-white" : "bg-white/95 text-gray-900"
//           }`}
//         >
//           <CardHeader className="pb-4">
//             <div className="flex items-center justify-between">
//               <CardTitle className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
//                 Recharges ({filteredRecharges.length})
//               </CardTitle>
//               <div className="flex gap-2">
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   className={`h-8 w-8 p-0 rounded-full transition-colors duration-300 ${
//                     theme === "dark" ? "hover:bg-gray-700/50 text-gray-300" : "hover:bg-gray-100/50 text-gray-600"
//                   }`}
//                   onClick={refreshRecharges}
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
//                   {t("rechargeHistory.loading")}
//                 </p>
//               </div>
//             ) : currentRecharges.length > 0 ? (
//               currentRecharges.map((recharge, index) => {
//                 const statusInfo = getStatusInfo(recharge.status)
//                 const StatusIcon = statusInfo.icon
                
//                 return (
//                 <div
//                   key={recharge.uid}
//                   className={`py-3 px-2 rounded-lg transition-colors duration-300 ${
//                     theme === "dark" ? "hover:bg-gray-700/30" : "hover:bg-gray-100/30"
//                   } ${
//                     index !== currentRecharges.length - 1
//                       ? theme === "dark"
//                         ? "border-b border-gray-700/50"
//                         : "border-b border-gray-200/50"
//                       : ""
//                   }`}
//                 >
//                   {/* Header Row */}
//                   <div className="flex items-center justify-between mb-2">
//                     <div className="flex items-center gap-3">
//                       <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0 ${statusInfo.bgColor}`}>
//                         <Smartphone className={`w-3.5 h-3.5 ${statusInfo.color}`} />
//                       </div>
//                       <div className="flex-1 min-w-0">
//                         <p className={`font-medium text-sm ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
//                           {recharge.formatted_amount}
//                         </p>
//                         <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
//                           {formatRechargeDate(recharge.created_at)}
//                         </p>
//                       </div>
//                     </div>
//                     <div className="text-right flex-shrink-0">
//                       <p className={`font-bold text-sm ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
//                         {recharge.formatted_amount}
//                       </p>
//                     </div>
//                   </div>
                  
//                   {/* Details Row */}
//                   <div className="flex items-center justify-between">
//                     <div className="flex-1">
//                       <div className="flex items-center gap-2">
//                         <p className={`text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-500"}`}>
//                           <span className="font-medium">{t("rechargeHistory.reference")}:</span> {recharge.reference}
//                         </p>
//                         <Button
//                           variant="ghost"
//                           size="sm"
//                           className={`h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-700`}
//                           onClick={() => copyToClipboard(recharge.reference)}
//                         >
//                           <Copy className="w-3 h-3" />
//                         </Button>
//                       </div>
//                       {recharge.is_expired && (
//                         <p className="text-xs text-red-500">
//                           <span className="font-medium">{t("rechargeHistory.status")}:</span> {t("rechargeHistory.expired")}
//                         </p>
//                       )}
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <StatusIcon className={`w-3 h-3 ${statusInfo.color}`} />
//                       <p className={`text-xs ${statusInfo.color}`}>
//                         {statusInfo.text}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//                 )
//               })
//             ) : (
//               <div className="text-center py-8">
//                 <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
//                   {t("rechargeHistory.noRecharges")}
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
//               {t("rechargeHistory.previous")}
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
//               {t("rechargeHistory.next")}
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
  Smartphone,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Calendar,
  Download,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  Copy,
  RefreshCw,
  Battery,
  Zap,
  AlertTriangle
} from "lucide-react"
import { useState, useEffect } from "react"
import { useTheme } from "@/lib/contexts"
import { useTranslation } from "@/lib/contexts"
import { useAuth } from "@/lib/contexts"
import { rechargeService, RechargeData, RechargesResponse } from "@/lib/recharge"

interface RechargeHistoryScreenProps {
  onNavigateBack: () => void
}

export function RechargeHistoryScreen({ onNavigateBack }: RechargeHistoryScreenProps): JSX.Element {
  const [currentPage, setCurrentPage] = useState(1)
  const [filterStatus, setFilterStatus] = useState<"all" | "approved" | "pending" | "rejected" | "proof_submitted">("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  
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
  const { user, recharges, isLoading, refreshRecharges } = useAuth()

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
    await refreshRecharges()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  // Helper function to format recharge date
  const formatRechargeDate = (dateString: string) => {
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

  // Helper function to get status color and icon
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "approved":
        return {
          color: "text-green-500",
          bgColor: theme === "dark" ? "bg-green-500/20" : "bg-green-100",
          icon: CheckCircle,
          text: t("additional.rechargeHistory.approved")
        }
      case "pending":
        return {
          color: "text-yellow-500",
          bgColor: theme === "dark" ? "bg-yellow-500/20" : "bg-yellow-100",
          icon: Clock,
          text: t("additional.rechargeHistory.pending")
        }
      case "rejected":
        return {
          color: "text-red-500",
          bgColor: theme === "dark" ? "bg-red-500/20" : "bg-red-100",
          icon: XCircle,
          text: t("additional.rechargeHistory.rejected")
        }
      case "proof_submitted":
        return {
          color: "text-blue-500",
          bgColor: theme === "dark" ? "bg-blue-500/20" : "bg-blue-100",
          icon: AlertTriangle,
          text: t("additional.rechargeHistory.underReview")
        }
      default:
        return {
          color: "text-gray-500",
          bgColor: theme === "dark" ? "bg-gray-500/20" : "bg-gray-100",
          icon: Clock,
          text: t("additional.rechargeHistory.unknown")
        }
    }
  }

  // Filter recharges based on status and search term
  const filteredRecharges = recharges.filter(recharge => {
    const matchesStatus = filterStatus === "all" || recharge.status === filterStatus
    const matchesSearch = searchTerm === "" || 
      recharge.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recharge.formatted_amount.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  // Calculate pagination
  const totalPages = Math.ceil(filteredRecharges.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentRecharges = filteredRecharges.slice(startIndex, endIndex)

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filterStatus, searchTerm])

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
    await refreshRecharges()
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
        : "bg-gradient-to-b from-orange-50 via-white to-blue-50"
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
            } ${theme === "dark" ? "text-orange-400" : "text-orange-500"}`} />
          </div>
        </div>
      )}

      {/* Mobile-optimized background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-20 right-4 w-32 h-32 rounded-full opacity-10 ${
          theme === "dark" ? "bg-cyan-500" : "bg-cyan-300"
        } blur-2xl animate-pulse`}></div>
        <div className={`absolute bottom-40 left-4 w-40 h-40 rounded-full opacity-10 ${
          theme === "dark" ? "bg-emerald-500" : "bg-emerald-300"
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
              {t("rechargeHistory.title") || "Recharge History"}
            </h1>
            <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              {filteredRecharges.length} {t("additional.rechargeHistory.recharges")}
            </p>
          </div>
          
          <div className={`p-2.5 rounded-xl ${
            theme === "dark" ? "bg-cyan-500/20 text-cyan-400" : "bg-cyan-100 text-cyan-600"
          }`}>
            <Battery className="w-5 h-5" />
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
                placeholder={t("additional.rechargeHistory.searchPlaceholder")}
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
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => setFilterStatus("all")}
              className={`h-11 rounded-xl font-semibold transition-all duration-200 active:scale-95 ${
                filterStatus === "all" 
                  ? "bg-orange-500 text-white shadow-lg" 
                  : theme === "dark" 
                    ? "bg-gray-700/50 border border-gray-600 text-gray-300 hover:bg-gray-600"
                    : "bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {t("additional.rechargeHistory.all")}
            </Button>
            <Button
              onClick={() => setFilterStatus("approved")}
              className={`h-11 rounded-xl font-semibold transition-all duration-200 active:scale-95 ${
                filterStatus === "approved" 
                  ? "bg-green-500 text-white shadow-lg" 
                  : theme === "dark" 
                    ? "bg-gray-700/50 border border-gray-600 text-gray-300 hover:bg-gray-600"
                    : "bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              {t("additional.rechargeHistory.approved")}
            </Button>
            <Button
              onClick={() => setFilterStatus("pending")}
              className={`h-11 rounded-xl font-semibold transition-all duration-200 active:scale-95 ${
                filterStatus === "pending" 
                  ? "bg-yellow-500 text-white shadow-lg" 
                  : theme === "dark" 
                    ? "bg-gray-700/50 border border-gray-600 text-gray-300 hover:bg-gray-600"
                    : "bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Clock className="w-4 h-4 mr-1" />
              {t("additional.rechargeHistory.pending")}
            </Button>
            <Button
              onClick={() => setFilterStatus("rejected")}
              className={`h-11 rounded-xl font-semibold transition-all duration-200 active:scale-95 ${
                filterStatus === "rejected" 
                  ? "bg-red-500 text-white shadow-lg" 
                  : theme === "dark" 
                    ? "bg-gray-700/50 border border-gray-600 text-gray-300 hover:bg-gray-600"
                    : "bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <XCircle className="w-4 h-4 mr-1" />
              {t("additional.rechargeHistory.rejected")}
            </Button>
          </div>
        </div>
      </div>

      {/* Scrollable content area */}
      <div className="relative z-10 px-4 pb-24 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
        {/* Action Bar */}
        <div className="flex items-center justify-between mb-4">
          <p className={`text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
            {currentRecharges.length} {t("additional.rechargeHistory.of")} {filteredRecharges.length} {t("additional.rechargeHistory.recharges")}
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

        {/* Recharges List */}
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
                  {t("additional.rechargeHistory.loadingRecharges")}
                </p>
              </div>
            ) : currentRecharges.length > 0 ? (
              <div className="space-y-1">
                {currentRecharges.map((recharge, index) => {
                const statusInfo = getStatusInfo(recharge.status)
                const StatusIcon = statusInfo.icon
                
                return (
                <div
                  key={recharge.uid}
                      className={`p-4 rounded-2xl transition-all duration-200 active:scale-98 ${
                        theme === "dark" ? "hover:bg-gray-700/30" : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${statusInfo.bgColor}`}>
                            <Zap className={`w-5 h-5 ${statusInfo.color}`} />
                      </div>
                          
                          <div>
                            <p className={`font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                          {recharge.formatted_amount}
                        </p>
                            <div className="flex items-center gap-2">
                              <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                          {formatRechargeDate(recharge.created_at)}
                        </p>
                              <div className={`w-1 h-1 rounded-full ${
                                theme === "dark" ? "bg-gray-600" : "bg-gray-400"
                              }`}></div>
                              <div className="flex items-center gap-1">
                                <StatusIcon className={`w-3 h-3 ${statusInfo.color}`} />
                                <p className={`text-sm ${statusInfo.color}`}>
                                  {statusInfo.text}
                                </p>
                              </div>
                            </div>
                      </div>
                    </div>
                        
                        <div className="text-right">
                          <p className={`font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                        {recharge.formatted_amount}
                      </p>
                          <div className={`w-2 h-2 rounded-full ml-auto mt-2 ${
                            recharge.status === "approved"
                              ? "bg-green-500"
                              : recharge.status === "pending"
                              ? "bg-yellow-500"
                              : recharge.status === "rejected"
                              ? "bg-red-500"
                              : "bg-blue-500"
                          }`}></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                            <p className={`text-xs font-mono ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                              {recharge.reference}
                        </p>
                            <button
                          onClick={() => copyToClipboard(recharge.reference)}
                              className={`p-1 rounded-lg transition-all duration-200 active:scale-90 ${
                                theme === "dark" 
                                  ? "hover:bg-gray-600/50 text-gray-400 hover:text-gray-300" 
                                  : "hover:bg-gray-200/50 text-gray-500 hover:text-gray-700"
                              }`}
                              title={t("additional.rechargeHistory.copyReference")}
                        >
                          <Copy className="w-3 h-3" />
                            </button>
                      </div>
                      {recharge.is_expired && (
                            <p className="text-xs text-red-500 mt-1">
                              <span className="font-medium">{t("additional.rechargeHistory.status")}:</span> {t("additional.rechargeHistory.expired")}
                        </p>
                      )}
                    </div>
                        
                        <p className={`text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                          {formatFullDate(recharge.created_at)}
                      </p>
                    </div>
                  </div>
                  )
                })}
                </div>
            ) : (
              <div className="text-center py-12">
                <div className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center ${
                  theme === "dark" ? "bg-gray-700/50" : "bg-gray-100"
                }`}>
                  <Search className={`w-8 h-8 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`} />
                </div>
                <p className={`text-sm font-medium ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  {t("additional.rechargeHistory.noRechargesFound")}
                </p>
                <p className={`text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-500"}`}>
                  {t("additional.rechargeHistory.tryAdjustingSearchOrFilters")}
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
              {t("additional.rechargeHistory.previous")}
            </Button>
            
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                {t("additional.rechargeHistory.pageOf").replace("{{current}}", currentPage.toString()).replace("{{total}}", totalPages.toString())}
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
              {t("additional.rechargeHistory.next")}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          </div>
        )}
    </div>
  )
}
