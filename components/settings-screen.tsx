"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Switch } from "@/components/ui/switch"
import {
  ArrowLeft,
  User,
  LogOut,
  ChevronRight,
  Languages,
  Sun,
  Moon,
  Tag,
} from "lucide-react"
import { useTranslation, useTheme, useAuth } from "@/lib/contexts"
import {
  BP,
  getStoredNickname,
  toPublicHandle,
  pageBg,
} from "@/lib/design"

interface SettingsScreenProps {
  onNavigateBack: () => void
  onNavigateToProfile: () => void
  onLogout: () => void
}

/** PDF p.20 — Paramètres + surnom */
export function SettingsScreen({ onNavigateBack, onNavigateToProfile, onLogout }: SettingsScreenProps) {
  const { language, setLanguage, t } = useTranslation()
  const { theme, setTheme } = useTheme()
  const { user } = useAuth()

  const [nickname, setNickname] = useState("")

  useEffect(() => {
    const stored = getStoredNickname(user?.uid)
    if (stored) setNickname(stored)
    else if (user?.display_name) setNickname(toPublicHandle(user.display_name))
    else setNickname("")
  }, [user?.uid, user?.display_name])

  const handleLanguageToggle = () => {
    setLanguage(language === "en" ? "fr" : "en")
  }
  const handleThemeToggle = () => setTheme(theme === "light" ? "dark" : "light")

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
        <div>
          <h1 className="text-[17px] font-extrabold" style={{ color: BP.text }}>
            {t("settings.title")}
          </h1>
          <p className="text-[12px]" style={{ color: BP.muted }}>
            {t("settings.subtitle")}
          </p>
        </div>
      </div>

      <div className="px-4 pb-28 space-y-4">
        <div
          className="p-4 rounded-[18px] border"
          style={{
            background: "rgba(14,159,110,0.08)",
            borderColor: "rgba(14,159,110,0.22)",
          }}
        >
          <p
            className="text-[11px] font-bold uppercase tracking-[0.12em] mb-2.5"
            style={{ color: BP.green }}
          >
            {t("settings.nicknameTitle")}
          </p>
          {/* Surnom figé après création — pas d'édition */}
          <div className="w-full text-left">
            <div
              className="h-12 px-3.5 rounded-[14px] flex items-center justify-between"
              style={{
                background: "#F3F6FB",
                color: BP.text,
                boxShadow: "0 2px 10px rgba(14,26,46,0.04)",
              }}
            >
              <span className="text-[17px] font-extrabold" style={{ color: BP.text }}>
                {nickname || t("settings.nicknamePlaceholder")}
              </span>
              <Tag className="w-4 h-4" style={{ color: BP.muted }} />
            </div>
            <p className="text-[12px] mt-2.5 leading-relaxed" style={{ color: BP.muted }}>
              {t("settings.nicknameLockedHint")}
            </p>
          </div>
        </div>

        <div
          className="overflow-hidden rounded-[18px] border bg-white"
          style={{ borderColor: BP.border, boxShadow: "0 4px 16px rgba(14,26,46,0.04)" }}
        >
          <div className="px-4 py-3 border-b" style={{ borderColor: BP.border }}>
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: BP.muted }}>
              {t("settings.account.title")}
            </p>
            <p className="text-[11px]" style={{ color: BP.muted }}>
              {t("settings.account.subtitle")}
            </p>
          </div>
          <SettingsItem
            icon={<User className="w-5 h-5" />}
            title={t("settings.account.profile")}
            subtitle={t("settings.account.profileSubtitle")}
            showChevron
            onClick={onNavigateToProfile}
          />
        </div>

        <div
          className="overflow-hidden rounded-[18px] border bg-white"
          style={{ borderColor: BP.border, boxShadow: "0 4px 16px rgba(14,26,46,0.04)" }}
        >
          <div className="px-4 py-3 border-b" style={{ borderColor: BP.border }}>
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: BP.muted }}>
              {t("settings.preferences.title")}
            </p>
            <p className="text-[11px]" style={{ color: BP.muted }}>
              {t("settings.preferences.subtitle")}
            </p>
          </div>
          <SettingsItem
            icon={<Languages className="w-5 h-5" />}
            title={t("settings.account.language")}
            subtitle={language === "en" ? t("english") : t("french")}
            showButton
            buttonText={language === "en" ? "EN" : "FR"}
            onClick={handleLanguageToggle}
            onButtonClick={handleLanguageToggle}
          />
          <SettingsItem
            icon={theme === "dark" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            title={t("settings.account.theme")}
            subtitle={theme === "light" ? t("settings.account.lightTheme") : t("settings.account.darkTheme")}
            showToggle
            toggleValue={theme === "dark"}
            onToggleChange={handleThemeToggle}
          />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4" style={{ background: pageBg(false) }}>
        <button
          onClick={onLogout}
          className="w-full h-[52px] rounded-[16px] font-bold text-white flex items-center justify-center gap-2"
          style={{ background: BP.red }}
        >
          <LogOut className="w-4 h-4" />
          {t("settings.logout")}
        </button>
      </div>
    </div>
  )
}

interface SettingsItemProps {
  icon: React.ReactNode
  title: string
  subtitle: string
  showChevron?: boolean
  showToggle?: boolean
  toggleValue?: boolean
  showButton?: boolean
  buttonText?: string
  onButtonClick?: () => void
  onToggleChange?: () => void
  onClick?: () => void
}

function SettingsItem({
  icon,
  title,
  subtitle,
  showChevron,
  showToggle,
  toggleValue,
  showButton,
  buttonText,
  onButtonClick,
  onToggleChange,
  onClick,
}: SettingsItemProps) {
  return (
    <div
      className={`flex items-center justify-between p-4 ${onClick ? "cursor-pointer active:bg-black/5" : ""}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
    >
      <div className="flex items-center gap-3 flex-1">
        <div
          className="p-2 rounded-xl"
          style={{ background: "rgba(14,159,110,0.12)", color: BP.green }}
        >
          {icon}
        </div>
        <div>
          <p className="font-bold text-sm" style={{ color: BP.text }}>
            {title}
          </p>
          <p className="text-xs mt-0.5" style={{ color: BP.muted }}>
            {subtitle}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {showToggle && (
          <Switch
            checked={toggleValue}
            onCheckedChange={() => onToggleChange?.()}
            className="data-[state=checked]:bg-[#0E9F6E]"
          />
        )}
        {showButton && (
          <button
            type="button"
            className="h-8 px-3 text-xs font-bold rounded-full"
            style={{ background: "rgba(14,159,110,0.12)", color: BP.green }}
            onClick={(e) => {
              e.stopPropagation()
              onButtonClick?.()
            }}
          >
            {buttonText}
          </button>
        )}
        {showChevron && <ChevronRight className="w-5 h-5" style={{ color: BP.muted }} />}
      </div>
    </div>
  )
}
