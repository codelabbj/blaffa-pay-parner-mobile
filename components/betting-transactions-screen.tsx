"use client"

import { useState, useEffect } from "react"
import {
  ArrowLeft,
  Search,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { authService } from "@/lib/auth"
import { bettingService, BettingTransaction } from "@/lib/betting"
import { formatNumberWithSpaces } from "@/lib/utils"
import { TransactionDetailsModal } from "@/components/transaction-details-modal"
import { BP, statusPillClass , pageBg, cardBg, textPrimary } from "@/lib/design"

interface BettingTransactionsScreenProps {
  onNavigateBack: () => void
}

/** PDF p.15 — Transactions de Paris (nom client) */
export function BettingTransactionsScreen({ onNavigateBack }: BettingTransactionsScreenProps) {
  const { toast } = useToast()
  const [transactions, setTransactions] = useState<BettingTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<BettingTransaction | null>(null)
  const [showTransactionDetails, setShowTransactionDetails] = useState(false)

  useEffect(() => {
    loadTransactions()
  }, [currentPage])

  const loadTransactions = async () => {
    setIsLoading(true)
    try {
      const accessToken = authService.getAccessToken()
      if (!accessToken) throw new Error("No access token available")
      const data = await bettingService.getTransactions(accessToken, "", "", "", "-created_at", currentPage)
      setTransactions(data.results)
      setTotalCount(data.count)
      setHasNextPage(!!data.next)
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de charger les transactions",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const cancelTransaction = async (transactionUid: string) => {
    const accessToken = authService.getAccessToken()
    if (!accessToken) throw new Error("No access token available")
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/payments/betting/user/transactions/${transactionUid}/request_cancellation/`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: "Client changed mind - explicit request" }),
      }
    )
    if (!response.ok) throw new Error("Failed to request cancellation")
    toast({ title: "Demande d'annulation envoyée" })
    await loadTransactions()
  }

  const statusLabel = (tx: BettingTransaction) => {
    if (tx.cancellation_requested_at && tx.status !== "cancelled") return "Annulation demandée"
    switch (tx.status) {
      case "success":
        return "Réussi"
      case "pending":
        return "En attente"
      case "failed":
        return "Échoué"
      case "cancelled":
        return "Annulé"
      default:
        return tx.status
    }
  }

  const statusClass = (tx: BettingTransaction) => {
    if (tx.cancellation_requested_at && tx.status !== "cancelled") return "bp-pill-pending"
    return statusPillClass(tx.status)
  }

  const timeOnly = (dateString: string) =>
    new Date(dateString).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })

  const clientName = (tx: BettingTransaction) =>
    tx.partner_name?.trim() || `ID ${tx.betting_user_id}`

  const filtered = transactions.filter((tx) => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return true
    return (
      tx.reference?.toLowerCase().includes(q) ||
      tx.platform_name?.toLowerCase().includes(q) ||
      tx.betting_user_id?.toLowerCase().includes(q) ||
      tx.partner_name?.toLowerCase().includes(q)
    )
  })

  const totalPages = Math.max(1, Math.ceil(totalCount / 10))

  return (
    <div className="min-h-screen" style={{ background: pageBg(false) }}>
      <div className="px-4 pt-12 pb-4 flex items-center gap-3">
        <button
          onClick={onNavigateBack}
          className="w-10 h-10 rounded-[12px] flex items-center justify-center bg-white border"
          style={{ borderColor: BP.border }}
        >
          <ArrowLeft className="w-5 h-5" style={{ color: BP.text }} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-[17px] font-extrabold" style={{ color: BP.text }}>
            Transactions de Paris
          </h1>
          <p className="text-[12px]" style={{ color: BP.muted }}>
            {totalCount.toLocaleString("fr-FR")} transaction{totalCount !== 1 ? "s" : ""}
          </p>
        </div>
        <button onClick={loadTransactions} className="p-2" style={{ color: BP.muted }}>
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="px-4 mb-4">
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none z-10"
            style={{ color: BP.muted }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un pari, un ID…"
            className="w-full h-12 pl-11 pr-4 rounded-full border-0 outline-none text-[15px] font-medium placeholder:text-[#9AA8BC]"
            style={{
              background: "#FFFFFF",
              color: BP.text,
              boxShadow: "0 4px 14px rgba(14,26,46,0.06)",
            }}
          />
        </div>
      </div>

      <div className="px-4 pb-24 space-y-2.5">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <RefreshCw className="w-6 h-6 animate-spin" style={{ color: BP.green }} />
          </div>
        ) : filtered.length > 0 ? (
          filtered.map((tx) => {
            const isDeposit = tx.transaction_type === "deposit"
            return (
              <button
                key={tx.uid}
                type="button"
                onClick={() => {
                  setSelectedTransaction({ ...tx, historyType: "betting" } as any)
                  setShowTransactionDetails(true)
                }}
                className="w-full text-left p-3.5 rounded-[18px] border bg-white active:scale-[0.99] transition"
                style={{
                  borderColor: BP.border,
                  boxShadow: "0 4px 16px rgba(14,26,46,0.04)",
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-11 h-11 rounded-[14px] flex items-center justify-center shrink-0"
                    style={{
                      background: isDeposit ? "rgba(14,159,110,0.12)" : "rgba(229,72,77,0.12)",
                      color: isDeposit ? BP.green : BP.red,
                    }}
                  >
                    {isDeposit ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-extrabold text-[14px] truncate" style={{ color: BP.text }}>
                          {clientName(tx)}
                        </p>
                        <p className="text-[12px] truncate mt-0.5" style={{ color: BP.muted }}>
                          {tx.platform_name} · ID {tx.betting_user_id} · {timeOnly(tx.created_at)}
                        </p>
                        <span
                          className={`inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${statusClass(tx)}`}
                        >
                          {statusLabel(tx)}
                        </span>
                      </div>
                      <p
                        className="font-extrabold tabular-nums text-[15px] shrink-0"
                        style={{ color: isDeposit ? BP.green : BP.red }}
                      >
                        {isDeposit ? "+" : "−"}
                        {formatNumberWithSpaces(tx.amount)}
                      </p>
                    </div>
                  </div>
                </div>
              </button>
            )
          })
        ) : (
          <div
            className="py-14 text-center rounded-[18px] border bg-white"
            style={{ borderColor: BP.border }}
          >
            <p className="font-bold" style={{ color: BP.text }}>
              Aucune transaction
            </p>
            <p className="text-sm mt-1" style={{ color: BP.muted }}>
              Les dépôts et retraits MobCash apparaîtront ici
            </p>
          </div>
        )}
      </div>

      {totalCount > 10 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 flex items-center justify-center gap-4" style={{ background: pageBg(false) }}>
          <button
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="w-10 h-10 rounded-[12px] bg-white border flex items-center justify-center disabled:opacity-40"
            style={{ borderColor: BP.border }}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-bold" style={{ color: BP.text }}>
            {currentPage} / {totalPages}
          </span>
          <button
            disabled={!hasNextPage}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="w-10 h-10 rounded-[12px] bg-white border flex items-center justify-center disabled:opacity-40"
            style={{ borderColor: BP.border }}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      <TransactionDetailsModal
        isOpen={showTransactionDetails}
        onClose={() => {
          setShowTransactionDetails(false)
          setSelectedTransaction(null)
        }}
        transaction={selectedTransaction}
        onCancelTransaction={cancelTransaction}
      />
    </div>
  )
}
