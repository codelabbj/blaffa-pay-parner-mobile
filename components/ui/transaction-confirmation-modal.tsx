"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  CheckCircle, 
  Phone, 
  CreditCard, 
  Building2, 
  FileText, 
  Image,
  Wallet,
  TrendingDown,
  Plus,
  ArrowLeft
} from "lucide-react"
import { useTheme } from "@/lib/contexts"
import { useTranslation } from "@/lib/contexts"
import { formatNumberWithSpaces } from "@/lib/utils"

export interface TransactionData {
  type: 'deposit' | 'withdrawal' | 'recharge'
  amount: string
  recipientPhone?: string
  selectedNetwork?: {
    uid: string
    nom: string
    code: string
  }
  proofDescription?: string
  proofImage?: File | null
}

interface TransactionConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  transactionData: TransactionData
  isProcessing?: boolean
}

export function TransactionConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  transactionData,
  isProcessing = false
}: TransactionConfirmationModalProps) {
  const { theme } = useTheme()
  const { t } = useTranslation()

  const getTransactionIcon = () => {
    switch (transactionData.type) {
      case 'deposit':
        return Wallet
      case 'withdrawal':
        return TrendingDown
      case 'recharge':
        return Plus
      default:
        return Wallet
    }
  }

  const getTransactionColor = () => {
    switch (transactionData.type) {
      case 'deposit':
        return {
          primary: theme === "dark" ? "bg-orange-500/20 text-orange-400" : "bg-orange-100 text-orange-600",
          accent: theme === "dark" ? "bg-orange-500/10 border-orange-500/30" : "bg-orange-50 border-orange-200",
          button: "bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600"
        }
      case 'withdrawal':
        return {
          primary: theme === "dark" ? "bg-red-500/20 text-red-400" : "bg-red-100 text-red-600",
          accent: theme === "dark" ? "bg-red-500/10 border-red-500/30" : "bg-red-50 border-red-200",
          button: "bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600"
        }
      case 'recharge':
        return {
          primary: theme === "dark" ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-600",
          accent: theme === "dark" ? "bg-emerald-500/10 border-emerald-500/30" : "bg-emerald-50 border-emerald-200",
          button: "bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600"
        }
      default:
        return {
          primary: theme === "dark" ? "bg-gray-500/20 text-gray-400" : "bg-gray-100 text-gray-600",
          accent: theme === "dark" ? "bg-gray-500/10 border-gray-500/30" : "bg-gray-50 border-gray-200",
          button: "bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-700 hover:to-gray-600"
        }
    }
  }

  const getTransactionTitle = () => {
    switch (transactionData.type) {
      case 'deposit':
        return t("deposit.confirmDeposit") || "Confirm Deposit"
      case 'withdrawal':
        return t("withdraw.confirmWithdraw") || "Confirm Withdrawal"
      case 'recharge':
        return t("recharge.createRecharge") || "Confirm Recharge"
      default:
        return "Confirm Transaction"
    }
  }

  const getTransactionDescription = () => {
    switch (transactionData.type) {
      case 'deposit':
        return t("deposit.confirmDescription") || "Please review your deposit details before confirming"
      case 'withdrawal':
        return t("withdraw.confirmDescription") || "Please review your withdrawal details before confirming"
      case 'recharge':
        return t("recharge.confirmDescription") || "Please review your recharge details before confirming"
      default:
        return "Please review your transaction details before confirming"
    }
  }

  const TransactionIcon = getTransactionIcon()
  const colors = getTransactionColor()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={`max-w-md mx-4 rounded-2xl border-0 shadow-2xl ${
          theme === "dark" 
            ? "bg-gray-900/95 backdrop-blur-xl border-gray-700/50" 
            : "bg-white/95 backdrop-blur-xl border-gray-200/50"
        }`}
        showCloseButton={false}
      >
        {/* Header */}
        <DialogHeader className="text-center space-y-4 pb-4">
          <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center ${colors.primary}`}>
            <TransactionIcon className="w-8 h-8" />
          </div>
          
          <div className="space-y-2">
            <DialogTitle className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              {getTransactionTitle()}
            </DialogTitle>
            <DialogDescription className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              {getTransactionDescription()}
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Transaction Details */}
        <div className="space-y-4 py-4">
          {/* Amount */}
          <div className={`p-4 rounded-xl border ${colors.accent}`}>
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-lg ${
                theme === "dark" ? "bg-green-500/20 text-green-400" : "bg-green-100 text-green-600"
              }`}>
                <CreditCard className="w-4 h-4" />
              </div>
              <span className={`text-sm font-semibold ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                {transactionData.type === 'recharge' ? t("recharge.rechargeAmount") : t("deposit.amount")}
              </span>
            </div>
            <p className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              {formatNumberWithSpaces(transactionData.amount)} FCFA
            </p>
          </div>

          {/* Recipient Phone (for deposit/withdrawal) */}
          {transactionData.recipientPhone && (
            <div className={`p-4 rounded-xl border ${colors.accent}`}>
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${
                  theme === "dark" ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600"
                }`}>
                  <Phone className="w-4 h-4" />
                </div>
                <span className={`text-sm font-semibold ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                  {transactionData.type === 'deposit' ? t("deposit.recipientPhone") : t("withdraw.recipientPhone")}
                </span>
              </div>
              <p className={`text-lg font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                {transactionData.recipientPhone}
              </p>
            </div>
          )}

          {/* Network (for deposit/withdrawal) */}
          {transactionData.selectedNetwork && (
            <div className={`p-4 rounded-xl border ${colors.accent}`}>
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${
                  theme === "dark" ? "bg-slate-500/20 text-slate-400" : "bg-slate-100 text-slate-600"
                }`}>
                  <Building2 className="w-4 h-4" />
                </div>
                <span className={`text-sm font-semibold ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                  {transactionData.type === 'deposit' ? t("deposit.selectNetwork") : t("withdraw.selectNetwork")}
                </span>
              </div>
              <div className="space-y-1">
                <p className={`text-lg font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  {transactionData.selectedNetwork.nom}
                </p>
                <p className={`text-sm font-mono uppercase tracking-wider ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                  {transactionData.selectedNetwork.code}
                </p>
              </div>
            </div>
          )}

          {/* Proof Description (for recharge) */}
          {transactionData.proofDescription && (
            <div className={`p-4 rounded-xl border ${colors.accent}`}>
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${
                  theme === "dark" ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600"
                }`}>
                  <FileText className="w-4 h-4" />
                </div>
                <span className={`text-sm font-semibold ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                  {t("recharge.proofDescription")}
                </span>
              </div>
              <p className={`text-base font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                {transactionData.proofDescription}
              </p>
            </div>
          )}

          {/* Proof Image (for recharge) */}
          {transactionData.proofImage && (
            <div className={`p-4 rounded-xl border ${colors.accent}`}>
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${
                  theme === "dark" ? "bg-orange-500/20 text-orange-400" : "bg-orange-100 text-orange-600"
                }`}>
                  <Image className="w-4 h-4" />
                </div>
                <span className={`text-sm font-semibold ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                  {t("recharge.proofImage")}
                </span>
              </div>
              <p className={`text-base font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                {transactionData.proofImage.name}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="flex-col gap-3 pt-4">
          <Button
            onClick={onConfirm}
            disabled={isProcessing}
            className={`w-full h-12 text-base font-bold rounded-xl transition-all duration-200 active:scale-98 ${
              isProcessing
                ? "bg-gray-400/50 cursor-not-allowed text-gray-600"
                : colors.button
            }`}
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>
                  {transactionData.type === 'deposit' && t("deposit.processing")}
                  {transactionData.type === 'withdrawal' && t("withdraw.processing")}
                  {transactionData.type === 'recharge' && t("recharge.creatingRecharge")}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>
                  {transactionData.type === 'deposit' && t("deposit.confirmDeposit")}
                  {transactionData.type === 'withdrawal' && t("withdraw.confirmWithdraw")}
                  {transactionData.type === 'recharge' && t("recharge.createRecharge")}
                </span>
              </div>
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
            className={`w-full h-11 rounded-xl font-semibold transition-all duration-200 active:scale-98 ${
              theme === "dark" 
                ? "border-gray-600 text-gray-300 hover:bg-gray-700/50" 
                : "border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("additional.goBack") || "Go Back"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
