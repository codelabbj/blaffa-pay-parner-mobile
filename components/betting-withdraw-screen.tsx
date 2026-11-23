"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Search, Loader2, X, Check } from "lucide-react"
import { authService } from "@/lib/auth"
import { bettingService, BettingPlatform } from "@/lib/betting"
import { formatNumberWithSpaces } from "@/lib/utils"
import { BP, pageBg } from "@/lib/design"

interface BettingWithdrawScreenProps {
  onNavigateBack: () => void
  platformUid?: string
  onTransactionSuccess?: () => void
}

const softInput = {
  background: "#FFFFFF",
  borderColor: BP.border,
  color: BP.text,
  boxShadow: "0 1px 2px rgba(14,26,46,0.04)",
}

/** Retrait MobCash — même langage UI que dépôt PDF p.10–12 */
export function BettingWithdrawScreen({
  onNavigateBack,
  platformUid,
  onTransactionSuccess,
}: BettingWithdrawScreenProps) {
  const [platform, setPlatform] = useState<BettingPlatform | null>(null)
  const [isLoadingPlatform, setIsLoadingPlatform] = useState(true)
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [bettingUserId, setBettingUserId] = useState("")
  const [withdrawalCode, setWithdrawalCode] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [verifiedUser, setVerifiedUser] = useState<{
    UserId: number
    Name?: string
    CurrencyId?: number
  } | null>(null)
  const [withdrawnAmount, setWithdrawnAmount] = useState<string | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    if (platformUid) loadPlatformDetails()
  }, [platformUid])

  const loadPlatformDetails = async () => {
    setIsLoadingPlatform(true)
    try {
      const accessToken = authService.getAccessToken()
      if (!accessToken || !platformUid) throw new Error("Missing credentials or platform ID")

      const platformData = await bettingService.getPlatformDetails(accessToken, platformUid)

      try {
        const externalData = await bettingService.getExternalPlatformData()
        const match = externalData.find(
          (ext) =>
            ext.id === platformData.external_id ||
            ext.name.toLowerCase() === platformData.name.toLowerCase() ||
            ext.public_name?.toLowerCase() === platformData.name.toLowerCase()
        )

        if (match) {
          setPlatform({
            ...platformData,
            city: match.city || platformData.city,
            street: match.street || platformData.street,
            external_image: match.image || platformData.external_image,
            logo: platformData.logo || match.image,
          })
        } else {
          setPlatform(platformData)
        }
      } catch {
        setPlatform(platformData)
      }
    } catch {
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
    } catch (err: any) {
      setError(err.message || "Impossible de vérifier l'ID")
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
        } else {
          const amt =
            result.transaction?.amount != null
              ? String(result.transaction.amount)
              : null
          setWithdrawnAmount(amt)
          setStep(3)
          if (onTransactionSuccess) onTransactionSuccess()
        }
      } else {
        throw new Error(result.message || "Le retrait a échoué")
      }
    } catch (err: any) {
      setError(err.message || "Impossible de créer le retrait")
    } finally {
      setIsCreating(false)
    }
  }

  const clientName = verifiedUser?.Name?.trim() || "Client"
  const prettyCity = platform?.city
    ? platform.city
        .toLowerCase()
        .split(/\s+/)
        .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ""))
        .join(" ")
    : ""
  const platformLine = [platform?.name, prettyCity].filter(Boolean).join(" · ")

  if (isLoadingPlatform) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: pageBg(false) }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: BP.blue }} />
      </div>
    )
  }

  if (step === 3) {
    return (
      <div className="min-h-screen flex flex-col px-4" style={{ background: pageBg(false) }}>
        <div className="flex-1 flex flex-col items-center justify-center text-center pt-8">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
            style={{ background: "rgba(14,159,110,0.16)" }}
          >
            <Check className="w-10 h-10" strokeWidth={3} style={{ color: BP.green }} />
          </div>
          <h1 className="text-[22px] font-extrabold mb-2" style={{ color: BP.text }}>
            Retrait effectué
          </h1>
          {withdrawnAmount && (
            <p className="text-[28px] font-extrabold tabular-nums mb-2" style={{ color: BP.red }}>
              −{formatNumberWithSpaces(withdrawnAmount)} FCFA
            </p>
          )}
          <p className="text-[14px]" style={{ color: BP.muted }}>
            Compte <span className="font-bold" style={{ color: BP.text }}>{clientName}</span>
          </p>
          <p className="text-[12px] mt-1" style={{ color: BP.muted }}>
            {platform?.name} · ID {bettingUserId}
          </p>
        </div>
        <div className="pb-10 max-w-sm mx-auto w-full">
          <button
            type="button"
            onClick={onNavigateBack}
            className="w-full h-[52px] rounded-[16px] font-bold text-white"
            style={{ background: BP.green }}
          >
            Retour à l&apos;accueil
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: pageBg(false) }}>
      <div className="px-4 pt-12 pb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={step === 2 ? () => setStep(1) : onNavigateBack}
          className="w-10 h-10 rounded-[12px] flex items-center justify-center bg-white border shrink-0 active:scale-95"
          style={{ borderColor: BP.border }}
        >
          <ArrowLeft className="w-5 h-5" style={{ color: BP.text }} />
        </button>
        <div className="min-w-0">
          <h1 className="text-[17px] font-extrabold" style={{ color: BP.text }}>
            Retrait de Paris
          </h1>
          <p className="text-[12px] truncate" style={{ color: BP.muted }}>
            {step === 1 ? platformLine || platform?.name : "Compte trouvé"}
          </p>
        </div>
      </div>

      <div className="px-4 flex-1 pb-8">
        {step === 1 && (
          <div className="space-y-4 pt-6">
            <h2 className="text-[22px] font-extrabold text-center" style={{ color: BP.text }}>
              Retirer
            </h2>
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: BP.muted }}>
                ID utilisateur de Paris
              </p>
              <div className="relative">
                <input
                  type="tel"
                  inputMode="numeric"
                  value={bettingUserId}
                  onChange={(e) => setBettingUserId(e.target.value)}
                  placeholder="Entre l'ID utilisateur…"
                  className="w-full h-14 px-4 rounded-[14px] text-base font-semibold border outline-none focus:ring-2 focus:ring-[#2F6BFF]/25"
                  style={softInput}
                />
                {bettingUserId && (
                  <button
                    type="button"
                    onClick={() => setBettingUserId("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                    style={{ color: BP.muted }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={handleVerifyUserId}
              disabled={!bettingUserId || isVerifying}
              className="w-full h-[52px] rounded-[16px] font-bold text-white flex items-center justify-center gap-2 disabled:opacity-45"
              style={{ background: BP.blue }}
            >
              {isVerifying ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              Rechercher le compte
            </button>
            {error && (
              <div className="p-3 rounded-[14px] text-sm font-semibold" style={{ color: BP.red, background: "rgba(229,72,77,0.1)" }}>
                {error}
              </div>
            )}
          </div>
        )}

        {step === 2 && verifiedUser && (
          <div className="space-y-6 pt-2">
            <div
              className="p-4 rounded-[18px] border bg-white flex items-start gap-3"
              style={{ borderColor: BP.border, boxShadow: "0 8px 24px rgba(14,26,46,0.06)" }}
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ background: BP.green }}>
                <Check className="w-6 h-6 text-white" strokeWidth={3} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 mb-1">
                  <span className="text-[12px] font-mono font-bold" style={{ color: BP.text }}>
                    ID {bettingUserId}
                  </span>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full text-white" style={{ background: BP.green }}>
                    Vérifié
                  </span>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                    style={{ background: "rgba(47,107,255,0.12)", color: BP.blue }}
                  >
                    {platform?.name}
                  </span>
                </div>
                <p className="text-[18px] font-extrabold leading-snug break-words" style={{ color: BP.text }}>
                  {clientName}
                </p>
                {(platform?.city || platform?.street) && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {platform?.city && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase" style={{ background: BP.bg, color: BP.muted }}>
                        {platform.city}
                      </span>
                    )}
                    {platform?.street && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase" style={{ background: BP.bg, color: BP.muted }}>
                        {platform.street}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: BP.muted }}>
                Code de retrait
              </p>
              <input
                type="text"
                value={withdrawalCode}
                onChange={(e) => setWithdrawalCode(e.target.value)}
                placeholder="Code fourni par le client"
                className="w-full h-14 px-4 rounded-[14px] text-base font-semibold border outline-none focus:ring-2 focus:ring-[#0E9F6E]/25"
                style={softInput}
              />
            </div>

            <button
              type="button"
              onClick={handleCreateWithdrawal}
              disabled={!withdrawalCode || isCreating}
              className="w-full h-[52px] rounded-[16px] font-bold text-white flex items-center justify-center gap-2 disabled:opacity-45"
              style={{ background: BP.green }}
            >
              {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              Confirmer le retrait
            </button>
            {error && (
              <div className="p-3 rounded-[14px] text-sm font-semibold" style={{ color: BP.red, background: "rgba(229,72,77,0.1)" }}>
                {error}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
