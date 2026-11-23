"use client"

import { useState, useEffect } from "react"
import {
  ArrowLeft,
  Check,
  X,
  ChevronRight,
  Gamepad2,
  Activity,
  Loader2,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { authService } from "@/lib/auth"
import { bettingService, BettingPlatformWithStats, ExternalPlatformData } from "@/lib/betting"
import { BP } from "@/lib/design"

interface BettingPlatformsScreenProps {
  onNavigateBack: () => void
  onNavigateToBettingDeposit: (platformUid: string) => void
  onNavigateToBettingWithdraw: (platformUid: string) => void
  transactionType?: "deposit" | "withdraw"
}

function prettyPlace(value?: string | null) {
  if (!value) return ""
  return value
    .toLowerCase()
    .split(/\s+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ""))
    .join(" ")
}

function platformBadge(name: string): { label: string; bg: string } {
  const n = (name || "").toUpperCase()
  if (n.includes("1X") || n.includes("1XBET")) return { label: "1X", bg: BP.blue }
  if (n.includes("MEL")) return { label: "MEL", bg: BP.navy }
  if (n.includes("888")) return { label: "888", bg: "#1A1A2E" }
  if (n.includes("BETWINNER") || n.includes("BW")) return { label: "BW", bg: "#0B6E4F" }
  const letters = n.replace(/[^A-Z0-9]/g, "").slice(0, 3) || "?"
  return { label: letters, bg: BP.violet }
}

