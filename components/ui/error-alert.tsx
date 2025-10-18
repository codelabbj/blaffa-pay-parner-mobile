"use client"

import React from "react"
import { AlertCircle, X, AlertTriangle, Info, CheckCircle } from "lucide-react"
import { Button } from "./button"
import { cn } from "@/lib/utils"

export interface ErrorAlertProps {
  error?: string | string[]
  type?: "error" | "warning" | "info" | "success"
  title?: string
  onDismiss?: () => void
  className?: string
  showIcon?: boolean
}

export function ErrorAlert({
  error,
  type = "error",
  title,
  onDismiss,
  className,
  showIcon = true
}: ErrorAlertProps) {
  if (!error || (Array.isArray(error) && error.length === 0)) {
    return null
  }

  const errorMessage = Array.isArray(error) ? error.join(", ") : error

  const getIcon = () => {
    if (!showIcon) return null
    
    switch (type) {
      case "error":
        return <AlertCircle className="w-5 h-5" />
      case "warning":
        return <AlertTriangle className="w-5 h-5" />
      case "info":
        return <Info className="w-5 h-5" />
      case "success":
        return <CheckCircle className="w-5 h-5" />
      default:
        return <AlertCircle className="w-5 h-5" />
    }
  }

  const getStyles = () => {
    switch (type) {
      case "error":
        return {
          container: "border-red-500/50 bg-red-500/10 text-red-400",
          icon: "text-red-400",
          title: "text-red-300"
        }
      case "warning":
        return {
          container: "border-yellow-500/50 bg-yellow-500/10 text-yellow-400",
          icon: "text-yellow-400",
          title: "text-yellow-300"
        }
      case "info":
        return {
          container: "border-blue-500/50 bg-blue-500/10 text-blue-400",
          icon: "text-blue-400",
          title: "text-blue-300"
        }
      case "success":
        return {
          container: "border-green-500/50 bg-green-500/10 text-green-400",
          icon: "text-green-400",
          title: "text-green-300"
        }
      default:
        return {
          container: "border-red-500/50 bg-red-500/10 text-red-400",
          icon: "text-red-400",
          title: "text-red-300"
        }
    }
  }

  const styles = getStyles()

  return (
    <div className={cn(
      "p-4 rounded-xl border transition-all duration-200",
      styles.container,
      className
    )}>
      <div className="flex items-start gap-3">
        {showIcon && (
          <div className={cn("flex-shrink-0 mt-0.5", styles.icon)}>
            {getIcon()}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className={cn("text-sm font-semibold mb-1", styles.title)}>
              {title}
            </h4>
          )}
          <p className="text-sm leading-relaxed break-words">
            {errorMessage}
          </p>
        </div>
        
        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            className="flex-shrink-0 h-6 w-6 p-0 hover:bg-transparent"
            onClick={onDismiss}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  )
}

// Light theme variant
export function ErrorAlertLight({
  error,
  type = "error",
  title,
  onDismiss,
  className,
  showIcon = true
}: ErrorAlertProps) {
  if (!error || (Array.isArray(error) && error.length === 0)) {
    return null
  }

  const errorMessage = Array.isArray(error) ? error.join(", ") : error

  const getIcon = () => {
    if (!showIcon) return null
    
    switch (type) {
      case "error":
        return <AlertCircle className="w-5 h-5" />
      case "warning":
        return <AlertTriangle className="w-5 h-5" />
      case "info":
        return <Info className="w-5 h-5" />
      case "success":
        return <CheckCircle className="w-5 h-5" />
      default:
        return <AlertCircle className="w-5 h-5" />
    }
  }

  const getStyles = () => {
    switch (type) {
      case "error":
        return {
          container: "border-red-200 bg-red-50 text-red-600",
          icon: "text-red-600",
          title: "text-red-700"
        }
      case "warning":
        return {
          container: "border-yellow-200 bg-yellow-50 text-yellow-600",
          icon: "text-yellow-600",
          title: "text-yellow-700"
        }
      case "info":
        return {
          container: "border-blue-200 bg-blue-50 text-blue-600",
          icon: "text-blue-600",
          title: "text-blue-700"
        }
      case "success":
        return {
          container: "border-green-200 bg-green-50 text-green-600",
          icon: "text-green-600",
          title: "text-green-700"
        }
      default:
        return {
          container: "border-red-200 bg-red-50 text-red-600",
          icon: "text-red-600",
          title: "text-red-700"
        }
    }
  }

  const styles = getStyles()

  return (
    <div className={cn(
      "p-4 rounded-xl border transition-all duration-200",
      styles.container,
      className
    )}>
      <div className="flex items-start gap-3">
        {showIcon && (
          <div className={cn("flex-shrink-0 mt-0.5", styles.icon)}>
            {getIcon()}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className={cn("text-sm font-semibold mb-1", styles.title)}>
              {title}
            </h4>
          )}
          <p className="text-sm leading-relaxed break-words">
            {errorMessage}
          </p>
        </div>
        
        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            className="flex-shrink-0 h-6 w-6 p-0 hover:bg-transparent"
            onClick={onDismiss}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
