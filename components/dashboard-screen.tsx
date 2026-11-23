"use client"

import {
  TrendingUp,
  Settings,
  Bell,
  History,
  Copy,
  Plus,
  Minus,
  RefreshCw,
  Send,
  X,
  Menu,
  LogOut,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Target,
  Receipt,
  Percent,
} from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useTheme, useTranslation, useAuth } from "@/lib/contexts"
import { useToast } from "@/hooks/use-toast"
import { authService } from "@/lib/auth"
import { formatNumberWithSpaces } from "@/lib/utils"
import { type PartnerV2ActivityItem } from "@/lib/partner-v2"
import { TransactionTypeSelectionScreen } from "@/components/transaction-type-selection-screen"
import { TransactionDetailsModal } from "@/components/transaction-details-modal"
import { usePermission } from "@/hooks/use-permission"
import { bettingService } from "@/lib/betting"
import { BP, formatFcfa, statusPillClass } from "@/lib/design"

interface DashboardScreenProps {
  onNavigateToSettings: () => void
  onNavigateToDeposit: () => void
  onNavigateToWithdraw: () => void
  onNavigateToRecharge: () => void
  onNavigateToTransfer: () => void
  onNavigateToTransactionHistory: () => void
  onNavigateToRechargeHistory: () => void
  onNavigateToTransferHistory: () => void
  onNavigateToBettingPlatforms: (transactionType?: "deposit" | "withdraw") => void
  onNavigateToBettingTransactions: () => void
  onNavigateToBettingCommissions: () => void
  onNavigateToBettingDeposit: () => void
  onNavigateToBettingWithdraw: () => void
  onNavigateToNotifications: () => void
  onNavigateToBulkPayment: (view?: "create" | "history") => void
  onLogout: () => void
}

