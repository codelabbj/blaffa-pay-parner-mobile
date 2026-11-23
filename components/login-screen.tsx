"use client"

import type React from "react"
import { useState } from "react"
import { ErrorAlertLight } from "@/components/ui/error-alert"
import { Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react"
import { useAuth, useTheme } from "@/lib/contexts"
import { BP, pageBg, cardBg, textPrimary } from "@/lib/design"

interface LoginScreenProps {
  onLogin: () => void
}

/** PDF p.2 — Connexion (e-mail) */
export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [mode, setMode] = useState<"login" | "forgot-password" | "reset-password">("login")
  const { login, requestPasswordReset, confirmPasswordReset, isLoading } = useAuth()
  const { theme } = useTheme()
  const isDark = theme === "dark"

  const fieldCardStyle = {
    background: cardBg(isDark),
    borderColor: isDark ? "#243147" : BP.border,
    boxShadow: isDark ? "none" : "0 8px 24px rgba(14, 26, 46, 0.06)",
  }

  const inputClass =
    "w-full h-9 border-0 p-0 outline-none ring-0 shadow-none bg-transparent text-[16px] font-semibold"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    try {
      if (mode === "login") {
        await login(email, password)
        onLogin()
      } else if (mode === "forgot-password") {
        const response = await requestPasswordReset(email)
        setSuccess(response.message || "OTP envoyé avec succès.")
        setMode("reset-password")
      } else {
        const response = await confirmPasswordReset({
          identifier: email,
          code: otp,
          new_password: newPassword,
        })
        setSuccess(response.message || "Mot de passe réinitialisé avec succès.")
        setTimeout(() => {
          setMode("login")
          setSuccess("")
        }, 3000)
      }
    } catch (err: any) {
      setError(err.message || "Connexion impossible. Réessaie.")
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: pageBg(isDark) }}>
      <div className="flex-1 flex flex-col px-4 pt-16 pb-8 max-w-md mx-auto w-full">
        <div className="flex flex-col items-center pt-6 mb-10">
          <div
            className="w-[56px] h-[56px] rounded-[16px] flex items-center justify-center mb-4"
            style={{ background: BP.logoBlue, boxShadow: isDark ? "none" : "0 8px 24px rgba(14, 26, 46, 0.08)" }}
          >
            <span className="text-white text-[26px] font-extrabold leading-none">B</span>
          </div>
          <h1 className="text-[22px] font-extrabold tracking-tight" style={{ color: textPrimary(isDark) }}>
            Blaffa Pay
          </h1>
          <p className="mt-2 text-[14px] text-center" style={{ color: BP.muted }}>
            {mode === "login" && "Connecte-toi à ton espace partenaire"}
            {mode === "forgot-password" && "Récupère l’accès à ton compte"}
            {mode === "reset-password" && "Choisis un nouveau mot de passe"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
          <div className="space-y-3 flex-1">
            <ErrorAlertLight error={error} type="error" title="Erreur" onDismiss={() => setError("")} />
            {success && (
              <div
                className="p-3 rounded-[14px] text-sm font-medium border"
                style={{
                  background: "rgba(14,159,110,0.1)",
                  color: BP.green,
                  borderColor: "rgba(14,159,110,0.25)",
                }}
              >
                {success}
              </div>
            )}

            <div className="rounded-[16px] border px-4 py-3" style={fieldCardStyle}>
              <div className="flex items-center gap-2 mb-1">
                <Mail className="w-4 h-4" style={{ color: BP.blue }} />
                <span className="text-[12px] font-medium" style={{ color: BP.muted }}>
                  Adresse e-mail
                </span>
              </div>
              <input
                type="email"
                placeholder="partenaire@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                style={{ color: textPrimary(isDark) }}
                required
                disabled={isLoading}
                autoComplete="email"
              />
            </div>

            {mode === "login" && (
              <div className="rounded-[16px] border px-4 py-3" style={fieldCardStyle}>
                <div className="flex items-center gap-2 mb-1">
                  <Lock className="w-4 h-4" style={{ color: BP.amber }} />
                  <span className="text-[12px] font-medium" style={{ color: BP.muted }}>
                    Mot de passe
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${inputClass} pr-10`}
                    style={{ color: textPrimary(isDark) }}
                    required
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-1"
                    style={{ color: BP.muted }}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Masquer" : "Afficher"}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            {mode === "reset-password" && (
              <>
                <div className="rounded-[16px] border px-4 py-3" style={fieldCardStyle}>
                  <span className="text-[12px] font-medium block mb-1" style={{ color: BP.muted }}>
                    Code OTP
                  </span>
                  <input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className={inputClass}
                    style={{ color: textPrimary(isDark) }}
                    required
                  />
                </div>
                <div className="rounded-[16px] border px-4 py-3" style={fieldCardStyle}>
                  <span className="text-[12px] font-medium block mb-1" style={{ color: BP.muted }}>
                    Nouveau mot de passe
                  </span>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={inputClass}
                    style={{ color: textPrimary(isDark) }}
                    required
                  />
                </div>
              </>
            )}

            {mode === "login" && (
              <div className="text-right pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode("forgot-password")
                    setError("")
                    setSuccess("")
                  }}
                  className="text-[14px] font-semibold"
                  style={{ color: BP.blue }}
                >
                  Mot de passe oublié ?
                </button>
              </div>
            )}
          </div>

          <div className="pt-8 space-y-3">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-[52px] rounded-[16px] text-[16px] font-bold text-white flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: BP.green }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Patiente…
                </>
              ) : mode === "login" ? (
                "Se connecter"
              ) : mode === "forgot-password" ? (
                "Envoyer le code"
              ) : (
                "Réinitialiser"
              )}
            </button>
            {mode !== "login" && (
              <button
                type="button"
                onClick={() => {
                  setMode("login")
                  setError("")
                  setSuccess("")
                }}
                className="w-full text-sm font-semibold py-2"
                style={{ color: BP.muted }}
              >
                Retour à la connexion
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}