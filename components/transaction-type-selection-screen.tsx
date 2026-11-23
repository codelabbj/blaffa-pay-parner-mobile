"use client"

import { CreditCard, Gamepad2, ArrowLeft, Smartphone, FileSpreadsheet } from "lucide-react"
import { useTheme } from "@/lib/contexts"
import { User } from "@/lib/auth"
import { usePermission } from "@/hooks/use-permission"
import { useToast } from "@/hooks/use-toast"
import { BP, pageBg, cardBg, textPrimary } from "@/lib/design"

interface TransactionTypeSelectionScreenProps {
  transactionType: "deposit" | "withdraw"
  onNavigateBack: () => void
  onSelectMobileMoney: () => void
  onSelectBetting: () => void
  onSelectBulkPayment?: () => void
  user?: User
  showBulkPayment?: boolean
}

export function TransactionTypeSelectionScreen({
  transactionType,
  onNavigateBack,
  onSelectMobileMoney,
  onSelectBetting,
  onSelectBulkPayment,
  user,
  showBulkPayment = false,
}: TransactionTypeSelectionScreenProps) {
  const { theme } = useTheme()
  const { toast } = useToast()
  const isDark = theme === "dark"

  const canMomo = usePermission("can_process_momo")
  const canMobcash = usePermission("can_process_mobcash")
  const canBulk = usePermission("can_process_bulk_payment")

  const isDeposit = transactionType === "deposit"
  const actionText = isDeposit ? "Dépôt" : "Retrait"

  const canProcessUSSDTransaction = user?.can_process_ussd_transaction !== false

  const cardStyle = {
    background: cardBg(isDark),
    borderColor: isDark ? "#243147" : BP.border,
    boxShadow: isDark ? "none" : "0 8px 24px rgba(14, 26, 46, 0.06)",
  }

  const backBtnStyle = {
    background: cardBg(isDark),
    borderColor: isDark ? "#243147" : BP.border,
  }

  const optionCards = [
    {
      key: "momo",
      enabled: canMomo,
      onClick: () => {
        if (!canMomo) {
          toast({
            title: "Accès restreint",
            description: "Les transactions Mobile Money ne sont pas activées sur votre compte.",
            variant: "destructive",
          })
          return
        }
        onSelectMobileMoney()
      },
      icon: Smartphone,
      iconBg: "rgba(47, 107, 255, 0.14)",
      iconColor: BP.blue,
      title: "Mobile Money",
      description: isDeposit
        ? "Effectuez des dépôts via votre compte mobile money"
        : "Retirez vos fonds vers votre compte mobile money",
      badges: [
        { label: "Instantané", color: BP.blue },
        { label: "24/7", color: BP.green },
      ],
    },
    {
      key: "betting",
      enabled: canMobcash,
      onClick: () => {
        if (!canMobcash) {
          toast({
            title: "Accès restreint",
            description: "Les transactions MobCash ne sont pas activées sur votre compte.",
            variant: "destructive",
          })
          return
        }
        onSelectBetting()
      },
      icon: Gamepad2,
      iconBg: "rgba(124, 58, 237, 0.14)",
      iconColor: BP.violet,
      title: "MobCash (Paris Sportifs)",
      description: isDeposit
        ? "Effectuez des dépôts sur vos plateformes de paris autorisées"
        : "Retirez vos gains des plateformes de paris",
      badges: [
        { label: "Plateformes", color: BP.violet },
        { label: "Commissions", color: BP.green },
      ],
    },
  ] as const

  return (
    <div className="min-h-screen flex flex-col pb-8" style={{ background: pageBg(isDark) }}>
      <div className="px-4 pt-12 pb-4">
        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={onNavigateBack}
            className="w-10 h-10 rounded-[12px] flex items-center justify-center border shrink-0 active:scale-95 transition"
            style={backBtnStyle}
          >
            <ArrowLeft className="w-5 h-5" style={{ color: textPrimary(isDark) }} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-[17px] font-extrabold" style={{ color: textPrimary(isDark) }}>
              Type de {actionText.toLowerCase()}
            </h1>
            <p className="text-[12px]" style={{ color: BP.muted }}>
              Sélectionnez votre méthode de transaction
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {optionCards.map((opt) => {
            const Icon = opt.icon
            return (
              <button
                key={opt.key}
                type="button"
                onClick={opt.onClick}
                className={`w-full text-left bp-card p-4 border rounded-[18px] transition active:scale-[0.99] ${
                  !opt.enabled ? "opacity-55" : ""
                }`}
                style={cardStyle}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-14 h-14 rounded-[16px] flex items-center justify-center shrink-0"
                    style={{ background: opt.iconBg }}
                  >
                    <Icon className="w-7 h-7" style={{ color: opt.iconColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[16px] font-extrabold mb-1" style={{ color: textPrimary(isDark) }}>
                      {opt.title}
                    </h3>
                    <p className="text-[13px] leading-snug mb-3" style={{ color: BP.muted }}>
                      {opt.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {opt.badges.map((b) => (
                        <span
                          key={b.label}
                          className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                          style={{ background: `${b.color}1F`, color: b.color }}
                        >
                          {b.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            )
          })}

          {isDeposit && showBulkPayment && (
            <button
              type="button"
              onClick={() => {
                if (!canBulk) {
                  toast({
                    title: "Accès restreint",
                    description: "Le paiement groupé n'est pas activé sur votre compte.",
                    variant: "destructive",
                  })
                  return
                }
                onSelectBulkPayment?.()
              }}
              className={`w-full text-left bp-card p-4 border rounded-[18px] transition active:scale-[0.99] ${
                !canBulk ? "opacity-55" : ""
              }`}
              style={cardStyle}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-14 h-14 rounded-[16px] flex items-center justify-center shrink-0"
                  style={{ background: "rgba(47, 107, 255, 0.14)" }}
                >
                  <FileSpreadsheet className="w-7 h-7" style={{ color: BP.blue }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[16px] font-extrabold mb-1" style={{ color: textPrimary(isDark) }}>
                    Dépôt en Masse
                  </h3>
                  <p className="text-[13px] leading-snug mb-3" style={{ color: BP.muted }}>
                    Plusieurs dépôts via fichier Excel ou saisie manuelle.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span
                      className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                      style={{ background: "rgba(124, 58, 237, 0.12)", color: BP.violet }}
                    >
                      Multi-canal
                    </span>
                    <span
                      className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                      style={{ background: "rgba(47, 107, 255, 0.12)", color: BP.blue }}
                    >
                      Import Excel
                    </span>
                  </div>
                </div>
              </div>
            </button>
          )}

          {!canMomo && !canMobcash && (!isDeposit || !canBulk) && (
            <div className="bp-card p-6 border rounded-[18px] text-center" style={cardStyle}>
              <div
                className="w-14 h-14 rounded-[16px] flex items-center justify-center mx-auto mb-3"
                style={{ background: isDark ? "#1A2436" : "#F4F7FB" }}
              >
                <CreditCard className="w-7 h-7" style={{ color: BP.muted }} />
              </div>
              <h3 className="text-[16px] font-extrabold mb-1" style={{ color: textPrimary(isDark) }}>
                Aucune option disponible
              </h3>
              <p className="text-[13px]" style={{ color: BP.muted }}>
                {!canProcessUSSDTransaction
                  ? "Permissions USSD insuffisantes. Contactez votre administrateur."
                  : "Vous n'avez pas les permissions pour effectuer des transactions."}
              </p>
            </div>
          )}
        </div>

        <div
          className="mt-5 p-4 rounded-[18px] border"
          style={{
            background: cardBg(isDark),
            borderColor: isDark ? "#243147" : BP.border,
          }}
        >
          <div className="flex items-start gap-3">
            <CreditCard className="w-5 h-5 shrink-0 mt-0.5" style={{ color: BP.blue }} />
            <div>
              <h4 className="text-sm font-extrabold mb-1" style={{ color: textPrimary(isDark) }}>
                Information importante
              </h4>
              <p className="text-[12px] leading-relaxed" style={{ color: BP.muted }}>
                {isDeposit
                  ? "Les dépôts MobCash sont liés aux plateformes autorisées. Vérifiez vos identifiants."
                  : "Les retraits MobCash nécessitent les codes générés par les plateformes."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}