"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ErrorAlert } from "@/components/ui/error-alert"
import { TransactionConfirmationModal, TransactionData } from "@/components/ui/transaction-confirmation-modal"
import { ArrowLeft, Building2, Wallet, Phone, AlertCircle, CheckCircle, Smartphone, CreditCard, TrendingDown, RefreshCw, Check } from "lucide-react"
import { useState, useEffect } from "react"
import { useTheme } from "@/lib/contexts"
import { useTranslation } from "@/lib/contexts"
import { useAuth } from "@/lib/contexts"
import { parseBackendError, formatErrorMessage } from "@/lib/error-utils"

interface WithdrawScreenProps {
  onNavigateBack: () => void
}

export function WithdrawScreen({ onNavigateBack }: WithdrawScreenProps) {
  const [amount, setAmount] = useState("")
  const [amountError, setAmountError] = useState("")
  const [recipientPhone, setRecipientPhone] = useState("")
  const [selectedNetwork, setSelectedNetwork] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [showNetworkSelection, setShowNetworkSelection] = useState(true)
  
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
  const { networks, createTransaction, accountData } = useAuth()

  // Format number with spaces for better readability
  const formatNumberWithSpaces = (value: string) => {
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, " ")
  }

  // Amount validation function
  const validateAmount = (value: string) => {
    const numericAmount = parseFloat(value.replace(/\s/g, ""))
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return "Le montant doit être supérieur à 0"
    }
    if (numericAmount < 100) {
      return "Le montant minimum est 100 FCFA"
    }
    if (numericAmount > 1000000) {
      return "Le montant maximum est 1 000 000 FCFA"
    }
    if (accountData && numericAmount > parseFloat(accountData.balance.toString())) {
      return "Le montant dépasse votre solde disponible"
    }
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
    setAmount("")
    setError("")
  }

  const handleWithdraw = async () => {
    if (!amount || !recipientPhone || !selectedNetwork) {
      setError(t("additional.pleaseFillInAllFields"))
      return
    }
    
    // Show confirmation modal instead of directly processing
    setShowConfirmationModal(true)
  }

  const handleConfirmWithdraw = async () => {
    setIsProcessing(true)
    setError("")
    
    try {
      await createTransaction({
        type: "withdrawal",
        amount: amount.replace(/\s/g, ""), // Remove spaces but preserve leading zeros
        recipient_phone: recipientPhone,
        network: selectedNetwork
      })
      
      // Show success modal
      setShowSuccessModal(true)
      setShowConfirmationModal(false)
      // Navigate back after modal delay
      setTimeout(() => {
        setShowSuccessModal(false)
        setTimeout(() => {
          onNavigateBack()
        }, 300) // Small delay for modal close animation
      }, 2500)
    } catch (error) {
      console.error('Withdrawal error:', error)
      
      // Parse backend errors using the new error parsing utility
      const parsedError = parseBackendError(error)
      const formattedMessage = formatErrorMessage(parsedError)
      setError(formattedMessage)
      setShowConfirmationModal(false)
    } finally {
      setIsProcessing(false)
    }
  }

  // Filter networks that support withdrawals
  const availableNetworks = networks.filter(network => network.is_active)

  // Get selected network details
  const selectedNetworkDetails = availableNetworks.find(network => network.uid === selectedNetwork)

  // Prepare transaction data for confirmation modal
  const transactionData: TransactionData = {
    type: 'withdrawal',
    amount,
    recipientPhone,
    selectedNetwork: selectedNetworkDetails ? {
      uid: selectedNetworkDetails.uid,
      nom: selectedNetworkDetails.nom,
      code: selectedNetworkDetails.code
    } : undefined
  }

  // Pull-to-refresh handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!pullToRefreshState.canPull || pullToRefreshState.isRefreshing) return
    
    const touch = e.touches[0]
    setPullToRefreshState(prev => ({
      ...prev,
      startY: touch.clientY,
      currentY: touch.clientY
    }))
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!pullToRefreshState.canPull || pullToRefreshState.isRefreshing) return
    
    const touch = e.touches[0]
    const currentY = touch.clientY
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
    // Add any refresh logic here if needed
    setTimeout(() => {
      setPullToRefreshState(prev => ({ ...prev, isRefreshing: false, pullDistance: 0 }))
    }, 1000)
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
        : "bg-gradient-to-b from-orange-50 via-white to-blue-50"
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
            } ${theme === "dark" ? "text-orange-400" : "text-orange-500"}`} />
          </div>
        </div>
      )}

      {/* Mobile-optimized background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-20 right-4 w-32 h-32 rounded-full opacity-20 ${
          theme === "dark" ? "bg-red-500" : "bg-red-300"
        } blur-2xl animate-pulse`}></div>
        <div className={`absolute bottom-40 left-4 w-40 h-40 rounded-full opacity-20 ${
          theme === "dark" ? "bg-orange-500" : "bg-orange-300"
        } blur-2xl animate-pulse`} style={{animationDelay: '1.5s'}}></div>
      </div>

      {/* Mobile-first header with safe area */}
      <div className="relative z-10 px-4 pt-safe-area-inset-top pt-12">
      {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="sm"
            className={`h-11 w-11 p-0 rounded-xl active:scale-95 transition-all duration-200 ${
              theme === "dark" 
                ? "text-gray-300 hover:bg-white/10 active:bg-white/20" 
                : "text-gray-600 hover:bg-black/5 active:bg-black/10"
            }`}
            onClick={showNetworkSelection ? onNavigateBack : handleBackToNetworkSelection}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div className="text-center flex-1 mx-4">
            <h1 className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              {showNetworkSelection ? "Sélectionner le Réseau" : t("withdraw.title")}
            </h1>
            <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              {showNetworkSelection ? "Choisissez votre réseau mobile money" : t("withdraw.subtitle")}
            </p>
          </div>
          
          <div className={`p-2.5 rounded-xl ${
            theme === "dark" ? "bg-red-500/20 text-red-400" : "bg-red-100 text-red-600"
          }`}>
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-1 rounded-full transition-all duration-300 ${
              showNetworkSelection ? (theme === "dark" ? "bg-red-500" : "bg-red-600") : "bg-green-500"
            }`}></div>
            <div className={`w-8 h-1 rounded-full transition-all duration-300 ${
              !showNetworkSelection ? (theme === "dark" ? "bg-red-500" : "bg-red-600") : (theme === "dark" ? "bg-gray-600" : "bg-gray-300")
            }`}></div>
            <div className={`w-8 h-1 rounded-full transition-all duration-300 ${
              amount && recipientPhone ? "bg-green-500" : (theme === "dark" ? "bg-gray-600" : "bg-gray-300")
            }`}></div>
          </div>
          </div>
        </div>

      {/* Scrollable content area */}
      <div className="relative z-10 px-4 pb-24 max-h-screen overflow-y-auto">
        <div className="space-y-6">
          {showNetworkSelection ? (
            /* Network Selection Step */
          <div className={`p-6 rounded-2xl border transition-all duration-300 ${
            theme === "dark" 
              ? "bg-gray-800/60 border-gray-700/50 backdrop-blur-sm" 
              : "bg-white/80 border-gray-200/50 backdrop-blur-sm shadow-sm"
          }`}>
            <Label className={`text-sm font-semibold mb-5 flex items-center gap-2 ${
              theme === "dark" ? "text-gray-200" : "text-gray-800"
            }`}>
              <div className={`p-2 rounded-lg ${
                theme === "dark" ? "bg-slate-600/50 text-slate-300" : "bg-slate-100 text-slate-600"
              }`}>
                <Building2 className="w-4 h-4" />
              </div>
                {t("withdraw.selectNetwork")}
              </Label>
            
            <div className="grid grid-cols-2 gap-4">
                {availableNetworks.map((network) => (
                  <button
                    key={network.uid}
                    onClick={() => handleNetworkSelect(network.uid)}
                  className={`p-5 rounded-xl border-2 transition-all duration-200 active:scale-98 ${
                      selectedNetwork === network.uid
                        ? theme === "dark"
                        ? "border-slate-400 bg-slate-700/50 shadow-lg"
                        : "border-slate-300 bg-slate-50 shadow-lg"
                        : theme === "dark"
                        ? "border-gray-600 bg-gray-700/20 active:bg-gray-700/40"
                        : "border-gray-200 bg-gray-50/50 active:bg-gray-100"
                    }`}
                  >
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                        selectedNetwork === network.uid
                        ? theme === "dark"
                          ? "bg-slate-600 text-slate-100"
                          : "bg-slate-200 text-slate-700"
                          : theme === "dark"
                          ? "bg-gray-600/50 text-gray-300"
                            : "bg-gray-200 text-gray-600"
                      }`}>
                      <Building2 className="w-7 h-7" />
                    </div>
                    
                    <div className="space-y-1">
                      <p className={`font-semibold text-base leading-tight ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}>
                          {network.nom}
                        </p>
                        <p className={`text-xs ${
                          theme === "dark" ? "text-gray-400" : "text-gray-500"
                        }`}>
                          {network.code}
                        </p>
                      </div>

                    {selectedNetwork === network.uid && (
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        theme === "dark" ? "bg-slate-500" : "bg-slate-400"
                      }`}>
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                    )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Transaction Form Step */
            <>
              {/* Selected Network Display */}
              <div className={`p-4 rounded-xl border transition-all duration-300 ${
                theme === "dark" 
                  ? "bg-green-900/20 border-green-700/50 backdrop-blur-sm" 
                  : "bg-green-50 border-green-200/50 backdrop-blur-sm"
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      theme === "dark" ? "bg-green-600/30 text-green-400" : "bg-green-100 text-green-600"
                    }`}>
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className={`font-semibold text-sm ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                        {selectedNetworkDetails?.nom}
                      </p>
                      <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                        Réseau sélectionné
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleBackToNetworkSelection}
                    className={`text-xs px-3 py-1 rounded-lg transition-all duration-200 ${
                      theme === "dark" 
                        ? "text-gray-400 hover:text-gray-300 hover:bg-gray-700/50" 
                        : "text-gray-600 hover:text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    Changer
                  </button>
                </div>
              </div>

              {/* Available Balance Display */}
              {accountData && (
                <div className={`p-4 rounded-xl border transition-all duration-300 ${
                  theme === "dark" 
                    ? "bg-blue-900/20 border-blue-700/50 backdrop-blur-sm" 
                    : "bg-blue-50 border-blue-200/50 backdrop-blur-sm"
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        theme === "dark" ? "bg-blue-600/30 text-blue-400" : "bg-blue-100 text-blue-600"
                      }`}>
                        <Wallet className="w-5 h-5" />
                      </div>
                      <div>
                        <p className={`font-semibold text-sm ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                          Solde Disponible
                        </p>
                        <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                          Montant dans votre portefeuille
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                        {accountData.balance ? `${accountData.balance.toLocaleString()} FCFA` : "0 FCFA"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Recipient Phone Card - Second */}
              <div className={`p-5 rounded-2xl border transition-all duration-300 ${
                theme === "dark" 
                  ? "bg-gray-800/60 border-gray-700/50 backdrop-blur-sm" 
                  : "bg-white/80 border-gray-200/50 backdrop-blur-sm shadow-sm"
              }`}>
                <Label className={`text-sm font-semibold mb-3 flex items-center gap-2 ${
                  theme === "dark" ? "text-gray-200" : "text-gray-800"
                }`}>
                  <div className={`p-1.5 rounded-lg ${
                    theme === "dark" ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600"
                  }`}>
                    <Phone className="w-4 h-4" />
                  </div>
                  {t("withdraw.recipientPhone")}
                </Label>
                <Input
                  type="tel"
                  placeholder={t("withdraw.recipientPhonePlaceholder")}
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value.replace(/\s/g, ''))}
                  className={`h-14 text-lg font-medium rounded-xl border-2 transition-all duration-300 ${
                    theme === "dark" 
                      ? "bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:bg-gray-700" 
                      : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:bg-white"
                  }`}
                />
              </div>

              {/* Amount Card - Third */}
              <div className={`p-5 rounded-2xl border transition-all duration-300 ${
                theme === "dark" 
                  ? "bg-gray-800/60 border-gray-700/50 backdrop-blur-sm" 
                  : "bg-white/80 border-gray-200/50 backdrop-blur-sm shadow-sm"
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <Label className={`text-sm font-semibold flex items-center gap-2 ${
                    theme === "dark" ? "text-gray-200" : "text-gray-800"
                  }`}>
                    <div className={`p-1.5 rounded-lg ${
                      theme === "dark" ? "bg-red-500/20 text-red-400" : "bg-red-100 text-red-600"
                    }`}>
                      <TrendingDown className="w-4 h-4" />
                    </div>
                    {t("withdraw.amount")}
                  </Label>
                  <span className={`text-xs ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}>
                    Min: 100 - Max: 1 000 000 FCFA
                  </span>
                </div>

                {/* Amount input with better mobile UX */}
                <div className="relative">
                  <Input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="Entrez le montant"
                    value={amount}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\s/g, "")
                      if (/^\d*$/.test(value)) {
                        const formattedAmount = formatNumberWithSpaces(value)
                        setAmount(formattedAmount)
                        setAmountError(validateAmount(formattedAmount))
                      }
                    }}
                    className={`h-16 text-xl font-bold rounded-xl border-2 pr-12 transition-all duration-300 ${
                      amountError
                        ? theme === "dark"
                          ? "bg-red-900/20 border-red-500 text-white"
                          : "bg-red-50 border-red-300 text-gray-900"
                        : theme === "dark" 
                        ? "bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-red-500 focus:bg-gray-700" 
                        : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500 focus:border-red-500 focus:bg-white"
                    }`}
                  />
                  
                  {/* Currency indicator */}
                  <div className={`absolute right-4 top-1/2 transform -translate-y-1/2 ${
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}>
                    <span className="text-sm font-medium">FCFA</span>
                  </div>
                </div>

                {/* Amount validation error */}
                {amountError && (
                  <div className={`mt-3 p-3 rounded-lg flex items-center gap-2 ${
                    theme === "dark" ? "bg-red-500/20" : "bg-red-100"
                  }`}>
                    <AlertCircle className={`w-4 h-4 ${
                      theme === "dark" ? "text-red-400" : "text-red-600"
                    }`} />
                    <p className={`text-sm ${
                      theme === "dark" ? "text-red-400" : "text-red-600"
                    }`}>
                      {amountError}
                    </p>
                  </div>
                )}

                {/* Amount range indicator */}
                {amount && !amountError && (
                  <div className="mt-3">
                    <div className="flex justify-between items-center">
                      <span className={`text-xs ${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}>
                        Min: 100 FCFA
                      </span>
                      <span className={`text-sm font-medium ${
                        theme === "dark" ? "text-red-400" : "text-red-600"
                      }`}>
                        {amount} FCFA
                      </span>
                      <span className={`text-xs ${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}>
                        Max: 1 000 000 FCFA
                      </span>
                    </div>
                  </div>
                )}
              </div>

          {/* Status Messages */}
          <ErrorAlert
            error={error}
            type="error"
                title={t("additional.transactionFailed")}
            onDismiss={() => setError("")}
          />

            {success && (
            <div className={`flex items-center gap-3 p-4 rounded-xl border animate-in slide-in-from-top-2 ${
              theme === "dark" 
                ? "bg-green-900/20 border-green-700/50 backdrop-blur-sm" 
                : "bg-green-50 border-green-200/50 backdrop-blur-sm"
            }`}>
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className={`text-sm font-medium ${theme === "dark" ? "text-green-400" : "text-green-600"}`}>
                {t("withdraw.successMessage")}
              </span>
              </div>
              )}
            </>
            )}
        </div>
      </div>

      {/* Fixed bottom button - Mobile optimized - Only show when not in network selection */}
      {!showNetworkSelection && (
      <div className={`fixed bottom-0 left-0 right-0 z-50 p-4 ${
        theme === "dark" 
          ? "bg-slate-900/95 border-t border-gray-700/50" 
          : "bg-white/95 border-t border-gray-200/50"
      } backdrop-blur-lg`}>
            <Button
              onClick={handleWithdraw}
              disabled={!amount || !recipientPhone || !selectedNetwork || !!amountError || isProcessing}
            className={`w-full h-14 text-lg font-bold rounded-2xl transition-all duration-200 active:scale-98 ${
                !amount || !recipientPhone || !selectedNetwork || !!amountError || isProcessing
              ? "bg-gray-400/50 cursor-not-allowed text-gray-600"
                : "bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 shadow-lg shadow-red-500/25"
              }`}
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>{t("withdraw.processing")}</span>
                </div>
              ) : (
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5" />
              <span>{t("withdraw.confirmWithdraw")}</span>
            </div>
              )}
            </Button>
      </div>
      )}

      {/* Confirmation Modal */}
      <TransactionConfirmationModal
        isOpen={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        onConfirm={handleConfirmWithdraw}
        transactionData={transactionData}
        isProcessing={isProcessing}
      />

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowSuccessModal(false)}
          />
          
          {/* Modal Content */}
          <div 
            className={`relative w-full max-w-sm mx-4 mb-8 rounded-t-3xl transform transition-all duration-500 ease-out ${
              showSuccessModal 
                ? 'translate-y-0 opacity-100' 
                : 'translate-y-full opacity-0'
            } ${
              theme === "dark"
                ? "bg-gray-800 border-t border-gray-700"
                : "bg-white border-t border-gray-200"
            }`}
          >
            {/* Modal Header */}
            <div className="flex justify-center pt-8 pb-4">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                theme === "dark" 
                  ? "bg-green-500/20" 
                  : "bg-green-100"
              }`}>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  theme === "dark" 
                    ? "bg-green-500" 
                    : "bg-green-500"
                }`}>
                  <Check className="w-10 h-10 text-white" strokeWidth={3} />
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-6 pb-8 text-center">
              <h2 className={`text-2xl font-bold mb-2 ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}>
                Retrait Réussi !
              </h2>
              <p className={`text-sm ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}>
                Votre retrait a été effectué avec succès
              </p>
              
              {/* Transaction Details */}
              <div className={`mt-6 p-4 rounded-2xl ${
                theme === "dark" 
                  ? "bg-gray-700/50" 
                  : "bg-gray-50"
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}>
                    Montant
                  </span>
                  <span className={`font-bold ${
                    theme === "dark" ? "text-red-400" : "text-red-600"
                  }`}>
                    {amount} FCFA
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}>
                    Réseau
                  </span>
                  <span className={`text-sm font-semibold ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}>
                    {selectedNetworkDetails?.nom}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}>
                    Téléphone
                  </span>
                  <span className={`text-sm font-semibold ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}>
                    {recipientPhone}
                  </span>
                </div>
              </div>

              {/* Success Animation */}
              <div className="mt-6 flex justify-center">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}