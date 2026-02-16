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
  Hash,
  User,
  Info,
  Smartphone,
  Globe,
  DollarSign,
  Wallet,
  Gamepad,
  Gamepad2
} from "lucide-react"
import { useTheme } from "@/lib/contexts"
import { useTranslation } from "@/lib/contexts"
import { formatNumberWithSpaces } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

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
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()
  const { t } = useTranslation()
  const { toast } = useToast()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalStyle
      }
    }
  }, [isOpen])

  if (!transaction) return null

  const getStatusColor = () => {
    switch (transaction.status) {
      case 'success':
      case 'completed':
      case 'sent_to_user':
        return "text-green-500"
      case 'pending':
        return "text-yellow-500"
      case 'failed':
        return "text-red-500"
      default:
        return "text-gray-500"
    }
  }

  const getStatusText = () => {
    switch (transaction.status) {
      case 'success':
      case 'completed':
      case 'sent_to_user':
        return "Succès"
      case 'pending':
        return "En attente"
      case 'failed':
        return "Échoué"
      default:
        return transaction.status
    }
  }

  const getStatusMessage = () => {
    switch (transaction.status) {
      case 'success':
      case 'completed':
      case 'sent_to_user':
        return "Transaction réussie avec succès"
      case 'pending':
        return "Transaction en cours de traitement"
      case 'failed':
        return "La transaction a échoué"
      default:
        return "Statut de la transaction inconnu"
    }
  }

  const formatTransactionDate = (dateString: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const formatAmount = (amount: string) => {
    if (!amount) return "0"
    return formatNumberWithSpaces(amount)
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

  if (!mounted || !isOpen) return null

  // Determine Application Name
  let appName = "Blaffa Pay"
  if (transaction.historyType === 'betting') {
    appName = transaction.partner_name || transaction.platform_name || "Paris Sportif"
  } else if (transaction.historyType === 'recharge') {
    appName = "Recharge Mobile"
  } else if (transaction.historyType === 'transfer') {
    appName = "Transfert"
  }

  // Determine Network Name
  const networkName = transaction.network?.nom || transaction.operator || "N/A"

  // Icon Helper for Details
  const renderDetailRow = (
    Icon: React.ElementType,
    label: string,
    value: string | number | null | undefined,
    isCopyable: boolean = false,
    copyValue?: string
  ) => {
    if (!value && value !== 0) return null;

    return (
      <div className={`flex items-start gap-4 py-3 border-b last:border-0 ${theme === "dark" ? "border-gray-800" : "border-gray-100"}`}>
        <div className={`mt-0.5 p-2 rounded-full ${theme === "dark" ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-blue-600"}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <p className={`text-xs mb-1 font-medium ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
            {label}
          </p>
          <div className="flex items-center gap-2">
            <p className={`text-sm font-bold ${theme === "dark" ? "text-white" : "text-gray-900"} break-all`}>
              {value}
            </p>
            {isCopyable && copyValue && (
              <button
                onClick={() => copyToClipboard(copyValue)}
                className={`p-1 rounded opacity-70 hover:opacity-100 transition-opacity ${theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-200"}`}
              >
                <Copy className="w-3.5 h-3.5 text-blue-500" />
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return createPortal(
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      <div
        className={`fixed left-0 right-0 bottom-0 z-50 transform transition-transform duration-300 ease-in-out ${theme === "dark" ? "bg-gray-900" : "bg-white"
          } rounded-t-[2rem] shadow-2xl max-h-[90vh] flex flex-col`}
        style={{
          boxShadow: "0 -4px 20px rgba(0,0,0,0.1)"
        }}
      >
        {/* Header */}
        <div className={`relative px-6 py-4 flex items-center justify-center border-b ${theme === "dark" ? "border-gray-800" : "border-gray-100"}`}>
          <button
            onClick={onClose}
            className={`absolute left-4 p-2 rounded-full transition-colors ${theme === "dark" ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-600"}`}
          >
            <X className="w-6 h-6" />
          </button>
          <h2 className={`text-base font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            Détails de la transaction
          </h2>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto px-6 py-6 pb-12 space-y-6">

          {/* Status Section */}
          <div className="flex flex-col items-center text-center space-y-1">
            <h3 className={`text-xl font-bold ${getStatusColor()}`}>
              {getStatusText()}
            </h3>
            <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
              {getStatusMessage()}
            </p>
            <div className={`text-3xl font-black mt-4 mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              {/* Display sign based on type */}
              XOF {formatAmount(transaction.amount)}
            </div>
          </div>

          {/* Message Box */}
          <div className={`rounded-2xl p-4 flex items-start gap-3 ${theme === "dark" ? "bg-blue-900/20 border border-blue-800/50" : "bg-blue-50 border border-blue-100"
            }`}>
            <Info className={`w-5 h-5 shrink-0 mt-0.5 ${theme === "dark" ? "text-blue-400" : "text-blue-500"
              }`} />
            <div>
              <p className={`text-sm font-bold mb-1 ${theme === "dark" ? "text-blue-300" : "text-gray-900"
                }`}>
                Message
              </p>
              <p className={`text-sm leading-relaxed ${theme === "dark" ? "text-blue-200" : "text-gray-600"
                }`}>
                {transaction.objet || transaction.description || transaction.message || getStatusMessage()}
              </p>
            </div>
          </div>

          {/* Details Card */}
          <div className={`rounded-3xl border ${theme === "dark" ? "border-gray-800 bg-gray-900" : "border-gray-100 bg-white"
            } shadow-sm`}>
            <div className={`px-5 py-4 border-b ${theme === "dark" ? "border-gray-800" : "border-gray-100"}`}>
              <h4 className={`font-bold text-sm ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                Informations de la transaction
              </h4>
            </div>

            <div className="px-5 py-2">
              {/* Application */}
              {renderDetailRow(
                transaction.historyType === 'betting' ? Gamepad2 : Smartphone,
                "Application",
                appName
              )}

              {/* Network */}
              {renderDetailRow(
                Globe,
                "Réseau",
                networkName
              )}

              {/* Phone Number / ID */}
              {renderDetailRow(
                Phone,
                "Numéro / ID",
                transaction.recipient_phone || transaction.phone || transaction.betting_user_id || transaction.receiver_name
              )}

              {/* Montant (Redundant but requested) */}
              {renderDetailRow(
                DollarSign,
                "Montant",
                `XOF ${formatAmount(transaction.amount)}`
              )}

              {/* Reference */}
              {renderDetailRow(
                FileText,
                "Référence",
                transaction.reference,
                true,
                transaction.reference
              )}

              {/* Date */}
              {renderDetailRow(
                Calendar,
                "Date",
                formatTransactionDate(transaction.created_at || transaction.date)
              )}

              {/* Betting ID */}
              {transaction.historyType === 'betting' && renderDetailRow(
                User,
                "ID Paris",
                transaction.betting_user_id
              )}

              {/* Balance Before - Key Requirement */}
              {renderDetailRow(
                Wallet,
                "Solde Avant",
                transaction.balance_before ? `XOF ${formatAmount(transaction.balance_before)}` : null
              )}

              {/* Balance After - Key Requirement */}
              {renderDetailRow(
                Wallet,
                "Solde Après",
                transaction.balance_after ? `XOF ${formatAmount(transaction.balance_after)}` : null
              )}
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  )
}
