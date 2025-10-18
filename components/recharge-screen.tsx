// "use client"

// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { 
//   ArrowLeft, 
//   Image,
//   AlertCircle
// } from "lucide-react"
// import { useState } from "react"
// import { useTheme } from "@/lib/contexts"
// import { useTranslation } from "@/lib/contexts"
// import { useAuth } from "@/lib/contexts"

// interface RechargeScreenProps {
//   onNavigateBack: () => void
// }

// export function RechargeScreen({ onNavigateBack }: RechargeScreenProps) {
//   const [amount, setAmount] = useState("")
//   const [proofImage, setProofImage] = useState<File | null>(null)
//   const [proofDescription, setProofDescription] = useState("")
//   const [isProcessing, setIsProcessing] = useState(false)
//   const [error, setError] = useState("")
//   const [success, setSuccess] = useState(false)
//   const { theme } = useTheme()
//   const { t } = useTranslation()
//   const { createRecharge, accountData } = useAuth()

//   const handleRecharge = async () => {
//     if (!amount) {
//       setError("Please enter an amount")
//       return
//     }
    
//     setIsProcessing(true)
//     setError("")
    
//     try {
//       await createRecharge({
//         amount: amount,
//         proof_image: proofImage,
//         proof_description: proofDescription,
//         transaction_date: null
//       })
      
//       setSuccess(true)
//       setTimeout(() => {
//         onNavigateBack()
//       }, 2000)
//     } catch (error) {
//       console.error('Recharge error:', error)
      
//       // Parse backend validation errors
//       if (error instanceof Error) {
//         try {
//           const errorData = JSON.parse(error.message)
//           if (typeof errorData === 'object' && errorData !== null) {
//             // Handle field-specific errors
//             const errorMessages: string[] = []
//             Object.keys(errorData).forEach(field => {
//               if (Array.isArray(errorData[field])) {
//                 errorMessages.push(...(errorData[field] as string[]))
//               } else {
//                 errorMessages.push(String(errorData[field]))
//               }
//             })
//             setError(errorMessages.join(', '))
//           } else {
//             setError(error.message)
//           }
//         } catch (parseError) {
//           setError(error.message)
//         }
//       } else {
//         setError("Failed to create recharge")
//       }
//     } finally {
//       setIsProcessing(false)
//     }
//   }

//   return (
//     <div
//       className={`min-h-screen transition-colors duration-300 ${
//         theme === "dark"
//           ? "bg-gradient-to-br from-purple-900 via-gray-900 to-purple-900"
//           : "bg-gradient-to-br from-purple-50 via-white to-orange-50"
//       }`}
//     >
//       {/* Header */}
//       <div className="px-4 pt-12 pb-8 safe-area-inset-top">
//         <div className="flex items-center gap-4 mb-8">
//           <Button
//             variant="ghost"
//             size="sm"
//             className={`h-11 w-11 p-0 rounded-full ${
//               theme === "dark" 
//                 ? "text-gray-300 hover:bg-gray-700/50" 
//                 : "text-gray-600 hover:bg-gray-100/50"
//             }`}
//             onClick={onNavigateBack}
//           >
//             <ArrowLeft className="w-5 h-5" />
//           </Button>
//           <div>
//             <h1 className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
//               {t("recharge.title")}
//             </h1>
//             <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
//               {t("recharge.subtitle")}
//             </p>
//           </div>
//         </div>

//         {/* Recharge Form */}
//         <div className="space-y-6">
//           {/* Balance Info */}
//           <div className={`p-4 rounded-xl ${
//             theme === "dark" ? "bg-gray-700/30" : "bg-gray-100/50"
//           }`}>
//             <div className="flex items-center justify-between">
//               <span className={`text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
//                 {t("recharge.availableBalance")}
//               </span>
//               <span className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
//                 {accountData?.formatted_balance || "Loading..."}
//               </span>
//             </div>
//           </div>

//           {/* Quick Amount Buttons */}
//           <div className="space-y-2">
//             <Label className={`text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
//               {t("recharge.quickAmount")}
//             </Label>
//             <div className="grid grid-cols-3 gap-2">
//               {["5000", "10000", "50000"].map((quickAmount) => (
//                 <Button
//                   key={quickAmount}
//                   variant="outline"
//                   size="sm"
//                   onClick={() => setAmount(quickAmount)}
//                   className={`h-10 ${
//                     theme === "dark" 
//                       ? "border-gray-600 hover:bg-gray-700/50 text-gray-300" 
//                       : "border-gray-200 hover:bg-gray-100/50 text-gray-600"
//                   }`}
//                 >
//                   {quickAmount} FCFA
//                 </Button>
//               ))}
//             </div>
//           </div>

