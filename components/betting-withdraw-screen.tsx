"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import {
  ArrowLeft,
  TrendingDown,
  Gamepad2,
  AlertCircle,
  Loader2,
  CheckCircle,
} from "lucide-react"
import { useTheme } from "@/lib/contexts"
import { useToast } from "@/hooks/use-toast"
import { authService } from "@/lib/auth"
import { bettingService, BettingPlatform } from "@/lib/betting"
import { formatNumberWithSpaces } from "@/lib/utils"

interface BettingWithdrawScreenProps {
  onNavigateBack: () => void
  platformUid?: string
}

export function BettingWithdrawScreen({
  onNavigateBack,
  platformUid,
}: BettingWithdrawScreenProps) {
  const { theme } = useTheme()
  const { toast } = useToast()

  const [platform, setPlatform] = useState<BettingPlatform | null>(null)
  const [isLoadingPlatform, setIsLoadingPlatform] = useState(true)
  const [bettingUserId, setBettingUserId] = useState("")
  const [withdrawalCode, setWithdrawalCode] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [verifiedUser, setVerifiedUser] = useState<{
    UserId: number
    Name?: string
    CurrencyId?: number
  } | null>(null)
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null)
  const [idValidationError, setIdValidationError] = useState("")

  useEffect(() => {
    if (platformUid) {
      loadPlatformDetails()
    }
  }, [platformUid])

  const loadPlatformDetails = async () => {
    setIsLoadingPlatform(true)
    try {
      const accessToken = authService.getAccessToken()
      if (!accessToken || !platformUid) {
        throw new Error("Missing credentials or platform ID")
      }

      // Load platform details first
      const platformData = await bettingService.getPlatformDetails(accessToken, platformUid)

      // Try to load external platform data, but don't fail if it doesn't work
      let externalPlatform = null
      try {
        const externalData = await bettingService.getExternalPlatformData()
        externalPlatform = externalData.find(ext => ext.id === platformData.external_id)
      } catch (externalError) {
        console.warn("External platform data failed to load:", externalError)
        // Continue without external data - platform will still work
      }
      
      // Merge platform data with external city/street/image data (if available)
      const enrichedPlatform = {
        ...platformData,
        city: externalPlatform?.city,
        street: externalPlatform?.street,
        external_image: externalPlatform?.image
      }

      setPlatform(enrichedPlatform)
    } catch (error) {
      console.error("Load platform error:", error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de charger la plateforme",
        variant: "destructive",
      })
      onNavigateBack()
    } finally {
      setIsLoadingPlatform(false)
    }
  }


  // Debounced verification function
  const debouncedVerifyUserId = useCallback(() => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout)
    }
    
    if (!bettingUserId || !platform || bettingUserId.length < 3) {
      setVerifiedUser(null)
      setIdValidationError("")
      return
    }

    const timeout = setTimeout(async () => {
      await handleVerifyUserId()
    }, 800) // 800ms delay
    
    setDebounceTimeout(timeout)
  }, [bettingUserId, platform])

  const handleVerifyUserId = async () => {
    if (!bettingUserId || !platform) return

    setIsVerifying(true)
    setVerifiedUser(null)
    setIdValidationError("")

    try {
      const accessToken = authService.getAccessToken()
      if (!accessToken) {
        throw new Error("No access token available")
      }

      const result = await bettingService.verifyUserId(accessToken, {
        platform_uid: platform.uid,
        betting_user_id: bettingUserId,
      })

      if (result.UserId === 0) {
        setIdValidationError("ID de pari invalide")
        setVerifiedUser(null)
      } else {
        setVerifiedUser(result)
        setIdValidationError("")
        toast({
          title: "Vérification Réussie",
          description: result.Name ? `Utilisateur: ${result.Name}` : "ID vérifié",
        })
      }
    } catch (error) {
      console.error("Verify user ID error:", error)
      const errorMessage = error instanceof Error ? error.message : "Impossible de vérifier l'ID"
      
      if (errorMessage === 'Invalid betting user ID') {
        setIdValidationError("ID de pari invalide")
        setVerifiedUser(null)
      } else {
        toast({
          title: "Erreur de Vérification",
          description: errorMessage,
          variant: "destructive",
        })
        setIdValidationError("Erreur de vérification")
        setVerifiedUser(null)
      }
    } finally {
      setIsVerifying(false)
    }
  }

  // Auto-verify betting user ID when user stops typing
  useEffect(() => {
    if (bettingUserId && bettingUserId.length >= 3 && platform) {
      debouncedVerifyUserId()
    }
    
    // Cleanup timeout on unmount
    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout)
      }
    }
  }, [bettingUserId, platform])


  const handleCreateWithdrawal = async () => {
    if (!bettingUserId || !withdrawalCode || !platform) return

    setIsCreating(true)

    try {
      const accessToken = authService.getAccessToken()
      if (!accessToken) {
        throw new Error("No access token available")
      }

      const result = await bettingService.createWithdrawal(accessToken, {
        platform_uid: platform.uid,
        betting_user_id: bettingUserId,
        withdrawal_code: withdrawalCode,
      })

      if (result.success) {
        toast({
          title: "Retrait Réussi",
          description: result.message || "Votre retrait a été effectué avec succès",
        })
        // Reset form
        setBettingUserId("")
        setWithdrawalCode("")
        setShowConfirmation(false)
        // Navigate back after short delay
        setTimeout(() => {
          onNavigateBack()
        }, 1500)
      } else {
        throw new Error(result.message || "Le retrait a échoué")
      }
    } catch (error) {
      console.error("Create withdrawal error:", error)
      toast({
        title: "Erreur de Retrait",
        description: error instanceof Error ? error.message : "Impossible de créer le retrait",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }


  if (isLoadingPlatform) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          theme === "dark"
            ? "bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900"
            : "bg-gradient-to-b from-orange-50 via-white to-blue-50"
        }`}
      >
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    )
  }

  if (!platform) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          theme === "dark"
            ? "bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900"
            : "bg-gradient-to-b from-orange-50 via-white to-blue-50"
        }`}
      >
        <p className={theme === "dark" ? "text-white" : "text-gray-900"}>
          Plateforme non trouvée
        </p>
      </div>
    )
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
            theme === "dark" ? "bg-orange-500" : "bg-orange-300"
          } blur-3xl animate-pulse`}
        ></div>
        <div
          className={`absolute bottom-60 left-4 w-32 h-32 rounded-full opacity-10 ${
            theme === "dark" ? "bg-red-500" : "bg-red-300"
          } blur-2xl animate-pulse`}
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* Header */}
      <div className="relative z-10 px-4 pt-12 pb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onNavigateBack}
              className={`h-11 w-11 p-0 rounded-xl active:scale-95 transition-all duration-200 ${
                theme === "dark"
                  ? "text-gray-300 hover:bg-white/10 active:bg-white/20"
                  : "text-gray-600 hover:bg-black/5 active:bg-black/10"
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1
                className={`text-2xl font-bold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Retrait de Paris
              </h1>
              <p
                className={`text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {platform.name}
              </p>
            </div>
          </div>
        </div>

        {/* Platform Info Card */}
        <Card
          className={`p-4 rounded-2xl border mb-6 ${
            theme === "dark"
              ? "bg-gray-800/60 border-gray-700/50 backdrop-blur-sm"
              : "bg-white/80 border-gray-200/50 backdrop-blur-sm shadow-sm"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center">
              {platform.external_image ? (
                <img
                  src={platform.external_image}
                  alt={platform.name}
                  className="w-12 h-12 rounded-xl object-cover"
                />
              ) : platform.logo ? (
                <img
                  src={`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}${platform.logo}`}
                  alt={platform.name}
                  className="w-12 h-12 rounded-xl object-cover"
                />
              ) : (
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  theme === "dark"
                    ? "bg-gradient-to-br from-orange-600 to-red-600"
                    : "bg-gradient-to-br from-orange-500 to-red-500"
                }`}>
                  <Gamepad2 className="w-6 h-6 text-white" />
                </div>
              )}
            </div>
            <div>
              <h3
                className={`font-bold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                {platform.name}
              </h3>
              <p
                className={`text-xs ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Min: {formatNumberWithSpaces(platform.min_withdrawal_amount)} - Max:{" "}
                {formatNumberWithSpaces(platform.max_withdrawal_amount)} FCFA
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Form Content */}
      <div className="relative z-10 px-4 pb-24">
        {!showConfirmation ? (
          <div className="space-y-6">
            {/* City and Street Fields */}
            <div>
              <label
                className={`block text-sm font-semibold mb-3 ${
                  theme === "dark" ? "text-gray-200" : "text-gray-800"
                }`}
              >
                Informations de Localisation
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className={`block text-xs font-medium mb-1 ${
                      theme === "dark" ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    Ville
                  </label>
                  <div
                    className={`h-12 rounded-xl px-4 flex items-center ${
                      theme === "dark"
                        ? "bg-gray-800/60 border border-gray-700 text-gray-300"
                        : "bg-gray-100 border border-gray-200 text-gray-600"
                    }`}
                  >
                    {platform?.city || "Non spécifié"}
                  </div>
                </div>
                <div>
                  <label
                    className={`block text-xs font-medium mb-1 ${
                      theme === "dark" ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    Rue
                  </label>
                  <div
                    className={`h-12 rounded-xl px-4 flex items-center ${
                      theme === "dark"
                        ? "bg-gray-800/60 border border-gray-700 text-gray-300"
                        : "bg-gray-100 border border-gray-200 text-gray-600"
                    }`}
                  >
                    {platform?.street || "Non spécifié"}
                  </div>
                </div>
              </div>
            </div>

            {/* Betting User ID */}
            <div>
              <label
                className={`block text-sm font-semibold mb-2 ${
                  theme === "dark" ? "text-gray-200" : "text-gray-800"
                }`}
              >
                ID Utilisateur de Paris
              </label>
              <div className="flex gap-2">
                <Input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={bettingUserId}
                  onChange={(e) => {
                    setBettingUserId(e.target.value)
                    setVerifiedUser(null)
                    setIdValidationError("")
                  }}
                  placeholder="Entrez l'ID utilisateur"
                  className={`flex-1 h-12 rounded-xl ${
                    idValidationError
                      ? theme === "dark"
                        ? "bg-red-900/20 border-red-500 text-white"
                        : "bg-red-50 border-red-300 text-gray-900"
                      : verifiedUser
                      ? theme === "dark"
                        ? "bg-green-900/20 border-green-500 text-white"
                        : "bg-green-50 border-green-300 text-gray-900"
                      : theme === "dark"
                      ? "bg-gray-800/60 border-gray-700 text-white"
                      : "bg-white border-gray-200 text-gray-900"
                  }`}
                  disabled={isVerifying || isCreating}
                />
                <Button
                  onClick={handleVerifyUserId}
                  disabled={!bettingUserId || isVerifying || isCreating}
                  className={`h-12 px-6 rounded-xl font-semibold ${
                    theme === "dark"
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-blue-500 hover:bg-blue-600 text-white"
                  }`}
                >
                  {isVerifying ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Vérifier"
                  )}
                </Button>
              </div>

              {/* Verification Status */}
              {verifiedUser && (
                <div
                  className={`mt-3 p-3 rounded-xl flex items-center gap-2 ${
                    theme === "dark" ? "bg-green-500/20" : "bg-green-100"
                  }`}
                >
                  <CheckCircle
                    className={`w-5 h-5 ${
                      theme === "dark" ? "text-green-400" : "text-green-600"
                    }`}
                  />
                  <div>
                    <p
                      className={`text-sm font-semibold ${
                        theme === "dark" ? "text-green-400" : "text-green-600"
                      }`}
                    >
                      ID Vérifié
                    </p>
                    {verifiedUser.Name && (
                      <p
                        className={`text-xs ${
                          theme === "dark" ? "text-green-300" : "text-green-700"
                        }`}
                      >
                        {verifiedUser.Name}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Error Message */}
              {idValidationError && (
                <div
                  className={`mt-3 p-3 rounded-xl flex items-center gap-2 ${
                    theme === "dark" ? "bg-red-500/20" : "bg-red-100"
                  }`}
                >
                  <AlertCircle
                    className={`w-5 h-5 ${
                      theme === "dark" ? "text-red-400" : "text-red-600"
                    }`}
                  />
                  <p
                    className={`text-sm font-semibold ${
                      theme === "dark" ? "text-red-400" : "text-red-600"
                    }`}
                  >
                    {idValidationError}
                  </p>
                </div>
              )}

              {/* Verification Loading */}
              {isVerifying && !verifiedUser && !idValidationError && (
                <div
                  className={`mt-3 p-3 rounded-xl flex items-center gap-2 ${
                    theme === "dark" ? "bg-blue-500/20" : "bg-blue-100"
                  }`}
                >
                  <Loader2 className={`w-5 h-5 animate-spin ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`} />
                  <p
                    className={`text-sm font-semibold ${
                      theme === "dark" ? "text-blue-400" : "text-blue-600"
                    }`}
                  >
                    Vérification en cours...
                  </p>
                </div>
              )}
            </div>

            {/* Withdrawal Code */}
            <div>
              <label
                className={`block text-sm font-semibold mb-2 ${
                  theme === "dark" ? "text-gray-200" : "text-gray-800"
                }`}
              >
                Code de Retrait
              </label>
              <Input
                type="text"
                value={withdrawalCode}
                onChange={(e) => setWithdrawalCode(e.target.value)}
                placeholder="Entrez le code de retrait"
                className={`h-14 rounded-xl text-lg font-semibold ${
                  theme === "dark"
                    ? "bg-gray-800/60 border-gray-700 text-white"
                    : "bg-white border-gray-200 text-gray-900"
                }`}
                disabled={isCreating}
              />
              <p
                className={`mt-2 text-xs ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Le code de retrait est fourni par la plateforme de paris
              </p>
            </div>

            {/* Submit Button */}
            <Button
              onClick={() => setShowConfirmation(true)}
              disabled={!bettingUserId || !withdrawalCode || isCreating}
              className={`w-full h-14 rounded-xl text-lg font-bold ${
                theme === "dark"
                  ? "bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white"
                  : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <TrendingDown className="w-6 h-6 mr-2" />
              Continuer
            </Button>
          </div>
        ) : (
          /* Confirmation Screen */
          <div className="space-y-6">
            <Card
              className={`p-6 rounded-2xl border ${
                theme === "dark"
                  ? "bg-gray-800/60 border-gray-700/50 backdrop-blur-sm"
                  : "bg-white/80 border-gray-200/50 backdrop-blur-sm shadow-sm"
              }`}
            >
              <h2
                className={`text-lg font-bold mb-4 ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Confirmer le Retrait
              </h2>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-sm ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Plateforme
                  </span>
                  <span
                    className={`font-semibold ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {platform.name}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span
                    className={`text-sm ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    ID Utilisateur
                  </span>
                  <span
                    className={`font-semibold ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {bettingUserId}
                  </span>
                </div>

                <div
                  className={`h-px ${
                    theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                  }`}
                ></div>

                <div className="flex items-center justify-between">
                  <span
                    className={`text-sm ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Code de Retrait
                  </span>
                  <span
                    className={`text-xl font-bold ${
                      theme === "dark" ? "text-orange-400" : "text-orange-600"
                    }`}
                  >
                    {withdrawalCode}
                  </span>
                </div>
              </div>

              <div
                className={`mt-4 p-3 rounded-xl flex items-start gap-2 ${
                  theme === "dark" ? "bg-orange-500/20" : "bg-orange-100"
                }`}
              >
                <AlertCircle
                  className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                    theme === "dark" ? "text-orange-400" : "text-orange-600"
                  }`}
                />
                <p
                  className={`text-xs ${
                    theme === "dark" ? "text-orange-300" : "text-orange-700"
                  }`}
                >
                  Assurez-vous que le code de retrait est correct. Cette action ajoutera
                  des fonds à votre compte.
                </p>
              </div>
            </Card>

            <div className="flex gap-3">
              <Button
                onClick={() => setShowConfirmation(false)}
                disabled={isCreating}
                variant="outline"
                className={`flex-1 h-14 rounded-xl text-lg font-bold ${
                  theme === "dark"
                    ? "border-gray-700 text-gray-300 hover:bg-gray-800"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Retour
              </Button>
              <Button
                onClick={handleCreateWithdrawal}
                disabled={isCreating}
                className={`flex-1 h-14 rounded-xl text-lg font-bold ${
                  theme === "dark"
                    ? "bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white"
                    : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white"
                }`}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                    Traitement...
                  </>
                ) : (
                  "Confirmer"
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

