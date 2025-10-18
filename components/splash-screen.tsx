"use client"

import { useEffect, useState } from "react"
import { Shield, Loader2 } from "lucide-react"
import { useLanguage } from "@/lib/contexts"

interface SplashScreenProps {
  onComplete: () => void
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [progress, setProgress] = useState(0)
  const { t, isHydrated } = useLanguage()

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer)
          setTimeout(onComplete, 500)
          return 100
        }
        return prev + 2
      })
    }, 50)

    return () => clearInterval(timer)
  }, [onComplete])

  const getLoadingMessage = () => {
    // Use default text during hydration to prevent mismatch
    if (!isHydrated) {
      if (progress < 30) return "Chargement..."
      if (progress >= 30 && progress < 60) return "Chargement du portefeuille..."
      if (progress >= 60 && progress < 90) return "Sécurisation de la connexion..."
      if (progress >= 90) return "Presque prêt..."
      return "Chargement..."
    }
    
    if (progress < 30) return t("loading")
    if (progress >= 30 && progress < 60) return t("splash.loadingWallet")
    if (progress >= 60 && progress < 90) return t("splash.securingConnection")
    if (progress >= 90) return t("splash.almostReady")
    return t("loading")
  }

  useEffect(() => {
    document.body.style.background = "linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)"
    document.body.style.minHeight = "100vh"

    return () => {
      document.body.style.background = ""
      document.body.style.minHeight = ""
    }
  }, [])

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-8"
      style={{
        background: "linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)",
        minHeight: "100vh",
      }}
    >
      {/* Modern Logo */}
      <div className="text-center mb-16">
        <div className="mb-8">
          <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-4 mb-6">
            <img src="/logo.png" alt="BlaffaPay Logo" className="w-20 h-20 object-contain mx-auto" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-white mb-2">
          BlaffaPay
        </h1>
        <p className="text-white/80 text-sm">
          Digital Wallet Platform
        </p>
      </div>

      {/* Modern Progress */}
      <div className="w-full max-w-sm">
        <div className="bg-white/20 backdrop-blur-sm rounded-full h-2 mb-6">
          <div 
            className="bg-white rounded-full h-2 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="text-center">
          <p className="text-white text-sm font-medium mb-2">
            {getLoadingMessage()}
          </p>
          <p className="text-white/60 text-xs">
            {progress}%
          </p>
        </div>
      </div>
    </div>
  )
}
