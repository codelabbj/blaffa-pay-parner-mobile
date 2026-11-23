"use client"

import { Label } from "@/components/ui/label"
import { ErrorAlert } from "@/components/ui/error-alert"
import { TransactionConfirmationModal, TransactionData } from "@/components/ui/transaction-confirmation-modal"
import { ArrowLeft, Building2, Wallet, Phone, AlertCircle, CheckCircle, TrendingDown, RefreshCw, Check } from "lucide-react"
import { useState, useEffect } from "react"
import { useTheme } from "@/lib/contexts"
import { useTranslation } from "@/lib/contexts"
import { useAuth } from "@/lib/contexts"
import { parseBackendError, formatErrorMessage } from "@/lib/error-utils"
import { BP, pageBg, cardBg, textPrimary } from "@/lib/design"
import { PhoneCountryInput } from "@/components/ui/phone-country-input"

interface WithdrawScreenProps {
  onNavigateBack: () => void
  onTransactionSuccess?: () => void
}

export function WithdrawScreen({ onNavigateBack, onTransactionSuccess }: WithdrawScreenProps) {
  const [amount, setAmount] = useState("")
  const [amountError, setAmountError] = useState("")
  const [recipientPhone, setRecipientPhone] = useState("")
  const [phoneValid, setPhoneValid] = useState(false)
  const [selectedNetwork, setSelectedNetwork] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [showNetworkSelection, setShowNetworkSelection] = useState(true)

  const [pullToRefreshState, setPullToRefreshState] = useState({
    isPulling: false,
    pullDistance: 0,
    isRefreshing: false,
    startY: 0,
    currentY: 0,
    canPull: true,
  })

  const { theme } = useTheme()
  const { t } = useTranslation()
  const { networks, createTransaction, accountData, refreshNetworks } = useAuth()
  const isDark = theme === "dark"

  const cardStyle = {
    background: cardBg(isDark),
    borderColor: isDark ? "#243147" : BP.border,
    boxShadow: isDark ? "none" : "0 8px 24px rgba(14, 26, 46, 0.06)",
  }

  const inputClass =
    "w-full h-12 px-4 text-[15px] font-semibold rounded-[14px] border outline-none focus:ring-2 focus:ring-[#0E9F6E]/25"

  const inputStyle = {
    background: isDark ? "#1A2436" : "#FFFFFF",
    borderColor: isDark ? "#243147" : BP.border,
    color: textPrimary(isDark),
  }

  useEffect(() => {
    if (networks.length === 0) void refreshNetworks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const formatNumberWithSpaces = (value: string) => value.replace(/\B(?=(\d{3})+(?!\d))/g, " ")

  const validateAmount = (value: string) => {
    const numericAmount = parseFloat(value.replace(/\s/g, ""))
    if (isNaN(numericAmount) || numericAmount <= 0) return "Le montant doit être supérieur à 0"
    if (numericAmount < 100) return "Le montant minimum est 100 FCFA"
    if (numericAmount > 1000000) return "Le montant maximum est 1 000 000 FCFA"
    if (accountData && numericAmount > parseFloat(accountData.balance.toString()))
      return "Le montant dépasse votre solde disponible"
    return ""
  }

  const handleNetworkSelect = (networkUid: string) => {
    setSelectedNetwork(networkUid)
    setShowNetworkSelection(false)
  }

  const handleBackToNetworkSelection = () => {
    setShowNetworkSelection(true)
    setSelectedNetwork("")
    setRecipientPhone("")
    setPhoneValid(false)
    setAmount("")
    setError("")
  }

  const handleWithdraw = async () => {
    if (!amount || !recipientPhone || !selectedNetwork) {
      setError(t("additional.pleaseFillInAllFields"))
      return
    }
    if (!phoneValid) {
      setError("Numéro de téléphone invalide pour le pays sélectionné.")
      return
    }
    setShowConfirmationModal(true)
  }

  const handleConfirmWithdraw = async () => {
    setIsProcessing(true)
    setError("")
    try {
      await createTransaction({
        type: "withdrawal",
        amount: amount.replace(/\s/g, ""),
        recipient_phone: recipientPhone,
        network: selectedNetwork,
      })
      setShowSuccessModal(true)
      setShowConfirmationModal(false)
      if (onTransactionSuccess) onTransactionSuccess()
      setTimeout(() => {
        setShowSuccessModal(false)
        setTimeout(() => onNavigateBack(), 300)
      }, 2500)
    } catch (err) {
      console.error("Withdrawal error:", err)
      setError(formatErrorMessage(parseBackendError(err)))
      setShowConfirmationModal(false)
    } finally {
      setIsProcessing(false)
    }
  }

  const availableNetworks = networks.filter((network) => network.is_active)
  const selectedNetworkDetails = availableNetworks.find((network) => network.uid === selectedNetwork)

  const transactionData: TransactionData = {
    type: "withdrawal",
    amount,
    recipientPhone,
    selectedNetwork: selectedNetworkDetails
      ? { uid: selectedNetworkDetails.uid, nom: selectedNetworkDetails.nom, code: selectedNetworkDetails.code }
      : undefined,
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!pullToRefreshState.canPull || pullToRefreshState.isRefreshing) return
    const touch = e.touches[0]
    setPullToRefreshState((prev) => ({ ...prev, startY: touch.clientY, currentY: touch.clientY }))
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!pullToRefreshState.canPull || pullToRefreshState.isRefreshing) return
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    if (scrollTop > 0) {
      setPullToRefreshState((prev) => ({ ...prev, canPull: false }))
      return
    }
    const touch = e.touches[0]
    const pullDistance = Math.max(0, touch.clientY - pullToRefreshState.startY)
    if (pullDistance > 0) {
      e.preventDefault()
      setPullToRefreshState((prev) => ({
        ...prev,
        currentY: touch.clientY,
        pullDistance: Math.min(pullDistance, 120),
        isPulling: pullDistance > 10,
      }))
    }
  }

  const handleTouchEnd = () => {
    if (!pullToRefreshState.canPull || pullToRefreshState.isRefreshing) return
    if (pullToRefreshState.pullDistance >= 80 && pullToRefreshState.isPulling) {
      setPullToRefreshState((prev) => ({ ...prev, isRefreshing: true }))
      setTimeout(() => {
        setPullToRefreshState((prev) => ({ ...prev, isRefreshing: false, pullDistance: 0, isPulling: false, canPull: true }))
      }, 1000)
    } else {
      setPullToRefreshState((prev) => ({ ...prev, isPulling: false, pullDistance: 0, canPull: true }))
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      if (scrollTop === 0) setPullToRefreshState((prev) => ({ ...prev, canPull: true }))
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const stepDot = (active: boolean) => ({
    background: active ? BP.green : isDark ? "#243147" : BP.border,
  })

  const networkImageUrl = (image?: string) =>
    image ? (image.startsWith("http") ? image : `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}${image}`) : ""

  return (
    <div
      className="min-h-screen"
      style={{
        background: pageBg(isDark),
        transform: `translateY(${pullToRefreshState.pullDistance}px)`,
        transition: pullToRefreshState.isPulling ? "none" : "transform 0.3s ease-out",
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
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
            onClick={showNetworkSelection ? onNavigateBack : handleBackToNetworkSelection}
            className="w-10 h-10 rounded-[12px] flex items-center justify-center border shrink-0 active:scale-95"
            style={{ background: cardBg(isDark), borderColor: isDark ? "#243147" : BP.border }}
          >
            <ArrowLeft className="w-5 h-5" style={{ color: textPrimary(isDark) }} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-[17px] font-extrabold" style={{ color: textPrimary(isDark) }}>
              {showNetworkSelection ? "Sélectionner le réseau" : t("withdraw.title")}
            </h1>
            <p className="text-[12px]" style={{ color: BP.muted }}>
              {showNetworkSelection ? "Choisissez votre réseau mobile money" : t("withdraw.subtitle")}
            </p>
          </div>
        </div>

        <div className="flex justify-center gap-2 mb-2">
          <div className="w-8 h-1 rounded-full" style={stepDot(showNetworkSelection)} />
          <div className="w-8 h-1 rounded-full" style={stepDot(!showNetworkSelection)} />
          <div className="w-8 h-1 rounded-full" style={stepDot(!showNetworkSelection && !!amount && !!recipientPhone)} />
        </div>
      </div>

      <div className="px-4 pb-32 space-y-4">
        {showNetworkSelection ? (
          <div className="bp-card p-4 border rounded-[18px]" style={cardStyle}>
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-4 h-4" style={{ color: BP.blue }} />
              <Label className="text-sm font-extrabold" style={{ color: textPrimary(isDark) }}>
                {t("withdraw.selectNetwork")}
              </Label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {availableNetworks.map((network) => (
                <button
                  key={network.uid}
                  type="button"
                  onClick={() => handleNetworkSelect(network.uid)}
                  className="p-4 rounded-[14px] border active:scale-[0.98]"
                  style={{ borderColor: isDark ? "#243147" : BP.border, background: isDark ? "#1A2436" : "#FFFFFF" }}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-14 h-14 rounded-[14px] overflow-hidden flex items-center justify-center" style={{ background: BP.bg }}>
                      {network.image ? (
                        <img src={networkImageUrl(network.image)} alt={network.nom} className="w-full h-full object-cover" />
                      ) : (
                        <Building2 className="w-7 h-7" style={{ color: BP.muted }} />
                      )}
                    </div>
                    <p className="font-extrabold text-sm" style={{ color: textPrimary(isDark) }}>
                      {network.nom}
                    </p>
                    <p className="text-[11px]" style={{ color: BP.muted }}>
                      {network.code}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="bp-card p-4 border rounded-[18px] flex items-center justify-between" style={cardStyle}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[12px] overflow-hidden flex items-center justify-center" style={{ background: isDark ? "#1A2436" : BP.bg }}>
                  {selectedNetworkDetails?.image ? (
                    <img src={networkImageUrl(selectedNetworkDetails.image)} alt={selectedNetworkDetails.nom} className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="w-5 h-5" style={{ color: BP.muted }} />
                  )}
                </div>
                <div>
                  <p className="font-extrabold text-sm" style={{ color: textPrimary(isDark) }}>
                    {selectedNetworkDetails?.nom}
                  </p>
                  <p className="text-[11px]" style={{ color: BP.muted }}>
                    Réseau sélectionné
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleBackToNetworkSelection}
                className="text-[12px] font-bold px-3 py-1.5 rounded-[10px]"
                style={{ color: BP.blue, background: isDark ? "#1A2436" : BP.bg }}
              >
                Changer
              </button>
            </div>

            {accountData && (
              <div className="bp-card p-4 border rounded-[18px] flex items-center justify-between" style={cardStyle}>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-[12px] flex items-center justify-center"
                    style={{ background: "rgba(47,107,255,0.12)" }}
                  >
                    <Wallet className="w-5 h-5" style={{ color: BP.blue }} />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold" style={{ color: textPrimary(isDark) }}>
                      Solde disponible
                    </p>
                    <p className="text-[11px]" style={{ color: BP.muted }}>
                      Montant dans votre portefeuille
                    </p>
                  </div>
                </div>
                <p className="text-lg font-extrabold tabular-nums" style={{ color: textPrimary(isDark) }}>
                  {accountData.balance ? `${accountData.balance.toLocaleString()} FCFA` : "0 FCFA"}
                </p>
              </div>
            )}

            <div className="bp-card p-4 border rounded-[18px]" style={cardStyle}>
              <div className="flex items-center gap-2 mb-3">
                <Phone className="w-4 h-4" style={{ color: BP.blue }} />
                <Label className="text-sm font-extrabold" style={{ color: textPrimary(isDark) }}>
                  {t("withdraw.recipientPhone")}
                </Label>
              </div>
              <PhoneCountryInput
                value={recipientPhone}
                onChange={(e164, meta) => {
                  setRecipientPhone(e164)
                  setPhoneValid(meta.valid)
                }}
                placeholder={t("withdraw.recipientPhonePlaceholder")}
              />
            </div>

            <div className="bp-card p-4 border rounded-[18px]" style={cardStyle}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4" style={{ color: BP.red }} />
                  <Label className="text-sm font-extrabold" style={{ color: textPrimary(isDark) }}>
                    {t("withdraw.amount")}
                  </Label>
                </div>
                <span className="text-[10px]" style={{ color: BP.muted }}>
                  Min: 100 — Max: 1 000 000 FCFA
                </span>
              </div>
              <div className="relative">
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Entrez le montant"
                  value={amount}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\s/g, "")
                    if (/^\d*$/.test(value)) {
                      const formatted = formatNumberWithSpaces(value)
                      setAmount(formatted)
                      setAmountError(validateAmount(formatted))
                    }
                  }}
                  className={`${inputClass} h-14 text-xl font-extrabold pr-16 tabular-nums`}
                  style={{
                    ...inputStyle,
                    borderColor: amountError ? BP.red : inputStyle.borderColor,
                  }}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold" style={{ color: BP.muted }}>
                  FCFA
                </span>
              </div>
              {amountError && (
                <div className="mt-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" style={{ color: BP.red }} />
                  <p className="text-sm" style={{ color: BP.red }}>
                    {amountError}
                  </p>
                </div>
              )}
              {amount && !amountError && (
                <p className="text-center text-sm font-bold mt-3 tabular-nums" style={{ color: BP.red }}>
                  {amount} FCFA
                </p>
              )}
            </div>

            <ErrorAlert error={error} type="error" title={t("additional.transactionFailed")} onDismiss={() => setError("")} />

            {success && (
              <div
                className="flex items-center gap-3 p-4 rounded-[18px] border"
                style={{ background: "rgba(14,159,110,0.08)", borderColor: "rgba(14,159,110,0.2)" }}
              >
                <CheckCircle className="w-5 h-5" style={{ color: BP.green }} />
                <span className="text-sm font-semibold" style={{ color: BP.green }}>
                  {t("withdraw.successMessage")}
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {!showNetworkSelection && (
        <div
          className="fixed bottom-0 left-0 right-0 z-50 p-4 border-t"
          style={{ background: pageBg(isDark), borderColor: isDark ? "#243147" : BP.border }}
        >
          <button
            type="button"
            onClick={handleWithdraw}
            disabled={!amount || !recipientPhone || !phoneValid || !selectedNetwork || !!amountError || isProcessing}
            className={`w-full bp-btn-primary flex items-center justify-center gap-2 active:scale-[0.99] ${
              !amount || !recipientPhone || !phoneValid || !selectedNetwork || !!amountError || isProcessing ? "opacity-45 cursor-not-allowed" : ""
            }`}
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{t("withdraw.processing")}</span>
              </>
            ) : (
              <>
                <TrendingDown className="w-5 h-5" />
                <span>{t("withdraw.confirmWithdraw")}</span>
              </>
            )}
          </button>
        </div>
      )}

      <TransactionConfirmationModal
        isOpen={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        onConfirm={handleConfirmWithdraw}
        transactionData={transactionData}
        isProcessing={isProcessing}
      />

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowSuccessModal(false)} />
          <div
            className="relative w-full max-w-sm mx-4 mb-8 rounded-t-[24px] border-t"
            style={{ background: cardBg(isDark), borderColor: isDark ? "#243147" : BP.border }}
          >
            <div className="flex justify-center pt-8 pb-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: BP.green }}>
                <Check className="w-9 h-9 text-white" strokeWidth={3} />
              </div>
            </div>
            <div className="px-6 pb-8 text-center">
              <h2 className="text-xl font-extrabold mb-1" style={{ color: textPrimary(isDark) }}>
                Retrait réussi !
              </h2>
              <p className="text-sm mb-6" style={{ color: BP.muted }}>
                Votre retrait a été effectué avec succès
              </p>
              <div className="p-4 rounded-[18px] text-left space-y-2" style={{ background: isDark ? "#1A2436" : BP.bg }}>
                <div className="flex justify-between text-xs">
                  <span style={{ color: BP.muted }}>Montant</span>
                  <span className="font-extrabold" style={{ color: BP.red }}>
                    {amount} FCFA
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span style={{ color: BP.muted }}>Réseau</span>
                  <span className="font-bold" style={{ color: textPrimary(isDark) }}>
                    {selectedNetworkDetails?.nom}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span style={{ color: BP.muted }}>Téléphone</span>
                  <span className="font-bold" style={{ color: textPrimary(isDark) }}>
                    {recipientPhone}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}