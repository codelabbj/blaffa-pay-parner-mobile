"use client"

import { useEffect, useRef, useState } from "react"
import { BP } from "@/lib/design"

interface SplashScreenProps {
  onComplete: () => void
  isReady?: boolean
}

export function SplashScreen({ onComplete, isReady = false }: SplashScreenProps) {
  const [progress, setProgress] = useState(0)
  const completedRef = useRef(false)
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    if (completedRef.current) return

    if (isReady) {
      setProgress(100)
      const timeout = window.setTimeout(() => {
        if (completedRef.current) return
        completedRef.current = true
        onCompleteRef.current()
      }, 180)
      return () => window.clearTimeout(timeout)
    }

    const timer = window.setInterval(() => {
      setProgress((prev) => (prev >= 90 ? 90 : prev + 12))
    }, 40)

    return () => window.clearInterval(timer)
  }, [isReady])

  useEffect(() => {
    document.body.style.background = BP.navy
    document.body.style.minHeight = "100vh"

    return () => {
      document.body.style.background = ""
      document.body.style.minHeight = ""
    }
  }, [])

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-8"
      style={{ background: BP.navy, minHeight: "100vh" }}
    >
      <div className="text-center mb-16">
        <div
          className="w-[72px] h-[72px] rounded-[18px] flex items-center justify-center mx-auto mb-6"
          style={{ background: BP.logoBlue }}
        >
          <img src="/logo.png" alt="Blaffa Pay" className="w-12 h-12 object-contain" />
        </div>
        <h1 className="text-[28px] font-extrabold text-white mb-2">Blaffa Pay</h1>
        <p className="text-[14px]" style={{ color: "rgba(243,246,251,0.72)" }}>
          Espace partenaire
        </p>
      </div>

      <div className="w-full max-w-xs">
        <div
          className="rounded-full h-1.5 mb-4 overflow-hidden"
          style={{ background: "rgba(255,255,255,0.15)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-150 ease-out"
            style={{ width: `${progress}%`, background: BP.green }}
          />
        </div>
        <p className="text-center text-[11px] font-semibold" style={{ color: "rgba(243,246,251,0.5)" }}>
          Chargement…
        </p>
      </div>
    </div>
  )
}
