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
import { authService } from "@/lib/auth"
import { formatNumberWithSpaces } from "@/lib/utils"
import { TransactionDetailsModal } from "@/components/transaction-details-modal"
import { BP, pageBg, cardBg, textPrimary, statusPillClass } from "@/lib/design"

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
  
  // Server pagination states
  const [serverTransactions, setServerTransactions] = useState<Transaction[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [hasNextPage, setHasNextPage] = useState(false)
  
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
  const { user, isLoading, refreshTransactions } = useAuth()
  const isDark = theme === "dark"

  const cardStyle = {
    background: cardBg(isDark),
    borderColor: isDark ? "#243147" : BP.border,
    boxShadow: isDark ? "none" : "0 8px 24px rgba(14, 26, 46, 0.06)",
  }

  // Items per page to request
  const itemsPerPage = 20

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
    await fetchPage(currentPage, filterType, searchTerm)
    setTimeout(() => setIsRefreshing(false), 500)
  }

  const fetchPage = async (page: number, typeFilter: string, searchQuery: string) => {
    try {
      const token = authService.getAccessToken()
      if (token) {
        const response = await transactionsService.getTransactions(token, page, itemsPerPage, typeFilter, searchQuery)
        setServerTransactions(response.results)
        setTotalCount(response.count)
        setHasNextPage(!!response.next)
      }
    } catch (error) {
      console.error("Fetch page error:", error)
    }
  }

  // Fetch page initially and when params change
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchPage(currentPage, filterType, searchTerm)
    }, 300)
    return () => clearTimeout(handler)
  }, [currentPage, filterType, searchTerm])

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
  const currentTransactions = serverTransactions.filter(transaction => {
    const matchesType = filterType === "all" || transaction.type === filterType
    const matchesSearch = searchTerm === "" || 
      transaction.display_recipient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.recipient_phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.reference?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesType && matchesSearch
  })

  // Calculate pagination taking into account backend page size ignores
  const backendPageSize = serverTransactions.length > 0 ? Math.max(serverTransactions.length, itemsPerPage) : itemsPerPage
  const totalPages = Math.ceil(totalCount / backendPageSize) || 1

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
    await fetchPage(currentPage, filterType, searchTerm)
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

  const filterChip = (active: boolean, accent: string) =>
    active
      ? { background: accent, color: "#FFFFFF", borderColor: accent }
      : {
          background: cardBg(isDark),
          color: BP.muted,
          borderColor: isDark ? "#243147" : BP.border,
        }

  return (
    <div
      className="min-h-screen"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        background: pageBg(isDark),
        transform: `translateY(${pullToRefreshState.pullDistance}px)`,
        transition: pullToRefreshState.isPulling ? "none" : "transform 0.3s ease-out",
      }}
    >
      {(pullToRefreshState.isPulling || pullToRefreshState.isRefreshing) && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-40">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center border"
            style={{ background: cardBg(isDark), borderColor: isDark ? "#243147" : BP.border }}
          >
            <RefreshCw
              className={`w-5 h-5 ${pullToRefreshState.isRefreshing ? "animate-spin" : ""}`}
              style={{ color: BP.green }}
            />
          </div>
        </div>
      )}

      <div className="px-4 pt-12 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <button
            type="button"
            onClick={onNavigateBack}
            className="w-10 h-10 rounded-[12px] flex items-center justify-center border shrink-0 active:scale-95"
            style={{ background: cardBg(isDark), borderColor: isDark ? "#243147" : BP.border }}
          >
            <ArrowLeft className="w-5 h-5" style={{ color: textPrimary(isDark) }} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-[17px] font-extrabold" style={{ color: textPrimary(isDark) }}>
              {t("transactionHistory.title")}
            </h1>
            <p className="text-[12px]" style={{ color: BP.muted }}>
              {totalCount} {t("additional.transactionHistory.transactions")}
            </p>
          </div>
          <button
            type="button"
            onClick={handleRefreshButton}
            disabled={isRefreshing}
            className="w-10 h-10 rounded-[12px] flex items-center justify-center border shrink-0 active:scale-95"
            style={{ background: cardBg(isDark), borderColor: isDark ? "#243147" : BP.border }}
          >
            <RefreshCw
              className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`}
              style={{ color: BP.muted }}
            />
          </button>
        </div>

        <div className="space-y-3 mb-2">
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: BP.muted }}
            />
            <input
              type="text"
              placeholder={t("transactionHistory.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 pl-11 pr-4 rounded-full border text-[15px] font-medium outline-none focus:ring-2 focus:ring-[#0E9F6E]/20"
              style={{
                background: cardBg(isDark),
                borderColor: isDark ? "#243147" : BP.border,
                color: textPrimary(isDark),
                boxShadow: isDark ? "none" : "0 4px 16px rgba(14,26,46,0.04)",
              }}
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFilterType("all")}
              className="flex-1 h-10 rounded-full text-xs font-bold border active:scale-95"
              style={filterChip(filterType === "all", BP.blue)}
            >
              {t("additional.transactionHistory.all")}
            </button>
            <button
              type="button"
              onClick={() => setFilterType("deposit")}
              className="flex-1 h-10 rounded-full text-xs font-bold border flex items-center justify-center gap-1 active:scale-95"
              style={filterChip(filterType === "deposit", BP.green)}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              {t("additional.transactionHistory.deposits")}
            </button>
            <button
              type="button"
              onClick={() => setFilterType("withdrawal")}
              className="flex-1 h-10 rounded-full text-xs font-bold border flex items-center justify-center gap-1 active:scale-95"
              style={filterChip(filterType === "withdrawal", BP.red)}
            >
              <TrendingDown className="w-3.5 h-3.5" />
              {t("additional.transactionHistory.withdrawals")}
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 pb-28">
        <p className="text-[12px] font-semibold mb-3" style={{ color: BP.muted }}>
          {Math.min((currentPage - 1) * backendPageSize + currentTransactions.length, totalCount)}{" "}
          {t("additional.transactionHistory.of")} {totalCount} {t("additional.transactionHistory.transactions")}
        </p>

        {isLoading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3" style={{ color: BP.muted }} />
            <p className="text-sm" style={{ color: BP.muted }}>
              {t("additional.transactionHistory.loadingTransactions")}
            </p>
          </div>
        ) : currentTransactions.length > 0 ? (
          <div className="space-y-3">
            {currentTransactions.map((transaction) => (
              <button
                key={transaction.uid}
                type="button"
                onClick={() => {
                  setSelectedTransaction(transaction)
                  setShowTransactionDetails(true)
                }}
                className="w-full text-left bp-card p-4 border rounded-[18px] active:scale-[0.99] transition"
                style={cardStyle}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-11 h-11 rounded-[14px] flex items-center justify-center shrink-0"
                      style={{
                        background:
                          transaction.type === "deposit"
                            ? "rgba(14, 159, 110, 0.14)"
                            : "rgba(229, 72, 77, 0.12)",
                        color: transaction.type === "deposit" ? BP.green : BP.red,
                      }}
                    >
                      {transaction.type === "deposit" ? (
                        <TrendingUp className="w-5 h-5" />
                      ) : (
                        <TrendingDown className="w-5 h-5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-extrabold text-[15px] truncate" style={{ color: textPrimary(isDark) }}>
                        {transaction.display_recipient_name || transaction.recipient_phone}
                      </p>
                      <p className="text-[12px] mt-0.5" style={{ color: BP.muted }}>
                        {formatTransactionDate(transaction.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p
                      className="font-extrabold text-[15px] tabular-nums"
                      style={{ color: transaction.type === "deposit" ? BP.green : BP.red }}
                    >
                      {transaction.type === "deposit"
                        ? `+${transaction.formatted_amount || transaction.amount}`
                        : `-${transaction.formatted_amount || transaction.amount}`}
                    </p>
                    <span
                      className={`inline-block mt-2 text-[11px] font-bold px-2.5 py-1 rounded-full ${statusPillClass(transaction.status)}`}
                    >
                      {transaction.status_display}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 pt-2 text-[11px]" style={{ borderTop: `1px solid ${isDark ? "#243147" : BP.border}` }}>
                  <div className="flex items-center gap-2 min-w-0">
                    <span style={{ color: BP.muted }}>
                      {transaction.network?.nom || "N/A"} · {transaction.reference}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        copyToClipboard(transaction.reference)
                      }}
                      className="p-1 rounded-lg"
                      title={t("additional.transactionHistory.copyReference")}
                    >
                      <Copy className="w-3 h-3" style={{ color: BP.muted }} />
                    </button>
                  </div>
                  <span style={{ color: BP.muted }}>{formatFullDate(transaction.created_at)}</span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Search className="w-10 h-10 mx-auto mb-3" style={{ color: BP.muted }} />
            <p className="text-sm font-semibold" style={{ color: BP.muted }}>
              {t("additional.transactionHistory.noTransactionsFound")}
            </p>
            <p className="text-xs mt-1" style={{ color: BP.muted }}>
              {t("additional.transactionHistory.tryAdjustingSearchOrFilters")}
            </p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div
          className="fixed bottom-0 left-0 right-0 z-50 p-4 border-t"
          style={{ background: pageBg(isDark), borderColor: isDark ? "#243147" : BP.border }}
        >
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
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={!hasNextPage}
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