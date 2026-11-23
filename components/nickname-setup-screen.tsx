"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import { useAuth, useTheme } from "@/lib/contexts"
import { BP, normalizeNickname, setStoredNickname , pageBg, cardBg, textPrimary } from "@/lib/design"

interface NicknameSetupScreenProps {
  onComplete: () => void
}

/** PDF p.3 — 1ʳᵉ connexion surnom */
export function NicknameSetupScreen({ onComplete }: NicknameSetupScreenProps) {
  const { user } = useAuth()
  const [value, setValue] = useState("")
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  const handleContinue = async () => {
    const nick = normalizeNickname(value)
    if (!nick || nick.length < 3) {
      setError("Choisis un surnom d’au moins 2 caractères (ex. @le_boss)")
      return
    }
    setSaving(true)
    setError("")
    try {
      setStoredNickname(nick, user?.uid)
      onComplete()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col px-4" style={{ background: pageBg(false) }}>
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full pt-20 pb-8">
        <div className="flex flex-col items-center text-center mb-10">
          <div
            className="w-[56px] h-[56px] rounded-[16px] flex items-center justify-center mb-5 shadow-md"
            style={{ background: BP.logoBlue }}
          >
            <span className="text-white text-[26px] font-extrabold leading-none">B</span>
          </div>
          <h1 className="text-[22px] font-extrabold tracking-tight" style={{ color: BP.text }}>
            Bienvenue sur Blaffa Pay
          </h1>
          <p className="mt-2 text-[14px]" style={{ color: BP.muted }}>
            Choisis ton surnom pour commencer
          </p>
        </div>

        <div className="space-y-2 flex-1">
          <Input
            type="text"
            placeholder="@ton_surnom"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="h-14 text-base rounded-[14px] font-semibold bg-white border-2 focus-visible:ring-0"
            style={{ borderColor: BP.green, color: BP.text }}
            autoCapitalize="none"
            autoCorrect="off"
          />
          <p className="text-[12px] leading-relaxed px-0.5" style={{ color: BP.muted }}>
            C&apos;est avec ce surnom qu&apos;on te trouvera pour les transferts. Ton vrai nom reste caché.
          </p>
          {error && (
            <p className="text-sm font-medium" style={{ color: BP.red }}>
              {error}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={handleContinue}
          disabled={saving}
          className="w-full h-[52px] rounded-[16px] font-bold text-white flex items-center justify-center gap-2 disabled:opacity-60"
          style={{ background: BP.green }}
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
          Continuer ➤
        </button>
      </div>
    </div>
  )
}
