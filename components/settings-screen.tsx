// "use client"

// import type React from "react"

// import { Button } from "@/components/ui/button"
// import { Card, CardContent } from "@/components/ui/card"
// import { Switch } from "@/components/ui/switch"
// import {
//   ArrowLeft,
//   User,
//   Shield,
//   Bell,
//   Wallet,
//   HelpCircle,
//   LogOut,
//   ChevronRight,
//   Phone,
//   Lock,
//   Eye,
//   Palette,
//   Languages,
// } from "lucide-react"
// import { useTranslation } from "@/lib/contexts"
// import { useTheme } from "@/lib/contexts"

// interface SettingsScreenProps {
//   onNavigateBack: () => void
//   onNavigateToProfile: () => void
//   onLogout: () => void
// }

// export function SettingsScreen({ onNavigateBack, onNavigateToProfile, onLogout }: SettingsScreenProps) {
//   const { t, language, setLanguage } = useTranslation()
//   const { theme, setTheme } = useTheme()

//   const handleLanguageToggle = () => {
//     setLanguage(language === "en" ? "fr" : "en")
//   }

//   const handleThemeToggle = () => {
//     setTheme(theme === "light" ? "dark" : "light")
//   }

  
//   return (
//     <div
//       className={`min-h-screen transition-colors duration-300 ${
//         theme === "dark"
//           ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
//           : "bg-gradient-to-br from-blue-50 via-white to-blue-100"
//       }`}
//     >
//       {/* Header */}
//       <div className="px-4 pt-12 pb-8 safe-area-inset-top">
//         <div className="flex items-center gap-4">
//           <Button
//             variant="ghost"
//             size="sm"
//             className={`h-11 w-11 p-0 rounded-full ${
//               theme === "dark" 
//                 ? "text-gray-300 hover:bg-gray-700/50" 
//                 : "text-gray-600 hover:bg-gray-100/50"
//             }`}
//             onClick={onNavigateBack}
//           >
//             <ArrowLeft className="w-5 h-5" />
//           </Button>
//           <h1 className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{t("settings.title")}</h1>
//         </div>
//       </div>

//       <div className="px-4 py-8 space-y-8">
//         {/* Account Section */}
//         <Card
//           className={`border-0 shadow-xl backdrop-blur-sm transition-colors duration-300 ${
//             theme === "dark" ? "bg-gray-800/95 text-white" : "bg-white/95 text-gray-900"
//           }`}
//         >
//           <CardContent className="p-0">
//             <div className={`p-6 border-b ${theme === "dark" ? "border-gray-700/50" : "border-border/50"}`}>
//               <h2 className={`font-bold text-lg mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{t("settings.account.title")}</h2>
//               <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>{t("settings.account.subtitle")}</p>
//             </div>

//             <div className="space-y-0">
//               <SettingsItem
//                 icon={<User className="w-5 h-5" />}
//                 title={t("settings.account.profile")}
//                 subtitle={t("settings.account.profileSubtitle")}
//                 showChevron
//                 onClick={onNavigateToProfile}
//               />
              
              
//               <SettingsItem
//                 icon={<Languages className="w-5 h-5" />}
//                 title={t("settings.account.language")}
//                 subtitle={language === "en" ? "English" : "Français"}
//                 showButton
//                 buttonText={language === "en" ? "FR" : "EN"}
//                 onButtonClick={handleLanguageToggle}
//               />
//               <SettingsItem
//                 icon={<Palette className="w-5 h-5" />}
//                 title={t("settings.account.theme")}
//                 subtitle={theme === "light" ? t("settings.account.lightTheme") : t("settings.account.darkTheme")}
//                 showButton
//                 buttonText={theme === "light" ? "🌙" : "☀️"}
//                 onButtonClick={handleThemeToggle}
//               />
//             </div>
//           </CardContent>
//         </Card>

       
//         <Button
//           variant="destructive"
//           className="w-full h-14 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
//           onClick={onLogout}
//         >
//           <LogOut className="w-5 h-5 mr-3" />
//           {t("settings.logout")}
//         </Button>
//       </div>
//     </div>
//   )
// }

