"use client"

import { ArrowLeft, Shield, Lock } from "lucide-react"
import { useTheme } from "@/lib/contexts"
import { BP, pageBg, cardBg, textPrimary } from "@/lib/design"

interface PermissionDeniedScreenProps {
  onNavigateBack: () => void
  message?: string
}

export function PermissionDeniedScreen({
  onNavigateBack,
  message = "Vous n'êtes pas autorisé à accéder à cette fonctionnalité.",
}: PermissionDeniedScreenProps) {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  const cardStyle = {
    background: cardBg(isDark),
    borderColor: isDark ? "#243147" : BP.border,
    boxShadow: isDark ? "none" : "0 8px 24px rgba(14, 26, 46, 0.06)",
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: pageBg(isDark) }}>
      <div className="px-4 pt-12 pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onNavigateBack}
            className="w-10 h-10 rounded-[12px] flex items-center justify-center border shrink-0 active:scale-95"
            style={{ background: cardBg(isDark), borderColor: isDark ? "#243147" : BP.border }}
          >
            <ArrowLeft className="w-5 h-5" style={{ color: textPrimary(isDark) }} />
          </button>
          <h1 className="text-[17px] font-extrabold flex-1 text-center pr-10" style={{ color: textPrimary(isDark) }}>
            Accès refusé
          </h1>
        </div>
      </div>

      <div className="flex-1 px-4 pb-12 flex items-center justify-center">
        <div className="text-center max-w-sm w-full">
          <div
            className="w-20 h-20 rounded-[18px] mx-auto mb-6 flex items-center justify-center"
            style={{ background: "rgba(229, 72, 77, 0.12)" }}
          >
            <Shield className="w-10 h-10" style={{ color: BP.red }} />
          </div>

          <h2 className="text-[22px] font-extrabold mb-3" style={{ color: textPrimary(isDark) }}>
            Accès non autorisé
          </h2>

          <p className="text-[15px] leading-relaxed mb-8" style={{ color: BP.muted }}>
            {message}
          </p>

          <div className="bp-card p-4 border rounded-[18px] text-left mb-8" style={cardStyle}>
            <div className="flex items-center gap-3 mb-2">
              <Lock className="w-5 h-5" style={{ color: BP.blue }} />
              <span className="text-sm font-extrabold" style={{ color: textPrimary(isDark) }}>
                Permissions requises
              </span>
            </div>
            <p className="text-[13px] leading-relaxed" style={{ color: BP.muted }}>
              Contactez votre administrateur pour obtenir les permissions nécessaires à cette fonctionnalité.
            </p>
          </div>

          <button
            type="button"
            onClick={onNavigateBack}
            className="w-full h-[52px] rounded-[16px] text-[16px] font-bold text-white active:scale-[0.99]"
            style={{ background: BP.green }}
          >
            Retour au tableau de bord
          </button>
        </div>
      </div>
    </div>
  )
}