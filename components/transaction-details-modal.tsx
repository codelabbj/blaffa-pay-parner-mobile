"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  CheckCircle, 
  Phone, 
  CreditCard, 
  Building2, 
  FileText, 
  Copy,
  Clock,
  TrendingUp,
  TrendingDown,
  Battery,
  Send,
  X,
  Calendar,
  Hash
} from "lucide-react"
import { useTheme } from "@/lib/contexts"
import { useTranslation } from "@/lib/contexts"
import { formatNumberWithSpaces } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface TransactionDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  transaction: any // The transaction data from recentHistory
}

export function TransactionDetailsModal({
  isOpen,
  onClose,
  transaction
}: TransactionDetailsModalProps) {
  const { theme } = useTheme()
  const { t } = useTranslation()
  const { toast } = useToast()

  if (!transaction) return null

  const getTransactionIcon = () => {
    switch (transaction.historyType) {
      case 'transaction':
        return transaction.type === 'deposit' ? TrendingUp : TrendingDown
      case 'betting':
        return transaction.transaction_type === 'deposit' ? TrendingUp : TrendingDown
      case 'recharge':
        return Battery
      case 'transfer':
        return Send
      default:
        return CreditCard
    }
  }

  const getTransactionColor = () => {
    switch (transaction.historyType) {
      case 'transaction':
        return transaction.type === 'deposit' 
          ? (theme === "dark" ? "bg-green-500/20 text-green-400" : "bg-green-100 text-green-600")
          : (theme === "dark" ? "bg-red-500/20 text-red-400" : "bg-red-100 text-red-600")
      case 'betting':
        return transaction.transaction_type === 'deposit'
          ? (theme === "dark" ? "bg-purple-500/20 text-purple-400" : "bg-purple-100 text-purple-600")
          : (theme === "dark" ? "bg-orange-500/20 text-orange-400" : "bg-orange-100 text-orange-600")
      case 'recharge':
        return theme === "dark" ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600"
      case 'transfer':
        return theme === "dark" ? "bg-cyan-500/20 text-cyan-400" : "bg-cyan-100 text-cyan-600"
      default:
        return theme === "dark" ? "bg-gray-500/20 text-gray-400" : "bg-gray-100 text-gray-600"
    }
  }

  const getStatusColor = () => {
    switch (transaction.status) {
      case 'success':
      case 'completed':
      case 'sent_to_user':
        return theme === "dark" ? "text-green-400" : "text-green-600"
      case 'pending':
        return theme === "dark" ? "text-yellow-400" : "text-yellow-600"
      case 'failed':
        return theme === "dark" ? "text-red-400" : "text-red-600"
      default:
        return theme === "dark" ? "text-gray-400" : "text-gray-600"
    }
  }

  const getStatusIcon = () => {
    switch (transaction.status) {
      case 'success':
      case 'completed':
      case 'sent_to_user':
        return CheckCircle
      case 'pending':
        return Clock
      case 'failed':
        return X
      default:
        return Clock
    }
  }

  const formatTransactionDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const formatTransactionAmount = (amount: string, type: string) => {
    const formattedAmount = formatNumberWithSpaces(amount)
    return type === "deposit" 
      ? `+${formattedAmount} FCFA`
      : `-${formattedAmount} FCFA`
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copié",
        description: "Référence copiée dans le presse-papiers",
      })
    } catch (error) {
      console.error('Copy failed:', error)
    }
  }

  const TransactionIcon = getTransactionIcon()
  const StatusIcon = getStatusIcon()
  const colors = getTransactionColor()

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}
      
      <div
        className={`fixed bottom-0 left-0 right-0 w-full h-auto max-h-[85vh] mx-0 rounded-t-2xl border-0 shadow-2xl z-50 transform ${
          theme === "dark" 
            ? "bg-gray-900" 
            : "bg-white"
        }`}
        style={{ 
          left: 0, 
          right: 0, 
          width: '100%',
          maxWidth: '100vw'
        }}
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-2 pb-1">
          <div className={`w-10 h-1 rounded-full ${theme === "dark" ? "bg-gray-600" : "bg-gray-300"}`}></div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-2 px-4">
          <h2
            className={`text-sm font-bold ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            {transaction.typeLabel || transaction.historyType}
          </h2>
          <button
            onClick={onClose}
            className={`h-7 w-7 rounded-lg flex items-center justify-center ${
              theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"
            }`}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 pb-6 overflow-y-auto max-h-[70vh]">
          <div className="space-y-2 w-full">
            {/* Names Section */}
            <div>
              <h3
                className={`text-sm font-bold mb-1.5 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                NOMS ET CONTACTS
              </h3>
              <div className="space-y-1">
                {/* Recipient Name */}
                {transaction.recipient_name && (
                  <div className={`p-1.5 rounded-xl flex items-center justify-between ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
                    <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Nom Destinataire</span>
                    <span className={`text-xs font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{transaction.recipient_name}</span>
                  </div>
                )}

                {/* Display Recipient Name */}
                {transaction.display_recipient_name && (
                  <div className={`p-1.5 rounded-xl flex items-center justify-between ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
                    <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Nom Affiché</span>
                    <span className={`text-xs font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{transaction.display_recipient_name}</span>
                  </div>
                )}

                {/* Partner Name */}
                {transaction.partner_name && (
                  <div className={`p-1.5 rounded-xl flex items-center justify-between ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
                    <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Nom Partenaire</span>
                    <span className={`text-xs font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{transaction.partner_name}</span>
                  </div>
                )}

                {/* Platform Name */}
                {transaction.platform_name && (
                  <div className={`p-1.5 rounded-xl flex items-center justify-between ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
                    <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Nom Plateforme</span>
                    <span className={`text-xs font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{transaction.platform_name}</span>
                  </div>
                )}

                {/* Receiver Name (for transfers) */}
                {transaction.receiver_name && (
                  <div className={`p-1.5 rounded-xl flex items-center justify-between ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
                    <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Nom Receveur</span>
                    <span className={`text-xs font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{transaction.receiver_name}</span>
                  </div>
                )}

                {/* Processed By Name */}
                {transaction.processed_by_name && (
                  <div className={`p-1.5 rounded-xl flex items-center justify-between ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
                    <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Traité par</span>
                    <span className={`text-xs font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{transaction.processed_by_name}</span>
                  </div>
                )}

                {/* Phone Number */}
                {transaction.recipient_phone && (
                  <div className={`p-1.5 rounded-xl flex items-center justify-between ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
                    <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Téléphone</span>
                    <span className={`text-xs font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{transaction.recipient_phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Transaction Info */}
            <div>
              <h3
                className={`text-sm font-bold mb-1.5 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                INFORMATIONS
              </h3>
              <div className="space-y-1">
                {/* Amount */}
                <div
                  className={`p-1.5 rounded-xl flex items-center justify-between ${
                    theme === "dark" ? "bg-gray-800" : "bg-gray-100"
                  }`}
                >
                  <span
                    className={`text-xs ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Montant
                  </span>
                  <span className={`text-sm font-bold ${
                    transaction.historyType === 'transaction' && transaction.type === "deposit"
                      ? "text-green-500"
                      : transaction.historyType === 'transaction'
                      ? (theme === "dark" ? "text-red-400" : "text-red-600")
                      : transaction.historyType === 'betting' && transaction.transaction_type === "deposit"
                      ? "text-purple-500"
                      : transaction.historyType === 'betting'
                      ? (theme === "dark" ? "text-orange-400" : "text-orange-600")
                      : transaction.historyType === 'recharge'
                      ? "text-blue-500"
                      : "text-cyan-500"
                  }`}>
                    {transaction.historyType === 'transaction'
                      ? formatTransactionAmount(transaction.amount, transaction.type)
                      : transaction.historyType === 'betting'
                      ? formatTransactionAmount(transaction.amount, transaction.transaction_type)
                      : transaction.historyType === 'recharge'
                      ? `+${formatNumberWithSpaces(transaction.amount)} FCFA`
                      : `-${formatNumberWithSpaces(transaction.amount)} FCFA`
                    }
                  </span>
                </div>

                {/* Status */}
                <div
                  className={`p-1.5 rounded-xl flex items-center justify-between ${
                    theme === "dark" ? "bg-gray-800" : "bg-gray-100"
                  }`}
                >
                  <span
                    className={`text-xs ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Statut
                  </span>
                  <div className="flex items-center gap-2">
                    <StatusIcon className={`w-4 h-4 ${getStatusColor()}`} />
                    <span className={`text-sm font-bold ${getStatusColor()}`}>
                      {transaction.status === 'success' ? 'Réussi' :
                       transaction.status === 'completed' ? 'Terminé' :
                       transaction.status === 'sent_to_user' ? 'Envoyé' :
                       transaction.status === 'pending' ? 'En attente' :
                       transaction.status === 'failed' ? 'Échoué' : transaction.status}
                    </span>
                  </div>
                </div>

                {/* Reference */}
                {transaction.reference && (
                  <div
                    className={`p-1.5 rounded-xl flex items-center justify-between ${
                      theme === "dark" ? "bg-gray-800" : "bg-gray-100"
                    }`}
                  >
                    <span
                      className={`text-xs ${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Référence
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-mono ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                        {transaction.reference}
                      </span>
                      <button
                        onClick={() => copyToClipboard(transaction.reference)}
                        className={`p-1 rounded ${
                          theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-200"
                        }`}
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Date */}
                <div
                  className={`p-1.5 rounded-xl flex items-center justify-between ${
                    theme === "dark" ? "bg-gray-800" : "bg-gray-100"
                  }`}
                >
                  <span
                    className={`text-xs ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Date
                  </span>
                  <span className={`text-sm font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    {formatTransactionDate(transaction.created_at)}
                  </span>
                </div>
              </div>
            </div>

            {/* Complete API Response Details */}
            <div>
              <h3
                className={`text-sm font-bold mb-1.5 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                DÉTAILS COMPLETS
              </h3>
              <div className="space-y-1">
                {/* UID */}
                {transaction.uid && (
                  <div className={`p-2 rounded-xl flex items-center justify-between ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
                    <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>UID</span>
                    <span className={`text-xs font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{transaction.uid}</span>
                  </div>
                )}

                {/* Type Display */}
                {transaction.type_display && (
                  <div className={`p-2 rounded-xl flex items-center justify-between ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
                    <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Type Affiché</span>
                    <span className={`text-xs font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{transaction.type_display}</span>
                  </div>
                )}

                {/* Formatted Amount */}
                {transaction.formatted_amount && (
                  <div className={`p-2 rounded-xl flex items-center justify-between ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
                    <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Montant Formaté</span>
                    <span className={`text-xs font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{transaction.formatted_amount}</span>
                  </div>
                )}

                {/* Status Display */}
                {transaction.status_display && (
                  <div className={`p-2 rounded-xl flex items-center justify-between ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
                    <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Statut Affiché</span>
                    <span className={`text-xs font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{transaction.status_display}</span>
                  </div>
                )}

                {/* Network Details */}
                {transaction.network && (
                  <>
                    <div className={`p-2 rounded-xl flex items-center justify-between ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
                      <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Réseau</span>
                      <span className={`text-xs font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{transaction.network.nom}</span>
                    </div>
                    <div className={`p-2 rounded-xl flex items-center justify-between ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
                      <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Code Réseau</span>
                      <span className={`text-xs font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{transaction.network.code}</span>
                    </div>
                    <div className={`p-2 rounded-xl flex items-center justify-between ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
                      <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Pays</span>
                      <span className={`text-xs font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{transaction.network.country_name}</span>
                    </div>
                  </>
                )}

                {/* Objet */}
                {transaction.objet && (
                  <div className={`p-2 rounded-xl flex items-center justify-between ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
                    <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Objet</span>
                    <span className={`text-xs font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{transaction.objet}</span>
                  </div>
                )}

                {/* Timing Information */}
                {transaction.started_at && (
                  <div className={`p-2 rounded-xl flex items-center justify-between ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
                    <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Démarré le</span>
                    <span className={`text-xs font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{formatTransactionDate(transaction.started_at)}</span>
                  </div>
                )}

                {transaction.completed_at && (
                  <div className={`p-2 rounded-xl flex items-center justify-between ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
                    <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Terminé le</span>
                    <span className={`text-xs font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{formatTransactionDate(transaction.completed_at)}</span>
                  </div>
                )}

                {transaction.processing_duration && (
                  <div className={`p-2 rounded-xl flex items-center justify-between ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
                    <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Durée Traitement</span>
                    <span className={`text-xs font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{transaction.processing_duration}s</span>
                  </div>
                )}

                {/* Retry Information */}
                <div className={`p-2 rounded-xl flex items-center justify-between ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
                  <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Tentatives</span>
                  <span className={`text-xs font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{transaction.retry_count || 0}/{transaction.max_retries || 0}</span>
                </div>

                {transaction.can_retry !== undefined && (
                  <div className={`p-2 rounded-xl flex items-center justify-between ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
                    <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Peut Réessayer</span>
                    <span className={`text-xs font-bold ${transaction.can_retry ? "text-green-500" : "text-red-500"}`}>{transaction.can_retry ? "Oui" : "Non"}</span>
                  </div>
                )}

                {/* Error Message */}
                {transaction.error_message && (
                  <div className={`p-2 rounded-xl flex items-center justify-between ${theme === "dark" ? "bg-red-900/20" : "bg-red-50"}`}>
                    <span className={`text-xs ${theme === "dark" ? "text-red-400" : "text-red-600"}`}>Message d'Erreur</span>
                    <span className={`text-xs font-bold ${theme === "dark" ? "text-red-400" : "text-red-600"}`}>{transaction.error_message}</span>
                  </div>
                )}

                {/* Processed By */}
                {transaction.processed_by_name && (
                  <div className={`p-2 rounded-xl flex items-center justify-between ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
                    <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Traité par</span>
                    <span className={`text-xs font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{transaction.processed_by_name}</span>
                  </div>
                )}

                {/* Priority */}
                {transaction.priority !== undefined && (
                  <div className={`p-2 rounded-xl flex items-center justify-between ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
                    <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Priorité</span>
                    <span className={`text-xs font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{transaction.priority}</span>
                  </div>
                )}

                {/* Fees */}
                {transaction.fees && (
                  <div className={`p-2 rounded-xl flex items-center justify-between ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
                    <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Frais</span>
                    <span className={`text-xs font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{transaction.fees} FCFA</span>
                  </div>
                )}

                {/* Balance Information */}
                {transaction.balance_before && (
                  <div className={`p-2 rounded-xl flex items-center justify-between ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
                    <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Solde Avant</span>
                    <span className={`text-xs font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{formatNumberWithSpaces(transaction.balance_before)} FCFA</span>
                  </div>
                )}

                {transaction.balance_after && (
                  <div className={`p-2 rounded-xl flex items-center justify-between ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
                    <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Solde Après</span>
                    <span className={`text-xs font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{formatNumberWithSpaces(transaction.balance_after)} FCFA</span>
                  </div>
                )}

                {/* Callback URL */}
                {transaction.callback_url && (
                  <div className={`p-2 rounded-xl flex items-center justify-between ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
                    <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>URL Callback</span>
                    <span className={`text-xs font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`} style={{wordBreak: 'break-all'}}>{transaction.callback_url}</span>
                  </div>
                )}

                {/* Betting Specific Fields */}
                {transaction.historyType === 'betting' && (
                  <>
                    {transaction.betting_user_id && (
                      <div className={`p-2 rounded-xl flex items-center justify-between ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
                        <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>ID Utilisateur</span>
                        <span className={`text-xs font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{transaction.betting_user_id}</span>
                      </div>
                    )}
                    {transaction.withdrawal_code && (
                      <div className={`p-2 rounded-xl flex items-center justify-between ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
                        <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Code Retrait</span>
                        <span className={`text-xs font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{transaction.withdrawal_code}</span>
                      </div>
                    )}
                    {transaction.external_transaction_id && (
                      <div className={`p-2 rounded-xl flex items-center justify-between ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
                        <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>ID Externe</span>
                        <span className={`text-xs font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{transaction.external_transaction_id}</span>
                      </div>
                    )}
                    {transaction.commission_rate && (
                      <div className={`p-2 rounded-xl flex items-center justify-between ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
                        <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Taux Commission</span>
                        <span className={`text-xs font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{transaction.commission_rate}%</span>
                      </div>
                    )}
                    {transaction.commission_amount && (
                      <div className={`p-2 rounded-xl flex items-center justify-between ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
                        <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Montant Commission</span>
                        <span className={`text-xs font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{formatNumberWithSpaces(transaction.commission_amount)} FCFA</span>
                      </div>
                    )}
                    {transaction.commission_paid !== undefined && (
                      <div className={`p-2 rounded-xl flex items-center justify-between ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
                        <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Commission Payée</span>
                        <span className={`text-xs font-bold ${transaction.commission_paid ? "text-green-500" : "text-red-500"}`}>{transaction.commission_paid ? "Oui" : "Non"}</span>
                      </div>
                    )}
                    {transaction.commission_paid_at && (
                      <div className={`p-2 rounded-xl flex items-center justify-between ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
                        <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Commission Payée le</span>
                        <span className={`text-xs font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{formatTransactionDate(transaction.commission_paid_at)}</span>
                      </div>
                    )}
                    {transaction.partner_refunded !== undefined && (
                      <div className={`p-2 rounded-xl flex items-center justify-between ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
                        <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Partenaire Remboursé</span>
                        <span className={`text-xs font-bold ${transaction.partner_refunded ? "text-green-500" : "text-red-500"}`}>{transaction.partner_refunded ? "Oui" : "Non"}</span>
                      </div>
                    )}
                    {transaction.partner_balance_before && (
                      <div className={`p-2 rounded-xl flex items-center justify-between ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
                        <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Solde Partenaire Avant</span>
                        <span className={`text-xs font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{formatNumberWithSpaces(transaction.partner_balance_before)} FCFA</span>
                      </div>
                    )}
                    {transaction.partner_balance_after && (
                      <div className={`p-2 rounded-xl flex items-center justify-between ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
                        <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Solde Partenaire Après</span>
                        <span className={`text-xs font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{formatNumberWithSpaces(transaction.partner_balance_after)} FCFA</span>
                      </div>
                    )}
                    {transaction.cancellation_requested_at && (
                      <div className={`p-2 rounded-xl flex items-center justify-between ${theme === "dark" ? "bg-orange-900/20" : "bg-orange-50"}`}>
                        <span className={`text-xs ${theme === "dark" ? "text-orange-400" : "text-orange-600"}`}>Annulation Demandée le</span>
                        <span className={`text-xs font-bold ${theme === "dark" ? "text-orange-400" : "text-orange-600"}`}>{formatTransactionDate(transaction.cancellation_requested_at)}</span>
                      </div>
                    )}
                    {transaction.cancelled_at && (
                      <div className={`p-2 rounded-xl flex items-center justify-between ${theme === "dark" ? "bg-red-900/20" : "bg-red-50"}`}>
                        <span className={`text-xs ${theme === "dark" ? "text-red-400" : "text-red-600"}`}>Annulé le</span>
                        <span className={`text-xs font-bold ${theme === "dark" ? "text-red-400" : "text-red-600"}`}>{formatTransactionDate(transaction.cancelled_at)}</span>
                      </div>
                    )}
                    {transaction.is_cancellable !== undefined && (
                      <div className={`p-2 rounded-xl flex items-center justify-between ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
                        <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Peut être Annulé</span>
                        <span className={`text-xs font-bold ${transaction.is_cancellable ? "text-green-500" : "text-red-500"}`}>{transaction.is_cancellable ? "Oui" : "Non"}</span>
                      </div>
                    )}
                    {transaction.can_request_cancellation !== undefined && (
                      <div className={`p-2 rounded-xl flex items-center justify-between ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
                        <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Peut Demander Annulation</span>
                        <span className={`text-xs font-bold ${transaction.can_request_cancellation ? "text-green-500" : "text-red-500"}`}>{transaction.can_request_cancellation ? "Oui" : "Non"}</span>
                      </div>
                    )}
                  </>
                )}


                {/* Updated Date */}
                {transaction.updated_at && transaction.updated_at !== transaction.created_at && (
                  <div className={`p-2 rounded-xl flex items-center justify-between ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
                    <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Modifié le</span>
                    <span className={`text-xs font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{formatTransactionDate(transaction.updated_at)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
