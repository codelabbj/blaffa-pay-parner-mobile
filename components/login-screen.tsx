"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ErrorAlertLight } from "@/components/ui/error-alert"
import { Eye, EyeOff, Shield, Loader2 } from "lucide-react"
import { useTheme } from "@/lib/contexts"
import { useTranslation } from "@/lib/contexts"
import { useAuth } from "@/lib/contexts"

interface LoginScreenProps {
  onLogin: () => void
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const { theme } = useTheme()
  const { t } = useTranslation()
  const { login, isLoading } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    try {
      await login(email, password)
      onLogin()
    } catch (err: any) {
      setError(err.message || t("additional.loginFailedPleaseTryAgain"))
    }
  }

  return (
    <div
      className={`min-h-screen ${
        theme === "dark" ? "bg-slate-900" : "bg-gradient-to-br from-orange-50 via-white to-blue-50"
      }`}
    >
      <div className="min-h-screen flex flex-col">
        {/* Modern Header */}
        <div className={`${
          theme === "dark" ? "bg-slate-800/50 backdrop-blur-sm" : "bg-white/80 backdrop-blur-sm"
        } border-b border-opacity-20 ${
          theme === "dark" ? "border-slate-700" : "border-gray-200"
        } p-8`}>
          <div className="text-center">
            <img src="/logo.png" alt="BlaffaPay Logo" className="h-16 w-16 mx-auto mb-4" />
            <h1 className={`text-3xl font-bold ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}>
              BlaffaPay
            </h1>
            <p className={`text-sm mt-2 ${
              theme === "dark" ? "text-slate-400" : "text-gray-600"
            }`}>
              {t("app.description")}
            </p>
          </div>
        </div>

        {/* Login Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-sm">

            <form onSubmit={handleSubmit} className="space-y-6">
              <ErrorAlertLight
                error={error}
                type="error"
                title={t("additional.loginFailed")}
                onDismiss={() => setError("")}
              />
              
              <div>
                <Input
                  type="email"
                  placeholder={t("login.email")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`h-14 text-base rounded-xl border-2 ${
                    theme === "dark" 
                      ? "border-slate-700 bg-slate-800 text-white placeholder:text-slate-400 focus:border-orange-500" 
                      : "border-gray-200 bg-white text-gray-900 placeholder:text-gray-500 focus:border-orange-500"
                  }`}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder={t("login.password")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`h-14 text-base rounded-xl border-2 pr-14 ${
                    theme === "dark" 
                      ? "border-slate-700 bg-slate-800 text-white placeholder:text-slate-400 focus:border-orange-500" 
                      : "border-gray-200 bg-white text-gray-900 placeholder:text-gray-500 focus:border-orange-500"
                  }`}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg ${
                    theme === "dark" 
                      ? "text-slate-400 hover:text-white hover:bg-slate-700" 
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              <button
                type="submit"
                className={`w-full h-14 text-base font-semibold rounded-xl transition-all duration-200 ${
                  isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : theme === "dark"
                      ? "bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white"
                      : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                }`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t("additional.signingIn")}
                  </div>
                ) : (
                  t("login.signIn")
                )}
              </button>
            </form>

            <div className="text-center">
              <button className={`text-sm font-medium ${
                theme === "dark" 
                  ? "text-orange-400 hover:text-orange-300" 
                  : "text-orange-600 hover:text-orange-700"
              }`}>
                {t("login.forgotPassword")}
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
