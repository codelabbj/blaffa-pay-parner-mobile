"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import {
  ArrowLeft,
  Search,
  CheckCircle,
  Loader2,
  X,
  User,
  Mail,
  Wallet,
  Check,
  ChevronLeft,
} from "lucide-react"
import { useTheme } from "@/lib/contexts"
import { authService } from "@/lib/auth"
import { bettingService, BettingPlatform } from "@/lib/betting"
import { formatNumberWithSpaces } from "@/lib/utils"

interface BettingDepositScreenProps {
  onNavigateBack: () => void
  platformUid?: string
  onTransactionSuccess?: () => void
}

export function BettingDepositScreen({
  onNavigateBack,
  platformUid,
  onTransactionSuccess,
}: BettingDepositScreenProps) {
  const { theme } = useTheme()

  const [platform, setPlatform] = useState<BettingPlatform | null>(null)
  const [isLoadingPlatform, setIsLoadingPlatform] = useState(true)
  const [step, setStep] = useState(1) // 1: User ID, 2: Amount
  const [bettingUserId, setBettingUserId] = useState("")
  const [amount, setAmount] = useState("0")
  const [isVerifying, setIsVerifying] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [verifiedUser, setVerifiedUser] = useState<{
    UserId: number
    Name?: string
    CurrencyId?: number
  } | null>(null)

  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [lastAmount, setLastAmount] = useState("")
  const [lastUserId, setLastUserId] = useState("")

  const [error, setError] = useState("")

  useEffect(() => {
    if (platformUid) {
      loadPlatformDetails()
    }
  }, [platformUid])

  const loadPlatformDetails = async () => {
    setIsLoadingPlatform(true)
    try {
      const accessToken = authService.getAccessToken()
      if (!accessToken || !platformUid) {
        throw new Error("Missing credentials or platform ID")
      }

      const platformData = await bettingService.getPlatformDetails(accessToken, platformUid)
      setPlatform(platformData)
    } catch (error) {
      console.error("Load platform error:", error)
      onNavigateBack()
    } finally {
      setIsLoadingPlatform(false)
    }
  }

  const handleVerifyUserId = async () => {
    if (!bettingUserId || !platform) return

    setIsVerifying(true)
    setError("")

    try {
      const accessToken = authService.getAccessToken()
      if (!accessToken) throw new Error("No access token available")

      const result = await bettingService.verifyUserId(accessToken, {
        platform_uid: platform.uid,
        betting_user_id: bettingUserId,
      })

      if (result.success && result.user && result.user.user_id !== 0) {
        setVerifiedUser({
          UserId: result.user.user_id,
          Name: result.user.name,
          CurrencyId: result.user.currency_id,
        })
        setStep(2)
      } else {
        setError("ID de pari invalide")
      }
    } catch (error: any) {
      setError(error.message || "Impossible de vérifier l'ID")
    } finally {
      setIsVerifying(false)
    }
  }

  const handleCreateDeposit = async () => {
    if (!verifiedUser || !amount || parseFloat(amount) <= 0 || !platform) return

    setIsCreating(true)
    setError("")

    try {
      const accessToken = authService.getAccessToken()
      if (!accessToken) throw new Error("No access token available")

      const result = await bettingService.createDeposit(accessToken, {
        platform_uid: platform.uid,
        betting_user_id: bettingUserId,
        amount: amount,
      })

      if (result.success) {
        if (result.transaction && result.transaction.status === "failed") {
          setError(result.transaction.external_response?.error || result.transaction.notes || "Le dépôt a échoué")
        } else {
          setLastAmount(amount)
          setLastUserId(bettingUserId)
          setShowSuccessToast(true)

          if (onTransactionSuccess) onTransactionSuccess()

          // Auto close after 3 seconds
          setTimeout(() => {
            setShowSuccessToast(false)
            onNavigateBack()
          }, 3500)
        }
      } else {
        throw new Error(result.message || "Le dépôt a échoué")
      }
    } catch (error: any) {
      setError(error.message || "Impossible de créer le dépôt")
    } finally {
      setIsCreating(false)
    }
  }

  const handleKeyPress = (key: string) => {
    if (key === "backspace") {
      setAmount(prev => {
        if (prev.length <= 1) return "0"
        return prev.slice(0, -1)
      })
    } else {
      setAmount(prev => {
        if (prev === "0") return key
        return prev + key
      })
    }
  }

  if (isLoadingPlatform) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === "dark" ? "bg-slate-900" : "bg-blue-50"}`}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-500 ${theme === "dark"
      ? "bg-[#0f172a]"
      : "bg-[#f8fafc]"
      }`}>
      {/* Premium Mesh Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-[10%] -right-[10%] w-[70%] h-[50%] rounded-[100%] opacity-20 blur-[120px] animate-pulse ${theme === "dark" ? "bg-blue-500" : "bg-blue-300"
          }`} style={{ animationDuration: '8s' }} />
        <div className={`absolute top-[20%] -left-[10%] w-[60%] h-[40%] rounded-[100%] opacity-10 blur-[100px] animate-pulse ${theme === "dark" ? "bg-purple-500" : "bg-purple-200"
          }`} style={{ animationDuration: '12s', animationDelay: '2s' }} />
        <div className={`absolute -bottom-[10%] right-[20%] w-[50%] h-[40%] rounded-[100%] opacity-15 blur-[110px] animate-pulse ${theme === "dark" ? "bg-emerald-500" : "bg-emerald-200"
          }`} style={{ animationDuration: '10s', animationDelay: '1s' }} />
      </div>

      {/* Success Toast Overlay */}
      {showSuccessToast && (
        <div className="fixed top-8 left-0 right-0 z-[100] px-4 animate-in slide-in-from-top duration-500">
          <div className={`max-w-md mx-auto p-4 rounded-[2rem] shadow-[0_25px_60px_rgba(0,0,0,0.2)] border flex items-center gap-4 ${theme === "dark"
            ? "bg-slate-800/90 border-slate-700/50 backdrop-blur-xl"
            : "bg-white/90 border-slate-100 backdrop-blur-xl"
            }`}>
            <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30">
              <Check className="w-7 h-7 text-white" strokeWidth={3} />
            </div>
            <div className="flex-1">
              <h3 className={`font-black text-lg ${theme === "dark" ? "text-white" : "text-slate-900"}`}>Dépôt</h3>
              <p className={`text-sm font-medium leading-tight ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                Vous avez déposé {parseFloat(lastAmount).toFixed(2)} F sur le compte {lastUserId}
              </p>
            </div>
            <button
              onClick={() => setShowSuccessToast(false)}
              className="p-2 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 rounded-full transition-colors"
            >
              <X className={`w-6 h-6 ${theme === "dark" ? "text-slate-500" : "text-slate-400"}`} />
            </button>
          </div>
        </div>
      )}

      {/* Step Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1.5 flex gap-1 px-1 pt-1">
        <div className={`h-full flex-1 rounded-full transition-all duration-700 ${step >= 1 ? "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" : "bg-slate-200 dark:bg-slate-800"
          }`} />
        <div className={`h-full flex-1 rounded-full transition-all duration-700 ${step >= 2 ? "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" : "bg-slate-200 dark:bg-slate-800"
          }`} />
      </div>

      {/* Header */}
      <div className="p-4 flex items-center justify-between z-10 relative mt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={step === 2 ? () => setStep(1) : onNavigateBack}
          className={`h-11 w-11 p-0 rounded-2xl transition-all active:scale-90 ${theme === "dark"
            ? "text-slate-300 hover:bg-slate-800/80 bg-slate-800/40"
            : "text-slate-600 bg-white/80 hover:bg-white shadow-sm border border-slate-100"
            }`}
        >
          {step === 2 ? <ChevronLeft className="w-6 h-6" /> : <ArrowLeft className="w-6 h-6" />}
        </Button>
        <div className="text-center">
          <p className={`text-[10px] font-black uppercase tracking-[0.25em] ${theme === "dark" ? "text-slate-500" : "text-slate-400"}`}>
            Depot de paris
          </p>
        </div>
        <div className={`h-11 w-11 rounded-2xl flex items-center justify-center transition-all ${theme === "dark" ? "bg-slate-800/40" : "bg-white/80 shadow-sm border border-slate-100"
          }`}>
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
        </div>
      </div>

      {/* Step 1: User ID */}
      {step === 1 && (
        <div className="flex flex-col h-[calc(100vh-100px)] px-6 pt-10 z-10 relative">
          <div className="text-center mb-12">
            <h1 className={`text-4xl font-black tracking-tighter mb-2 ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
              Déposer
            </h1>
          </div>

          <div className="space-y-8 flex-1">
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <label className={`text-[11px] font-black uppercase tracking-widest ${theme === "dark" ? "text-slate-500" : "text-slate-400"}`}>
                  ID Utilisateur de paris
                </label>
                <div className={`w-2 h-2 rounded-full ${bettingUserId ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-700'}`} />
              </div>
              <div className="relative group">
                <Input
                  type="tel"
                  inputMode="numeric"
                  value={bettingUserId}
                  onChange={(e) => setBettingUserId(e.target.value)}
                  placeholder="Entrez l'ID utilisateur"
                  className={`h-20 text-3xl font-black rounded-[2rem] border-2 px-8 pr-16 transition-all duration-300 outline-none ${theme === "dark"
                    ? "bg-slate-800/50 border-slate-700/50 text-white focus:border-blue-500 focus:bg-slate-900/80 focus:shadow-[0_0_30px_rgba(59,130,246,0.1)]"
                    : "bg-white border-slate-100 shadow-xl shadow-slate-200/40 text-slate-900 focus:border-blue-500 focus:shadow-[0_15px_30px_rgba(0,0,0,0.05)]"
                    }`}
                />
                {bettingUserId && (
                  <button
                    onClick={() => setBettingUserId("")}
                    className="absolute right-6 top-1/2 -translate-y-1/2 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all active:scale-75"
                  >
                    <X className="w-7 h-7 text-slate-400" />
                  </button>
                )}
              </div>
            </div>

            {error && (
              <div className="p-5 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-black text-center animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center justify-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                  {error}
                </div>
              </div>
            )}

            <Button
              onClick={handleVerifyUserId}
              disabled={!bettingUserId || isVerifying}
              className={`w-full h-20 rounded-[2.5rem] text-xl font-black transition-all active:scale-[0.97] group overflow-hidden relative ${theme === "dark"
                ? "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_20px_40px_rgba(37,99,235,0.3)]"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-[0_20px_40px_rgba(37,99,235,0.25)]"
                }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
              {isVerifying ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="w-7 h-7 animate-spin" />
                  <span>Vérification...</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Search className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  <span>Rechercher le compte</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Amount */}
      {step === 2 && verifiedUser && (
        <div className="flex flex-col h-[calc(100vh-100px)] px-4 z-10 relative">
          {/* User Card with Platform Logo */}
          <div className={`p-5 rounded-[3rem] border mb-6 flex items-center gap-4 transition-all animate-in zoom-in-95 duration-500 ${theme === "dark"
            ? "bg-slate-800/60 border-slate-700/50 backdrop-blur-md shadow-2xl"
            : "bg-white border-slate-50 shadow-[0_20px_40px_rgba(0,0,0,0.03)]"
            }`}>
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Check className="w-9 h-9 text-white" strokeWidth={4} />
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-blue-600 border-4 border-slate-800 flex items-center justify-center animate-bounce-subtle">
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className={`font-black text-xl leading-tight truncate ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                  ID {bettingUserId}
                </h3>
                <span className="flex h-5 items-center px-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-wider animate-pulse">
                  Vérifié
                </span>
              </div>
              <p className={`text-sm font-bold truncate ${theme === "dark" ? "text-slate-500" : "text-slate-400"}`}>
                {verifiedUser.Name || "Utilisateur vérifié"}
              </p>
            </div>
            {platform?.logo && (
              <div className={`w-14 h-14 rounded-2xl p-2 shrink-0 border ${theme === "dark" ? "bg-slate-700/50 border-slate-600" : "bg-white border-slate-100 shadow-sm"
                }`}>
                <img
                  src={`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}${platform.logo}`}
                  alt={platform.name}
                  className="w-full h-full object-contain"
                />
              </div>
            )}
          </div>

          {/* Amount Display Area */}
          <div className="flex flex-col items-center justify-center flex-1 max-h-[300px]">
            <span className={`text-xl font-black mb-2 ${theme === "dark" ? "text-slate-600" : "text-slate-300"}`}>
              F
            </span>
            <div className="relative w-full text-center">
              <input
                type="tel"
                inputMode="decimal"
                value={amount}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9.]/g, "")
                  // Prevent multiple dots
                  if ((val.match(/\./g) || []).length > 1) return
                  setAmount(val || "0")
                }}
                onFocus={(e) => {
                  if (amount === "0") setAmount("")
                }}
                onBlur={(e) => {
                  if (amount === "" || amount === ".") setAmount("0")
                }}
                autoFocus
                className={`w-full bg-transparent border-none text-center text-7xl font-black tracking-tighter outline-none caret-blue-500 ${theme === "dark" ? "text-white" : "text-slate-900"
                  }`}
                style={{ fontSize: amount.length > 8 ? '4rem' : '4.5rem' }}
              />
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-[2rem] bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold text-center mb-6">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div className="mt-auto mb-10">
            <Button
              onClick={handleCreateDeposit}
              disabled={parseFloat(amount) <= 0 || isCreating}
              className={`w-full h-18 rounded-[2.5rem] text-2xl font-black transition-all active:scale-95 group relative overflow-hidden ${theme === "dark"
                ? "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_20px_50px_rgba(37,99,235,0.4)]"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-[0_20px_50px_rgba(37,99,235,0.3)]"
                }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
              {isCreating ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <span>Traitement...</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Wallet className="w-7 h-7 group-hover:rotate-12 transition-transform" />
                  <span>Déposer</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
