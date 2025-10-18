"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  ArrowLeft,
  Shield,
  Check,
  X,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  ChevronRight,
  Gamepad2,
  DollarSign,
  Activity,
} from "lucide-react"
import { useTheme } from "@/lib/contexts"
import { useTranslation } from "@/lib/contexts"
import { useToast } from "@/hooks/use-toast"
import { authService } from "@/lib/auth"
import { bettingService, BettingPlatformWithStats, ExternalPlatformData } from "@/lib/betting"
import { formatNumberWithSpaces } from "@/lib/utils"

interface BettingPlatformsScreenProps {
  onNavigateBack: () => void
  onNavigateToBettingDeposit: (platformUid: string) => void
  onNavigateToBettingWithdraw: (platformUid: string) => void
  transactionType?: "deposit" | "withdraw"
}

export function BettingPlatformsScreen({
  onNavigateBack,
  onNavigateToBettingDeposit,
  onNavigateToBettingWithdraw,
  transactionType,
}: BettingPlatformsScreenProps) {
  const { theme } = useTheme()
  const { t } = useTranslation()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(true)
  const [authorizedPlatforms, setAuthorizedPlatforms] = useState<BettingPlatformWithStats[]>([])
  const [unauthorizedPlatforms, setUnauthorizedPlatforms] = useState<BettingPlatformWithStats[]>([])
  const [summary, setSummary] = useState({
    total_platforms: 0,
    authorized_count: 0,
    unauthorized_count: 0,
    platforms_with_transactions: 0,
  })
  const [selectedPlatform, setSelectedPlatform] = useState<BettingPlatformWithStats | null>(null)
  const [externalPlatformData, setExternalPlatformData] = useState<ExternalPlatformData[]>([])

  useEffect(() => {
    loadPlatforms()
  }, [])

  const loadPlatforms = async () => {
    setIsLoading(true)
    try {
      const accessToken = authService.getAccessToken()
      if (!accessToken) {
        throw new Error("No access token available")
      }

      // Load internal platforms first
      const platformsData = await bettingService.getPlatformsWithStats(accessToken)
      setAuthorizedPlatforms(platformsData.authorized_platforms)
      setUnauthorizedPlatforms(platformsData.unauthorized_platforms)
      setSummary(platformsData.summary)

      // Try to load external platform data, but don't fail if it doesn't work
      let externalData: any[] = []
      try {
        externalData = await bettingService.getExternalPlatformData()
        setExternalPlatformData(externalData)
      } catch (externalError) {
        console.warn("External platform data failed to load:", externalError)
        // Continue without external data - platforms will still work
      }

      // Merge external data with internal platforms (if available)
      const enrichedAuthorizedPlatforms = platformsData.authorized_platforms.map(platform => {
        const externalPlatform = externalData.find(ext => ext.id === platform.external_id)
        return {
          ...platform,
          city: externalPlatform?.city,
          street: externalPlatform?.street,
          external_image: externalPlatform?.image
        }
      })

      const enrichedUnauthorizedPlatforms = platformsData.unauthorized_platforms.map(platform => {
        const externalPlatform = externalData.find(ext => ext.id === platform.external_id)
        return {
          ...platform,
          city: externalPlatform?.city,
          street: externalPlatform?.street,
          external_image: externalPlatform?.image
        }
      })

      setAuthorizedPlatforms(enrichedAuthorizedPlatforms)
      setUnauthorizedPlatforms(enrichedUnauthorizedPlatforms)
    } catch (error) {
      console.error("Load platforms error:", error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de charger les plateformes",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const handlePlatformSelect = (platform: BettingPlatformWithStats) => {
    if (transactionType) {
      // Automatically navigate based on transaction type
      if (transactionType === "deposit") {
        onNavigateToBettingDeposit(platform.uid)
      } else {
        onNavigateToBettingWithdraw(platform.uid)
      }
    } else {
      // Show platform details for manual selection
      setSelectedPlatform(platform)
    }
  }

  return (
    <div
      className={`min-h-screen relative overflow-hidden ${
        theme === "dark"
          ? "bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900"
          : "bg-gradient-to-b from-orange-50 via-white to-blue-50"
      }`}
    >
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute top-20 right-4 w-40 h-40 rounded-full opacity-10 ${
            theme === "dark" ? "bg-indigo-500" : "bg-indigo-300"
          } blur-3xl animate-pulse`}
        ></div>
        <div
          className={`absolute bottom-60 left-4 w-32 h-32 rounded-full opacity-10 ${
            theme === "dark" ? "bg-purple-500" : "bg-purple-300"
          } blur-2xl animate-pulse`}
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* Header */}
      <div className="relative z-10 px-3 pt-12 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onNavigateBack}
              className={`h-10 w-10 p-0 rounded-xl active:scale-95 transition-all duration-200 ${
                theme === "dark"
                  ? "text-gray-300 hover:bg-white/10 active:bg-white/20"
                  : "text-gray-600 hover:bg-black/5 active:bg-black/10"
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1
                className={`text-lg font-bold truncate ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                {transactionType 
                  ? `Plateformes - ${transactionType === "deposit" ? "Dépôt" : "Retrait"}`
                  : "Plateformes de Paris"
                }
              </h1>
              <p
                className={`text-xs ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {transactionType 
                  ? `Sélectionnez une plateforme pour ${transactionType === "deposit" ? "effectuer un dépôt" : "effectuer un retrait"}`
                  : "Gérer vos plateformes autorisées"
                }
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadPlatforms}
            disabled={isLoading}
            className={`h-10 w-10 p-0 rounded-xl active:scale-95 transition-all duration-200 ${
              theme === "dark"
                ? "text-gray-300 hover:bg-white/10 active:bg-white/20"
                : "text-gray-600 hover:bg-black/5 active:bg-black/10"
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <Card
            className={`p-3 rounded-xl border transition-all ${
              theme === "dark"
                ? "bg-gray-800/60 border-gray-700/50 backdrop-blur-sm"
                : "bg-white/80 border-gray-200/50 backdrop-blur-sm shadow-sm"
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  theme === "dark" ? "bg-green-500/20 text-green-400" : "bg-green-100 text-green-600"
                }`}
              >
                <Check className="w-4 h-4" />
              </div>
              <div>
                <p
                  className={`text-xs ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Autorisées
                </p>
                <p
                  className={`text-lg font-bold ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  {summary.authorized_count}
                </p>
              </div>
            </div>
          </Card>

          <Card
            className={`p-3 rounded-xl border transition-all ${
              theme === "dark"
                ? "bg-gray-800/60 border-gray-700/50 backdrop-blur-sm"
                : "bg-white/80 border-gray-200/50 backdrop-blur-sm shadow-sm"
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  theme === "dark" ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600"
                }`}
              >
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <p
                  className={`text-xs ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Avec transactions
                </p>
                <p
                  className={`text-lg font-bold ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  {summary.platforms_with_transactions}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Platforms List */}
      <div className="relative z-10 px-3 pb-20">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-5 h-5 animate-spin text-orange-500" />
          </div>
        ) : (
          <div className="space-y-3">
            {/* Authorized Platforms */}
            {authorizedPlatforms.length > 0 && (
              <div>
                <h2
                  className={`text-xs font-semibold mb-2 px-1 ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  PLATEFORMES AUTORISÉES
                </h2>
                <div className="space-y-2">
                  {authorizedPlatforms.map((platform) => (
                    <Card
                      key={platform.uid}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        theme === "dark"
                          ? "bg-gray-800/60 border-gray-700/50 backdrop-blur-sm hover:bg-gray-700/60"
                          : "bg-white/80 border-gray-200/50 backdrop-blur-sm shadow-sm hover:shadow-md"
                      }`}
                      onClick={() => handlePlatformSelect(platform)}
                    >
                      <div className="flex items-start gap-2">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                          {platform.external_image ? (
                            <img
                              src={platform.external_image}
                              alt={platform.name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          ) : platform.logo ? (
                            <img
                              src={`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}${platform.logo}`}
                              alt={platform.name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              theme === "dark"
                                ? "bg-gradient-to-br from-indigo-600 to-purple-600"
                                : "bg-gradient-to-br from-indigo-500 to-purple-500"
                            }`}>
                              <Gamepad2 className="w-5 h-5 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3
                              className={`font-bold text-sm truncate ${
                                theme === "dark" ? "text-white" : "text-gray-900"
                              }`}
                            >
                              {platform.name}
                            </h3>
                            <ChevronRight
                              className={`w-4 h-4 flex-shrink-0 ${
                                theme === "dark" ? "text-gray-500" : "text-gray-400"
                              }`}
                            />
                          </div>

                          {/* City and Street */}
                          {(platform.city || platform.street) && (
                            <div className="mb-2">
                              {platform.city && (
                                <p
                                  className={`text-xs ${
                                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                                  }`}
                                >
                                  Ville: {platform.city}
                                </p>
                              )}
                              {platform.street && (
                                <p
                                  className={`text-xs ${
                                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                                  }`}
                                >
                                  Rue: {platform.street}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Stats */}
                          <div className="grid grid-cols-2 gap-1 mt-2">
                            <div
                              className={`p-1.5 rounded-lg ${
                                theme === "dark" ? "bg-gray-700/50" : "bg-gray-100"
                              }`}
                            >
                              <p
                                className={`text-xs ${
                                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                                }`}
                              >
                                Transactions
                              </p>
                              <p
                                className={`text-xs font-bold ${
                                  theme === "dark" ? "text-white" : "text-gray-900"
                                }`}
                              >
                                {platform.my_stats.total_transactions}
                              </p>
                            </div>
                            <div
                              className={`p-1.5 rounded-lg ${
                                theme === "dark" ? "bg-gray-700/50" : "bg-gray-100"
                              }`}
                            >
                              <p
                                className={`text-xs ${
                                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                                }`}
                              >
                                Commission
                              </p>
                              <p
                                className={`text-xs font-bold ${
                                  theme === "dark" ? "text-green-400" : "text-green-600"
                                }`}
                              >
                                {formatNumberWithSpaces(platform.my_stats.unpaid_commission.toString())}
                              </p>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          {/* <div className="grid grid-cols-2 gap-1 mt-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                onNavigateToBettingDeposit(platform.uid)
                              }}
                              disabled={!platform.can_deposit}
                              className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                                platform.can_deposit
                                  ? theme === "dark"
                                    ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                                    : "bg-green-100 text-green-600 hover:bg-green-200"
                                  : theme === "dark"
                                  ? "bg-gray-700/50 text-gray-500 cursor-not-allowed"
                                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
                              }`}
                            >
                              <TrendingUp className="w-3 h-3 inline mr-1" />
                              Dépôt
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                onNavigateToBettingWithdraw(platform.uid)
                              }}
                              disabled={!platform.can_withdraw}
                              className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                                platform.can_withdraw
                                  ? theme === "dark"
                                    ? "bg-orange-500/20 text-orange-400 hover:bg-orange-500/30"
                                    : "bg-orange-100 text-orange-600 hover:bg-orange-200"
                                  : theme === "dark"
                                  ? "bg-gray-700/50 text-gray-500 cursor-not-allowed"
                                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
                              }`}
                            >
                              <TrendingDown className="w-3 h-3 inline mr-1" />
                              Retrait
                            </button>
                          </div> */}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Unauthorized Platforms */}
            {unauthorizedPlatforms.length > 0 && (
              <div className="mt-4">
                <h2
                  className={`text-xs font-semibold mb-2 px-1 ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  PLATEFORMES NON AUTORISÉES
                </h2>
                <div className="space-y-2">
                  {unauthorizedPlatforms.map((platform) => (
                    <Card
                      key={platform.uid}
                      className={`p-3 rounded-xl border transition-all opacity-60 ${
                        theme === "dark"
                          ? "bg-gray-800/60 border-gray-700/50 backdrop-blur-sm"
                          : "bg-white/80 border-gray-200/50 backdrop-blur-sm shadow-sm"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                          {platform.external_image ? (
                            <img
                              src={platform.external_image}
                              alt={platform.name}
                              className="w-10 h-10 rounded-lg object-cover grayscale"
                            />
                          ) : platform.logo ? (
                            <img
                              src={`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}${platform.logo}`}
                              alt={platform.name}
                              className="w-10 h-10 rounded-lg object-cover grayscale"
                            />
                          ) : (
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                            }`}>
                              <Gamepad2
                                className={`w-5 h-5 ${
                                  theme === "dark" ? "text-gray-500" : "text-gray-400"
                                }`}
                              />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3
                            className={`font-bold text-sm truncate ${
                              theme === "dark" ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            {platform.name}
                          </h3>
                          
                          {/* City and Street */}
                          {(platform.city || platform.street) && (
                            <div className="mb-1">
                              {platform.city && (
                                <p
                                  className={`text-xs ${
                                    theme === "dark" ? "text-gray-500" : "text-gray-500"
                                  }`}
                                >
                                  Ville: {platform.city}
                                </p>
                              )}
                              {platform.street && (
                                <p
                                  className={`text-xs ${
                                    theme === "dark" ? "text-gray-500" : "text-gray-500"
                                  }`}
                                >
                                  Rue: {platform.street}
                                </p>
                              )}
                            </div>
                          )}
                          
                          <p
                            className={`text-xs ${
                              theme === "dark" ? "text-gray-500" : "text-gray-500"
                            }`}
                          >
                            Accès non autorisé
                          </p>
                        </div>
                        <X
                          className={`w-4 h-4 flex-shrink-0 ${
                            theme === "dark" ? "text-red-500" : "text-red-600"
                          }`}
                        />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {authorizedPlatforms.length === 0 && unauthorizedPlatforms.length === 0 && (
              <div className="text-center py-8">
                <Gamepad2
                  className={`w-12 h-12 mx-auto mb-3 ${
                    theme === "dark" ? "text-gray-600" : "text-gray-400"
                  }`}
                />
                <p
                  className={`text-sm ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Aucune plateforme disponible
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Platform Details Modal */}
      {selectedPlatform && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setSelectedPlatform(null)}
          />
          
          <div
            className={`fixed bottom-0 left-0 right-0 w-full max-h-[90vh] mx-0 rounded-t-2xl border-0 shadow-2xl z-50 transform ${
              theme === "dark" 
                ? "bg-gray-900" 
                : "bg-white"
            }`}
            style={{ 
              left: 0, 
              right: 0, 
              width: '100%',
              maxWidth: '100vw'
            }}
          >
            {/* Drag Handle */}
            <div className="flex justify-center pt-2 pb-1">
              <div className={`w-10 h-1 rounded-full ${theme === "dark" ? "bg-gray-600" : "bg-gray-300"}`}></div>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between mb-3 px-4">
              <h2
                className={`text-base font-bold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                {selectedPlatform.name}
              </h2>
              <button
                onClick={() => setSelectedPlatform(null)}
                className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                  theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="px-4 pb-6 overflow-y-auto max-h-[75vh]">
              <div className="space-y-4 w-full">
              {/* Limits */}
              <div>
                <h3
                  className={`text-sm font-bold mb-3 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  LIMITES
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    className={`p-3 rounded-xl ${
                      theme === "dark" ? "bg-gray-800" : "bg-gray-100"
                    }`}
                  >
                    <p
                      className={`text-xs mb-1 ${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Dépôt Min
                    </p>
                    <p
                      className={`text-base font-bold ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {formatNumberWithSpaces(selectedPlatform.min_deposit_amount)}
                    </p>
                  </div>
                  <div
                    className={`p-3 rounded-xl ${
                      theme === "dark" ? "bg-gray-800" : "bg-gray-100"
                    }`}
                  >
                    <p
                      className={`text-xs mb-1 ${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Dépôt Max
                    </p>
                    <p
                      className={`text-base font-bold ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {formatNumberWithSpaces(selectedPlatform.max_deposit_amount)}
                    </p>
                  </div>
                  <div
                    className={`p-3 rounded-xl ${
                      theme === "dark" ? "bg-gray-800" : "bg-gray-100"
                    }`}
                  >
                    <p
                      className={`text-xs mb-1 ${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Retrait Min
                    </p>
                    <p
                      className={`text-base font-bold ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {formatNumberWithSpaces(selectedPlatform.min_withdrawal_amount)}
                    </p>
                  </div>
                  <div
                    className={`p-3 rounded-xl ${
                      theme === "dark" ? "bg-gray-800" : "bg-gray-100"
                    }`}
                  >
                    <p
                      className={`text-xs mb-1 ${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Retrait Max
                    </p>
                    <p
                      className={`text-base font-bold ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {formatNumberWithSpaces(selectedPlatform.max_withdrawal_amount)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div>
                <h3
                  className={`text-sm font-bold mb-3 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  STATISTIQUES
                </h3>
                <div className="space-y-3">
                  <div
                    className={`p-4 rounded-xl flex items-center justify-between ${
                      theme === "dark" ? "bg-gray-800" : "bg-gray-100"
                    }`}
                  >
                    <span
                      className={`text-sm ${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Total Transactions
                    </span>
                    <span
                      className={`text-lg font-bold ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {selectedPlatform.my_stats.total_transactions}
                    </span>
                  </div>
                  <div
                    className={`p-4 rounded-xl flex items-center justify-between ${
                      theme === "dark" ? "bg-gray-800" : "bg-gray-100"
                    }`}
                  >
                    <span
                      className={`text-sm ${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Montant Total
                    </span>
                    <span
                      className={`text-lg font-bold ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {formatNumberWithSpaces(selectedPlatform.my_stats.total_amount.toString())} FCFA
                    </span>
                  </div>
                  <div
                    className={`p-4 rounded-xl flex items-center justify-between ${
                      theme === "dark" ? "bg-green-500/20" : "bg-green-100"
                    }`}
                  >
                    <span
                      className={`text-sm ${
                        theme === "dark" ? "text-green-400" : "text-green-600"
                      }`}
                    >
                      Commission Non Payée
                    </span>
                    <span
                      className={`text-lg font-bold ${
                        theme === "dark" ? "text-green-400" : "text-green-600"
                      }`}
                    >
                      {formatNumberWithSpaces(selectedPlatform.my_stats.unpaid_commission.toString())} FCFA
                    </span>
                  </div>
                </div>
              </div>

              {/* Permission Info */}
              {selectedPlatform.granted_by_name && (
                <div>
                  <h3
                    className={`text-sm font-bold mb-3 ${
                      theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    AUTORISATION
                  </h3>
                  <div
                    className={`p-4 rounded-xl ${
                      theme === "dark" ? "bg-gray-800" : "bg-gray-100"
                    }`}
                  >
                    <p
                      className={`text-xs mb-2 ${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Accordée par
                    </p>
                    <p
                      className={`text-base font-bold mb-1 ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {selectedPlatform.granted_by_name}
                    </p>
                    <p
                      className={`text-xs ${
                        theme === "dark" ? "text-gray-500" : "text-gray-500"
                      }`}
                    >
                      {formatDate(selectedPlatform.permission_granted_at || null)}
                    </p>
                  </div>
                </div>
              )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

