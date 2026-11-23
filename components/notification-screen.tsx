"use client"

import { useState, useEffect } from "react"
import {
  ArrowLeft,
  Bell,
  RefreshCw,
  Send,
  ArrowUpRight,
  ArrowDownRight,
  X,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { BP , pageBg, cardBg, textPrimary } from "@/lib/design"

interface NotificationScreenProps {
  onNavigateBack: () => void
}

interface Notification {
  id: string
  type: "transfer" | "deposit" | "withdraw" | "system" | "cancel"
  title: string
  message: string
  timestamp: string
  isRead: boolean
}

/** PDF p.18 — Notifications */
export function NotificationScreen({ onNavigateBack }: NotificationScreenProps) {
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "transfer" | "system">("all")

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    setIsLoading(true)
    try {
      // API notifs pas encore branchée — liste vide pour l’instant
      setNotifications([])
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de charger les notifications",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const diff = Math.floor((Date.now() - new Date(timestamp).getTime()) / 60000)
    if (diff < 1) return "maintenant"
    if (diff < 60) return `${diff} min`
    if (diff < 1440) return `${Math.floor(diff / 60)} h`
    return `${Math.floor(diff / 1440)} j`
  }

  const iconFor = (type: Notification["type"]) => {
    switch (type) {
      case "transfer":
        return { bg: "rgba(124,58,237,0.12)", color: BP.violet, Icon: Send }
      case "deposit":
        return { bg: "rgba(14,159,110,0.12)", color: BP.green, Icon: ArrowUpRight }
      case "withdraw":
        return { bg: "rgba(47,107,255,0.12)", color: BP.blue, Icon: ArrowDownRight }
      case "cancel":
        return { bg: "rgba(229,72,77,0.12)", color: BP.red, Icon: X }
      default:
        return { bg: "rgba(14,26,46,0.08)", color: BP.muted, Icon: Bell }
    }
  }

  const filtered = notifications.filter((n) => {
    if (filter === "transfer") return n.type === "transfer" || n.type === "deposit" || n.type === "withdraw"
    if (filter === "system") return n.type === "system" || n.type === "cancel"
    return true
  })

  const tabs = [
    { key: "all" as const, label: "Toutes" },
    { key: "transfer" as const, label: "Transferts" },
    { key: "system" as const, label: "Système" },
  ]

  return (
    <div className="min-h-screen" style={{ background: pageBg(false) }}>
      <div className="px-4 pt-12 pb-4 flex items-center gap-3">
        <button
          onClick={onNavigateBack}
          className="w-10 h-10 rounded-[12px] flex items-center justify-center bg-white border"
          style={{ borderColor: BP.border }}
        >
          <ArrowLeft className="w-5 h-5" style={{ color: BP.text }} />
        </button>
        <h1 className="text-[17px] font-extrabold flex-1" style={{ color: BP.text }}>
          Notifications
        </h1>
        <button onClick={loadNotifications} className="p-2" style={{ color: BP.muted }}>
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Tabs PDF — pill navy active */}
      <div className="px-4 mb-4">
        <div
          className="flex gap-1 p-1 rounded-full bg-white border"
          style={{ borderColor: BP.border }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilter(tab.key)}
              className="flex-1 h-9 rounded-full text-[13px] font-bold transition"
              style={
                filter === tab.key
                  ? { background: BP.navy, color: "#fff" }
                  : { background: "transparent", color: BP.muted }
              }
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pb-10 space-y-2.5">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <RefreshCw className="w-6 h-6 animate-spin" style={{ color: BP.green }} />
          </div>
        ) : filtered.length > 0 ? (
          filtered.map((n) => {
            const { bg, color, Icon } = iconFor(n.type)
            return (
              <div
                key={n.id}
                className="p-3.5 rounded-[18px] border bg-white flex items-start gap-3"
                style={{
                  borderColor: BP.border,
                  boxShadow: "0 4px 16px rgba(14,26,46,0.04)",
                  opacity: n.isRead ? 0.85 : 1,
                }}
              >
                <div
                  className="w-11 h-11 rounded-[14px] flex items-center justify-center shrink-0"
                  style={{ background: bg, color }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-extrabold text-[14px]" style={{ color: BP.text }}>
                      {n.title}
                    </p>
                    <span className="text-[11px] shrink-0" style={{ color: BP.muted }}>
                      {formatTimestamp(n.timestamp)}
                    </span>
                  </div>
                  <p className="text-[13px] mt-0.5 leading-snug" style={{ color: BP.muted }}>
                    {n.message}
                  </p>
                </div>
              </div>
            )
          })
        ) : (
          <div
            className="py-14 text-center rounded-[18px] border bg-white"
            style={{ borderColor: BP.border }}
          >
            <Bell className="w-8 h-8 mx-auto mb-3" style={{ color: BP.muted }} />
            <p className="font-bold" style={{ color: BP.text }}>
              Aucune notification
            </p>
            <p className="text-sm mt-1" style={{ color: BP.muted }}>
              Les alertes transferts et système apparaîtront ici
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
