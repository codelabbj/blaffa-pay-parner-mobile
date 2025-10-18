"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  CheckCircle,
  Clock,
  RefreshCw,
  AlertCircle,
} from "lucide-react"
import { useTheme } from "@/lib/contexts"
import { useToast } from "@/hooks/use-toast"
import { authService } from "@/lib/auth"
import { bettingService, CommissionStats, UnpaidCommissionsResponse, CommissionRatesResponse, PaymentHistoryResponse } from "@/lib/betting"
import { formatNumberWithSpaces } from "@/lib/utils"

interface BettingCommissionsScreenProps {
  onNavigateBack: () => void
}

export function BettingCommissionsScreen({
  onNavigateBack,
}: BettingCommissionsScreenProps) {
  const { theme } = useTheme()
  const { toast } = useToast()

  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [isLoadingUnpaid, setIsLoadingUnpaid] = useState(true)
  const [isLoadingRates, setIsLoadingRates] = useState(true)
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const [stats, setStats] = useState<CommissionStats | null>(null)
  const [unpaidCommissions, setUnpaidCommissions] = useState<UnpaidCommissionsResponse | null>(null)
  const [rates, setRates] = useState<CommissionRatesResponse | null>(null)
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryResponse | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    await Promise.all([
      loadStats(),
      loadUnpaidCommissions(),
      loadRates(),
      loadPaymentHistory(),
    ])
  }

  const loadStats = async () => {
    setIsLoadingStats(true)
    try {
      const accessToken = authService.getAccessToken()
      if (!accessToken) {
        throw new Error("No access token available")
      }

      const data = await bettingService.getCommissionStats(accessToken)
      setStats(data)
    } catch (error) {
      console.error("Load stats error:", error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de charger les statistiques",
        variant: "destructive",
      })
    } finally {
      setIsLoadingStats(false)
    }
  }

  const loadUnpaidCommissions = async () => {
    setIsLoadingUnpaid(true)
    try {
      const accessToken = authService.getAccessToken()
      if (!accessToken) {
        throw new Error("No access token available")
      }

      const data = await bettingService.getUnpaidCommissions(accessToken)
      setUnpaidCommissions(data)
    } catch (error) {
      console.error("Load unpaid commissions error:", error)
    } finally {
      setIsLoadingUnpaid(false)
    }
  }

  const loadRates = async () => {
    setIsLoadingRates(true)
    try {
      const accessToken = authService.getAccessToken()
      if (!accessToken) {
        throw new Error("No access token available")
      }

      const data = await bettingService.getCurrentRates(accessToken)
      setRates(data)
    } catch (error) {
      console.error("Load rates error:", error)
    } finally {
      setIsLoadingRates(false)
    }
  }

  const loadPaymentHistory = async () => {
    setIsLoadingHistory(true)
    try {
      const accessToken = authService.getAccessToken()
      if (!accessToken) {
        throw new Error("No access token available")
      }

      const data = await bettingService.getPaymentHistory(accessToken)
      setPaymentHistory(data)
    } catch (error) {
      console.error("Load payment history error:", error)
    } finally {
      setIsLoadingHistory(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
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
            theme === "dark" ? "bg-emerald-500" : "bg-emerald-300"
          } blur-3xl animate-pulse`}
        ></div>
        <div
          className={`absolute bottom-60 left-4 w-32 h-32 rounded-full opacity-10 ${
            theme === "dark" ? "bg-green-500" : "bg-green-300"
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
                Commissions
              </h1>
              <p
                className={`text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Vos gains sur les transactions
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadData}
            disabled={isLoadingStats}
            className={`h-11 w-11 p-0 rounded-xl active:scale-95 transition-all duration-200 ${
              theme === "dark"
                ? "text-gray-300 hover:bg-white/10 active:bg-white/20"
                : "text-gray-600 hover:bg-black/5 active:bg-black/10"
            }`}
          >
            <RefreshCw className={`w-5 h-5 ${isLoadingStats ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card
            className={`p-4 rounded-2xl border ${
              theme === "dark"
                ? "bg-gray-800/60 border-gray-700/50 backdrop-blur-sm"
                : "bg-white/80 border-gray-200/50 backdrop-blur-sm shadow-sm"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  theme === "dark" ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-600"
                }`}
              >
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <p
                  className={`text-xs ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Total
                </p>
                <p
                  className={`text-lg font-bold ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  {stats ? formatNumberWithSpaces(stats.total_commission) : "0"}
                </p>
              </div>
            </div>
          </Card>

          <Card
            className={`p-4 rounded-2xl border ${
              theme === "dark"
                ? "bg-gray-800/60 border-gray-700/50 backdrop-blur-sm"
                : "bg-white/80 border-gray-200/50 backdrop-blur-sm shadow-sm"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  theme === "dark" ? "bg-yellow-500/20 text-yellow-400" : "bg-yellow-100 text-yellow-600"
                }`}
              >
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p
                  className={`text-xs ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Non payée
                </p>
                <p
                  className={`text-lg font-bold ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  {stats ? formatNumberWithSpaces(stats.unpaid_commission) : "0"}
                </p>
              </div>
            </div>
          </Card>

          <Card
            className={`p-4 rounded-2xl border ${
              theme === "dark"
                ? "bg-gray-800/60 border-gray-700/50 backdrop-blur-sm"
                : "bg-white/80 border-gray-200/50 backdrop-blur-sm shadow-sm"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  theme === "dark" ? "bg-green-500/20 text-green-400" : "bg-green-100 text-green-600"
                }`}
              >
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <p
                  className={`text-xs ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Payée
                </p>
                <p
                  className={`text-lg font-bold ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  {stats ? formatNumberWithSpaces(stats.paid_commission) : "0"}
                </p>
              </div>
            </div>
          </Card>

          <Card
            className={`p-4 rounded-2xl border ${
              theme === "dark"
                ? "bg-gray-800/60 border-gray-700/50 backdrop-blur-sm"
                : "bg-white/80 border-gray-200/50 backdrop-blur-sm shadow-sm"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  theme === "dark" ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600"
                }`}
              >
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p
                  className={`text-xs ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Transactions
                </p>
                <p
                  className={`text-lg font-bold ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  {stats ? stats.total_transactions : 0}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 px-4 pb-24 space-y-6">
        {/* Commission Rates */}
        {rates && (
          <div>
            <h2
              className={`text-sm font-semibold mb-3 px-2 ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              TAUX DE COMMISSION
            </h2>
            <Card
              className={`p-4 rounded-2xl border ${
                theme === "dark"
                  ? "bg-gray-800/60 border-gray-700/50 backdrop-blur-sm"
                  : "bg-white/80 border-gray-200/50 backdrop-blur-sm shadow-sm"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-sm ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Taux de dépôt
                  </span>
                  <span
                    className={`font-bold ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {rates.deposit_rate}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span
                    className={`text-sm ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Taux de retrait
                  </span>
                  <span
                    className={`font-bold ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {rates.withdrawal_rate}%
                  </span>
                </div>
              </div>
              {rates.message && (
                <div
                  className={`mt-3 p-3 rounded-xl flex items-start gap-2 ${
                    theme === "dark" ? "bg-blue-500/20" : "bg-blue-100"
                  }`}
                >
                  <AlertCircle
                    className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                      theme === "dark" ? "text-blue-400" : "text-blue-600"
                    }`}
                  />
                  <p
                    className={`text-xs ${
                      theme === "dark" ? "text-blue-300" : "text-blue-700"
                    }`}
                  >
                    {rates.message}
                  </p>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Commission by Platform */}
        {stats && stats.by_platform.length > 0 && (
          <div>
            <h2
              className={`text-sm font-semibold mb-3 px-2 ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              PAR PLATEFORME
            </h2>
            <div className="space-y-3">
              {stats.by_platform.map((platform, index) => (
                <Card
                  key={index}
                  className={`p-4 rounded-2xl border ${
                    theme === "dark"
                      ? "bg-gray-800/60 border-gray-700/50 backdrop-blur-sm"
                      : "bg-white/80 border-gray-200/50 backdrop-blur-sm shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3
                      className={`font-bold ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {platform.platform__name}
                    </h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        theme === "dark" ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {platform.count} transactions
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div
                      className={`p-2 rounded-lg ${
                        theme === "dark" ? "bg-gray-700/50" : "bg-gray-100"
                      }`}
                    >
                      <p
                        className={`text-xs ${
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Total
                      </p>
                      <p
                        className={`font-bold ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {formatNumberWithSpaces(platform.total_commission.toString())}
                      </p>
                    </div>
                    <div
                      className={`p-2 rounded-lg ${
                        theme === "dark" ? "bg-yellow-500/20" : "bg-yellow-100"
                      }`}
                    >
                      <p
                        className={`text-xs ${
                          theme === "dark" ? "text-yellow-400" : "text-yellow-600"
                        }`}
                      >
                        Non payée
                      </p>
                      <p
                        className={`font-bold ${
                          theme === "dark" ? "text-yellow-400" : "text-yellow-600"
                        }`}
                      >
                        {formatNumberWithSpaces(platform.unpaid_commission.toString())}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Payment History */}
        {paymentHistory && paymentHistory.payments.length > 0 && (
          <div>
            <h2
              className={`text-sm font-semibold mb-3 px-2 ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              HISTORIQUE DES PAIEMENTS
            </h2>
            <div className="space-y-3">
              {paymentHistory.payments.map((payment) => (
                <Card
                  key={payment.uid}
                  className={`p-4 rounded-2xl border ${
                    theme === "dark"
                      ? "bg-gray-800/60 border-gray-700/50 backdrop-blur-sm"
                      : "bg-white/80 border-gray-200/50 backdrop-blur-sm shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          theme === "dark" ? "bg-green-500/20 text-green-400" : "bg-green-100 text-green-600"
                        }`}
                      >
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <p
                          className={`font-bold ${
                            theme === "dark" ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {formatNumberWithSpaces(payment.total_amount)} FCFA
                        </p>
                        <p
                          className={`text-xs ${
                            theme === "dark" ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {payment.transaction_count} transactions
                        </p>
                      </div>
                    </div>
                  </div>
                  <div
                    className={`p-2 rounded-lg ${
                      theme === "dark" ? "bg-gray-700/50" : "bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span
                        className={theme === "dark" ? "text-gray-400" : "text-gray-600"}
                      >
                        Payé par
                      </span>
                      <span
                        className={theme === "dark" ? "text-white" : "text-gray-900"}
                      >
                        {payment.paid_by_name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span
                        className={theme === "dark" ? "text-gray-400" : "text-gray-600"}
                      >
                        Date
                      </span>
                      <span
                        className={theme === "dark" ? "text-white" : "text-gray-900"}
                      >
                        {formatDate(payment.created_at)}
                      </span>
                    </div>
                  </div>
                  {payment.notes && (
                    <p
                      className={`mt-2 text-xs ${
                        theme === "dark" ? "text-gray-500" : "text-gray-500"
                      }`}
                    >
                      {payment.notes}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

