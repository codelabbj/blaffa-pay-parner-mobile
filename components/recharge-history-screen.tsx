

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
import { authService } from "@/lib/auth"
import { BP, pageBg, cardBg, textPrimary, statusPillClass } from "@/lib/design"

interface RechargeHistoryScreenProps {
  onNavigateBack: () => void
  onNavigateToCreate?: () => void
}

export function RechargeHistoryScreen({
  onNavigateBack,
  onNavigateToCreate,
}: RechargeHistoryScreenProps): JSX.Element {
  const [currentPage, setCurrentPage] = useState(1)
  const [filterStatus, setFilterStatus] = useState<"all" | "approved" | "pending" | "rejected" | "proof_submitted">("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Server pagination states
  const [serverRecharges, setServerRecharges] = useState<RechargeData[]>([])
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
  const { user, isLoading, refreshRecharges } = useAuth()
  const isDark = theme === "dark"

  const cardStyle = {
    background: cardBg(isDark),
    borderColor: isDark ? "#243147" : BP.border,
    boxShadow: isDark ? "none" : "0 8px 24px rgba(14, 26, 46, 0.06)",
  }

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
    await refreshRecharges()
    await fetchPage(currentPage, filterStatus, searchTerm)
    setTimeout(() => setIsRefreshing(false), 500)
  }

  const fetchPage = async (page: number, statusFilter: string, searchQuery: string) => {
    try {
      const token = authService.getAccessToken()
      if (token) {
        const response = await rechargeService.getRecharges(token, page, itemsPerPage, statusFilter, searchQuery)
        setServerRecharges(response.results)
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
      fetchPage(currentPage, filterStatus, searchTerm)
    }, 300)
    return () => clearTimeout(handler)
  }, [currentPage, filterStatus, searchTerm])

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
          color: "text-[#0E9F6E]",
          bgColor: theme === "dark" ? "bg-[#EEF2F8]0/20" : "bg-[rgba(14,159,110,0.12)]",
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

  // Filter recharges based on status and search term (local fallback while Debounce loads)
  const currentRecharges = serverRecharges.filter(recharge => {
    const matchesStatus = filterStatus === "all" || recharge.status === filterStatus
    const matchesSearch = searchTerm === "" || 
      recharge.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recharge.formatted_amount.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  // Calculate pagination taking into account backend ignores
  const backendPageSize = serverRecharges.length > 0 ? Math.max(serverRecharges.length, itemsPerPage) : itemsPerPage
  const totalPages = Math.ceil(totalCount / backendPageSize) || 1

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
    await fetchPage(currentPage, filterStatus, searchTerm)
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

  const rechargeStatusPill = (status: string) => {
    const map: Record<string, string> = {
      approved: "bp-pill-success",
      pending: "bp-pill-pending",
      rejected: "bp-pill-failed",
      proof_submitted: "bp-pill-sent",
    }
    return map[status] || "bp-pill-sent"
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
      {/* Pull-to-refresh indicator */}
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
        <div className="flex items-center gap-3 mb-3">
          <button
            type="button"
            onClick={onNavigateBack}
            className="w-10 h-10 rounded-[12px] flex items-center justify-center border shrink-0"
            style={{ background: cardBg(isDark), borderColor: isDark ? "#243147" : BP.border }}
          >
            <ArrowLeft className="w-5 h-5" style={{ color: textPrimary(isDark) }} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-[17px] font-extrabold truncate" style={{ color: textPrimary(isDark) }}>
              Recharges
            </h1>
            <p className="text-[12px]" style={{ color: BP.muted }}>
              {totalCount} {t("additional.rechargeHistory.recharges")}
            </p>
          </div>
          <button
            type="button"
            onClick={handleRefreshButton}
            disabled={isRefreshing}
            className="w-10 h-10 rounded-[12px] flex items-center justify-center border shrink-0"
            style={{ background: cardBg(isDark), borderColor: isDark ? "#243147" : BP.border }}
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`} style={{ color: BP.muted }} />
          </button>
        </div>

        {onNavigateToCreate && (
          <button
            type="button"
            onClick={onNavigateToCreate}
            className="w-full h-[48px] mb-4 rounded-[14px] flex items-center justify-center gap-2 text-white text-[15px] font-bold active:scale-[0.99]"
            style={{ background: BP.green }}
          >
            <Zap className="w-5 h-5" />
            Nouvelle recharge
          </button>
        )}

        <div className="space-y-3 mb-2">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: BP.muted }} />
            <input
              type="text"
              placeholder={t("additional.rechargeHistory.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 pl-11 pr-4 rounded-full border text-[15px] outline-none focus:ring-2 focus:ring-[#0E9F6E]/20"
              style={{
                background: cardBg(isDark),
                borderColor: isDark ? "#243147" : BP.border,
                color: textPrimary(isDark),
                boxShadow: isDark ? "none" : "0 4px 16px rgba(14,26,46,0.04)",
              }}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { key: "all" as const, label: t("additional.rechargeHistory.all"), accent: BP.blue },
                { key: "approved" as const, label: t("additional.rechargeHistory.approved"), accent: BP.green },
                { key: "pending" as const, label: t("additional.rechargeHistory.pending"), accent: BP.amber },
                { key: "rejected" as const, label: t("additional.rechargeHistory.rejected"), accent: BP.red },
              ] as const
            ).map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilterStatus(f.key)}
                className="h-10 rounded-full text-xs font-bold border active:scale-95"
                style={filterChip(filterStatus === f.key, f.accent)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 pb-28">
        <p className="text-[12px] font-semibold mb-3" style={{ color: BP.muted }}>
          {Math.min((currentPage - 1) * backendPageSize + currentRecharges.length, totalCount)}{" "}
          {t("additional.rechargeHistory.of")} {totalCount} {t("additional.rechargeHistory.recharges")}
        </p>
        {isLoading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3" style={{ color: BP.muted }} />
            <p className="text-sm" style={{ color: BP.muted }}>
              {t("additional.rechargeHistory.loadingRecharges")}
            </p>
          </div>
        ) : currentRecharges.length > 0 ? (
          <div className="space-y-3">
            {currentRecharges.map((recharge) => {
              const statusInfo = getStatusInfo(recharge.status)
              return (
                <div key={recharge.uid} className="bp-card p-4 border rounded-[18px]" style={cardStyle}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="font-extrabold text-[17px] tabular-nums" style={{ color: textPrimary(isDark) }}>
                        {recharge.formatted_amount}
                      </p>
                      <p className="text-[12px] mt-0.5" style={{ color: BP.muted }}>
                        {formatRechargeDate(recharge.created_at)}
                      </p>
                    </div>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${rechargeStatusPill(recharge.status)}`}
                    >
                      {statusInfo.text}
                    </span>
                  </div>
                  <div
                    className="flex items-center justify-between pt-2 text-[11px]"
                    style={{ borderTop: `1px solid ${isDark ? "#243147" : BP.border}` }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono" style={{ color: BP.muted }}>
                        {recharge.reference}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(recharge.reference)}
                        title={t("additional.rechargeHistory.copyReference")}
                      >
                        <Copy className="w-3 h-3" style={{ color: BP.muted }} />
                      </button>
                    </div>
                    <span style={{ color: BP.muted }}>{formatFullDate(recharge.created_at)}</span>
                  </div>
                  {recharge.is_expired && (
                    <p className="text-xs mt-2" style={{ color: BP.red }}>
                      {t("additional.rechargeHistory.expired")}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Search className="w-10 h-10 mx-auto mb-3" style={{ color: BP.muted }} />
            <p className="text-sm font-semibold" style={{ color: BP.muted }}>
              {t("additional.rechargeHistory.noRechargesFound")}
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
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={!hasNextPage}
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
