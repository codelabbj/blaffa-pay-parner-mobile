
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  ArrowLeft,
  Search,
  Filter,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Copy,
  ChevronLeft,
  ChevronRight,
  X,
  Clock,
} from "lucide-react"
import { useTheme } from "@/lib/contexts"
import { useTranslation } from "@/lib/contexts"
import { useToast } from "@/hooks/use-toast"
import { authService } from "@/lib/auth"
import { bettingService, BettingTransaction } from "@/lib/betting"
import { formatNumberWithSpaces } from "@/lib/utils"
import { TransactionDetailsModal } from "@/components/transaction-details-modal"

interface BettingTransactionsScreenProps {
  onNavigateBack: () => void
}

export function BettingTransactionsScreen({
  onNavigateBack,
}: BettingTransactionsScreenProps) {
  const { theme } = useTheme()
  const { t } = useTranslation()
  const { toast } = useToast()

  const [transactions, setTransactions] = useState<BettingTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const [cancellingTransaction, setCancellingTransaction] = useState<string | null>(null)
  const [selectedTransaction, setSelectedTransaction] = useState<BettingTransaction | null>(null)
  const [showTransactionDetails, setShowTransactionDetails] = useState(false)

  useEffect(() => {
    loadTransactions()
  }, [statusFilter, typeFilter, currentPage])

  const loadTransactions = async () => {
    setIsLoading(true)
    try {
      const accessToken = authService.getAccessToken()
      if (!accessToken) {
        throw new Error("No access token available")
      }

      const data = await bettingService.getTransactions(
        accessToken,
        statusFilter,
        typeFilter,
        "",
        "-created_at",
        currentPage
      )
      setTransactions(data.results)
      setTotalCount(data.count)
    } catch (error) {
      console.error("Load transactions error:", error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de charger les transactions",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyReference = async (reference: string) => {
    try {
      await navigator.clipboard.writeText(reference)
      toast({
        title: "Référence Copiée",
        description: `Référence ${reference} copiée`,
      })
    } catch (error) {
      console.error("Copy failed:", error)
      toast({
        title: "Échec de la Copie",
        description: "Impossible de copier la référence",
        variant: "destructive",
      })
    }
  }

  const cancelTransaction = async (transactionUid: string) => {
    setCancellingTransaction(transactionUid)
    try {
      const accessToken = authService.getAccessToken()
      if (!accessToken) {
        throw new Error("No access token available")
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/payments/betting/user/transactions/${transactionUid}/request_cancellation/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: "Client changed mind - explicit request"
        })
      })

      if (!response.ok) {
        throw new Error('Failed to request cancellation')
      }

      const data = await response.json()
      
      toast({
        title: "Demande d'annulation envoyée",
        description: data.message || "Votre demande d'annulation a été enregistrée",
      })

      // Reload transactions to reflect the change
      loadTransactions()
    } catch (error) {
      console.error("Cancel transaction error:", error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible d'annuler la transaction",
        variant: "destructive",
      })
    } finally {
      setCancellingTransaction(null)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const canCancelTransaction = (transaction: BettingTransaction) => {
    // Debug logging to understand transaction state
    console.log('Checking transaction for cancellation:', {
      uid: transaction.uid,
      status: transaction.status,
      is_cancellable: transaction.is_cancellable,
      can_request_cancellation: transaction.can_request_cancellation,
      cancellation_requested_at: transaction.cancellation_requested_at,
      created_at: transaction.created_at
    })
    
    // Check if transaction is already cancelled
    if (transaction.status === 'cancelled') {
      console.log('Transaction cannot be cancelled: already cancelled')
      return false
    }
    
    // Check if cancellation was already requested
    if (transaction.cancellation_requested_at) {
      console.log('Transaction cannot be cancelled: cancellation already requested')
      return false
    }
    
    // Check if transaction is cancellable (if field exists and is explicitly false)
    if (transaction.is_cancellable === false) {
      console.log('Transaction cannot be cancelled: is_cancellable is false')
      return false
    }
    
    // Check if can request cancellation (if field exists and is explicitly false)
    if (transaction.can_request_cancellation === false) {
      console.log('Transaction cannot be cancelled: can_request_cancellation is false')
      return false
    }
    
    // Check if transaction is within 25 minutes of creation
    const transactionDate = new Date(transaction.created_at)
    const now = new Date()
    const diffInMinutes = (now.getTime() - transactionDate.getTime()) / (1000 * 60)
    
    console.log(`Transaction age: ${diffInMinutes.toFixed(2)} minutes`)
    
    // Allow cancellation for both pending and successful transactions within 25 minutes
    // If API fields are not provided (undefined), we'll use the time-based logic
    const canCancel = (transaction.status === 'pending' || transaction.status === 'success') && diffInMinutes <= 25
    console.log(`Can cancel transaction: ${canCancel}`)
    
    return canCancel
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return theme === "dark" ? "text-green-400" : "text-green-600"
      case "pending":
        return theme === "dark" ? "text-yellow-400" : "text-yellow-600"
      case "failed":
        return theme === "dark" ? "text-red-400" : "text-red-600"
      case "cancelled":
        return theme === "dark" ? "text-gray-400" : "text-gray-600"
      default:
        return theme === "dark" ? "text-gray-400" : "text-gray-600"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "success":
        return "Réussi"
      case "pending":
        return "En attente"
      case "failed":
        return "Échoué"
      case "cancelled":
        return "Annulé"
      default:
        return status
    }
  }

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.platform_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.betting_user_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.partner_name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const totalPages = Math.ceil(totalCount / 10)

  return (
    <div
      className={`min-h-screen relative overflow-hidden ${
        theme === "dark"
          ? "bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900"
          : "bg-gradient-to-b from-orange-50 via-white to-blue-50"
      }`}
    >
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute top-20 right-4 w-40 h-40 rounded-full opacity-10 ${
            theme === "dark" ? "bg-purple-500" : "bg-purple-300"
          } blur-3xl animate-pulse`}
        ></div>
        <div
          className={`absolute bottom-60 left-4 w-32 h-32 rounded-full opacity-10 ${
            theme === "dark" ? "bg-orange-500" : "bg-orange-300"
          } blur-2xl animate-pulse`}
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* Header */}
      <div className="relative z-10 px-4 pt-12 pb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onNavigateBack}
              className={`h-11 w-11 p-0 rounded-xl active:scale-95 transition-all duration-200 ${
                theme === "dark"
                  ? "text-gray-300 hover:bg-white/10 active:bg-white/20"
                  : "text-gray-600 hover:bg-black/5 active:bg-black/10"
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1
                className={`text-2xl font-bold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Transactions de Paris
              </h1>
              <p
                className={`text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {totalCount} transaction{totalCount !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadTransactions}
            disabled={isLoading}
            className={`h-11 w-11 p-0 rounded-xl active:scale-95 transition-all duration-200 ${
              theme === "dark"
                ? "text-gray-300 hover:bg-white/10 active:bg-white/20"
                : "text-gray-600 hover:bg-black/5 active:bg-black/10"
            }`}
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher..."
                className={`pl-10 h-12 rounded-xl ${
                  theme === "dark"
                    ? "bg-gray-800/60 border-gray-700 text-white"
                    : "bg-white border-gray-200 text-gray-900"
                }`}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={`h-12 w-12 p-0 rounded-xl ${
                theme === "dark"
                  ? "border-gray-700 text-gray-300"
                  : "border-gray-200 text-gray-700"
              }`}
            >
              <Filter className="w-5 h-5" />
            </Button>
          </div>

          {/* Filter Menu */}
          {showFilterMenu && (
            <Card
              className={`p-4 rounded-2xl border ${
                theme === "dark"
                  ? "bg-gray-800/60 border-gray-700/50 backdrop-blur-sm"
                  : "bg-white/80 border-gray-200/50 backdrop-blur-sm shadow-sm"
              }`}
            >
              <div className="space-y-3">
                <div>
                  <label
                    className={`block text-xs font-semibold mb-2 ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    TYPE
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setTypeFilter("")}
                      className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                        typeFilter === ""
                          ? theme === "dark"
                            ? "bg-orange-600 text-white"
                            : "bg-orange-500 text-white"
                          : theme === "dark"
                          ? "bg-gray-700 text-gray-300"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      Tous
                    </button>
                    <button
                      onClick={() => setTypeFilter("deposit")}
                      className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                        typeFilter === "deposit"
                          ? theme === "dark"
                            ? "bg-green-600 text-white"
                            : "bg-green-500 text-white"
                          : theme === "dark"
                          ? "bg-gray-700 text-gray-300"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      Dépôts
                    </button>
                    <button
                      onClick={() => setTypeFilter("withdrawal")}
                      className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                        typeFilter === "withdrawal"
                          ? theme === "dark"
                            ? "bg-orange-600 text-white"
                            : "bg-orange-500 text-white"
                          : theme === "dark"
                          ? "bg-gray-700 text-gray-300"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      Retraits
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    className={`block text-xs font-semibold mb-2 ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    STATUT
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setStatusFilter("")}
                      className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                        statusFilter === ""
                          ? theme === "dark"
                            ? "bg-orange-600 text-white"
                            : "bg-orange-500 text-white"
                          : theme === "dark"
                          ? "bg-gray-700 text-gray-300"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      Tous
                    </button>
                    <button
                      onClick={() => setStatusFilter("success")}
                      className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                        statusFilter === "success"
                          ? theme === "dark"
                            ? "bg-green-600 text-white"
                            : "bg-green-500 text-white"
                          : theme === "dark"
                          ? "bg-gray-700 text-gray-300"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      Réussi
                    </button>
                    <button
                      onClick={() => setStatusFilter("pending")}
                      className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                        statusFilter === "pending"
                          ? theme === "dark"
                            ? "bg-yellow-600 text-white"
                            : "bg-yellow-500 text-white"
                          : theme === "dark"
                          ? "bg-gray-700 text-gray-300"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      En attente
                    </button>
                    <button
                      onClick={() => setStatusFilter("failed")}
                      className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                        statusFilter === "failed"
                          ? theme === "dark"
                            ? "bg-red-600 text-white"
                            : "bg-red-500 text-white"
                          : theme === "dark"
                          ? "bg-gray-700 text-gray-300"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      Échoué
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Transactions List */}
      <div className="relative z-10 px-4 pb-24">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-6 h-6 animate-spin text-orange-500" />
          </div>
        ) : filteredTransactions.length > 0 ? (
          <div className="space-y-3">
            {filteredTransactions.map((transaction) => (
              <Card
                key={transaction.uid}
                onClick={() => {
                  setSelectedTransaction(transaction)
                  setShowTransactionDetails(true)
                }}
                className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 active:scale-98 ${
                  theme === "dark"
                    ? "bg-gray-800/60 border-gray-700/50 backdrop-blur-sm hover:bg-gray-700/60"
                    : "bg-white/80 border-gray-200/50 backdrop-blur-sm shadow-sm hover:bg-gray-50/80"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      transaction.transaction_type === "deposit"
                        ? theme === "dark"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-green-100 text-green-600"
                        : theme === "dark"
                        ? "bg-orange-500/20 text-orange-400"
                        : "bg-orange-100 text-orange-600"
                    }`}
                  >
                    {transaction.transaction_type === "deposit" ? (
                      <TrendingUp className="w-6 h-6" />
                    ) : (
                      <TrendingDown className="w-6 h-6" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <h3
                          className={`font-bold ${
                            theme === "dark" ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {transaction.partner_name}
                        </h3>
                        <p
                          className={`text-sm ${
                            theme === "dark" ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {transaction.platform_name}
                        </p>
                      </div>
                      <p
                        className={`font-bold ${
                          transaction.transaction_type === "deposit"
                            ? theme === "dark"
                              ? "text-green-400"
                              : "text-green-600"
                            : theme === "dark"
                            ? "text-orange-400"
                            : "text-orange-600"
                        }`}
                      >
                        {transaction.transaction_type === "deposit" ? "+" : "-"}
                        {formatNumberWithSpaces(transaction.amount)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(
                          transaction.status
                        )} ${
                          theme === "dark" ? "bg-gray-700/50" : "bg-gray-100"
                        }`}
                      >
                        {getStatusLabel(transaction.status)}
                      </span>
                      <span
                        className={`text-xs ${
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        ID: {transaction.betting_user_id}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs ${
                          theme === "dark" ? "text-gray-500" : "text-gray-500"
                        }`}
                      >
                        {formatDate(transaction.created_at)}
                      </span>
                      <div className="flex items-center gap-1">
                        <span
                          className={`text-xs font-mono ${
                            theme === "dark" ? "text-gray-500" : "text-gray-500"
                          }`}
                        >
                          {transaction.reference.slice(0, 12)}...
                        </span>
                        <button
                          onClick={() => copyReference(transaction.reference)}
                          className={`p-1 rounded transition-all ${
                            theme === "dark"
                              ? "hover:bg-gray-700 text-gray-400 hover:text-gray-300"
                              : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                          }`}
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Commission Info */}
                    <div
                      className={`mt-2 p-2 rounded-lg flex items-center justify-between ${
                        theme === "dark" ? "bg-gray-700/30" : "bg-gray-50"
                      }`}
                    >
                      <span
                        className={`text-xs ${
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Commission
                      </span>
                      <span
                        className={`text-xs font-bold ${
                          transaction.commission_paid
                            ? theme === "dark"
                              ? "text-green-400"
                              : "text-green-600"
                            : theme === "dark"
                            ? "text-yellow-400"
                            : "text-yellow-600"
                        }`}
                      >
                        {formatNumberWithSpaces(transaction.commission_amount)} FCFA{" "}
                        {transaction.commission_paid ? "✓" : "⏳"}
                      </span>
                    </div>

                    {/* Cancel Transaction Button */}
                    {canCancelTransaction(transaction) && (
                      <div className="mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => cancelTransaction(transaction.uid)}
                          disabled={cancellingTransaction === transaction.uid}
                          className={`w-full h-8 text-xs font-semibold rounded-lg transition-all duration-200 ${
                            theme === "dark"
                              ? "border-red-600 text-red-400 hover:bg-red-600/20 hover:text-red-300"
                              : "border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700"
                          }`}
                        >
                          {cancellingTransaction === transaction.uid ? (
                            <div className="flex items-center gap-2">
                              <RefreshCw className="w-3 h-3 animate-spin" />
                              <span>Annulation...</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <X className="w-3 h-3" />
                              <span>Annuler la transaction</span>
                            </div>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p
              className={`text-sm ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Aucune transaction trouvée
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`h-10 w-10 p-0 rounded-xl ${
                theme === "dark"
                  ? "border-gray-700 text-gray-300"
                  : "border-gray-200 text-gray-700"
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <span
              className={`text-sm ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Page {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`h-10 w-10 p-0 rounded-xl ${
                theme === "dark"
                  ? "border-gray-700 text-gray-300"
                  : "border-gray-200 text-gray-700"
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        )}
      </div>

      {/* Transaction Details Modal */}
      <TransactionDetailsModal
        isOpen={showTransactionDetails}
        onClose={() => {
          setShowTransactionDetails(false)
          setSelectedTransaction(null)
        }}
        transaction={selectedTransaction ? {
          ...selectedTransaction,
          historyType: 'betting',
          typeIcon: selectedTransaction.transaction_type === "deposit" ? TrendingUp : TrendingDown,
          typeColor: selectedTransaction.transaction_type === "deposit"
            ? (theme === "dark" ? "bg-purple-500/20 text-purple-400" : "bg-purple-100 text-purple-600")
            : (theme === "dark" ? "bg-orange-500/20 text-orange-400" : "bg-orange-100 text-orange-600"),
          typeLabel: `${selectedTransaction.transaction_type === "deposit" ? "Dépôt" : "Retrait"} Paris`,
          // Override display fields for consistent rendering
          display_recipient_name: selectedTransaction.partner_name,
          recipient_phone: selectedTransaction.betting_user_id,
          recipient_name: selectedTransaction.partner_name,
          amount: parseFloat(selectedTransaction.amount).toString(),
          type: selectedTransaction.transaction_type
        } : null}
      />
    </div>
  )
}

// Updated
