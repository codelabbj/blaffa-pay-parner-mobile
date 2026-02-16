"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ErrorAlert } from "@/components/ui/error-alert"
import { ArrowLeft, Send, Search, Filter, Calendar, Download, RefreshCw, User, Clock, CheckCircle, XCircle, AlertCircle, Copy } from "lucide-react"
import { useState, useEffect } from "react"
import { useTheme } from "@/lib/contexts"
import { useTranslation } from "@/lib/contexts"
import { authService } from "@/lib/auth"
import { transferService, Transfer } from "@/lib/transfers"
import { parseBackendError, formatErrorMessage } from "@/lib/error-utils"
import { formatNumberWithSpaces } from "@/lib/utils"
import { TransactionDetailsModal } from "@/components/transaction-details-modal"

interface TransferHistoryScreenProps {
  onNavigateBack: () => void
}

export function TransferHistoryScreen({ onNavigateBack }: TransferHistoryScreenProps) {
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [filteredTransfers, setFilteredTransfers] = useState<Transfer[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState({
    type: "sent",
    status: "completed",
    minAmount: "",
    maxAmount: "",
    dateFrom: "2025-03-01",
    dateTo: "2025-09-30"
  })
  const [showFilters, setShowFilters] = useState(false)
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null)
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

  const loadTransfers = async () => {
    setIsLoading(true)
    setError("")
    
    try {
      const accessToken = authService.getAccessToken()
      if (!accessToken) {
        throw new Error("No access token available")
      }

      const response = await transferService.getTransfers(
        accessToken,
        filters.type,
        filters.status,
        filters.minAmount,
        filters.maxAmount,
        filters.dateFrom,
        filters.dateTo
      )
      setTransfers(response.transfers)
      setFilteredTransfers(response.transfers)
    } catch (error) {
      console.error('Load transfers error:', error)
      const parsedError = parseBackendError(error)
      const formattedMessage = formatErrorMessage(parsedError)
      setError(formattedMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Filter transfers based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredTransfers(transfers)
    } else {
      const filtered = transfers.filter(transfer => 
        transfer.receiver_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transfer.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transfer.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transfer.amount.includes(searchQuery)
      )
      setFilteredTransfers(filtered)
    }
  }, [searchQuery, transfers])

  useEffect(() => {
    loadTransfers()
  }, [filters])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-500"
      case "failed":
        return "text-red-500"
      case "pending":
        return "text-yellow-500"
      default:
        return "text-gray-500"
    }
  }

  const copyReference = async (reference: string) => {
    try {
      await navigator.clipboard.writeText(reference)
      // You could add a toast notification here if needed
    } catch (error) {
      console.error('Failed to copy reference:', error)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      type: "sent",
      status: "completed",
      minAmount: "",
      maxAmount: "",
      dateFrom: "2025-03-01",
      dateTo: "2025-09-30"
    })
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

  const handleRefresh = async () => {
    setPullToRefreshState(prev => ({ ...prev, isRefreshing: true }))
    await loadTransfers()
    setTimeout(() => {
      setPullToRefreshState(prev => ({ ...prev, isRefreshing: false, pullDistance: 0 }))
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
        <div className={`absolute top-20 right-4 w-32 h-32 rounded-full opacity-20 ${
          theme === "dark" ? "bg-blue-500" : "bg-blue-300"
        } blur-2xl animate-pulse`}></div>
        <div className={`absolute bottom-40 left-4 w-40 h-40 rounded-full opacity-20 ${
          theme === "dark" ? "bg-blue-500" : "bg-blue-300"
        } blur-2xl animate-pulse`} style={{animationDelay: '1.5s'}}></div>
      </div>

      {/* Mobile-first header with safe area */}
      <div className="relative z-10 px-4 pt-safe-area-inset-top pt-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <Button
            variant="ghost"
            size="sm"
            className={`h-10 w-10 sm:h-11 sm:w-11 p-0 rounded-xl active:scale-95 transition-all duration-200 ${
              theme === "dark" 
                ? "text-gray-300 hover:bg-white/10 active:bg-white/20" 
                : "text-gray-600 hover:bg-black/5 active:bg-black/10"
            }`}
            onClick={onNavigateBack}
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
          
          <div className="text-center flex-1 mx-3 sm:mx-4">
            <h1 className={`text-lg sm:text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              Historique des transferts
            </h1>
            <p className={`text-xs sm:text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              {filteredTransfers.length} transfert{filteredTransfers.length > 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={`h-10 w-10 sm:h-11 sm:w-11 p-0 rounded-xl active:scale-95 transition-all duration-200 ${
                theme === "dark" 
                  ? "text-gray-300 hover:bg-white/10 active:bg-white/20" 
                  : "text-gray-600 hover:bg-black/5 active:bg-black/10"
              }`}
            >
              <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadTransfers}
              disabled={isLoading}
              className={`h-10 w-10 sm:h-11 sm:w-11 p-0 rounded-xl active:scale-95 transition-all duration-200 ${
                theme === "dark" 
                  ? "text-gray-300 hover:bg-white/10 active:bg-white/20" 
                  : "text-gray-600 hover:bg-black/5 active:bg-black/10"
              }`}
            >
              <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Search Field */}
        <div className={`p-4 rounded-2xl border mb-4 sm:mb-6 ${
          theme === "dark" 
            ? "bg-gray-800/60 border-gray-700/50 backdrop-blur-sm" 
            : "bg-white/80 border-gray-200/50 backdrop-blur-sm shadow-sm"
        }`}>
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
              theme === "dark" ? "text-gray-400" : "text-gray-500"
            }`} />
            <Input
              type="text"
              placeholder="Rechercher par nom, référence, description ou montant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-10 h-12 text-sm rounded-xl border-2 transition-all duration-300 ${
                theme === "dark" 
                  ? "bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:bg-gray-700" 
                  : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:bg-white"
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-lg transition-all duration-200 ${
                  theme === "dark" 
                    ? "hover:bg-gray-600/50 text-gray-400 hover:text-gray-300" 
                    : "hover:bg-gray-200/50 text-gray-500 hover:text-gray-700"
                }`}
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className={`p-4 rounded-2xl border mb-4 sm:mb-6 ${
            theme === "dark" 
              ? "bg-gray-800/60 border-gray-700/50 backdrop-blur-sm" 
              : "bg-white/80 border-gray-200/50 backdrop-blur-sm shadow-sm"
          }`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <Label className={`text-xs font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                  Type
                </Label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange("type", e.target.value)}
                  className={`w-full mt-1 p-2 sm:p-3 rounded-lg border text-sm ${
                    theme === "dark" 
                      ? "bg-gray-700 border-gray-600 text-white" 
                      : "bg-gray-50 border-gray-200 text-gray-900"
                  }`}
                >
                  <option value="sent">Envoyés</option>
                  <option value="received">Reçus</option>
                </select>
              </div>
              
              <div>
                <Label className={`text-xs font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                  Statut
                </Label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className={`w-full mt-1 p-2 sm:p-3 rounded-lg border text-sm ${
                    theme === "dark" 
                      ? "bg-gray-700 border-gray-600 text-white" 
                      : "bg-gray-50 border-gray-200 text-gray-900"
                  }`}
                >
                  <option value="completed">Terminé</option>
                  <option value="pending">En attente</option>
                  <option value="failed">Échoué</option>
                </select>
              </div>
              
              <div>
                <Label className={`text-xs font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                  Montant min
                </Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.minAmount}
                  onChange={(e) => handleFilterChange("minAmount", e.target.value)}
                  className={`mt-1 h-10 sm:h-11 text-sm ${
                    theme === "dark" 
                      ? "bg-gray-700 border-gray-600 text-white" 
                      : "bg-gray-50 border-gray-200 text-gray-900"
                  }`}
                />
              </div>
              
              <div>
                <Label className={`text-xs font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                  Montant max
                </Label>
                <Input
                  type="number"
                  placeholder="∞"
                  value={filters.maxAmount}
                  onChange={(e) => handleFilterChange("maxAmount", e.target.value)}
                  className={`mt-1 h-10 sm:h-11 text-sm ${
                    theme === "dark" 
                      ? "bg-gray-700 border-gray-600 text-white" 
                      : "bg-gray-50 border-gray-200 text-gray-900"
                  }`}
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className={`flex-1 h-10 sm:h-11 text-sm ${
                  theme === "dark" 
                    ? "border-gray-600 text-gray-300 hover:bg-gray-700" 
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                Effacer
              </Button>
              <Button
                size="sm"
                onClick={() => setShowFilters(false)}
                className="flex-1 h-10 sm:h-11 text-sm bg-blue-600 hover:bg-blue-700"
              >
                Appliquer
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Scrollable content area */}
      <div className="relative z-10 px-4 pb-24 max-h-screen overflow-y-auto">
        {/* Error Alert */}
        <ErrorAlert
          error={error}
          type="error"
          title="Erreur de chargement"
          onDismiss={() => setError("")}
        />

        {/* Transfers List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-blue-500 mx-auto mb-4" />
              <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                Chargement des transferts...
              </p>
            </div>
          </div>
        ) : filteredTransfers.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            {filteredTransfers.map((transfer) => (
              <div 
                key={transfer.uid} 
                onClick={() => {
                  setSelectedTransfer(transfer)
                  setShowTransactionDetails(true)
                }}
                className={`p-3 sm:p-4 rounded-2xl border transition-all duration-200 cursor-pointer active:scale-98 ${
                  theme === "dark" 
                    ? "bg-gray-800/60 border-gray-700/50 backdrop-blur-sm hover:bg-gray-700/60" 
                    : "bg-white/80 border-gray-200/50 backdrop-blur-sm shadow-sm hover:bg-gray-50/80"
                }`}
              >
                {/* Mobile-first responsive layout */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  {/* Left section - Icon and main info */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                      theme === "dark" ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600"
                    }`}>
                      <Send className="w-4 h-4 sm:w-6 sm:h-6" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      {/* Title and status - responsive layout */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                        <p className={`font-semibold text-sm sm:text-base truncate ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                          {transfer.receiver_name}
                        </p>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(transfer.status)}
                          <span className={`text-xs ${getStatusColor(transfer.status)}`}>
                            {transfer.status}
                          </span>
                        </div>
                      </div>
                      
                      <p className={`text-xs sm:text-sm mb-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                        {transfer.description}
                      </p>
                      
                      {/* Date and reference - mobile optimized */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span className={theme === "dark" ? "text-gray-500" : "text-gray-400"}>
                            {formatDate(transfer.created_at)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span className={`truncate ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                            {transfer.reference}
                          </span>
                          <button
                            onClick={() => copyReference(transfer.reference)}
                            className={`p-1 rounded-lg transition-all duration-200 active:scale-90 flex-shrink-0 ${
                              theme === "dark" 
                                ? "hover:bg-gray-600/50 text-gray-400 hover:text-gray-300" 
                                : "hover:bg-gray-200/50 text-gray-500 hover:text-gray-700"
                            }`}
                            title="Copier la référence"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right section - Amount and fees */}
                  <div className="flex items-center justify-between sm:flex-col sm:items-end sm:gap-2">
                    <div className="text-right">
                      <p className={`font-bold text-base sm:text-lg ${theme === "dark" ? "text-red-400" : "text-red-600"}`}>
                        -{formatNumberWithSpaces(transfer.amount)} FCFA
                      </p>
                      {transfer.fees && transfer.fees !== "0.00" && (
                        <p className={`text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                          Frais: {transfer.fees} FCFA
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Balance info - mobile optimized */}
                <div className={`mt-3 pt-3 border-t ${
                  theme === "dark" ? "border-gray-700" : "border-gray-200"
                }`}>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0 text-xs">
                    <span className={theme === "dark" ? "text-gray-500" : "text-gray-400"}>
                      Solde avant: {formatNumberWithSpaces(transfer.sender_balance_before)} FCFA
                    </span>
                    <span className={theme === "dark" ? "text-gray-500" : "text-gray-400"}>
                      Solde après: {formatNumberWithSpaces(transfer.sender_balance_after)} FCFA
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center ${
              theme === "dark" ? "bg-gray-700/50" : "bg-gray-100"
            }`}>
              <Send className={`w-6 h-6 sm:w-8 sm:h-8 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`} />
            </div>
            <p className={`text-sm font-medium ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              {searchQuery ? "Aucun transfert trouvé" : "Aucun transfert trouvé"}
            </p>
            <p className={`text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-500"}`}>
              {searchQuery ? "Essayez avec d'autres mots-clés" : "Ajustez vos filtres ou effectuez votre premier transfert"}
            </p>
          </div>
        )}
      </div>

      {/* Transaction Details Modal */}
      <TransactionDetailsModal
        isOpen={showTransactionDetails}
        onClose={() => {
          setShowTransactionDetails(false)
          setSelectedTransfer(null)
        }}
        transaction={selectedTransfer ? {
          ...selectedTransfer,
          historyType: 'transfer',
          typeIcon: Send,
          typeColor: theme === "dark" ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600",
          typeLabel: "Transfert",
          // Override display fields for consistent rendering
          display_recipient_name: selectedTransfer.receiver_name,
          recipient_phone: selectedTransfer.receiver_name, // Use receiver_name as phone fallback
          // recipient_name: selectedTransfer.receiver_name,
          amount: selectedTransfer.amount.toString(),
          type: "transfer"
        } : null}
      />
    </div>
  )
}