//           {/* Amount Input */}
//           <div className="space-y-2">
//             <Label htmlFor="amount" className={`text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
//               {t("recharge.rechargeAmount")}
//             </Label>
//             <div className="relative">
//               <span className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-sm font-bold ${
//                 theme === "dark" ? "text-gray-400" : "text-gray-500"
//               }`}>
//                 FCFA
//               </span>
//               <Input
//                 id="amount"
//                 type="number"
//                 placeholder="Enter amount"
//                 value={amount}
//                 onChange={(e) => setAmount(e.target.value)}
//                 className={`pl-12 h-12 text-lg font-semibold ${
//                   theme === "dark" 
//                     ? "bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400" 
//                     : "bg-gray-50/50 border-gray-200 text-gray-900 placeholder:text-gray-500"
//                 }`}
//               />
//             </div>
//           </div>

//           {/* Proof Description */}
//           <div className="space-y-2">
//             <Label htmlFor="description" className={`text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
//               {t("recharge.proofDescription")}
//             </Label>
//             <Input
//               id="description"
//               type="text"
//               placeholder={t("recharge.proofDescriptionPlaceholder")}
//               value={proofDescription}
//               onChange={(e) => setProofDescription(e.target.value)}
//               className={`h-12 text-lg font-semibold ${
//                 theme === "dark" 
//                   ? "bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400" 
//                   : "bg-gray-50/50 border-gray-200 text-gray-900 placeholder:text-gray-500"
//               }`}
//             />
//           </div>

//           {/* Proof Image Upload */}
//           <div className="space-y-2">
//             <Label className={`text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
//               {t("recharge.proofImage")}
//             </Label>
//             <div className="relative">
//               <input
//                 type="file"
//                 accept="image/*"
//                 onChange={(e) => setProofImage(e.target.files?.[0] || null)}
//                 className="hidden"
//                 id="proof-upload"
//               />
//               <label
//                 htmlFor="proof-upload"
//                 className={`flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-xl cursor-pointer transition-colors duration-200 ${
//                   theme === "dark"
//                     ? "border-gray-600 hover:border-gray-500 hover:bg-gray-700/30"
//                     : "border-gray-300 hover:border-gray-400 hover:bg-gray-50/50"
//                 }`}
//               >
//                 <Image className="w-5 h-5" />
//                 <span className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
//                   {proofImage ? proofImage.name : t("recharge.uploadProofImage")}
//                 </span>
//               </label>
//             </div>
//           </div>

//           {/* Error Message */}
//           {error && (
//             <div className={`flex items-center gap-2 p-3 rounded-lg ${
//               theme === "dark" ? "bg-red-900/20 border border-red-800" : "bg-red-50 border border-red-200"
//             }`}>
//               <AlertCircle className="w-4 h-4 text-red-500" />
//               <span className="text-sm text-red-600">{error}</span>
//             </div>
//           )}

//           {/* Success Message */}
//           {success && (
//             <div className={`flex items-center gap-2 p-3 rounded-lg ${
//               theme === "dark" ? "bg-green-900/20 border border-green-800" : "bg-green-50 border border-green-200"
//             }`}>
//               <div className="w-4 h-4 bg-green-500 rounded-full"></div>
//               <span className="text-sm text-green-600">{t("recharge.successMessage")}</span>
//             </div>
//           )}

//           {/* Recharge Button */}
//           <Button
//             onClick={handleRecharge}
//             disabled={!amount || isProcessing}
//             className={`w-full h-12 text-lg font-semibold transition-all duration-300 ${
//               !amount || isProcessing
//                 ? "bg-gray-400 cursor-not-allowed"
//                 : "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 hover:scale-[1.02] active:scale-[0.98]"
//             }`}
//           >
//             {isProcessing ? (
//               <div className="flex items-center gap-2">
//                 <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
//                 {t("recharge.creatingRecharge")}
//               </div>
//             ) : (
//               t("recharge.createRecharge")
//             )}
//           </Button>
//         </div>
//       </div>
//     </div>
//   )
// }



"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ErrorAlert } from "@/components/ui/error-alert"
import { TransactionConfirmationModal, TransactionData } from "@/components/ui/transaction-confirmation-modal"
import { 
  ArrowLeft, 
  Image,
  AlertCircle,
  CheckCircle,
  Wallet,
  CreditCard,
  FileText,
  Plus,
  RefreshCw
} from "lucide-react"
import { useState, useEffect } from "react"
import { useTheme } from "@/lib/contexts"
import { useTranslation } from "@/lib/contexts"
import { useAuth } from "@/lib/contexts"
import { parseBackendError, formatErrorMessage } from "@/lib/error-utils"

