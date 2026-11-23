"use client"

import { ArrowLeft, Search, Loader2, Check } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { authService } from "@/lib/auth"
import { transferService, User } from "@/lib/transfers"
import { parseBackendError, formatErrorMessage } from "@/lib/error-utils"
import { formatNumberWithSpaces } from "@/lib/utils"
import { BP, toPublicHandle, initialsFromHandle, avatarColor , pageBg, cardBg, textPrimary } from "@/lib/design"

interface TransferScreenProps {
  onNavigateBack: () => void
  onTransactionSuccess?: () => void
}

type Step = "choose" | "amount" | "success"

/** PDF p.6–8 — Transfert UV par surnom */
export function TransferScreen({ onNavigateBack, onTransactionSuccess }: TransferScreenProps) {
  const [step, setStep] = useState<Step>("choose")
  const [amount, setAmount] = useState("")
  const [amountError, setAmountError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedReceiver, setSelectedReceiver] = useState<User | null>(null)
  const [selectedHandle, setSelectedHandle] = useState("")
  const [partners, setPartners] = useState<User[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState("")
  const [sentAmount, setSentAmount] = useState("")
  const [sentHandle, setSentHandle] = useState("")
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const validateAmount = (value: string) => {
    const numericAmount = parseFloat(value.replace(/\s/g, ""))
    if (isNaN(numericAmount) || numericAmount <= 0) return "Le montant doit être supérieur à 0"
    if (numericAmount < 100) return "Le montant minimum est 100 FCFA"
    if (numericAmount > 1000000) return "Le montant maximum est 1 000 000 FCFA"
    return ""
  }

  const loadPartners = async (query: string) => {
    setIsSearching(true)
    setError("")
    try {
      const accessToken = authService.getAccessToken()
      if (!accessToken) throw new Error("No access token available")
      const q = query.replace(/^@+/, "").trim()
      const response = await transferService.searchUsers(accessToken, q)
      setPartners(response.results || [])
    } catch (err) {
      setError(formatErrorMessage(parseBackendError(err)))
      setPartners([])
    } finally {
      setIsSearching(false)
    }
  }

  useEffect(() => {
    loadPartners("")
  }, [])

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    searchTimeoutRef.current = setTimeout(() => loadPartners(searchQuery), 280)
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    }
  }, [searchQuery])

  const selectReceiver = (user: User) => {
    const handle = toPublicHandle(user.display_name)
    setSelectedReceiver(user)
    setSelectedHandle(handle)
    setError("")
    setStep("amount")
  }

  const handleSendTransfer = async () => {
    if (!amount || !selectedReceiver) {
      setError("Choisis un montant")
      return
    }
    const err = validateAmount(amount)
    if (err) {
      setAmountError(err)
      return
    }
    setIsProcessing(true)
    setError("")
    try {
      const accessToken = authService.getAccessToken()
      if (!accessToken) throw new Error("No access token available")
      await transferService.sendTransfer(accessToken, {
        receiver_uid: selectedReceiver.uid,
        amount,
        description: `Transfert UV vers ${selectedHandle}`,
      })
      setSentAmount(amount)
      setSentHandle(selectedHandle)
      setStep("success")
      if (onTransactionSuccess) onTransactionSuccess()
    } catch (err) {
      if (err instanceof Error && err.message.includes("{")) {
        try {
          const errorData = JSON.parse(err.message)
          const msgs: string[] = []
          Object.values(errorData).forEach((v) => {
            if (Array.isArray(v)) msgs.push(...v)
          })
          setError(msgs.join(". ") || "Transfert impossible")
        } catch {
          setError(formatErrorMessage(parseBackendError(err)))
        }
      } else {
        setError(formatErrorMessage(parseBackendError(err)))
      }
    } finally {
      setIsProcessing(false)
    }
  }

  if (step === "success") {
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
            Transfert envoyé
          </h1>
          <p className="text-[28px] font-extrabold tabular-nums mb-2" style={{ color: BP.green }}>
            {formatNumberWithSpaces(sentAmount)} FCFA
          </p>
          <p className="text-[14px] font-semibold" style={{ color: BP.muted }}>
            Envoyé à {sentHandle}
          </p>
        </div>
        <div className="pb-10 max-w-sm mx-auto w-full">
          <button
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

  if (step === "amount" && selectedReceiver) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: pageBg(false) }}>
        <div className="px-4 pt-12 pb-4 flex items-center gap-3">
          <button
            onClick={() => setStep("choose")}
            className="w-10 h-10 rounded-[12px] flex items-center justify-center bg-white border"
            style={{ borderColor: BP.border }}
          >
            <ArrowLeft className="w-5 h-5" style={{ color: BP.text }} />
          </button>
          <div>
            <h1 className="text-[17px] font-extrabold" style={{ color: BP.text }}>
              Montant à envoyer
            </h1>
            <p className="text-[12px]" style={{ color: BP.muted }}>
              Transfert vers un partenaire
            </p>
          </div>
        </div>

        <div className="px-4 flex-1">
          <div
            className="p-4 flex items-center gap-3 mb-8 rounded-[18px] border bg-white"
            style={{ borderColor: BP.border, boxShadow: "0 4px 16px rgba(14,26,46,0.04)" }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-extrabold text-white"
              style={{ background: avatarColor(selectedHandle) }}
            >
              {initialsFromHandle(selectedHandle)}
            </div>
            <div>
              <p className="font-extrabold" style={{ color: BP.text }}>
                {selectedHandle}
              </p>
              <p className="text-[12px]" style={{ color: BP.muted }}>
                Partenaire · Blaffa Pay
              </p>
            </div>
          </div>

          <div className="text-center mb-2">
            <p className="text-[14px] font-bold mb-1" style={{ color: BP.muted }}>
              FCFA
            </p>
            <input
              type="tel"
              inputMode="numeric"
              placeholder="0"
              value={amount ? formatNumberWithSpaces(amount) : ""}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "")
                setAmount(value)
                setAmountError(validateAmount(value))
              }}
              className="w-full border-0 outline-none ring-0 shadow-none text-center text-[42px] font-extrabold tabular-nums bg-transparent p-0"
              style={{ color: BP.text, caretColor: BP.green }}
            />
          </div>
          {amountError && <p className="text-center text-sm font-medium" style={{ color: BP.red }}>{amountError}</p>}
          {error && <p className="text-center text-sm font-medium mt-1" style={{ color: BP.red }}>{error}</p>}

          {/* Pill vert juste sous le montant — PDF p.7 */}
          <button
            onClick={handleSendTransfer}
            disabled={!amount || !!amountError || isProcessing}
            className="w-full mt-8 h-[52px] rounded-full font-bold text-white flex items-center justify-center gap-2 disabled:opacity-45"
            style={{ background: BP.green }}
          >
            {isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span className="text-lg leading-none">›</span>
                Envoyer à {selectedHandle}
              </>
            )}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: pageBg(false) }}>
      <div className="px-4 pt-12 pb-4 flex items-center gap-3">
        <button
          onClick={onNavigateBack}
          className="w-10 h-10 rounded-[12px] flex items-center justify-center bg-white border"
          style={{ borderColor: BP.border }}
        >
          <ArrowLeft className="w-5 h-5" style={{ color: BP.text }} />
        </button>
        <div>
          <h1 className="text-[17px] font-extrabold" style={{ color: BP.text }}>
            Transfert UV
          </h1>
          <p className="text-[12px]" style={{ color: BP.muted }}>
            Choisis un partenaire par surnom
          </p>
        </div>
      </div>

      <div className="px-4 mb-4">
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none z-10"
            style={{ color: BP.muted }}
          />
          <input
            type="text"
            placeholder="Rechercher un surnom…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-11 pr-10 rounded-full border-0 outline-none ring-0 shadow-none text-[15px] font-medium placeholder:text-[#9AA8BC]"
            style={{
              background: "#FFFFFF",
              color: BP.text,
              boxShadow: "0 4px 14px rgba(14,26,46,0.06)",
            }}
            autoCapitalize="none"
            autoCorrect="off"
          />
          {isSearching && (
            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin" style={{ color: BP.blue }} />
          )}
        </div>
      </div>

      <div className="px-4 pb-8 flex-1 overflow-y-auto">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] mb-3" style={{ color: BP.muted }}>
          Partenaires Blaffa Pay
        </p>
        {error && <p className="mb-3 text-sm" style={{ color: BP.red }}>{error}</p>}
        <div className="space-y-2">
          {partners.map((user) => {
            const handle = toPublicHandle(user.display_name)
            return (
              <button
                key={user.uid}
                type="button"
                onClick={() => selectReceiver(user)}
                className="w-full p-3.5 flex items-center gap-3 text-left rounded-[18px] border bg-white active:scale-[0.99] transition"
                style={{ borderColor: BP.border, boxShadow: "0 4px 16px rgba(14,26,46,0.04)" }}
              >
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-xs font-extrabold text-white shrink-0"
                  style={{ background: avatarColor(handle) }}
                >
                  {initialsFromHandle(handle)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold truncate" style={{ color: BP.text }}>
                    {handle}
                  </p>
                  <p className="text-[12px]" style={{ color: BP.muted }}>
                    Partenaire · Blaffa Pay
                  </p>
                </div>
                <span style={{ color: BP.muted }}>›</span>
              </button>
            )
          })}
          {!isSearching && partners.length === 0 && (
            <div className="py-10 text-center text-sm rounded-[18px] border bg-white" style={{ color: BP.muted, borderColor: BP.border }}>
              Aucun partenaire trouvé
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