// interface SettingsItemProps {
//   icon: React.ReactNode
//   title: string
//   subtitle: string
//   showChevron?: boolean
//   showToggle?: boolean
//   toggleValue?: boolean
//   showBadge?: boolean
//   showButton?: boolean
//   buttonText?: string
//   onButtonClick?: () => void
//   onClick?: () => void
// }

// function SettingsItem({
//   icon,
//   title,
//   subtitle,
//   showChevron,
//   showToggle,
//   toggleValue,
//   showBadge,
//   showButton,
//   buttonText,
//   onButtonClick,
//   onClick,
// }: SettingsItemProps) {
//   const { theme } = useTheme()
  
//   return (
//     /* Enhanced settings item with better hover effects and spacing */
//     <div 
//       className={`flex items-center justify-between p-6 transition-all duration-200 min-h-[80px] border-b last:border-b-0 ${
//         theme === "dark" 
//           ? "hover:bg-gray-700/30 border-gray-700/50" 
//           : "hover:bg-gray-100/30 border-border/30"
//       } ${onClick ? "cursor-pointer" : ""}`}
//       onClick={onClick}
//     >
//       <div className="flex items-center gap-4 flex-1">
//         <div className={`p-2 rounded-xl ${
//           theme === "dark" 
//             ? "text-gray-300 bg-gray-700/50" 
//             : "text-muted-foreground bg-muted/50"
//         }`}>{icon}</div>
//         <div className="flex-1">
//           <div className="flex items-center gap-2">
//             <p className={`font-semibold ${
//               theme === "dark" ? "text-white" : "text-gray-900"
//             }`}>{title}</p>
//             {showBadge && <div className="w-2 h-2 bg-accent rounded-full"></div>}
//           </div>
//           <p className={`text-sm mt-1 ${
//             theme === "dark" ? "text-gray-400" : "text-gray-600"
//           }`}>{subtitle}</p>
//         </div>
//       </div>

//       <div className="flex items-center gap-3">
//         {showToggle && <Switch checked={toggleValue} className="data-[state=checked]:bg-accent" />}
//         {showButton && (
//           <Button
//             variant="outline"
//             size="sm"
//             className={`h-8 px-3 text-xs font-medium ${
//               theme === "dark" 
//                 ? "bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700" 
//                 : "bg-transparent"
//             }`}
//             onClick={onButtonClick}
//           >
//             {buttonText}
//           </Button>
//         )}
//         {showChevron && <ChevronRight className={`w-5 h-5 ${
//           theme === "dark" ? "text-gray-400" : "text-muted-foreground"
//         }`} />}
//       </div>
//     </div>
//   )
// }



"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import {
  ArrowLeft,
  User,
  Shield,
  Bell,
  Wallet,
  HelpCircle,
  LogOut,
  ChevronRight,
  Phone,
  Lock,
  Eye,
  Palette,
  Languages,
  Settings,
  Moon,
  Sun,
  RefreshCw
} from "lucide-react"
import { useTranslation } from "@/lib/contexts"
import { useTheme } from "@/lib/contexts"
import { useState, useEffect } from "react"

interface SettingsScreenProps {
  onNavigateBack: () => void
  onNavigateToProfile: () => void
  onLogout: () => void
}