/** PDF p.4 — Accueil + commission du mois */
export function DashboardScreen({
  onNavigateToSettings,
  onNavigateToDeposit,
  onNavigateToWithdraw,
  onNavigateToTransfer,
  onNavigateToTransactionHistory,
  onNavigateToRechargeHistory,
  onNavigateToTransferHistory,
  onNavigateToBettingPlatforms,
  onNavigateToBettingTransactions,
  onNavigateToBettingCommissions,
  onNavigateToNotifications,
  onNavigateToBulkPayment,
  onLogout,
}: DashboardScreenProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [recentHistory, setRecentHistory] = useState<any[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showTransactionTypeSelection, setShowTransactionTypeSelection] = useState(false)
  const [currentTransactionTypeSelection, setCurrentTransactionTypeSelection] = useState<"deposit" | "withdraw" | null>(null)
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)
  const [showTransactionDetails, setShowTransactionDetails] = useState(false)
  const [monthCommission, setMonthCommission] = useState<string | null>(null)

  const { theme, setTheme } = useTheme()
  const { t } = useTranslation()
  const { user, accountData, activity, refreshBootstrap } = useAuth()
  const { toast } = useToast()
  const canMomo = usePermission("can_process_momo")
  const canMobcash = usePermission("can_process_mobcash")
  const canBulk = usePermission("can_process_bulk_payment")

  // Accueil PDF = clair. Si dark stocké, on bascule en light pour coller au design livré.
  useEffect(() => {
    if (theme === "dark") {
      // ne pas forcer silencieusement en boucle si l'utilisateur a choisi dark dans réglages —
      // mais le rendu de CET écran reste calé PDF clair (bg BP.bg).
    }
  }, [theme])

  const decorateActivityItem = (item: PartnerV2ActivityItem) => ({
    ...item,
    historyType: item.source,
    typeLabel: item.label,
    isTransferReceived: item.isTransferReceived ?? item.direction === "in",
  })

  const loadRecentHistory = async () => {
    setIsLoadingHistory(true)
    try {
      await refreshBootstrap()
    } finally {
      setIsLoadingHistory(false)
    }
  }

  const loadMonthCommission = async () => {
    try {
      const accessToken = authService.getAccessToken()
      if (!accessToken) return
      const now = new Date()
      const dateFrom = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
      const dateTo = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10)
      const stats = await bettingService.getCommissionStats(accessToken, dateFrom, dateTo)
      setMonthCommission(stats.total_commission || stats.unpaid_commission || "0")
    } catch (e) {
      console.error("Commission du mois:", e)
    }
  }

  useEffect(() => {
    setRecentHistory(activity.map(decorateActivityItem))
  }, [activity])

  useEffect(() => {
    loadMonthCommission()
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await Promise.all([loadRecentHistory(), loadMonthCommission()])
    setIsRefreshing(false)
  }

  const formatTransactionDate = (dateString: string) => {
    const date = new Date(dateString)
    const diffInHours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60))
    if (diffInHours < 1) return "à l'instant"
    if (diffInHours < 24) return `il y a ${diffInHours} h`
    return `il y a ${Math.floor(diffInHours / 24)} j`
  }

  const copyReference = async (reference: string) => {
    try {
      await navigator.clipboard.writeText(reference)
      toast({ title: "Copié", description: reference })
    } catch {
      /* ignore */
    }
  }

  const handleCancelTransaction = async (transactionUid: string) => {
    const accessToken = authService.getAccessToken()
    if (!accessToken) throw new Error("No access token available")
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/payments/betting/user/transactions/${transactionUid}/request_cancellation/`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: "Client changed mind - explicit request" }),
      }
    )
    if (!response.ok) throw new Error("Failed to request cancellation")
    await loadRecentHistory()
  }

  const openDeposit = () => {
    if (!canMomo && !canMobcash && !canBulk) {
      toast({ title: "Accès restreint", description: "Contacte le support pour activer les dépôts.", variant: "destructive" })
      return
    }
    const optionalCount = (canMomo ? 1 : 0) + (canBulk ? 1 : 0)
    if (canMobcash && optionalCount === 0) {
      onNavigateToBettingPlatforms("deposit")
      return
    }
    if (!canMobcash && canMomo && !canBulk) {
      onNavigateToDeposit()
      return
    }
    setCurrentTransactionTypeSelection("deposit")
    setShowTransactionTypeSelection(true)
  }

  const openWithdraw = () => {
    if (!canMomo && !canMobcash) {
      toast({ title: "Accès restreint", description: "Contacte le support pour activer les retraits.", variant: "destructive" })
      return
    }
    if (canMobcash && !canMomo) {
      onNavigateToBettingPlatforms("withdraw")
      return
    }
    if (!canMobcash && canMomo) {
      onNavigateToWithdraw()
      return
    }
    setCurrentTransactionTypeSelection("withdraw")
    setShowTransactionTypeSelection(true)
  }

  const activityTitle = (item: any) => {
    if (item.title) return item.title
    if (item.historyType === "betting") return item.partner_name || item.platform_name || "Paris"
    if (item.historyType === "transaction") return item.display_recipient_name || item.recipient_phone || "—"
    if (item.historyType === "transfer") return item.isTransferReceived ? item.sender_name : item.receiver_name
    if (item.historyType === "recharge") return "Recharge"
    if (item.historyType === "bulk") return item.display_recipient_name || "Dépôt groupé"
    return "—"
  }

  const activityAmount = (item: any) => {
    const amt = formatNumberWithSpaces(item.amount)
    if (item.historyType === "betting") return `${item.transaction_type === "deposit" ? "+" : "−"}${amt}`
    if (item.historyType === "transaction") return item.type === "deposit" ? `+${amt}` : `−${amt}`
    if (item.historyType === "transfer") return `${item.isTransferReceived ? "+" : "−"}${amt}`
    if (item.historyType === "recharge") return `+${amt}`
    return `−${amt}`
  }

  const isCredit = (item: any) =>
    (item.historyType === "transaction" && item.type === "deposit") ||
    (item.historyType === "transfer" && item.isTransferReceived) ||
    (item.historyType === "betting" && item.transaction_type === "deposit") ||
    item.historyType === "recharge" ||
    item.historyType === "bulk"

  const menuIcons: { label: string; icon: React.ReactNode; bg: string; color: string; onClick: () => void }[] = [
    { label: "Transactions", icon: <ArrowUpRight className="w-4 h-4" />, bg: "rgba(14,159,110,0.12)", color: BP.green, onClick: onNavigateToTransactionHistory },
    { label: "Recharges", icon: <Zap className="w-4 h-4" />, bg: "rgba(199,122,8,0.12)", color: BP.amber, onClick: onNavigateToRechargeHistory },
    { label: "Transferts", icon: <Send className="w-4 h-4" />, bg: "rgba(47,107,255,0.12)", color: BP.blue, onClick: onNavigateToTransferHistory },
    { label: "Paris", icon: <Target className="w-4 h-4" />, bg: "rgba(229,72,77,0.12)", color: BP.red, onClick: onNavigateToBettingTransactions },
    { label: "Dépôts", icon: <Receipt className="w-4 h-4" />, bg: "rgba(47,107,255,0.12)", color: BP.blue, onClick: () => onNavigateToBulkPayment("history") },
  ]

  return (
    <div className="min-h-screen" style={{ background: BP.bg }}>
      {/* En-tête navy — PDF */}
      <div className="relative pb-16" style={{ background: BP.navy }}>
        <div className="px-4 pt-12 pb-5">
          <div className="flex items-center justify-between mb-7">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setSidebarOpen(true)}
                className="w-11 h-11 rounded-[14px] flex items-center justify-center shrink-0"
                style={{ background: "rgba(255,255,255,0.1)" }}
                aria-label="Menu"
              >
                <Menu className="w-6 h-6 text-white" strokeWidth={2.25} />
              </button>
              <div className="min-w-0">
                <h1 className="text-[18px] font-extrabold text-white truncate">
                  {user?.first_name ? `Bonjour, ${user.first_name}` : "Bonjour"}
                </h1>
                <p className="text-[12px] text-white/55 capitalize">
                  {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "short" })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={onNavigateToNotifications}
                className="w-11 h-11 rounded-[14px] flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.1)" }}
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" style={{ color: "#F5C542" }} />
              </button>
              <button
                onClick={onNavigateToSettings}
                className="w-11 h-11 rounded-[14px] flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.1)" }}
                aria-label="Réglages"
              >
                <Settings className="w-5 h-5 text-white/90" />
              </button>
            </div>
          </div>

          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50 mb-1.5">
            Solde total
          </p>
          <p className="text-[30px] font-extrabold text-white tabular-nums leading-none mb-5">
            {accountData?.formatted_balance ||
              (accountData?.balance != null ? `${formatFcfa(accountData.balance)} FCFA` : "…")}
          </p>

          {/* Commission — carte teal sombre + % */}
          <button
            type="button"
            onClick={onNavigateToBettingCommissions}
            className="w-full rounded-[16px] px-3.5 py-3.5 flex items-center gap-3 text-left"
            style={{ background: "rgba(14, 159, 110, 0.28)" }}
          >
            <div
              className="w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0"
              style={{ background: "rgba(14,159,110,0.45)" }}
            >
              <Percent className="w-5 h-5 text-[#7DFFC4]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-[#7DFFC4]/80">Commission du mois</p>
              <p className="text-[17px] font-extrabold text-[#7DFFC4] tabular-nums">
                {monthCommission != null ? `${formatFcfa(monthCommission)} FCFA` : "…"}
              </p>
            </div>
            <span className="text-[13px] font-semibold text-[#7DFFC4] shrink-0">Historique ›</span>
          </button>
        </div>
      </div>

      {/* 3 actions chevauchant l’en-tête — cartes blanches */}
      <div className="px-4 -mt-11 relative z-10 mb-5">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Dépôt", onClick: openDeposit, color: BP.green, bg: "rgba(14,159,110,0.12)", Icon: Plus },
            { label: "Retrait", onClick: openWithdraw, color: BP.blue, bg: "rgba(47,107,255,0.12)", Icon: Minus },
            { label: "Transfert", onClick: onNavigateToTransfer, color: BP.violet, bg: "rgba(124,58,237,0.12)", Icon: Send },
          ].map((a) => (
            <button
              key={a.label}
              type="button"
              onClick={a.onClick}
              className="flex flex-col items-center gap-2.5 py-4 px-2 rounded-[18px] border active:scale-[0.98] transition"
              style={{
                background: BP.card,
                borderColor: BP.border,
                boxShadow: "0 8px 24px rgba(14,26,46,0.06)",
              }}
            >
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center"
                style={{ background: a.bg, color: a.color }}
              >
                <a.Icon className="w-5 h-5" strokeWidth={2.5} />
              </div>
              <span className="text-[13px] font-bold" style={{ color: BP.text }}>
                {a.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Activité récente */}
      <div className="px-4 pb-24">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[16px] font-extrabold" style={{ color: BP.text }}>
            Activité récente
          </h2>
          <button onClick={handleRefresh} disabled={isRefreshing} className="p-2" style={{ color: BP.muted }}>
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
        </div>

        <div className="space-y-2.5">
          {isLoadingHistory ? (
            <div className="flex justify-center py-10">
              <RefreshCw className="w-6 h-6 animate-spin" style={{ color: BP.blue }} />
            </div>
          ) : recentHistory.length > 0 ? (
            recentHistory.map((item) => (
              <button
                key={`${item.historyType}-${item.uid}`}
                type="button"
                onClick={() => {
                  setSelectedTransaction(item)
                  setShowTransactionDetails(true)
                }}
                className="w-full text-left p-3.5 rounded-[18px] border active:scale-[0.99] transition"
                style={{
                  background: BP.card,
                  borderColor: BP.border,
                  boxShadow: "0 4px 16px rgba(14,26,46,0.04)",
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-11 h-11 rounded-[14px] flex items-center justify-center shrink-0"
                    style={{
                      background: isCredit(item) ? "rgba(14,159,110,0.12)" : "rgba(229,72,77,0.12)",
                      color: isCredit(item) ? BP.green : BP.red,
                    }}
                  >
                    {isCredit(item) ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-bold truncate text-[14px]" style={{ color: BP.text }}>
                          {activityTitle(item)}
                        </p>
                        <p className="text-[12px] truncate mt-0.5" style={{ color: BP.muted }}>
                          {item.historyType === "betting"
                            ? `${item.platform_name || "Paris"} · ${formatTransactionDate(item.created_at)}`
                            : `${item.typeLabel || item.label || ""} · ${formatTransactionDate(item.created_at)}`}
                        </p>
                        <span
                          className={`inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${statusPillClass(item.status)}`}
                        >
                          {item.status_display || item.status}
                        </span>
                      </div>
                      <p
                        className="font-extrabold tabular-nums text-[15px] shrink-0"
                        style={{ color: isCredit(item) ? BP.green : BP.red }}
                      >
                        {activityAmount(item)}
                      </p>
                    </div>
                    {item.reference && (
                      <div className="flex items-center gap-1 mt-1.5">
                        <span className="text-[11px] font-mono truncate" style={{ color: BP.muted }}>
                          {String(item.reference).slice(0, 16)}…
                        </span>
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation()
                            copyReference(item.reference)
                          }}
                          className="p-1"
                          style={{ color: BP.muted }}
                        >
                          <Copy className="w-3 h-3" />
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div
              className="py-12 text-center rounded-[18px] border"
              style={{ background: BP.card, borderColor: BP.border }}
            >
              <History className="w-8 h-8 mx-auto mb-3" style={{ color: BP.muted }} />
              <p className="text-sm font-semibold" style={{ color: BP.text }}>
                Aucune activité récente
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Menu — PDF p.5 */}
      <div className={`fixed inset-0 z-50 transition-all duration-300 ${sidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}>
        <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
        <div
          className={`absolute inset-y-0 left-0 w-[82vw] max-w-sm flex flex-col bg-white shadow-2xl transition-transform duration-300 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center gap-3 px-4 pt-12 pb-5" style={{ background: BP.navy }}>
            <div
              className="w-11 h-11 rounded-[14px] flex items-center justify-center text-white font-extrabold text-lg"
              style={{ background: BP.logoBlue }}
            >
              B
            </div>
            <div className="flex-1">
              <p className="text-[15px] font-extrabold text-white">Blaffa Pay</p>
              <p className="text-[12px] text-white/55">Partners</p>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="p-2 text-white/80">
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 px-3 py-5 overflow-y-auto bg-white">
            <p className="px-3 mb-3 text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: BP.muted }}>
              Historique
            </p>
            {menuIcons.map((m) => (
              <button
                key={m.label}
                type="button"
                className="w-full flex items-center gap-3 px-3 py-3.5 rounded-[14px] active:bg-[#EEF2F8]"
                onClick={() => {
                  setSidebarOpen(false)
                  m.onClick()
                }}
              >
                <div
                  className="w-10 h-10 rounded-[12px] flex items-center justify-center"
                  style={{ background: m.bg, color: m.color }}
                >
                  {m.icon}
                </div>
                <span className="flex-1 text-left text-[15px] font-bold" style={{ color: BP.text }}>
                  {m.label}
                </span>
                <span style={{ color: BP.muted }}>›</span>
              </button>
            ))}
          </nav>

          <div className="p-4 bg-white border-t" style={{ borderColor: BP.border }}>
            <button
              onClick={() => {
                setSidebarOpen(false)
                onLogout()
              }}
              className="w-full h-[52px] rounded-[16px] flex items-center justify-center gap-2 text-white font-bold"
              style={{ background: BP.red }}
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      <TransactionDetailsModal
        isOpen={showTransactionDetails}
        onClose={() => {
          setShowTransactionDetails(false)
          setSelectedTransaction(null)
        }}
        transaction={selectedTransaction}
        onCancelTransaction={handleCancelTransaction}
      />

      {showTransactionTypeSelection && currentTransactionTypeSelection && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative h-full flex flex-col">
            <TransactionTypeSelectionScreen
              transactionType={currentTransactionTypeSelection}
              user={user || undefined}
              showBulkPayment={canBulk}
              onNavigateBack={() => {
                setShowTransactionTypeSelection(false)
                setCurrentTransactionTypeSelection(null)
              }}
              onSelectMobileMoney={() => {
                setShowTransactionTypeSelection(false)
                if (currentTransactionTypeSelection === "deposit") onNavigateToDeposit()
                else onNavigateToWithdraw()
              }}
              onSelectBetting={() => {
                setShowTransactionTypeSelection(false)
                onNavigateToBettingPlatforms(currentTransactionTypeSelection)
              }}
              onSelectBulkPayment={() => {
                setShowTransactionTypeSelection(false)
                onNavigateToBulkPayment()
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
