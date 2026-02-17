"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ErrorAlert } from "@/components/ui/error-alert"
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Edit3,
  Lock,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Settings,
  Shield,
  RefreshCw,
  Loader2
} from "lucide-react"
import { useState, useEffect } from "react"
import { useTheme } from "@/lib/contexts"
import { useTranslation } from "@/lib/contexts"
import { useAuth } from "@/lib/contexts"

// BLAFFA-PAY-FIX: New version with consolidated hooks at the top for React safety.
// Line count is significantly reduced from original 1300+ lines.

interface ProfileScreenProps {
  onNavigateBack: () => void
}

export function ProfileScreen({ onNavigateBack }: ProfileScreenProps) {
  // 1. All Hooks MUST be at the top level
  const { theme } = useTheme()
  const { t } = useTranslation()
  const { user, updateProfile, updatePassword, isLoading: isAuthLoading } = useAuth()

  const [activeTab, setActiveTab] = useState("profile")
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Profile form states
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [contactMethod, setContactMethod] = useState("")

  // Password form states
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  })

  // Initialize form from user data
  useEffect(() => {
    if (user) {
      setEmail(user.email || "")
      setPhone(user.phone || "")
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
      const updates: any = {}
      if (firstName !== user.first_name) updates.first_name = firstName
      if (lastName !== user.last_name) updates.last_name = lastName
      if (email !== user.email) updates.email = email
      if (phone !== user.phone) updates.phone = phone
      if (contactMethod !== user.contact_method) updates.contact_method = contactMethod

      if (Object.keys(updates).length === 0) {
        setError(t("additional.noChangesToSave") || "Aucun changement à enregistrer.")
        setIsUpdating(false)
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
      setError(t("additional.newPasswordMustBeAtLeast6Characters") || "Le nouveau mot de passe doit comporter au moins 6 caractères.")
      return
    }

    setIsUpdating(true)
    setError("")
    setSuccess("")

    try {
      await updatePassword({
        old_password: oldPassword,
        new_password: newPassword
      })
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

  const togglePasswordVisibility = (field: 'old' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  // 2. Early Return only AFTER all hooks are declared
  if (isAuthLoading && !user) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === "dark" ? "bg-slate-900" : "bg-blue-50"
        }`}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className={`text-sm ${theme === "dark" ? "text-slate-400" : "text-gray-600"}`}>
            Chargement du profil...
          </p>
        </div>
      </div>
    )
  }

  // 3. Normal Render
  return (
    <div
      className={`min-h-screen relative overflow-hidden ${theme === "dark"
          ? "bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900"
          : "bg-gradient-to-b from-blue-50 via-white to-blue-50"
        }`}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-20 right-4 w-32 h-32 rounded-full opacity-20 ${theme === "dark" ? "bg-blue-500" : "bg-blue-300"
          } blur-2xl animate-pulse`}></div>
        <div className={`absolute bottom-40 left-4 w-40 h-40 rounded-full opacity-20 ${theme === "dark" ? "bg-blue-500" : "bg-blue-300"
          } blur-2xl animate-pulse`} style={{ animationDelay: '1.5s' }}></div>
      </div>

      {/* Header */}
      <div className="relative z-10 px-4 pt-12">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="sm"
            className={`h-11 w-11 p-0 rounded-xl active:scale-95 transition-all duration-200 ${theme === "dark"
                ? "text-gray-300 hover:bg-white/10 active:bg-white/20"
                : "text-gray-600 hover:bg-black/5 active:bg-black/10"
              }`}
            onClick={onNavigateBack}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <div className="text-center flex-1 mx-4">
            <h1 className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              {t("profile.title") || "Profil"}
            </h1>
            <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              {t("profile.subtitle") || "Gérez vos informations personnelles"}
            </p>
          </div>

          <div className={`p-2.5 rounded-xl ${theme === "dark" ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600"
            }`}>
            <Settings className="w-5 h-5" />
          </div>
        </div>

        {/* Profile Tabs */}
        <div className={`p-1 rounded-2xl mb-6 ${theme === "dark" ? "bg-gray-800/60 backdrop-blur-sm" : "bg-white/80 backdrop-blur-sm shadow-sm"
          }`}>
          <div className="grid grid-cols-2 gap-1">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-95 ${activeTab === "profile"
                  ? theme === "dark"
                    ? "bg-blue-500/20 text-blue-400 shadow-sm"
                    : "bg-blue-100 text-blue-700 shadow-sm"
                  : theme === "dark"
                    ? "text-gray-400 hover:text-gray-300"
                    : "text-gray-600 hover:text-gray-800"
                }`}
            >
              <User className="w-4 h-4" />
              <span>{t("profile.tabs.profile") || "Profil"}</span>
            </button>
            <button
              onClick={() => setActiveTab("password")}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-95 ${activeTab === "password"
                  ? theme === "dark"
                    ? "bg-red-500/20 text-red-400 shadow-sm"
                    : "bg-red-100 text-red-700 shadow-sm"
                  : theme === "dark"
                    ? "text-gray-400 hover:text-gray-300"
                    : "text-gray-600 hover:text-gray-800"
                }`}
            >
              <Shield className="w-4 h-4" />
              <span>{t("profile.tabs.password") || "Sécurité"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-4 pb-32 max-h-[calc(100vh-220px)] overflow-y-auto">
        {/* Alerts */}
        <div className="mb-6 space-y-4">
          <ErrorAlert
            error={error}
            type="error"
            title="Erreur"
            onDismiss={() => setError("")}
          />

          {success && (
            <div className={`flex items-center gap-3 p-4 rounded-xl border animate-in slide-in-from-top-2 ${theme === "dark"
                ? "bg-green-900/20 border-green-700/50 backdrop-blur-sm"
                : "bg-green-50 border-green-200/50 backdrop-blur-sm"
              }`}>
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className={`text-sm font-medium ${theme === "dark" ? "text-green-400" : "text-green-600"}`}>
                {success}
              </span>
            </div>
          )}
        </div>

        {activeTab === "profile" ? (
          <div className="space-y-6">
            {/* Form Fields for Profile */}
            <div className={`p-5 rounded-2xl border transition-all duration-300 ${theme === "dark" ? "bg-gray-800/60 border-gray-700/50" : "bg-white border-gray-200 shadow-sm"
              }`}>
              <Label className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-500" />
                {t("profile.fields.email") || "Email"}
              </Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-xl"
              />
            </div>

            <div className={`p-5 rounded-2xl border transition-all duration-300 ${theme === "dark" ? "bg-gray-800/60 border-gray-700/50" : "bg-white border-gray-200 shadow-sm"
              }`}>
              <Label className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Phone className="w-4 h-4 text-green-500" />
                {t("profile.fields.phone") || "Téléphone"}
              </Label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-12 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-2xl border transition-all duration-300 ${theme === "dark" ? "bg-gray-800/60 border-gray-700/50" : "bg-white border-gray-200 shadow-sm"
                }`}>
                <Label className="text-sm font-semibold mb-2 block">Prénom</Label>
                <Input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>
              <div className={`p-4 rounded-2xl border transition-all duration-300 ${theme === "dark" ? "bg-gray-800/60 border-gray-700/50" : "bg-white border-gray-200 shadow-sm"
                }`}>
                <Label className="text-sm font-semibold mb-2 block">Nom</Label>
                <Input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>
            </div>

            <div className={`p-5 rounded-2xl border transition-all duration-300 ${theme === "dark" ? "bg-gray-800/60 border-gray-700/50" : "bg-white border-gray-200 shadow-sm"
              }`}>
              <Label className="text-sm font-semibold mb-4 block">Méthode de contact préférée</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => setContactMethod("email")}
                  className={`h-11 rounded-xl ${contactMethod === "email" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}
                >
                  Email
                </Button>
                <Button
                  onClick={() => setContactMethod("phone")}
                  className={`h-11 rounded-xl ${contactMethod === "phone" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}
                >
                  Téléphone
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Form Fields for Password */}
            <div className={`p-5 rounded-2xl border transition-all duration-300 ${theme === "dark" ? "bg-gray-800/60 border-gray-700/50" : "bg-white border-gray-200 shadow-sm"
              }`}>
              <Label className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Lock className="w-4 h-4 text-yellow-500" />
                Ancien mot de passe
              </Label>
              <div className="relative">
                <Input
                  type={showPasswords.old ? "text" : "password"}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="h-12 rounded-xl pr-12"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('old')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2"
                >
                  {showPasswords.old ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className={`p-5 rounded-2xl border transition-all duration-300 ${theme === "dark" ? "bg-gray-800/60 border-gray-700/50" : "bg-white border-gray-200 shadow-sm"
              }`}>
              <Label className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-500" />
                Nouveau mot de passe
              </Label>
              <div className="relative">
                <Input
                  type={showPasswords.new ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-12 rounded-xl pr-12"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2"
                >
                  {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className={`p-5 rounded-2xl border transition-all duration-300 ${theme === "dark" ? "bg-gray-800/60 border-gray-700/50" : "bg-white border-gray-200 shadow-sm"
              }`}>
              <Label className="text-sm font-semibold mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Confirmer
              </Label>
              <div className="relative">
                <Input
                  type={showPasswords.confirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-12 rounded-xl pr-12"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2"
                >
                  {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 p-4 ${theme === "dark" ? "bg-slate-900 border-t border-gray-800" : "bg-white border-t border-gray-200"
        }`}>
        <Button
          onClick={activeTab === "profile" ? handleUpdateProfile : handleChangePassword}
          disabled={isUpdating}
          className="w-full h-12 rounded-2xl font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
        >
          {isUpdating ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Chargement...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {activeTab === "profile" ? <Edit3 className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
              <span>{activeTab === "profile" ? "Mettre à jour" : "Changer le mot de passe"}</span>
            </div>
          )}
        </Button>
      </div>
    </div>
  )
}