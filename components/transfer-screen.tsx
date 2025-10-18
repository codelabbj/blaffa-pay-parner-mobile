"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ErrorAlert } from "@/components/ui/error-alert"
import { ArrowLeft, Send, Search, User as UserIcon, CheckCircle, AlertCircle, Loader2, RefreshCw } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useTheme } from "@/lib/contexts"
import { useTranslation } from "@/lib/contexts"
import { useAuth } from "@/lib/contexts"
import { authService } from "@/lib/auth"
import { transferService, User } from "@/lib/transfers"
import { parseBackendError, formatErrorMessage } from "@/lib/error-utils"
import { formatNumberWithSpaces } from "@/lib/utils"

interface TransferScreenProps {
  onNavigateBack: () => void
}

export function TransferScreen({ onNavigateBack }: TransferScreenProps) {
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedReceiver, setSelectedReceiver] = useState<User | null>(null)
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  
  // Pull-to-refresh state
  const [pullToRefreshState, setPullToRefreshState] = useState({
    isPulling: false,
    pullDistance: 0,
    isRefreshing: false,
    startY: 0,
    currentY: 0,
    canPull: true
  })
  
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const { theme } = useTheme()
  const { t } = useTranslation()

  // Search for partners with debouncing
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (searchQuery.length >= 2) {
      searchTimeoutRef.current = setTimeout(async () => {
        await searchUsers(searchQuery)
      }, 300)
    } else {
      setSearchResults([])
      setShowSearchResults(false)
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery])

  const searchUsers = async (query: string) => {
    if (!query || query.length < 2) return

    setIsSearching(true)
    setError("")
    
    try {
      const accessToken = authService.getAccessToken()
      if (!accessToken) {
        throw new Error("No access token available")
      }

      const response = await transferService.searchUsers(accessToken, query)
      setSearchResults(response.results)
      setShowSearchResults(true)
    } catch (error) {
      console.error('Search users error:', error)
      const parsedError = parseBackendError(error)
      const formattedMessage = formatErrorMessage(parsedError)
      setError(formattedMessage)
    } finally {
      setIsSearching(false)
    }
  }

  const selectReceiver = (user: User) => {
    setSelectedReceiver(user)
    setSearchQuery(user.display_name)
    setShowSearchResults(false)
    setError("")
  }

  const clearReceiver = () => {
    setSelectedReceiver(null)
    setSearchQuery("")
    setSearchResults([])
    setShowSearchResults(false)
  }

  const handleSendTransfer = async () => {
    if (!amount || !selectedReceiver || !description) {
      setError("Veuillez remplir tous les champs")
      return
    }

    setIsProcessing(true)
    setError("")
    
    try {
      const accessToken = authService.getAccessToken()
      if (!accessToken) {
        throw new Error("No access token available")
      }

      console.log('Sending transfer with:', {
        receiver_uid: selectedReceiver.uid,
        amount: amount,
        description: description
      })

      const response = await transferService.sendTransfer(accessToken, {
        receiver_uid: selectedReceiver.uid,
        amount: amount,
        description: description
      })
      
      setSuccess(true)
      // Clear form
      setAmount("")
      setDescription("")
      clearReceiver()
      
      
      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    } catch (error) {
      console.error('Send transfer error:', error)
      
      // Handle specific API error responses
      if (error instanceof Error && error.message.includes('{')) {
        try {
          const errorData = JSON.parse(error.message)
          let errorMessages = []
          
          // Handle receiver_uid errors
          if (errorData.receiver_uid) {
            errorMessages.push(...errorData.receiver_uid)
          }
          
          // Handle amount errors
          if (errorData.amount) {
            errorMessages.push(...errorData.amount)
          }
          
          // Handle description errors
          if (errorData.description) {
            errorMessages.push(...errorData.description)
          }
          
          // Handle other field errors
          Object.keys(errorData).forEach(key => {
            if (key !== 'receiver_uid' && key !== 'amount' && key !== 'description' && Array.isArray(errorData[key])) {
              errorMessages.push(...errorData[key])
            }
          })
          
          setError(errorMessages.join('. '))
        } catch (parseError) {
          // Fallback to original error handling
          const parsedError = parseBackendError(error)
          const formattedMessage = formatErrorMessage(parsedError)
          setError(formattedMessage)
        }
      } else {
        // Fallback to original error handling
        const parsedError = parseBackendError(error)
        const formattedMessage = formatErrorMessage(parsedError)
        setError(formattedMessage)
      }
    } finally {
      setIsProcessing(false)
    }
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
        <div className={`absolute top-20 right-4 w-32 h-32 rounded-full opacity-20 ${
          theme === "dark" ? "bg-orange-500" : "bg-orange-300"
        } blur-2xl animate-pulse`}></div>
        <div className={`absolute bottom-40 left-4 w-40 h-40 rounded-full opacity-20 ${
          theme === "dark" ? "bg-blue-500" : "bg-blue-300"
        } blur-2xl animate-pulse`} style={{animationDelay: '1.5s'}}></div>
      </div>

      {/* Mobile-first header with safe area */}
      <div className="relative z-10 px-4 pt-safe-area-inset-top pt-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
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
              Transfert UV
            </h1>
            <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              Envoyer de l'argent à un partenaire
            </p>
          </div>
          
          <div className={`p-2.5 rounded-xl ${
            theme === "dark" ? "bg-orange-500/20 text-orange-400" : "bg-orange-100 text-orange-600"
          }`}>
            <Send className="w-5 h-5" />
          </div>
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-1 rounded-full transition-all duration-300 ${
              selectedReceiver ? "bg-green-500" : theme === "dark" ? "bg-orange-500" : "bg-orange-600"
            }`}></div>
            <div className={`w-8 h-1 rounded-full transition-all duration-300 ${
              amount ? "bg-green-500" : theme === "dark" ? "bg-gray-600" : "bg-gray-300"
            }`}></div>
            <div className={`w-8 h-1 rounded-full transition-all duration-300 ${
              description ? "bg-green-500" : theme === "dark" ? "bg-gray-600" : "bg-gray-300"
            }`}></div>
          </div>
        </div>
      </div>

      {/* Scrollable content area */}
      <div className="relative z-10 px-4 pb-24 max-h-screen overflow-y-auto">
        <div className="space-y-6">
          {/* Receiver Search Card */}
          <div className={`p-5 rounded-2xl border transition-all duration-300 ${
            theme === "dark" 
              ? "bg-gray-800/60 border-gray-700/50 backdrop-blur-sm" 
              : "bg-white/80 border-gray-200/50 backdrop-blur-sm shadow-sm"
          }`}>
            <Label className={`text-sm font-semibold mb-3 flex items-center gap-2 ${
              theme === "dark" ? "text-gray-200" : "text-gray-800"
            }`}>
              <div className={`p-1.5 rounded-lg ${
                theme === "dark" ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600"
              }`}>
                <UserIcon className="w-4 h-4" />
              </div>
              Destinataire
            </Label>
            
            <div className="relative">
              <div className="relative">
                {/* <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`} /> */}
                <Input
                  type="text"
                  placeholder="Rechercher un utilisateur..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`pl-12 h-14 text-lg font-medium rounded-xl border-2 transition-all duration-300 ${
                    theme === "dark" 
                      ? "bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:bg-gray-700" 
                      : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:bg-white"
                  }`}
                />
                {isSearching && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  </div>
                )}
              </div>

              {/* Search Results Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div className={`absolute top-full left-0 right-0 mt-2 rounded-xl border shadow-xl z-50 max-h-60 overflow-y-auto ${
                  theme === "dark" 
                    ? "bg-gray-800/95 border-gray-700/50 backdrop-blur-lg" 
                    : "bg-white/95 border-gray-200/50 backdrop-blur-lg"
                }`}>
                  {searchResults.map((user) => (
                    <button
                      key={user.uid}
                      onClick={() => selectReceiver(user)}
                      className={`w-full flex items-center gap-3 p-4 text-left hover:bg-opacity-50 transition-colors ${
                        theme === "dark" 
                          ? "hover:bg-gray-700/50 text-gray-200" 
                          : "hover:bg-gray-100 text-gray-900"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                      }`}>
                        <UserIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{user.display_name}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* No results message */}
              {showSearchResults && searchResults.length === 0 && !isSearching && searchQuery.length >= 2 && (
                <div className={`absolute top-full left-0 right-0 mt-2 p-4 rounded-xl border z-50 ${
                  theme === "dark" 
                    ? "bg-gray-800/95 border-gray-700/50 backdrop-blur-lg" 
                    : "bg-white/95 border-gray-200/50 backdrop-blur-lg"
                }`}>
                  <p className={`text-sm text-center ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    Aucun utilisateur trouvé. Veuillez saisir un nom existant.
                  </p>
                </div>
              )}
            </div>

            {/* Selected Receiver */}
            {selectedReceiver && (
              <div className={`mt-4 p-4 rounded-xl border ${
                theme === "dark" 
                  ? "bg-green-900/20 border-green-700/50" 
                  : "bg-green-50 border-green-200"
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      theme === "dark" ? "bg-green-700" : "bg-green-200"
                    }`}>
                      <UserIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className={`font-semibold ${theme === "dark" ? "text-green-400" : "text-green-700"}`}>
                        {selectedReceiver.display_name}
                      </p>
                      <p className={`text-sm ${theme === "dark" ? "text-green-300" : "text-green-600"}`}>
                        ID: {selectedReceiver.uid}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearReceiver}
                    className={`h-8 w-8 p-0 rounded-lg ${
                      theme === "dark" 
                        ? "text-green-400 hover:bg-green-800/30" 
                        : "text-green-600 hover:bg-green-100"
                    }`}
                  >
                    ×
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Amount Card */}
          <div className={`p-5 rounded-2xl border transition-all duration-300 ${
            theme === "dark" 
              ? "bg-gray-800/60 border-gray-700/50 backdrop-blur-sm" 
              : "bg-white/80 border-gray-200/50 backdrop-blur-sm shadow-sm"
          }`}>
            <Label className={`text-sm font-semibold mb-3 flex items-center gap-2 ${
              theme === "dark" ? "text-gray-200" : "text-gray-800"
            }`}>
              <div className={`p-1.5 rounded-lg ${
                theme === "dark" ? "bg-green-500/20 text-green-400" : "bg-green-100 text-green-600"
              }`}>
                <Send className="w-4 h-4" />
              </div>
              Montant
            </Label>
            

            {/* Amount input */}
            <div className="relative">
              <span className={`absolute left-4 top-1/2 transform -translate-y-1/2 text-sm font-semibold ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}>
                FCFA
              </span>
              <Input
                type="number"
                inputMode="numeric"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`pl-16 h-16 text-xl font-bold rounded-xl border-2 transition-all duration-300 ${
                  theme === "dark" 
                    ? "bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-green-500 focus:bg-gray-700" 
                    : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500 focus:border-green-500 focus:bg-white"
                }`}
              />
            </div>
          </div>

          {/* Description Card */}
          <div className={`p-5 rounded-2xl border transition-all duration-300 ${
            theme === "dark" 
              ? "bg-gray-800/60 border-gray-700/50 backdrop-blur-sm" 
              : "bg-white/80 border-gray-200/50 backdrop-blur-sm shadow-sm"
          }`}>
            <Label className={`text-sm font-semibold mb-3 flex items-center gap-2 ${
              theme === "dark" ? "text-gray-200" : "text-gray-800"
            }`}>
              <div className={`p-1.5 rounded-lg ${
                theme === "dark" ? "bg-purple-500/20 text-purple-400" : "bg-purple-100 text-purple-600"
              }`}>
                <AlertCircle className="w-4 h-4" />
              </div>
              Description
            </Label>
            <Input
              type="text"
              placeholder="Remboursement dîner"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`h-14 text-lg font-medium rounded-xl border-2 transition-all duration-300 ${
                theme === "dark" 
                  ? "bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-purple-500 focus:bg-gray-700" 
                  : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500 focus:border-purple-500 focus:bg-white"
              }`}
            />
          </div>

          {/* Status Messages */}
          <ErrorAlert
            error={error}
            type="error"
            title="Erreur de transfert"
            onDismiss={() => setError("")}
          />

          {success && (
            <div className={`flex items-center gap-3 p-4 rounded-xl border animate-in slide-in-from-top-2 ${
              theme === "dark" 
                ? "bg-green-900/20 border-green-700/50 backdrop-blur-sm" 
                : "bg-green-50 border-green-200/50 backdrop-blur-sm"
            }`}>
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className={`text-sm font-medium ${theme === "dark" ? "text-green-400" : "text-green-600"}`}>
                Transfert effectué avec succès
              </span>
            </div>
          )}

        </div>
      </div>

      {/* Fixed bottom button */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 p-4 ${
        theme === "dark" 
          ? "bg-slate-900/95 border-t border-gray-700/50" 
          : "bg-white/95 border-t border-gray-200/50"
      } backdrop-blur-lg`}>
        <Button
          onClick={handleSendTransfer}
          disabled={!amount || !selectedReceiver || !description || isProcessing}
          className={`w-full h-14 text-lg font-bold rounded-2xl transition-all duration-200 active:scale-98 ${
            !amount || !selectedReceiver || !description || isProcessing
              ? "bg-gray-400/50 cursor-not-allowed text-gray-600"
              : "bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 shadow-lg shadow-orange-500/25"
          }`}
        >
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Envoi en cours...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              <span>Envoyer le transfert</span>
            </div>
          )}
        </Button>
      </div>
    </div>
  )
}
