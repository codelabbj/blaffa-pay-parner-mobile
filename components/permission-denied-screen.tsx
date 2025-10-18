"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Shield, Lock } from "lucide-react"
import { useTheme } from "@/lib/contexts"

interface PermissionDeniedScreenProps {
  onNavigateBack: () => void
  message?: string
}

export function PermissionDeniedScreen({ 
  onNavigateBack, 
  message = "Vous n'êtes pas autorisé à accéder à cette fonctionnalité." 
}: PermissionDeniedScreenProps) {
  const { theme } = useTheme()

  return (
    <div 
      className={`min-h-screen relative overflow-hidden ${
        theme === "dark"
        ? "bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900"
        : "bg-gradient-to-b from-orange-50 via-white to-blue-50"
      }`}
    >
      {/* Mobile-optimized background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-20 right-4 w-32 h-32 rounded-full opacity-20 ${
          theme === "dark" ? "bg-red-500" : "bg-red-300"
        } blur-2xl animate-pulse`}></div>
        <div className={`absolute bottom-40 left-4 w-40 h-40 rounded-full opacity-20 ${
          theme === "dark" ? "bg-orange-500" : "bg-orange-300"
        } blur-2xl animate-pulse`} style={{animationDelay: '1.5s'}}></div>
      </div>

      {/* Mobile-first header with safe area */}
      <div className="relative z-10 px-4 pt-safe-area-inset-top pt-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            size="sm"
            className={`h-10 w-10 sm:h-11 sm:w-11 p-0 rounded-xl active:scale-95 transition-all duration-200 ${
              theme === "dark" 
                ? "text-gray-300 hover:bg-white/10 active:bg-white/20" 
                : "text-gray-600 hover:bg-black/5 active:bg-black/10"
            }`}
            onClick={onNavigateBack}
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
          
          <div className="text-center flex-1 mx-3 sm:mx-4">
            <h1 className={`text-lg sm:text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              Accès Refusé
            </h1>
          </div>
          
          <div className="w-10 sm:w-11"></div> {/* Spacer for centering */}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 px-4 pb-24 flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-sm mx-auto">
          {/* Icon */}
          <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-3xl mx-auto mb-6 flex items-center justify-center ${
            theme === "dark" ? "bg-red-500/20" : "bg-red-100"
          }`}>
            <Shield className={`w-10 h-10 sm:w-12 sm:h-12 ${theme === "dark" ? "text-red-400" : "text-red-600"}`} />
          </div>

          {/* Title */}
          <h2 className={`text-xl sm:text-2xl font-bold mb-4 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            Accès Non Autorisé
          </h2>

          {/* Message */}
          <p className={`text-sm sm:text-base mb-8 leading-relaxed ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
            {message}
          </p>

          {/* Additional Info */}
          <div className={`p-4 rounded-2xl border mb-8 ${
            theme === "dark" 
              ? "bg-gray-800/60 border-gray-700/50 backdrop-blur-sm" 
              : "bg-white/80 border-gray-200/50 backdrop-blur-sm shadow-sm"
          }`}>
            <div className="flex items-center gap-3 mb-3">
              <Lock className={`w-5 h-5 ${theme === "dark" ? "text-orange-400" : "text-orange-600"}`} />
              <span className={`text-sm font-semibold ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`}>
                Permissions Requises
              </span>
            </div>
            <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              Contactez votre administrateur pour obtenir les permissions nécessaires à cette fonctionnalité.
            </p>
          </div>

          {/* Back Button */}
          <Button
            onClick={onNavigateBack}
            className="w-full h-12 sm:h-14 text-sm sm:text-base font-semibold bg-orange-600 hover:bg-orange-700 rounded-xl active:scale-95 transition-all duration-200"
          >
            Retour au Tableau de Bord
          </Button>
        </div>
      </div>
    </div>
  )
}