interface RechargeScreenProps {
  onNavigateBack: () => void
}

export function RechargeScreen({ onNavigateBack }: RechargeScreenProps) {
  const [amount, setAmount] = useState("")
  const [proofImage, setProofImage] = useState<File | null>(null)
  const [proofDescription, setProofDescription] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  
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
  const { createRecharge, accountData } = useAuth()

  const handleRecharge = async () => {
    if (!amount) {
      setError(t("additional.pleaseEnterAnAmount"))
      return
    }
    
    // Show confirmation modal instead of directly processing
    setShowConfirmationModal(true)
  }

  const handleConfirmRecharge = async () => {
    setIsProcessing(true)
    setError("")
    
    try {
      await createRecharge({
        amount: amount,
        proof_image: proofImage,
        proof_description: proofDescription,
        transaction_date: null
      })
      
      setSuccess(true)
      setShowConfirmationModal(false)
      setTimeout(() => {
        onNavigateBack()
      }, 2000)
    } catch (error) {
      console.error('Recharge error:', error)
      
      // Parse backend errors using the new error parsing utility
      const parsedError = parseBackendError(error)
      const formattedMessage = formatErrorMessage(parsedError)
      setError(formattedMessage)
      setShowConfirmationModal(false)
    } finally {
      setIsProcessing(false)
    }
  }

  // Prepare transaction data for confirmation modal
  const transactionData: TransactionData = {
    type: 'recharge',
    amount,
    proofDescription,
    proofImage
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
          theme === "dark" ? "bg-emerald-500" : "bg-emerald-300"
        } blur-2xl animate-pulse`}></div>
        <div className={`absolute bottom-40 left-4 w-40 h-40 rounded-full opacity-20 ${
          theme === "dark" ? "bg-cyan-500" : "bg-cyan-300"
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
            onClick={onNavigateBack}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div className="text-center flex-1 mx-4">
            <h1 className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              {t("recharge.title")}
            </h1>
            <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              {t("recharge.subtitle")}
            </p>
          </div>
          
          <div className={`p-2.5 rounded-xl ${
            theme === "dark" ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-600"
          }`}>
            <Plus className="w-5 h-5" />
          </div>
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-1 rounded-full transition-all duration-300 ${
              amount ? "bg-green-500" : theme === "dark" ? "bg-emerald-500" : "bg-emerald-600"
            }`}></div>
            <div className={`w-8 h-1 rounded-full transition-all duration-300 ${
              proofDescription ? "bg-green-500" : theme === "dark" ? "bg-gray-600" : "bg-gray-300"
            }`}></div>
            <div className={`w-8 h-1 rounded-full transition-all duration-300 ${
              proofImage ? "bg-green-500" : theme === "dark" ? "bg-gray-600" : "bg-gray-300"
            }`}></div>
          </div>
          </div>
        </div>

      {/* Scrollable content area */}
      <div className="relative z-10 px-4 pb-32 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        <div className="space-y-6">
          {/* Balance Info Card */}
          <div className={`p-5 rounded-2xl border transition-all duration-300 ${
            theme === "dark" 
              ? "bg-gray-800/60 border-gray-700/50 backdrop-blur-sm" 
              : "bg-white/80 border-gray-200/50 backdrop-blur-sm shadow-sm"
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  theme === "dark" ? "bg-green-500/20 text-green-400" : "bg-green-100 text-green-600"
                }`}>
                  <Wallet className="w-5 h-5" />
                </div>
                <span className={`text-sm font-semibold ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                {t("recharge.availableBalance")}
              </span>
              </div>
              <span className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                {accountData?.formatted_balance || "Loading..."}
              </span>
            </div>
          </div>

          {/* Amount Card */}
          <div className={`p-5 rounded-2xl border transition-all duration-300 ${
            theme === "dark" 
              ? "bg-gray-800/60 border-gray-700/50 backdrop-blur-sm" 
              : "bg-white/80 border-gray-200/50 backdrop-blur-sm shadow-sm"
          }`}>
            <Label className={`text-sm font-semibold mb-3 flex items-center gap-2 ${
              theme === "dark" ? "text-gray-200" : "text-gray-800"
            }`}>
              <div className={`p-1.5 rounded-lg ${
                theme === "dark" ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-600"
              }`}>
                <CreditCard className="w-4 h-4" />
              </div>
              {t("recharge.rechargeAmount")}
            </Label>
            

            {/* Amount input with better mobile UX */}
            <div className="relative">
              <span className={`absolute left-4 top-1/2 transform -translate-y-1/2 text-sm font-semibold ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}>
                FCFA
              </span>
              <Input
                type="number"
                inputMode="numeric"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`pl-16 h-14 text-lg font-bold rounded-xl border-2 transition-all duration-300 ${
                  theme === "dark" 
                    ? "bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-emerald-500 focus:bg-gray-700" 
                    : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500 focus:border-emerald-500 focus:bg-white"
                }`}
              />
            </div>
          </div>

          {/* Proof Description Card */}
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
                <FileText className="w-4 h-4" />
              </div>
              {t("recharge.proofDescription")}
            </Label>
            <Input
              type="text"
              placeholder={t("recharge.proofDescriptionPlaceholder")}
              value={proofDescription}
              onChange={(e) => setProofDescription(e.target.value)}
              className={`h-12 text-base font-medium rounded-xl border-2 transition-all duration-300 ${
                theme === "dark" 
                  ? "bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:bg-gray-700" 
                  : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:bg-white"
              }`}
            />
          </div>

          {/* Proof Image Upload Card */}
          <div className={`p-5 rounded-2xl border transition-all duration-300 ${
            theme === "dark" 
              ? "bg-gray-800/60 border-gray-700/50 backdrop-blur-sm" 
              : "bg-white/80 border-gray-200/50 backdrop-blur-sm shadow-sm"
          }`}>
            <Label className={`text-sm font-semibold mb-3 flex items-center gap-2 ${
              theme === "dark" ? "text-gray-200" : "text-gray-800"
            }`}>
              <div className={`p-1.5 rounded-lg ${
                theme === "dark" ? "bg-orange-500/20 text-orange-400" : "bg-orange-100 text-orange-600"
              }`}>
                <Image className="w-4 h-4" />
              </div>
              {t("recharge.proofImage")}
            </Label>
            
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setProofImage(e.target.files?.[0] || null)}
                className="hidden"
                id="proof-upload"
              />
              <label
                htmlFor="proof-upload"
                className={`flex items-center justify-center gap-3 p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 active:scale-98 ${
                  proofImage
                    ? theme === "dark"
                      ? "border-orange-500 bg-orange-500/10"
                      : "border-orange-500 bg-orange-50"
                    : theme === "dark"
                    ? "border-gray-600 hover:border-gray-500 hover:bg-gray-700/30"
                      : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                }`}
              >
                <div className={`p-2 rounded-lg ${
                  proofImage
                    ? theme === "dark"
                      ? "bg-orange-500/20 text-orange-400"
                      : "bg-orange-100 text-orange-600"
                    : theme === "dark"
                      ? "bg-gray-600/50 text-gray-400"
                      : "bg-gray-200 text-gray-500"
                }`}>
                  {proofImage ? <CheckCircle className="w-5 h-5" /> : <Image className="w-5 h-5" />}
                </div>
                <div className="text-center">
                  <p className={`text-base font-medium ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}>
                  {proofImage ? proofImage.name : t("recharge.uploadProofImage")}
                  </p>
                  {!proofImage && (
                    <p className={`text-sm ${
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}>
                      {t("additional.tapToSelectImage")}
                    </p>
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* Status Messages */}
          <ErrorAlert
            error={error}
            type="error"
            title={t("additional.rechargeFailed")}
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
                {t("recharge.successMessage")}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Fixed bottom button - Mobile optimized */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 p-4 ${
        theme === "dark" 
          ? "bg-slate-900/95 border-t border-gray-700/50" 
          : "bg-white/95 border-t border-gray-200/50"
      } backdrop-blur-lg`}>
          <Button
            onClick={handleRecharge}
            disabled={!amount || isProcessing}
          className={`w-full h-12 text-base font-bold rounded-2xl transition-all duration-200 active:scale-98 ${
              !amount || isProcessing
              ? "bg-gray-400/50 cursor-not-allowed text-gray-600"
              : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg shadow-blue-500/25"
            }`}
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>{t("recharge.creatingRecharge")}</span>
              </div>
            ) : (
            <div className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              <span>{t("recharge.createRecharge")}</span>
            </div>
            )}
          </Button>
      </div>

      {/* Confirmation Modal */}
      <TransactionConfirmationModal
        isOpen={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        onConfirm={handleConfirmRecharge}
        transactionData={transactionData}
        isProcessing={isProcessing}
      />
    </div>
  )
}