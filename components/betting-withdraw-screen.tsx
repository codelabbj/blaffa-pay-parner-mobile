"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import {
  ArrowLeft,
  ChevronLeft,
  Loader2,
  X,
  Check,
  Search,
  Wallet,
  Mail,
  Gamepad2,
} from "lucide-react"
import { useTheme } from "@/lib/contexts"
import { authService } from "@/lib/auth"
import { bettingService, BettingPlatform } from "@/lib/betting"
import { formatNumberWithSpaces } from "@/lib/utils"

interface BettingWithdrawScreenProps {
  onNavigateBack: () => void
  platformUid?: string
  onTransactionSuccess?: () => void
}

export function BettingWithdrawScreen({
  onNavigateBack,
  platformUid,
  onTransactionSuccess,
}: BettingWithdrawScreenProps) {
  const { theme } = useTheme()

  const [platform, setPlatform] = useState<BettingPlatform | any>(null)
  const [isLoadingPlatform, setIsLoadingPlatform] = useState(true)
  const [step, setStep] = useState(1) // 1: User ID, 2: Withdrawal Code, 3: Confirmation
  const [bettingUserId, setBettingUserId] = useState("")
  const [withdrawalCode, setWithdrawalCode] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [verifiedUser, setVerifiedUser] = useState<{
    UserId: number
    Name?: string
    CurrencyId?: number
  } | null>(null)

  const [showSuccessToast, setShowSuccessToast] = useState(false)
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

  const handleCreateWithdrawal = async () => {
    if (!verifiedUser || !withdrawalCode || !platform) return

    setIsCreating(true)
    setError("")

    try {
      const accessToken = authService.getAccessToken()
      if (!accessToken) throw new Error("No access token available")

      const result = await bettingService.createWithdrawal(accessToken, {
        platform_uid: platform.uid,
        betting_user_id: bettingUserId,
        withdrawal_code: withdrawalCode,
      })

      if (result.success) {
        if (result.transaction && result.transaction.status === "failed") {
          setError(result.transaction.external_response?.error || result.transaction.notes || "Le retrait a échoué")
          setStep(2)
        } else {
          setLastUserId(bettingUserId)
          setShowSuccessToast(true)

          if (onTransactionSuccess) onTransactionSuccess()

          setTimeout(() => {
            setShowSuccessToast(false)
            onNavigateBack()
          }, 3500)
        }
      } else {
        throw new Error(result.message || "Le retrait a échoué")
      }
    } catch (error: any) {
      setError(error.message || "Impossible de créer le retrait")
      setStep(2)
    } finally {
      setIsCreating(false)
    }
  }

  if (isLoadingPlatform) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === "dark" ? "bg-[#0f172a]" : "bg-[#f8fafc]"}`}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-500 ${theme === "dark" ? "bg-[#0f172a]" : "bg-[#f8fafc]"
      }`}>
      {/* Premium Mesh Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-[10%] -right-[10%] w-[70%] h-[50%] rounded-[100%] opacity-20 blur-[120px] animate-pulse ${theme === "dark" ? "bg-red-500" : "bg-red-300"
          }`} style={{ animationDuration: '8s' }} />
        <div className={`absolute top-[20%] -left-[10%] w-[60%] h-[40%] rounded-[100%] opacity-10 blur-[100px] animate-pulse ${theme === "dark" ? "bg-blue-500" : "bg-blue-200"
          }`} style={{ animationDuration: '12s', animationDelay: '2s' }} />
      </div>

      {/* Success Toast Overlay */}
      {showSuccessToast && (
        <div className="fixed top-8 left-0 right-0 z-[100] px-4 animate-in slide-in-from-top duration-500">
          <div className={`max-w-md mx-auto p-4 rounded-[2rem] shadow-[0_25px_60px_rgba(0,0,0,0.2)] border flex items-center gap-4 ${theme === "dark" ? "bg-slate-800/90 border-slate-700/50 backdrop-blur-xl" : "bg-white/90 border-slate-100 backdrop-blur-xl"
            }`}>
            <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30">
              <Check className="w-7 h-7 text-white" strokeWidth={3} />
            </div>
            <div className="flex-1">
              <h3 className={`font-black text-lg ${theme === "dark" ? "text-white" : "text-slate-900"}`}>Retrait</h3>
              <p className={`text-sm font-medium leading-tight ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                Votre demande de retrait pour le compte {lastUserId} a été créée.
              </p>
            </div>
            <button onClick={() => setShowSuccessToast(false)} className="p-2 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 rounded-full">
              <X className={`w-6 h-6 ${theme === "dark" ? "text-slate-500" : "text-slate-400"}`} />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="p-4 flex items-center justify-between z-10 relative mt-2">
        <Button
          variant="ghost" size="sm"
          onClick={step > 1 ? () => setStep(step - 1) : onNavigateBack}
          className={`h-11 w-11 p-0 rounded-2xl transition-all active:scale-90 ${theme === "dark" ? "text-slate-300 hover:bg-slate-800/40" : "text-slate-600 hover:bg-slate-100"
            }`}
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <div className="text-center">
          <p className={`text-[10px] font-black uppercase tracking-[0.25em] ${theme === "dark" ? "text-slate-500" : "text-slate-400"}`}>
            Retrait de paris
          </p>
        </div>
        <div className="w-11" /> {/* Spacer */}
      </div>

      <div className="flex-1 flex flex-col items-center justify-end z-10 relative h-[calc(100vh-120px)]">
        <div className={`w-full rounded-t-[2.5rem] shadow-2xl transition-all duration-700 transform animate-in slide-in-from-bottom-full overflow-hidden flex flex-col ${theme === "dark" ? "bg-slate-900/60 border-t border-slate-800/50 backdrop-blur-2xl" : "bg-white border-t border-white/50 backdrop-blur-2xl shadow-[0_-15px_50px_rgba(0,0,0,0.1)]"
          }`}>
          {/* Modal Handle */}
          <div className="flex justify-center pt-4 pb-2">
            <div className={`w-12 h-1 rounded-full ${theme === "dark" ? "bg-slate-700" : "bg-slate-200"}`} />
          </div>

          {/* Stepper Content */}
          <div className="p-8 flex-1 flex flex-col">
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 flex flex-col flex-1">
                <h2 className={`text-xl font-bold text-center mb-10 ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                  Retirer
                </h2>
                <div className="space-y-6 flex-1">
                  <div className="space-y-2">
                    <label className={`text-xs font-medium ml-1 ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                      Saisissez l'ID Utilisateur
                    </label>
                    <Input
                      type="tel" inputMode="numeric"
                      value={bettingUserId}
                      onChange={(e) => setBettingUserId(e.target.value)}
                      placeholder="Enter user id"
                      className={`h-14 rounded-2xl border-none outline-none text-lg ${theme === "dark" ? "bg-slate-800/50 text-white" : "bg-slate-50 text-slate-900"
                        }`}
                    />
                  </div>
                  {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}
                </div>
                <Button
                  onClick={handleVerifyUserId}
                  disabled={!bettingUserId || isVerifying}
                  className="w-full h-14 rounded-2xl bg-[#4d69ec] hover:bg-[#3f57d1] text-white font-bold text-base mt-8 shadow-lg shadow-blue-500/20"
                >
                  {isVerifying ? <Loader2 className="w-5 h-5 animate-spin" /> : "Suivant"}
                </Button>
              </div>
            )}

            {step === 2 && verifiedUser && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300 flex flex-col flex-1">
                <h2 className={`text-xl font-bold text-center mb-10 ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                  Retirer
                </h2>
                <div className="space-y-6 flex-1">
                  <div className="space-y-2">
                    <label className={`text-xs font-medium ml-1 ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                      Saisissez le code de retrait
                    </label>
                    <Input
                      type="text"
                      value={withdrawalCode}
                      onChange={(e) => setWithdrawalCode(e.target.value)}
                      placeholder="Code de retrait"
                      className={`h-14 rounded-2xl border-none outline-none text-lg ${theme === "dark" ? "bg-slate-800/50 text-white" : "bg-slate-50 text-slate-900"
                        }`}
                    />
                  </div>
                  {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}
                </div>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!withdrawalCode}
                  className="w-full h-14 rounded-2xl bg-[#4d69ec] hover:bg-[#3f57d1] text-white font-bold text-base mt-8 shadow-lg shadow-blue-500/20"
                >
                  Suivant
                </Button>
              </div>
            )}

            {step === 3 && verifiedUser && (
              <div className="animate-in fade-in zoom-in-95 duration-300 flex flex-col items-center flex-1">
                <h2 className={`text-lg font-bold mb-4 ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                  Détails du retrait
                </h2>

                <span className={`text-2xl font-black mb-8 ${theme === "dark" ? "text-white" : "text-slate-800"}`}>
                  --- F
                </span>

                <div className="w-full space-y-4 mb-10">
                  <div className={`border-t border-dashed w-full my-4 ${theme === "dark" ? "border-slate-700" : "border-slate-200"}`} />

                  <div className="flex justify-between items-center text-sm">
                    <span className={theme === "dark" ? "text-slate-400" : "text-slate-500"}>Transaction</span>
                    <span className={`font-bold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>Retrait</span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className={theme === "dark" ? "text-slate-400" : "text-slate-500"}>Destinataire</span>
                    <span className={`font-bold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                      {verifiedUser.Name || "yao ahou"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className={theme === "dark" ? "text-slate-400" : "text-slate-500"}>Identifiant WebUser</span>
                    <span className={`font-bold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                      {bettingUserId}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleCreateWithdrawal}
                  disabled={isCreating}
                  className="w-full h-14 rounded-2xl bg-[#4d69ec] hover:bg-[#3f57d1] text-white font-bold text-base shadow-lg shadow-blue-500/20"
                >
                  {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirmer"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
