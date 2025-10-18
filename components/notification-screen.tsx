"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  ArrowLeft,
  Bell,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Info,
  Clock,
  TrendingUp,
  TrendingDown,
  Battery,
  Send,
  X,
} from "lucide-react"
import { useTheme } from "@/lib/contexts"
import { useTranslation } from "@/lib/contexts"
import { useToast } from "@/hooks/use-toast"
import { formatNumberWithSpaces } from "@/lib/utils"

interface NotificationScreenProps {
  onNavigateBack: () => void
}

interface Notification {
  id: string
  type: 'transaction' | 'system' | 'promotion' | 'alert'
  title: string
  message: string
  timestamp: string
  isRead: boolean
  priority: 'low' | 'medium' | 'high'
  actionUrl?: string
  transactionData?: {
    type: 'deposit' | 'withdraw'
    amount: string
    status: string
    reference: string
  }
}

export function NotificationScreen({ onNavigateBack }: NotificationScreenProps) {
  const { theme } = useTheme()
  const { t } = useTranslation()
  const { toast } = useToast()

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread' | 'transaction' | 'system'>('all')

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    setIsLoading(true)
    try {
      // TODO: Replace with actual API call when available
      // const response = await fetch('/api/notifications')
      // const data = await response.json()
      // setNotifications(data.notifications || [])
      
      // For now, set empty array since API is not available
      setNotifications([])
    } catch (error) {
      console.error('Load notifications error:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les notifications",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      // TODO: Replace with actual API call when available
      // await fetch(`/api/notifications/${notificationId}/read`, { method: 'POST' })
      
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, isRead: true }
            : notif
        )
      )
    } catch (error) {
      console.error('Mark as read error:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      // TODO: Replace with actual API call when available
      // await fetch('/api/notifications/read-all', { method: 'POST' })
      
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      )
      
      toast({
        title: "Succès",
        description: "Toutes les notifications ont été marquées comme lues",
      })
    } catch (error) {
      console.error('Mark all as read error:', error)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      // TODO: Replace with actual API call when available
      // await fetch(`/api/notifications/${notificationId}`, { method: 'DELETE' })
      
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId))
      
      toast({
        title: "Notification supprimée",
        description: "La notification a été supprimée",
      })
    } catch (error) {
      console.error('Delete notification error:', error)
    }
  }

  const getNotificationIcon = (type: string, priority: string) => {
    const iconClass = `w-5 h-5 ${
      priority === 'high' 
        ? theme === "dark" ? "text-red-400" : "text-red-600"
        : priority === 'medium'
        ? theme === "dark" ? "text-yellow-400" : "text-yellow-600"
        : theme === "dark" ? "text-blue-400" : "text-blue-600"
    }`

    switch (type) {
      case 'transaction':
        return <TrendingUp className={iconClass} />
      case 'system':
        return <Info className={iconClass} />
      case 'promotion':
        return <Bell className={iconClass} />
      case 'alert':
        return <AlertCircle className={iconClass} />
      default:
        return <Bell className={iconClass} />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return theme === "dark" ? "bg-red-500/20 text-red-400" : "bg-red-100 text-red-600"
      case 'medium':
        return theme === "dark" ? "bg-yellow-500/20 text-yellow-400" : "bg-yellow-100 text-yellow-600"
      case 'low':
        return theme === "dark" ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600"
      default:
        return theme === "dark" ? "bg-gray-500/20 text-gray-400" : "bg-gray-100 text-gray-600"
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) {
      return "À l'instant"
    } else if (diffInMinutes < 60) {
      return `Il y a ${diffInMinutes} min`
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60)
      return `Il y a ${hours}h`
    } else {
      const days = Math.floor(diffInMinutes / 1440)
      return `Il y a ${days} jour${days > 1 ? 's' : ''}`
    }
  }

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.isRead
      case 'transaction':
        return notification.type === 'transaction'
      case 'system':
        return notification.type === 'system'
      default:
        return true
    }
  })

  const unreadCount = notifications.filter(n => !n.isRead).length

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
      <div className="relative z-10 px-3 sm:px-4 pt-12 pb-4 sm:pb-6">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onNavigateBack}
              className={`h-10 w-10 sm:h-11 sm:w-11 p-0 rounded-xl active:scale-95 transition-all duration-200 ${
                theme === "dark"
                  ? "text-gray-300 hover:bg-white/10 active:bg-white/20"
                  : "text-gray-600 hover:bg-black/5 active:bg-black/10"
              }`}
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <div>
              <h1
                className={`text-xl sm:text-2xl font-bold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Notifications
              </h1>
              <p
                className={`text-xs sm:text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {unreadCount > 0 ? `${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}` : "Toutes les notifications sont lues"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                className={`h-8 sm:h-9 px-2 sm:px-3 rounded-xl text-xs font-semibold ${
                  theme === "dark"
                    ? "border-gray-700 text-gray-300 hover:bg-gray-700"
                    : "border-gray-200 text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span className="hidden sm:inline">Tout marquer comme lu</span>
                <span className="sm:hidden">Tout lu</span>
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={loadNotifications}
              disabled={isLoading}
              className={`h-10 w-10 sm:h-11 sm:w-11 p-0 rounded-xl active:scale-95 transition-all duration-200 ${
                theme === "dark"
                  ? "text-gray-300 hover:bg-white/10 active:bg-white/20"
                  : "text-gray-600 hover:bg-black/5 active:bg-black/10"
              }`}
            >
              <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 sm:gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2">
          {[
            { key: 'all', label: 'Toutes', shortLabel: 'Toutes' },
            { key: 'unread', label: 'Non lues', shortLabel: 'Non lues' },
            { key: 'transaction', label: 'Transactions', shortLabel: 'Trans.' },
            { key: 'system', label: 'Système', shortLabel: 'Système' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                filter === tab.key
                  ? theme === "dark"
                    ? "bg-blue-600 text-white"
                    : "bg-blue-500 text-white"
                  : theme === "dark"
                  ? "bg-gray-700/50 text-gray-300 hover:bg-gray-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.shortLabel}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="relative z-10 px-3 sm:px-4 pb-24">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-6 h-6 animate-spin text-orange-500" />
          </div>
        ) : filteredNotifications.length > 0 ? (
          <div className="space-y-2 sm:space-y-3">
            {filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all duration-200 ${
                  notification.isRead
                    ? theme === "dark"
                      ? "bg-gray-800/60 border-gray-700/50 backdrop-blur-sm"
                      : "bg-white/80 border-gray-200/50 backdrop-blur-sm shadow-sm"
                    : theme === "dark"
                    ? "bg-blue-900/20 border-blue-700/50 backdrop-blur-sm"
                    : "bg-blue-50/80 border-blue-200/50 backdrop-blur-sm shadow-sm"
                }`}
              >
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 ${
                    theme === "dark" ? "bg-gray-700/50" : "bg-gray-100"
                  }`}>
                    {getNotificationIcon(notification.type, notification.priority)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1 sm:mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 sm:gap-2 mb-1">
                          <h3
                            className={`font-semibold text-sm sm:text-sm ${
                              notification.isRead
                                ? theme === "dark" ? "text-gray-300" : "text-gray-700"
                                : theme === "dark" ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {notification.title}
                          </h3>
                          {!notification.isRead && (
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                          )}
                        </div>
                        
                        <p
                          className={`text-xs sm:text-sm mb-1 sm:mb-2 ${
                            theme === "dark" ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                            {notification.priority === 'high' ? 'Important' : 
                             notification.priority === 'medium' ? 'Normal' : 'Faible'}
                          </span>
                          <span className={`text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                            {formatTimestamp(notification.timestamp)}
                          </span>
                        </div>
                        
                        {notification.transactionData && (
                          <div className={`mt-2 sm:mt-3 p-2 sm:p-3 rounded-lg sm:rounded-xl ${
                            theme === "dark" ? "bg-gray-700/30" : "bg-gray-50"
                          }`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1 sm:gap-2">
                                {notification.transactionData.type === 'deposit' ? (
                                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                                ) : (
                                  <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500" />
                                )}
                                <span className={`text-xs sm:text-sm font-medium ${
                                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                                }`}>
                                  {notification.transactionData.type === 'deposit' ? 'Dépôt' : 'Retrait'}
                                </span>
                              </div>
                              <div className="text-right">
                                <p className={`text-xs sm:text-sm font-bold ${
                                  notification.transactionData.type === 'deposit' 
                                    ? "text-green-500" 
                                    : "text-orange-500"
                                }`}>
                                  {notification.transactionData.type === 'deposit' ? '+' : '-'}
                                  {formatNumberWithSpaces(notification.transactionData.amount)} FCFA
                                </p>
                                <p className={`text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                                  {notification.transactionData.reference}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-0.5 sm:gap-1 ml-1 sm:ml-2">
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className={`h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-lg ${
                              theme === "dark"
                                ? "hover:bg-gray-700 text-gray-400 hover:text-gray-300"
                                : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                            }`}
                          >
                            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                          className={`h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-lg ${
                            theme === "dark"
                              ? "hover:bg-gray-700 text-gray-400 hover:text-gray-300"
                              : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                          }`}
                        >
                          <X className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12">
            <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl mx-auto mb-3 sm:mb-4 flex items-center justify-center ${
              theme === "dark" ? "bg-gray-700/50" : "bg-gray-100"
            }`}>
              <Bell className={`w-6 h-6 sm:w-8 sm:h-8 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`} />
            </div>
            <h3 className={`text-base sm:text-lg font-semibold mb-1 sm:mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              Aucune notification
            </h3>
            <p className={`text-xs sm:text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              {filter === 'unread' 
                ? "Toutes vos notifications sont lues"
                : filter === 'transaction'
                ? "Aucune notification de transaction"
                : filter === 'system'
                ? "Aucune notification système"
                : "Vous n'avez pas encore de notifications"
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
