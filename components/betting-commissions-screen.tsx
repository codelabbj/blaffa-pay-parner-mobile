"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { authService } from "@/lib/auth"
import {
  bettingService,
  CommissionStats,
  PaymentHistoryResponse,
} from "@/lib/betting"
import { BP, pageBg, formatFcfa } from "@/lib/design"

interface BettingCommissionsScreenProps {
  onNavigateBack: () => void
}

/** PDF p.19 — Commissions : carte du mois + historique des paiements */
export function BettingCommissionsScreen({ onNavigateBack }: BettingCommissionsScreenProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<CommissionStats | null>(null)
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryResponse | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const accessToken = authService.getAccessToken()
      if (!accessToken) throw new Error("No access token available")

      const now = new Date()
      const dateFrom = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
      const dateTo = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10)

      const [statsData, historyData] = await Promise.all([
        bettingService.getCommissionStats(accessToken, dateFrom, dateTo),
        bettingService.getPaymentHistory(accessToken).catch(() => null),
      ])
      setStats(statsData)
      setPaymentHistory(historyData)
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de charger les commissions",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const monthLabel = new Date()
    .toLocaleDateString("fr-FR", { month: "long" })
    .toUpperCase()

  const totalMonth = stats
    ? Number(stats.total_commission || 0) ||
      Number(stats.paid_commission || 0) + Number(stats.unpaid_commission || 0)
    : 0
  const paid = stats ? Number(stats.paid_commission || 0) : 0
  const unpaid = stats ? Number(stats.unpaid_commission || 0) : 0

  const formatPeriod = (payment: { period_start?: string; period_end?: string; created_at: string }) => {
    const fmt = (value?: string) => {
      if (!value) return ""
      const d = new Date(value)
      if (Number.isNaN(d.getTime())) return value
      return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }).replace(".", "")
    }
    if (payment.period_start && payment.period_end) {
      return `Semaine du ${fmt(payment.period_start)}-${fmt(payment.period_end)}`
    }
    const d = new Date(payment.created_at)
    if (Number.isNaN(d.getTime())) return payment.created_at
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })
  }

  return (
    <div className="min-h-screen pb-10" style={{ background: pageBg(false) }}>
      {/* Header PDF : bouton blanc carré + titre (pas de refresh) */}
      <div className="px-4 pt-12 pb-5 flex items-center gap-3">
        <button
          type="button"
          onClick={onNavigateBack}
          className="w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 bg-white border"
          style={{ borderColor: BP.border }}
          aria-label="Retour"
        >
          <ChevronLeft className="w-5 h-5" style={{ color: BP.text }} />
        </button>
        <h1 className="text-[26px] font-extrabold tracking-tight" style={{ color: BP.text }}>
          Commissions
        </h1>
      </div>

      <div className="px-4">
        {/* Carte PDF : 2 sous-cartes translucides Déjà payée / À recevoir */}
        <div
          className="rounded-[24px] px-4 pt-5 pb-4 mb-7 text-white"
          style={{ background: "#0B8F63" }}
        >
          <p className="text-[11px] font-bold tracking-[0.08em] text-white/80 px-1">
            COMMISSION DU MOIS · {monthLabel}
          </p>
          <p className="text-[36px] font-extrabold tabular-nums mt-3 leading-none tracking-tight px-1">
            {isLoading ? "…" : formatFcfa(totalMonth)}{" "}
            <span className="text-[15px] font-bold tracking-normal">FCFA</span>
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div
              className="rounded-[16px] px-3.5 py-3"
              style={{ background: "rgba(255,255,255,0.16)" }}
            >
              <p className="text-[12px] text-white/80">Déjà payée</p>
              <p className="text-[18px] font-extrabold tabular-nums mt-1.5">
                {isLoading ? "…" : `${formatFcfa(paid)} F`}
              </p>
            </div>
            <div
              className="rounded-[16px] px-3.5 py-3"
              style={{ background: "rgba(255,255,255,0.16)" }}
            >
              <p className="text-[12px] text-white/80">À recevoir</p>
              <p className="text-[18px] font-extrabold tabular-nums mt-1.5">
                {isLoading ? "…" : `${formatFcfa(unpaid)} F`}
              </p>
            </div>
          </div>
        </div>

        <p
          className="text-[11px] font-bold tracking-[0.14em] mb-3 px-0.5"
          style={{ color: BP.muted }}
        >
          HISTORIQUE DES PAIEMENTS
        </p>

        {isLoading && !paymentHistory ? (
          <div className="py-12 text-center text-sm" style={{ color: BP.muted }}>
            Chargement…
          </div>
        ) : paymentHistory && paymentHistory.payments.length > 0 ? (
          <div className="space-y-3">
            {paymentHistory.payments.map((payment) => (
              <div
                key={payment.uid}
                className="flex items-center gap-3 p-4 rounded-[18px] border bg-white"
                style={{
                  borderColor: BP.border,
                  boxShadow: "0 4px 16px rgba(14,26,46,0.04)",
                }}
              >
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: "rgba(14,159,110,0.12)" }}
                >
                  <CheckCircle className="w-5 h-5" style={{ color: BP.green }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-extrabold" style={{ color: BP.text }}>
                    Commission payée
                  </p>
                  <p className="text-[12px] mt-0.5 truncate" style={{ color: BP.muted }}>
                    {formatPeriod(payment)}
                  </p>
                </div>
                <p className="text-[16px] font-extrabold tabular-nums shrink-0" style={{ color: BP.green }}>
                  +{formatFcfa(payment.total_amount)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="rounded-[18px] border bg-white p-8 text-center"
            style={{ borderColor: BP.border }}
          >
            <p className="text-sm font-semibold" style={{ color: BP.muted }}>
              Aucun paiement enregistré pour le moment
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
