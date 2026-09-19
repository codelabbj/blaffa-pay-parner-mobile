"use client"

import { useEffect, useState } from "react"

interface SplashScreenProps {
  onComplete: () => void
  isReady?: boolean
}

export function SplashScreen({ onComplete, isReady = false }: SplashScreenProps) {
  const [progress, setProgress] = useState(0)
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    if (completed) return

    if (isReady) {
      setProgress(100)
      const timeout = window.setTimeout(() => {
        setCompleted(true)
        onComplete()
      }, 180)
      return () => window.clearTimeout(timeout)
    }

    const timer = window.setInterval(() => {
      setProgress((prev) => (prev >= 90 ? 90 : prev + 12))
    }, 40)

    return () => window.clearInterval(timer)
  }, [isReady, onComplete, completed])

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

      <div className="w-full max-w-sm">
        <div className="bg-white/20 backdrop-blur-sm rounded-full h-2 mb-6">
          <div
            className="bg-white rounded-full h-2 transition-all duration-150 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}
