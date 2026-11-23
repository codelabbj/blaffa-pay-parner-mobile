"use client"

import { ErrorAlert } from "@/components/ui/error-alert"
import { TransactionConfirmationModal, TransactionData } from "@/components/ui/transaction-confirmation-modal"
import {
  ArrowLeft,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
  Briefcase,
  Plus,
  Check,
  Loader2,
} from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/lib/contexts"
import { parseBackendError, formatErrorMessage } from "@/lib/error-utils"
import { BP, pageBg, formatFcfa } from "@/lib/design"

interface RechargeScreenProps {
  onNavigateBack: () => void
  onTransactionSuccess?: () => void
}

/** PDF p.14 — Recharge */
export function RechargeScreen({ onNavigateBack, onTransactionSuccess }: RechargeScreenProps) {
  const [amount, setAmount] = useState("")
  const [amountError, setAmountError] = useState("")
  const [proofImage, setProofImage] = useState<File | null>(null)
  const [proofDescription, setProofDescription] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState("")
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const { createRecharge, accountData } = useAuth()

  const validateAmount = (value: string) => {
    const numericAmount = parseFloat(value.replace(/\s/g, ""))
    if (isNaN(numericAmount) || numericAmount <= 0) return "Le montant doit être supérieur à 0"
    if (numericAmount < 1000) return "Le montant minimum est 1 000 FCFA"
    if (numericAmount > 100000000) return "Le montant maximum est 100 000 000 FCFA"
    return ""
  }

  const handleRecharge = () => {
    if (!amount) {
      setError("Entre un montant")
      return
    }
    if (amountError) return
    setShowConfirmationModal(true)
  }

  const handleConfirmRecharge = async () => {
    setIsProcessing(true)
    setError("")
    try {
      await createRecharge({
        amount,
        proof_image: proofImage,
        proof_description: proofDescription,
        transaction_date: null,
      })
      setShowSuccessModal(true)
      setShowConfirmationModal(false)
      if (onTransactionSuccess) onTransactionSuccess()
      setTimeout(() => {
        setShowSuccessModal(false)
        setTimeout(() => onNavigateBack(), 300)
      }, 2200)
    } catch (err) {
      const parsedError = parseBackendError(err)
      setError(formatErrorMessage(parsedError))
      setShowConfirmationModal(false)
    } finally {
      setIsProcessing(false)
    }
  }

  const transactionData: TransactionData = {
    type: "recharge",
    amount,
    proofDescription,
    proofImage,
  }

  const balanceLabel =
    accountData?.formatted_balance ||
    (accountData?.balance != null ? `${formatFcfa(accountData.balance)} FCFA` : "…")

  return (
    <div className="min-h-screen flex flex-col" style={{ background: pageBg(false) }}>
      <div className="px-4 pt-12 pb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={onNavigateBack}
          className="w-10 h-10 rounded-[12px] flex items-center justify-center bg-white border shrink-0 active:scale-95"
          style={{ borderColor: BP.border }}
        >
          <ArrowLeft className="w-5 h-5" style={{ color: BP.text }} />
        </button>
        <div className="min-w-0">
          <h1 className="text-[17px] font-extrabold" style={{ color: BP.text }}>
            Recharge
          </h1>
          <p className="text-[12px]" style={{ color: BP.muted }}>
            Recharge mobile, internet et services
          </p>
        </div>
      </div>

      <div className="px-4 flex-1 pb-28 space-y-4">
        {/* Solde — PDF */}
        <div
          className="rounded-[18px] px-4 py-4 flex items-center gap-3"
          style={{ background: "rgba(47,107,255,0.10)" }}
        >
          <div
            className="w-11 h-11 rounded-[12px] flex items-center justify-center shrink-0"
            style={{ background: "rgba(14,159,110,0.18)" }}
          >
            <Briefcase className="w-5 h-5" style={{ color: BP.green }} />
          </div>
          <div className="min-w-0">
            <p className="text-[18px] font-extrabold tabular-nums leading-tight" style={{ color: BP.text }}>
              {balanceLabel}
            </p>
            <p className="text-[12px] font-semibold" style={{ color: BP.blue }}>
              Solde disponible
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[13px] font-bold" style={{ color: BP.text }}>
            💳  Montant de recharge
          </p>
          <div className="relative">
            <span
              className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold"
              style={{ color: BP.muted }}
            >
              FCFA
            </span>
            <input
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="0"
              value={amount}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "")
                setAmount(value)
                setAmountError(validateAmount(value))
              }}
              className="w-full h-14 pl-16 pr-4 rounded-[14px] text-lg font-extrabold tabular-nums border outline-none focus:ring-2 focus:ring-[#0E9F6E]/25 bg-white"
              style={{ borderColor: amountError ? BP.red : BP.border, color: BP.text }}
            />
          </div>
          {amountError && (
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" style={{ color: BP.red }} />
              <span className="text-sm" style={{ color: BP.red }}>
                {amountError}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-[13px] font-bold" style={{ color: BP.text }}>
            📄  Description de la preuve
          </p>
          <input
            type="text"
            placeholder="Décris ta preuve de recharge"
            value={proofDescription}
            onChange={(e) => setProofDescription(e.target.value)}
            className="w-full h-14 px-4 rounded-[14px] text-[15px] font-semibold border outline-none focus:ring-2 focus:ring-[#0E9F6E]/25 bg-white"
            style={{ borderColor: BP.border, color: BP.text }}
          />
        </div>

        <div className="space-y-2">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setProofImage(e.target.files?.[0] || null)}
            className="hidden"
            id="proof-upload"
          />
          <label
            htmlFor="proof-upload"
            className="flex flex-col items-center justify-center gap-2 py-10 border border-dashed rounded-[18px] cursor-pointer active:scale-[0.99] bg-white"
            style={{
              borderColor: proofImage ? BP.green : BP.border,
              background: proofImage ? "rgba(14,159,110,0.06)" : "#FFFFFF",
            }}
          >
            {proofImage ? (
              <CheckCircle className="w-8 h-8" style={{ color: BP.green }} />
            ) : (
              <ImageIcon className="w-8 h-8" style={{ color: BP.blue }} />
            )}
            <p className="text-sm font-semibold" style={{ color: BP.text }}>
              {proofImage ? proofImage.name : "Télécharger l'image de preuve"}
            </p>
          </label>
        </div>

        <ErrorAlert error={error} type="error" title="Recharge échouée" onDismiss={() => setError("")} />
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 p-4" style={{ background: pageBg(false) }}>
        <button
          type="button"
          onClick={handleRecharge}
          disabled={!amount || isProcessing || !!amountError}
          className="w-full h-[52px] rounded-[16px] font-bold text-white flex items-center justify-center gap-2 disabled:opacity-45"
          style={{ background: BP.green }}
        >
          {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
          Créer la recharge
        </button>
      </div>

      <TransactionConfirmationModal
        isOpen={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        onConfirm={handleConfirmRecharge}
        transactionData={transactionData}
        isProcessing={isProcessing}
      />

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowSuccessModal(false)} />
          <div className="relative w-full max-w-sm mx-4 mb-8 rounded-t-[24px] bg-white border-t" style={{ borderColor: BP.border }}>
            <div className="flex justify-center pt-8 pb-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: BP.green }}
              >
                <Check className="w-9 h-9 text-white" strokeWidth={3} />
              </div>
            </div>
            <div className="px-6 pb-8 text-center">
              <h2 className="text-xl font-extrabold mb-1" style={{ color: BP.text }}>
                Recharge créée
              </h2>
              <p className="text-sm" style={{ color: BP.muted }}>
                Ta demande a été soumise avec succès
              </p>
              <p className="mt-4 text-lg font-extrabold tabular-nums" style={{ color: BP.green }}>
                {amount.replace(/\B(?=(\d{3})+(?!\d))/g, " ")} FCFA
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
