"use client"

import {
  ArrowLeft,
  User,
  Mail,
  Edit3,
  Lock,
  CheckCircle,
  Eye,
  EyeOff,
  Shield,
  Loader2,
} from "lucide-react"
import { useState, useEffect } from "react"
import { useTheme, useTranslation, useAuth } from "@/lib/contexts"
import { BP, pageBg, cardBg, textPrimary } from "@/lib/design"
import { PhoneCountryInput } from "@/components/ui/phone-country-input"
import { digitsOnly } from "@/lib/phone-countries"

interface ProfileScreenProps {
  onNavigateBack: () => void
}

/** Profil — email / tél / prénom / nom éditables (le surnom est figé dans Paramètres) */
export function ProfileScreen({ onNavigateBack }: ProfileScreenProps) {
  const { theme } = useTheme()
  const { t } = useTranslation()
  const { user, updateProfile, updatePassword, isLoading: isAuthLoading } = useAuth()
  const isDark = theme === "dark"

  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile")
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [phoneValid, setPhoneValid] = useState(true)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [contactMethod, setContactMethod] = useState("email")

  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPasswords, setShowPasswords] = useState({ old: false, new: false, confirm: false })

  useEffect(() => {
    if (user) {
      setEmail(user.email || "")
      setPhone(user.phone || "")
      setPhoneValid(!user.phone || digitsOnly(user.phone).length >= 8)
      setFirstName(user.first_name || "")
      setLastName(user.last_name || "")
      setContactMethod(user.contact_method || "email")
    }
  }, [user])

  const handleUpdateProfile = async () => {
    if (!user) return
    setIsUpdating(true)
    setError("")
    setSuccess("")
    try {
      const phoneChanged = (phone || "").trim() !== (user.phone || "")
      if (phoneChanged && phone && !phoneValid) {
        setError("Numéro de téléphone invalide pour le pays sélectionné.")
        return
      }
      const updates: Record<string, string> = {}
      if (firstName.trim() !== (user.first_name || "")) updates.first_name = firstName.trim()
      if (lastName.trim() !== (user.last_name || "")) updates.last_name = lastName.trim()
      if (email.trim() !== (user.email || "")) updates.email = email.trim()
      if (phoneChanged) updates.phone = phone.trim()
      if (contactMethod !== (user.contact_method || "email")) updates.contact_method = contactMethod
      if (Object.keys(updates).length === 0) {
        setError(t("additional.noChangesToSave") || "Aucun changement à enregistrer.")
        return
      }
      await updateProfile(updates)
      setSuccess("Profil mis à jour avec succès.")
    } catch (err: any) {
      setError(err.message || "Échec de la mise à jour du profil.")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setError(t("additional.newPasswordsDoNotMatch") || "Les nouveaux mots de passe ne correspondent pas.")
      return
    }
    if (newPassword.length < 6) {
      setError(
        t("additional.newPasswordMustBeAtLeast6Characters") ||
          "Le nouveau mot de passe doit comporter au moins 6 caractères."
      )
      return
    }
    setIsUpdating(true)
    setError("")
    setSuccess("")
    try {
      await updatePassword({ old_password: oldPassword, new_password: newPassword })
      setSuccess("Mot de passe mis à jour avec succès.")
      setOldPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err: any) {
      setError(err.message || "Échec de la mise à jour du mot de passe.")
    } finally {
      setIsUpdating(false)
    }
  }

  const fieldStyle = {
    background: isDark ? "#1A2436" : "#FFFFFF",
    borderColor: isDark ? "#243147" : BP.border,
    color: textPrimary(isDark),
  }

  const cardStyle = {
    background: cardBg(isDark),
    borderColor: isDark ? "#243147" : BP.border,
    boxShadow: isDark ? "none" : "0 4px 16px rgba(14,26,46,0.04)",
  }

  if (isAuthLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: pageBg(isDark) }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: BP.green }} />
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: pageBg(isDark) }}>
      <div className="px-4 pt-12 pb-4 flex items-center gap-3">
        <button
          onClick={onNavigateBack}
          className="w-10 h-10 rounded-[12px] flex items-center justify-center border"
          style={{
            background: cardBg(isDark),
            borderColor: isDark ? "#243147" : BP.border,
          }}
        >
          <ArrowLeft className="w-5 h-5" style={{ color: textPrimary(isDark) }} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-[17px] font-extrabold" style={{ color: textPrimary(isDark) }}>
            {t("profile.title") || "Profil"}
          </h1>
          <p className="text-[12px]" style={{ color: BP.muted }}>
            {t("profile.subtitle") || "Gère tes informations de compte"}
          </p>
        </div>
      </div>

      <div className="px-4 mb-4">
        <div
          className="p-1 rounded-[14px] grid grid-cols-2 gap-1 border"
          style={{
            background: cardBg(isDark),
            borderColor: isDark ? "#243147" : BP.border,
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className="flex items-center justify-center gap-2 h-11 rounded-[12px] text-sm font-bold transition"
            style={
              activeTab === "profile"
                ? { background: "rgba(14,159,110,0.14)", color: BP.green }
                : { background: "transparent", color: BP.muted }
            }
          >
            <User className="w-4 h-4" />
            {t("profile.tabs.profile") || "Profil"}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("password")}
            className="flex items-center justify-center gap-2 h-11 rounded-[12px] text-sm font-bold transition"
            style={
              activeTab === "password"
                ? { background: "rgba(14,159,110,0.14)", color: BP.green }
                : { background: "transparent", color: BP.muted }
            }
          >
            <Shield className="w-4 h-4" />
            {t("profile.tabs.password") || "Mot de passe"}
          </button>
        </div>
      </div>

      <div className="px-4 pb-28 space-y-3">
        {error && (
          <div
            className="p-3 rounded-[14px] text-sm font-semibold"
            style={{ color: BP.red, background: "rgba(229,72,77,0.1)" }}
          >
            {error}
          </div>
        )}
        {success && (
          <div
            className="p-3 rounded-[14px] text-sm font-semibold flex items-center gap-2"
            style={{ color: BP.green, background: "rgba(14,159,110,0.12)" }}
          >
            <CheckCircle className="w-4 h-4 shrink-0" />
            {success}
          </div>
        )}

        {activeTab === "profile" ? (
          <>
            <FieldCard label="Adresse e-mail" icon={<Mail className="w-4 h-4" />} iconColor={BP.muted} style={cardStyle}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 px-3.5 rounded-[14px] border text-[15px] font-semibold outline-none"
                style={fieldStyle}
              />
            </FieldCard>

            <div className="p-4 rounded-[18px] border" style={cardStyle}>
              <p className="text-[12px] font-bold mb-2" style={{ color: BP.muted }}>
                Numéro de téléphone
              </p>
              <PhoneCountryInput
                value={phone}
                onChange={(e164, meta) => {
                  setPhone(e164)
                  setPhoneValid(!meta.national || meta.valid)
                }}
                placeholder="Numéro national"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FieldCard label="Prénom" style={cardStyle}>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full h-12 px-3.5 rounded-[14px] border text-[15px] font-semibold outline-none"
                  style={fieldStyle}
                />
              </FieldCard>
              <FieldCard label="Nom" style={cardStyle}>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full h-12 px-3.5 rounded-[14px] border text-[15px] font-semibold outline-none"
                  style={fieldStyle}
                />
              </FieldCard>
            </div>

            <div className="p-4 rounded-[18px] border" style={cardStyle}>
              <p className="text-[12px] font-bold mb-3" style={{ color: BP.muted }}>
                Méthode de contact préférée
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setContactMethod("email")}
                  className="h-11 rounded-[14px] text-sm font-bold"
                  style={
                    contactMethod === "email"
                      ? { background: BP.green, color: "#fff" }
                      : { background: isDark ? "#1A2436" : BP.bg, color: textPrimary(isDark) }
                  }
                >
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => setContactMethod("phone")}
                  className="h-11 rounded-[14px] text-sm font-bold"
                  style={
                    contactMethod === "phone"
                      ? { background: BP.green, color: "#fff" }
                      : { background: isDark ? "#1A2436" : BP.bg, color: textPrimary(isDark) }
                  }
                >
                  Téléphone
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            {(
              [
                { key: "old" as const, label: "Ancien mot de passe", value: oldPassword, set: setOldPassword },
                { key: "new" as const, label: "Nouveau mot de passe", value: newPassword, set: setNewPassword },
                { key: "confirm" as const, label: "Confirmer", value: confirmPassword, set: setConfirmPassword },
              ] as const
            ).map((f) => (
              <FieldCard
                key={f.key}
                label={f.label}
                icon={<Lock className="w-4 h-4" />}
                iconColor={BP.muted}
                style={cardStyle}
              >
                <div className="relative">
                  <input
                    type={showPasswords[f.key] ? "text" : "password"}
                    value={f.value}
                    onChange={(e) => f.set(e.target.value)}
                    className="w-full h-12 px-3.5 pr-11 rounded-[14px] border text-[15px] font-semibold outline-none"
                    style={fieldStyle}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords((p) => ({ ...p, [f.key]: !p[f.key] }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                    style={{ color: BP.muted }}
                  >
                    {showPasswords[f.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </FieldCard>
            ))}
          </>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4" style={{ background: pageBg(isDark) }}>
        <button
          type="button"
          onClick={activeTab === "profile" ? handleUpdateProfile : handleChangePassword}
          disabled={isUpdating}
          className="w-full h-[52px] rounded-[16px] font-bold text-white flex items-center justify-center gap-2 disabled:opacity-60"
          style={{ background: BP.green }}
        >
          {isUpdating ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : activeTab === "profile" ? (
            <Edit3 className="w-4 h-4" />
          ) : (
            <Lock className="w-4 h-4" />
          )}
          {activeTab === "profile" ? "Mettre à jour" : "Changer le mot de passe"}
        </button>
      </div>
    </div>
  )
}

function FieldCard({
  label,
  icon,
  iconColor,
  style,
  children,
}: {
  label: string
  icon?: React.ReactNode
  iconColor?: string
  style: React.CSSProperties
  children: React.ReactNode
}) {
  return (
    <div className="p-4 rounded-[18px] border" style={style}>
      <p className="text-[12px] font-bold mb-2 flex items-center gap-1.5" style={{ color: BP.muted }}>
        {icon ? <span style={{ color: iconColor || BP.muted }}>{icon}</span> : null}
        {label}
      </p>
      {children}
    </div>
  )
}