/** PDF p.9 — liste plateformes MobCash */
export function BettingPlatformsScreen({
  onNavigateBack,
  onNavigateToBettingDeposit,
  onNavigateToBettingWithdraw,
  transactionType,
}: BettingPlatformsScreenProps) {
  const { toast } = useToast()
  const cardStyle = {
    background: BP.card,
    borderColor: BP.border,
    boxShadow: "0 8px 24px rgba(14, 26, 46, 0.06)",
  }

  const [isLoading, setIsLoading] = useState(true)
  const [authorizedPlatforms, setAuthorizedPlatforms] = useState<BettingPlatformWithStats[]>([])
  const [unauthorizedPlatforms, setUnauthorizedPlatforms] = useState<BettingPlatformWithStats[]>([])
  const [summary, setSummary] = useState({
    total_platforms: 0,
    authorized_count: 0,
    unauthorized_count: 0,
    platforms_with_transactions: 0,
  })
  const [selectedPlatform, setSelectedPlatform] = useState<BettingPlatformWithStats | null>(null)

  useEffect(() => {
    loadPlatforms()
  }, [])

  const loadPlatforms = async () => {
    setIsLoading(true)
    try {
      const accessToken = authService.getAccessToken()
      if (!accessToken) throw new Error("No access token available")

      const platformsData = await bettingService.getPlatformsWithStats(accessToken)
      setSummary(platformsData.summary)

      let externalData: ExternalPlatformData[] = []
      try {
        externalData = await bettingService.getExternalPlatformData()
      } catch (externalError) {
        console.warn("External platform data failed to load:", externalError)
      }

      const matchPlatform = (platform: BettingPlatformWithStats, extData: ExternalPlatformData[]) => {
        let match = extData.find((ext) => ext.id === platform.external_id)
        if (!match) {
          match = extData.find(
            (ext) =>
              ext.name.toLowerCase() === platform.name.toLowerCase() ||
              ext.public_name?.toLowerCase() === platform.name.toLowerCase()
          )
        }
        return {
          ...platform,
          city: match?.city || platform.city,
          street: match?.street || platform.street,
          external_image: match?.image || platform.external_image,
        }
      }

      setAuthorizedPlatforms(platformsData.authorized_platforms.map((p) => matchPlatform(p, externalData)))
      setUnauthorizedPlatforms(platformsData.unauthorized_platforms.map((p) => matchPlatform(p, externalData)))
    } catch (error) {
      console.error("Load platforms error:", error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de charger les plateformes",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePlatformSelect = (platform: BettingPlatformWithStats) => {
    if (transactionType === "deposit") {
      onNavigateToBettingDeposit(platform.uid)
    } else if (transactionType === "withdraw") {
      onNavigateToBettingWithdraw(platform.uid)
    } else {
      setSelectedPlatform(platform)
    }
  }

  const logoUrl = (platform: BettingPlatformWithStats) => {
    if (platform.external_image) return platform.external_image
    if (platform.logo) {
      return platform.logo.startsWith("http")
        ? platform.logo
        : `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}${platform.logo}`
    }
    return ""
  }

  const title = transactionType
    ? transactionType === "deposit"
      ? "Dépôt — Plateformes"
      : "Retrait — Plateformes"
    : "Plateformes de paris"

  const subtitle = transactionType
    ? "Choisis une plateforme de paris"
    : "Gérer vos plateformes autorisées"

  const renderAvatar = (platform: BettingPlatformWithStats, muted = false) => {
    const url = logoUrl(platform)
    const badge = platformBadge(platform.name)
    if (url) {
      return (
        <div
          className={`w-11 h-11 rounded-[12px] overflow-hidden flex items-center justify-center shrink-0 ${muted ? "grayscale opacity-70" : ""}`}
          style={{ background: BP.bg }}
        >
          <img src={url} alt={platform.name} className="w-11 h-11 object-cover" />
        </div>
      )
    }
    return (
      <div
        className="w-11 h-11 rounded-[12px] flex items-center justify-center shrink-0 text-white text-[11px] font-extrabold tracking-tight"
        style={{ background: muted ? BP.muted : badge.bg }}
      >
        {badge.label}
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-8" style={{ background: BP.bg }}>
      <div className="px-4 pt-12 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <button
            type="button"
            onClick={onNavigateBack}
            className="w-10 h-10 rounded-[12px] flex items-center justify-center border shrink-0 active:scale-95 bg-white"
            style={{ borderColor: BP.border }}
          >
            <ArrowLeft className="w-5 h-5" style={{ color: BP.text }} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-[17px] font-extrabold truncate" style={{ color: BP.text }}>
              {title}
            </h1>
            <p className="text-[12px]" style={{ color: BP.muted }}>
              {subtitle}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bp-card p-3 border rounded-[18px]" style={cardStyle}>
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-[10px] flex items-center justify-center"
                style={{ background: "rgba(14,159,110,0.14)" }}
              >
                <Check className="w-4 h-4" style={{ color: BP.green }} />
              </div>
              <div>
                <p className="text-[11px]" style={{ color: BP.muted }}>
                  Autorisées
                </p>
                <p className="text-lg font-extrabold" style={{ color: BP.text }}>
                  {summary.authorized_count}
                </p>
              </div>
            </div>
          </div>
          <div className="bp-card p-3 border rounded-[18px]" style={cardStyle}>
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-[10px] flex items-center justify-center"
                style={{ background: "rgba(47,107,255,0.12)" }}
              >
                <Activity className="w-4 h-4" style={{ color: BP.blue }} />
              </div>
              <div>
                <p className="text-[11px]" style={{ color: BP.muted }}>
                  Actives
                </p>
                <p className="text-lg font-extrabold" style={{ color: BP.text }}>
                  {summary.platforms_with_transactions || summary.authorized_count}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: BP.blue }} />
          </div>
        ) : (
          <div className="space-y-2">
            {authorizedPlatforms.map((platform) => (
              <button
                key={platform.uid}
                type="button"
                onClick={() => handlePlatformSelect(platform)}
                className="w-full bp-card p-3.5 border rounded-[18px] text-left active:scale-[0.99] transition"
                style={cardStyle}
              >
                <div className="flex items-center gap-3">
                  {renderAvatar(platform)}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-extrabold text-[15px] truncate" style={{ color: BP.text }}>
                      {platform.name}
                    </h3>
                    {[platform.city, platform.street].some(Boolean) && (
                      <p className="text-[12px] truncate" style={{ color: BP.muted }}>
                        {[prettyPlace(platform.city), prettyPlace(platform.street)].filter(Boolean).join(" · ")}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 shrink-0" style={{ color: BP.muted }} />
                </div>
              </button>
            ))}

            {unauthorizedPlatforms.map((platform) => (
              <div
                key={platform.uid}
                className="bp-card p-3.5 border rounded-[18px] opacity-70"
                style={cardStyle}
              >
                <div className="flex items-center gap-3">
                  {renderAvatar(platform, true)}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-extrabold text-[15px] truncate" style={{ color: BP.muted }}>
                      {platform.name}
                    </h3>
                    <p className="text-[12px]" style={{ color: BP.muted }}>
                      Accès non autorisé
                    </p>
                  </div>
                  <X className="w-4 h-4 shrink-0" style={{ color: BP.red }} />
                </div>
              </div>
            ))}

            {authorizedPlatforms.length === 0 && unauthorizedPlatforms.length === 0 && (
              <div className="text-center py-12">
                <Gamepad2 className="w-12 h-12 mx-auto mb-3" style={{ color: BP.muted }} />
                <p className="text-sm font-semibold" style={{ color: BP.muted }}>
                  Aucune plateforme disponible
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {selectedPlatform && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSelectedPlatform(null)} />
          <div
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[90vh] overflow-y-auto rounded-t-[24px] border-t bg-white"
            style={{ borderColor: BP.border }}
          >
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full" style={{ background: BP.border }} />
            </div>
            <div className="flex items-center justify-between px-4 mb-4">
              <h2 className="text-base font-extrabold" style={{ color: BP.text }}>
                {selectedPlatform.name}
              </h2>
              <button
                type="button"
                onClick={() => setSelectedPlatform(null)}
                className="w-8 h-8 rounded-[10px] flex items-center justify-center"
                style={{ background: BP.bg }}
              >
                <X className="w-4 h-4" style={{ color: BP.muted }} />
              </button>
            </div>
            <div className="px-4 pb-8 space-y-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedPlatform(null)
                  onNavigateToBettingDeposit(selectedPlatform.uid)
                }}
                className="w-full h-[52px] rounded-[16px] font-bold text-white"
                style={{ background: BP.green }}
              >
                Déposer
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedPlatform(null)
                  onNavigateToBettingWithdraw(selectedPlatform.uid)
                }}
                className="w-full h-[52px] rounded-[16px] font-bold text-white"
                style={{ background: BP.blue }}
              >
                Retirer
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
