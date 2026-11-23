"use client"

import {
  Copy,
  X,
  Calendar,
  Hash,
  User,
  Info,
  Smartphone,
  DollarSign,
  Clock,
  FileText,
  Phone,
  Globe,
  RefreshCw,
} from "lucide-react"
import { formatNumberWithSpaces } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { BP, statusPillClass } from "@/lib/design"

interface TransactionDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  transaction: any
  onCancelTransaction?: (transactionUid: string) => Promise<void>
}

/** PDF p.16–17 — détail paris + Blaffa Cancel */
export function TransactionDetailsModal({
  isOpen,
  onClose,
  transaction,
  onCancelTransaction,
}: TransactionDetailsModalProps) {
  const [mounted, setMounted] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [cancelResult, setCancelResult] = useState<string | null>(null)
  const [showCancelToast, setShowCancelToast] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isOpen) {
      setCancelResult(null)
      setShowCancelToast(false)
    }
  }, [isOpen])

  const canCancelTransaction = () => {
    if (!transaction || !onCancelTransaction) return false
    if (transaction.historyType !== "betting") return false
    if (transaction.status === "cancelled") return false
    if (transaction.cancellation_requested_at) return false
    if (transaction.is_cancellable === false) return false
    if (transaction.can_request_cancellation === false) return false
    const transactionDate = new Date(transaction.created_at)
    const diffInMinutes = (Date.now() - transactionDate.getTime()) / (1000 * 60)
    return (transaction.status === "pending" || transaction.status === "success") && diffInMinutes <= 25
  }

  const handleCancelTransaction = async () => {
    if (!onCancelTransaction || !transaction) return
    setIsCancelling(true)
    try {
      await onCancelTransaction(transaction.uid)
      const client =
        transaction.partner_name ||
        transaction.betting_user_name ||
        transaction.client_name ||
        "le client"
      setCancelResult(
        `Transaction № ${transaction.reference || transaction.uid} annulée et remboursée. Le client (${client}) a été notifié.`
      )
      setShowCancelToast(true)
      toast({
        title: "Transaction annulée",
        description: "Réponse de Blaffa Cancel reçue",
      })
      setTimeout(() => setShowCancelToast(false), 3500)
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible d'annuler la transaction",
        variant: "destructive",
      })
    } finally {
      setIsCancelling(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = originalStyle
      }
    }
  }, [isOpen])

  if (!transaction || !mounted || !isOpen) return null

  const formatTransactionDate = (dateString: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatAmount = (amount: string) => formatNumberWithSpaces(amount || "0")

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({ title: "Copié", description: "Référence copiée" })
    } catch {
      /* ignore */
    }
  }

  const clientName =
    transaction.partner_name ||
    transaction.betting_user_name ||
    transaction.client_name ||
    transaction.display_recipient_name ||
    null

  const isFullyCancelled = transaction.status === "cancelled" || !!cancelResult
  const isCancelRequested = !!transaction.cancellation_requested_at && !isFullyCancelled
  const isBetting = transaction.historyType === "betting"

  const amountPrefix =
    transaction.transaction_type === "withdraw" || transaction.type === "withdraw" ? "−" : "+"

  const renderDetailRow = (
    Icon: React.ElementType,
    label: string,
    value: string | number | null | undefined,
    emphasize = false
  ) => {
    if (value === null || value === undefined || value === "") return null
    return (
      <div className="flex items-start gap-3 py-3.5 border-b last:border-0" style={{ borderColor: BP.border }}>
        <div
          className="mt-0.5 p-2 rounded-xl shrink-0"
          style={{
            background: emphasize ? "rgba(14,159,110,0.12)" : "rgba(47,107,255,0.08)",
            color: emphasize ? BP.green : BP.blue,
          }}
        >
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide mb-0.5" style={{ color: BP.muted }}>
            {label}
          </p>
          <p
            className={`font-bold break-words ${emphasize ? "text-[16px]" : "text-sm"}`}
            style={{ color: BP.text }}
          >
            {value}
          </p>
        </div>
      </div>
    )
  }

  // ——— PDF p.17 : état Annulée (plein écran) ———
  if (isBetting && isFullyCancelled) {
    return createPortal(
      <div className="fixed inset-0 z-50 flex flex-col" style={{ background: BP.bg }}>
        {showCancelToast && (
          <div
            className="absolute top-12 left-4 right-4 z-50 rounded-[16px] px-4 py-3 flex items-center gap-3 shadow-lg"
            style={{ background: BP.navy }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{ background: BP.red }}
            >
              <X className="w-4 h-4 text-white" strokeWidth={3} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-extrabold text-white">Transaction annulée</p>
              <p className="text-[12px] text-white/70">Réponse de Blaffa Cancel reçue</p>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-4 pt-16 pb-28">
          <div className="text-center mb-6">
            <h1 className="text-[28px] font-extrabold" style={{ color: BP.red }}>
              Annulée
            </h1>
            <p className="text-[14px] mt-1" style={{ color: BP.muted }}>
              Annulation confirmée par Blaffa Cancel
            </p>
            <p className="text-[28px] font-extrabold tabular-nums mt-3" style={{ color: BP.red }}>
              {amountPrefix}
              {formatAmount(transaction.amount)} FCFA
            </p>
          </div>

          <div
            className="rounded-[18px] p-4 mb-4 border"
            style={{
              background: "rgba(229,72,77,0.08)",
              borderColor: "rgba(229,72,77,0.25)",
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "rgba(229,72,77,0.15)" }}
              >
                <Info className="w-4 h-4" style={{ color: BP.red }} />
              </div>
              <div>
                <p className="text-sm font-extrabold mb-1" style={{ color: BP.red }}>
                  Blaffa Cancel
                </p>
                <p className="text-sm leading-relaxed" style={{ color: BP.red }}>
                  {cancelResult ||
                    `Transaction № ${transaction.reference || ""} annulée et remboursée. Le client${
                      clientName ? ` (${clientName})` : ""
                    } a été notifié.`}
                </p>
              </div>
            </div>
          </div>

          <div
            className="rounded-[18px] border bg-white px-4"
            style={{ borderColor: BP.border, boxShadow: "0 8px 24px rgba(14,26,46,0.06)" }}
          >
            {renderDetailRow(User, "Nom du client", clientName, true)}
            {renderDetailRow(
              Clock,
              "Annulée le",
              formatTransactionDate(transaction.cancelled_at || transaction.updated_at || transaction.created_at)
            )}
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4" style={{ background: BP.bg }}>
          <button
            type="button"
            onClick={onClose}
            className="w-full h-[52px] rounded-[16px] font-bold bg-white border active:scale-[0.99]"
            style={{ borderColor: BP.border, color: BP.text }}
          >
            Fermer
          </button>
        </div>
      </div>,
      document.body
    )
  }

  // ——— PDF p.16 : détail standard / annulation demandée ———
  return createPortal(
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div
        className="fixed left-0 right-0 bottom-0 z-50 rounded-t-[24px] max-h-[92vh] flex flex-col bg-white border-t"
        style={{ borderColor: BP.border }}
      >
        <div className="relative px-5 py-4 flex items-center justify-center border-b" style={{ borderColor: BP.border }}>
          <button
            type="button"
            onClick={onClose}
            className="absolute left-4 w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: BP.bg, color: BP.muted }}
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-sm font-extrabold" style={{ color: BP.text }}>
            Détail de la transaction
          </h2>
        </div>

        <div className="overflow-y-auto px-5 py-5 pb-10 space-y-4">
          <div className="text-center space-y-2">
            <span
              className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${statusPillClass(
                isCancelRequested ? "pending" : transaction.status
              )}`}
            >
              {isCancelRequested
                ? "Annulation demandée"
                : transaction.status === "success"
                  ? "Réussi"
                  : transaction.status_display || transaction.status}
            </span>
            {isBetting && transaction.status === "success" && !isCancelRequested && (
              <p className="text-[13px]" style={{ color: BP.muted }}>
                Dépôt crédité avec succès
              </p>
            )}
            <p
              className="text-3xl font-extrabold tabular-nums"
              style={{
                color:
                  transaction.transaction_type === "withdraw" || transaction.type === "withdraw"
                    ? BP.red
                    : BP.green,
              }}
            >
              {amountPrefix}
              {formatAmount(transaction.amount)} FCFA
            </p>
          </div>

          {canCancelTransaction() && (
            <button
              type="button"
              onClick={handleCancelTransaction}
              disabled={isCancelling}
              className="w-full h-[48px] rounded-[14px] font-bold text-white flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: BP.red }}
            >
              {isCancelling ? <RefreshCw className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
              Annuler la transaction
            </button>
          )}

          {isCancelRequested && (
            <div
              className="rounded-[14px] p-4 border"
              style={{
                background: "rgba(199,122,8,0.08)",
                borderColor: "rgba(199,122,8,0.3)",
              }}
            >
              <p className="text-xs font-extrabold mb-1" style={{ color: BP.amber }}>
                Annulation demandée
              </p>
              <p className="text-sm" style={{ color: BP.muted }}>
                La demande a été envoyée à Blaffa Cancel. En attente de confirmation.
              </p>
            </div>
          )}

          <div className="rounded-[18px] border bg-white px-4" style={{ borderColor: BP.border }}>
            {isBetting && (
              <>
                {renderDetailRow(User, "Nom du client", clientName, true)}
                {renderDetailRow(Hash, "ID utilisateur", transaction.betting_user_id)}
                {renderDetailRow(
                  Smartphone,
                  "Plateforme",
                  [transaction.platform_name, transaction.city].filter(Boolean).join(" · ")
                )}
                {renderDetailRow(FileText, "Référence", transaction.reference)}
                {renderDetailRow(Calendar, "Date", formatTransactionDate(transaction.created_at))}
                {transaction.commission_amount != null &&
                  renderDetailRow(DollarSign, "Commission", `${formatAmount(transaction.commission_amount)} FCFA`)}
              </>
            )}

            {transaction.historyType === "transfer" && (
              <>
                {renderDetailRow(User, "Expéditeur", transaction.sender_name)}
                {renderDetailRow(User, "Bénéficiaire", transaction.receiver_name)}
                {renderDetailRow(DollarSign, "Frais", `${formatAmount(transaction.fees)} FCFA`)}
                {renderDetailRow(Calendar, "Date", formatTransactionDate(transaction.created_at))}
                {renderDetailRow(FileText, "Référence", transaction.reference)}
              </>
            )}

            {transaction.historyType === "recharge" && (
              <>
                {renderDetailRow(FileText, "Preuve", transaction.proof_description)}
                {renderDetailRow(Calendar, "Date", formatTransactionDate(transaction.created_at))}
                {renderDetailRow(Clock, "Expire le", formatTransactionDate(transaction.expires_at))}
              </>
            )}

            {transaction.historyType === "transaction" && (
              <>
                {renderDetailRow(User, "Destinataire", transaction.display_recipient_name || transaction.recipient_phone)}
                {renderDetailRow(Globe, "Réseau", transaction.network?.nom)}
                {renderDetailRow(Phone, "Téléphone", transaction.recipient_phone)}
                {renderDetailRow(Calendar, "Date", formatTransactionDate(transaction.created_at))}
                {renderDetailRow(FileText, "Référence", transaction.reference)}
              </>
            )}

            {!["betting", "transfer", "recharge", "transaction"].includes(transaction.historyType) && (
              <>
                {renderDetailRow(FileText, "Référence", transaction.reference)}
                {renderDetailRow(Calendar, "Date", formatTransactionDate(transaction.created_at))}
              </>
            )}
          </div>

          {transaction.reference && (
            <button
              type="button"
              onClick={() => copyToClipboard(String(transaction.reference))}
              className="w-full flex items-center justify-center gap-2 text-sm font-semibold py-2"
              style={{ color: BP.blue }}
            >
              <Copy className="w-4 h-4" />
              Copier la référence
            </button>
          )}
        </div>
      </div>
    </>,
    document.body
  )
}
