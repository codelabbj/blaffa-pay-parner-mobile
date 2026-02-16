"use client"

// import { MouseEvent } from "lucide-react"
import { CreditCard, Gamepad2, ArrowLeft, Smartphone } from "lucide-react"
import { useTheme } from "@/lib/contexts"
import { User } from "@/lib/auth"

interface TransactionTypeSelectionScreenProps {
  transactionType: "deposit" | "withdraw"
  onNavigateBack: () => void
  onSelectMobileMoney: () => void
  onSelectBetting: () => void
  user?: User
}

export function TransactionTypeSelectionScreen({
  transactionType,
  onNavigateBack,
  onSelectMobileMoney,
  onSelectBetting,
  user,
}: TransactionTypeSelectionScreenProps) {
  const { theme } = useTheme()

  const isDeposit = transactionType === "deposit"
  const actionText = isDeposit ? "Dépôt" : "Retrait"
  
  // Permission checks - default to true if not specified
  const canUseMomoPay = user?.can_use_momo_pay !== false
  const canUseMobcashBetting = user?.can_use_mobcash_betting !== false
  const canUseTransfer = user?.can_use_transfer !== false
  const canProcessUSSDTransaction = user?.can_process_ussd_transaction !== false
  
  return (
    <div
      className={`h-full relative overflow-hidden flex flex-col ${
        theme === "dark"
          ? "bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900"
          : "bg-gradient-to-b from-blue-50 via-white to-blue-50"
      }`}
    >
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute top-20 right-4 w-40 h-40 rounded-full opacity-10 ${
            theme === "dark" ? "bg-blue-500" : "bg-blue-300"
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
      <div className="relative z-10 px-4 pt-12 pb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateBack}
              className={`h-11 w-11 rounded-xl transition-all duration-200 active:scale-95 ${
                theme === "dark"
                  ? "text-gray-300 hover:bg-white/10 active:bg-white/20"
                  : "text-gray-600 hover:bg-black/5 active:bg-black/10"
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1
                className={`text-2xl font-bold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
            Choisir le Type de {actionText}
              </h1>
              <p
                className={`text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
            Sélectionnez votre méthode de transaction
              </p>
            </div>
          </div>
        </div>

        {/* Selection Cards */}
        <div className="space-y-4 flex-1">
          {/* Mobile Money Option */}
          {canUseMomoPay && canProcessUSSDTransaction && (
            <button
              onClick={onSelectMobileMoney}
              className={`w-full p-6 rounded-2xl border transition-all duration-300 active:scale-95 ${
                theme === "dark"
                  ? "bg-gray-800/60 border-gray-700/50 backdrop-blur-sm hover:bg-gray-700/60"
                  : "bg-white/80 border-gray-200/50 backdrop-blur-sm shadow-sm hover:shadow-md hover:bg-white"
              }`}
            >
            <div className="flex items-start gap-4">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                  theme === "dark"
                    ? "bg-gradient-to-br from-blue-600 to-cyan-600"
                    : "bg-gradient-to-br from-blue-500 to-cyan-500"
                }`}
              >
                <Smartphone className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1 text-left">
                <h3
                  className={`text-xl font-bold mb-2 ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  Mobile Money
                </h3>
                <p
                  className={`text-sm mb-4 ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {isDeposit
                    ? "Effectuez des dépôts via votre compte mobile money"
                    : "Retirez vos fonds vers votre compte mobile money"}
                </p>
                <div className="flex items-center gap-2">
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      theme === "dark"
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    Instantané
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      theme === "dark"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-green-100 text-green-600"
                    }`}
                  >
                    24/7 Disponible
                  </div>
                </div>
              </div>
            </div>
          </button>
          )}

          {/* Betting Option */}
          {canUseMobcashBetting && (
            <button
            onClick={onSelectBetting}
            className={`w-full p-6 rounded-2xl border transition-all duration-300 active:scale-95 ${
              theme === "dark"
                ? "bg-gray-800/60 border-gray-700/50 backdrop-blur-sm hover:bg-gray-700/60"
                : "bg-white/80 border-gray-200/50 backdrop-blur-sm shadow-sm hover:shadow-md hover:bg-white"
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                  theme === "dark"
                    ? "bg-gradient-to-br from-purple-600 to-indigo-600"
                    : "bg-gradient-to-br from-purple-500 to-indigo-500"
                }`}
              >
                <Gamepad2 className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1 text-left">
                <h3
                  className={`text-xl font-bold mb-2 ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  MobCash (Paris Sportifs)
                </h3>
                <p
                  className={`text-sm mb-4 ${
                    theme === "dark"
                      ? "text-gray-400"
                      : "text-gray-600"
                  }`}
                >
                  {isDeposit
                    ? "Effectuez des dépôts sur vos plateformes de paris autorisées"
                    : "Retirez vos gains des plateformes de paris"}
                </p>
                <div className="flex items-center gap-2">
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      theme === "dark"
                        ? "bg-purple-500/20 text-purple-400"
                        : "bg-purple-100 text-purple-600"
                    }`}
                  >
                    Plateformes
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      theme === "dark"
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    Commissions
                  </div>
                </div>
              </div>
            </div>
          </button>
          )}

          {/* No options available message */}
          {(!canUseMomoPay || !canProcessUSSDTransaction) && !canUseMobcashBetting && (
            <div className={`p-6 rounded-2xl border text-center ${
              theme === "dark"
                ? "bg-gray-800/60 border-gray-700/50 backdrop-blur-sm"
                : "bg-white/80 border-gray-200/50 backdrop-blur-sm shadow-sm"
            }`}>
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                theme === "dark"
                  ? "bg-gray-700/50"
                  : "bg-gray-100"
              }`}>
                <CreditCard className={`w-8 h-8 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`} />
              </div>
              <h3 className={`text-xl font-bold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                Aucune option disponible
              </h3>
              <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                {!canProcessUSSDTransaction 
                  ? "Vous n'avez pas les permissions nécessaires pour les transactions USSD. Contactez votre administrateur."
                  : "Vous n'avez pas les permissions nécessaires pour effectuer des transactions."
                }
              </p>
            </div>
          )}
        </div>

        {/* Information Card */}
        <div
          className={`mt-6 p-4 rounded-2xl ${
            theme === "dark" ? "bg-blue-900/20" : "bg-blue-50"
          }`}
        >
          <div className="flex items-start gap-3">
            <CreditCard
              className={`w-5 h-5 mt-0.5 ${
                theme === "dark" ? "text-blue-400" : "text-blue-600"
              }`}
            />
            <div>
              <h4
                className={`font-semibold mb-1 ${
                  theme === "dark" ? "text-blue-400" : "text-blue-700"
                }`}
              >
                Information importante
              </h4>
              <p
                className={`text-xs ${
                  theme === "dark" ? "text-blue-300" : "text-blue-600"
                }`}
              >
                {isDeposit
                  ? "Les dépôts MobCash sont directement liés aux plateformes de paris autorisées. Assurez-vous d'avoir les bons identifiants."
                  : "Les	retraits MobCash nécessitent les codes de retrait générés par les plateformes de paris."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