export function SettingsScreen({ onNavigateBack, onNavigateToProfile, onLogout }: SettingsScreenProps) {
  const { t, language, setLanguage } = useTranslation()
  const { theme, setTheme } = useTheme()
  
  // Pull-to-refresh state
  const [pullToRefreshState, setPullToRefreshState] = useState({
    isPulling: false,
    pullDistance: 0,
    isRefreshing: false,
    startY: 0,
    currentY: 0,
    canPull: true
  })

  const handleLanguageToggle = () => {
    setLanguage(language === "en" ? "fr" : "en")
  }

  const handleThemeToggle = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  // Pull-to-refresh handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!pullToRefreshState.canPull || pullToRefreshState.isRefreshing) return
    
    const startY = e.touches[0].clientY
    setPullToRefreshState(prev => ({
      ...prev,
      startY,
      currentY: startY,
      isPulling: false
    }))
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!pullToRefreshState.canPull || pullToRefreshState.isRefreshing) return
    
    const currentY = e.touches[0].clientY
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    
    // Only allow pull-to-refresh when at the top of the page
    if (scrollTop > 0) {
      setPullToRefreshState(prev => ({ ...prev, canPull: false }))
      return
    }
    
    const pullDistance = Math.max(0, currentY - pullToRefreshState.startY)
    const maxPullDistance = 120
    
    if (pullDistance > 0) {
      e.preventDefault() // Prevent default scroll behavior
      setPullToRefreshState(prev => ({
        ...prev,
        currentY,
        pullDistance: Math.min(pullDistance, maxPullDistance),
        isPulling: pullDistance > 10
      }))
    }
  }

  const handleTouchEnd = () => {
    if (!pullToRefreshState.canPull || pullToRefreshState.isRefreshing) return
    
    const { pullDistance } = pullToRefreshState
    const refreshThreshold = 80
    
    if (pullDistance >= refreshThreshold && pullToRefreshState.isPulling) {
      handleRefresh()
    } else {
      // Reset pull state
      setPullToRefreshState(prev => ({
        ...prev,
        isPulling: false,
        pullDistance: 0,
        canPull: true
      }))
    }
  }

  const handleRefresh = async () => {
    setPullToRefreshState(prev => ({ ...prev, isRefreshing: true }))
    // Add any refresh logic here if needed
    setTimeout(() => {
      setPullToRefreshState(prev => ({ ...prev, isRefreshing: false, pullDistance: 0 }))
    }, 1000)
  }

  // Reset canPull when scroll position changes
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      if (scrollTop === 0) {
        setPullToRefreshState(prev => ({ ...prev, canPull: true }))
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div 
      className={`min-h-screen relative overflow-hidden ${
        theme === "dark"
        ? "bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900"
        : "bg-gradient-to-b from-orange-50 via-white to-blue-50"
      }`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: `translateY(${pullToRefreshState.pullDistance}px)`,
        transition: pullToRefreshState.isPulling ? 'none' : 'transform 0.3s ease-out'
      }}
    >
      {/* Pull-to-refresh indicator */}
      {(pullToRefreshState.isPulling || pullToRefreshState.isRefreshing) && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-40">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            theme === "dark" 
              ? "bg-gray-800/90 backdrop-blur-sm border border-gray-700/50" 
              : "bg-white/90 backdrop-blur-sm border border-gray-200/50"
          } shadow-lg`}>
            <RefreshCw className={`w-5 h-5 ${
              pullToRefreshState.isRefreshing ? 'animate-spin' : ''
            } ${theme === "dark" ? "text-orange-400" : "text-orange-500"}`} />
          </div>
        </div>
      )}

      {/* Mobile-optimized background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-20 right-4 w-32 h-32 rounded-full opacity-10 ${
          theme === "dark" ? "bg-orange-500" : "bg-orange-300"
        } blur-2xl animate-pulse`}></div>
        <div className={`absolute bottom-40 left-4 w-40 h-40 rounded-full opacity-10 ${
          theme === "dark" ? "bg-blue-500" : "bg-blue-300"
        } blur-2xl animate-pulse`} style={{animationDelay: '1.5s'}}></div>
      </div>

      {/* Mobile-first header with safe area */}
      <div className="relative z-10 px-4 pt-safe-area-inset-top pt-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            size="sm"
            className={`h-11 w-11 p-0 rounded-xl active:scale-95 transition-all duration-200 ${
              theme === "dark" 
                ? "text-gray-300 hover:bg-white/10 active:bg-white/20" 
                : "text-gray-600 hover:bg-black/5 active:bg-black/10"
            }`}
            onClick={onNavigateBack}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div className="text-center flex-1 mx-4">
            <h1 className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              {t("settings.title")}
            </h1>
            <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              {t("additional.manageYourPreferences")}
            </p>
          </div>
          
          <div className={`p-2.5 rounded-xl ${
            theme === "dark" ? "bg-gray-500/20 text-gray-400" : "bg-gray-100 text-gray-600"
          }`}>
            <Settings className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Scrollable content area */}
      <div className="relative z-10 px-4 pb-32 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        <div className="space-y-6">
          {/* Account Settings Card */}
          <div className={`rounded-2xl border transition-all duration-300 ${
            theme === "dark" 
              ? "bg-gray-800/60 border-gray-700/50 backdrop-blur-sm" 
              : "bg-white/80 border-gray-200/50 backdrop-blur-sm shadow-sm"
          }`}>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-2 rounded-xl ${
                  theme === "dark" ? "bg-orange-500/20 text-orange-400" : "bg-orange-100 text-orange-600"
                }`}>
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h2 className={`font-bold text-lg ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    {t("settings.account.title")}
                  </h2>
                  <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    {t("settings.account.subtitle")}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <SettingsItem
                  icon={<User className="w-5 h-5" />}
                  title={t("settings.account.profile")}
                  subtitle={t("settings.account.profileSubtitle")}
                  showChevron
                  onClick={onNavigateToProfile}
                />
              </div>
            </div>
          </div>

          {/* Preferences Card */}
          <div className={`rounded-2xl border transition-all duration-300 ${
            theme === "dark" 
              ? "bg-gray-800/60 border-gray-700/50 backdrop-blur-sm" 
              : "bg-white/80 border-gray-200/50 backdrop-blur-sm shadow-sm"
          }`}>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-2 rounded-xl ${
                  theme === "dark" ? "bg-green-500/20 text-green-400" : "bg-green-100 text-green-600"
                }`}>
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h2 className={`font-bold text-lg ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    {t("additional.preferences")}
                  </h2>
                  <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    {t("additional.customizeYourAppExperience")}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <SettingsItem
                  icon={<Languages className="w-5 h-5" />}
                  title={t("settings.account.language")}
                  subtitle={language === "en" ? "English" : "Français"}
                  showButton
                  buttonText={language === "en" ? "FR" : "EN"}
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
          </div>
        </div>
      </div>

      {/* Fixed bottom logout button */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 p-4 ${
        theme === "dark" 
          ? "bg-slate-900/95 border-t border-gray-700/50" 
          : "bg-white/95 border-t border-gray-200/50"
      } backdrop-blur-lg`}>
        <Button
          variant="destructive"
          className="w-full h-12 text-base font-bold rounded-2xl transition-all duration-200 active:scale-98 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 shadow-lg shadow-red-500/25"
          onClick={onLogout}
        >
          <LogOut className="w-5 h-5 mr-2" />
          {t("settings.logout")}
        </Button>
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
  showBadge?: boolean
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
  showBadge,
  showButton,
  buttonText,
  onButtonClick,
  onToggleChange,
  onClick,
}: SettingsItemProps) {
  const { theme } = useTheme()
  
  return (
    <div 
      className={`flex items-center justify-between p-4 rounded-2xl transition-all duration-200 active:scale-98 ${
        theme === "dark" 
          ? "hover:bg-gray-700/30" 
          : "hover:bg-gray-50"
      } ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-4 flex-1">
        <div className={`p-2 rounded-xl ${
          theme === "dark" 
            ? "text-gray-300 bg-gray-700/50" 
            : "text-gray-600 bg-gray-100"
        }`}>
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className={`font-semibold ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}>
              {title}
            </p>
            {showBadge && (
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            )}
          </div>
          <p className={`text-sm mt-1 ${
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          }`}>
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {showToggle && (
          <Switch 
            checked={toggleValue} 
            onCheckedChange={onToggleChange}
            className="data-[state=checked]:bg-green-500"
          />
        )}
        {showButton && (
          <Button
            variant="outline"
            size="sm"
            className={`h-9 px-4 text-sm font-semibold rounded-xl transition-all duration-200 active:scale-95 ${
              theme === "dark" 
                ? "bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600" 
                : "bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200"
            }`}
            onClick={(e) => {
              e.stopPropagation()
              onButtonClick?.()
            }}
          >
            {buttonText}
          </Button>
        )}
        {showChevron && (
          <ChevronRight className={`w-5 h-5 ${
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          }`} />
        )}
      </div>
    </div>
  )
}