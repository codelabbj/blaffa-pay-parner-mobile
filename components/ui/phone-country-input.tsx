"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Check, ChevronDown, Search } from "lucide-react"
import {
  PHONE_COUNTRIES,
  DEFAULT_PHONE_COUNTRY,
  type PhoneCountry,
  digitsOnly,
  splitPhoneNumber,
  toE164,
  isValidNationalNumber,
  phoneValidationMessage,
  findCountryByIso,
} from "@/lib/phone-countries"
import { BP } from "@/lib/design"

export type PhoneCountryInputProps = {
  /** Valeur E.164 (+225…) ou vide */
  value: string
  onChange: (e164: string, meta: { country: PhoneCountry; national: string; valid: boolean }) => void
  disabled?: boolean
  placeholder?: string
  /** Affiche le message d’erreur sous le champ */
  showError?: boolean
  className?: string
  inputClassName?: string
  style?: React.CSSProperties
}

export function PhoneCountryInput({
  value,
  onChange,
  disabled,
  placeholder,
  showError = true,
  className,
  inputClassName,
  style,
}: PhoneCountryInputProps) {
  const [country, setCountry] = useState<PhoneCountry>(DEFAULT_PHONE_COUNTRY)
  const [national, setNational] = useState("")
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const rootRef = useRef<HTMLDivElement>(null)
  const syncedFromValue = useRef<string | null>(null)

  // Hydrate depuis value externe (profil chargé, etc.)
  useEffect(() => {
    if (value === syncedFromValue.current) return
    const { country: c, national: n } = splitPhoneNumber(value)
    setCountry(c)
    setNational(n)
    syncedFromValue.current = value || ""
  }, [value])

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onDoc)
    return () => document.removeEventListener("mousedown", onDoc)
  }, [])

  const emit = (nextCountry: PhoneCountry, nextNational: string) => {
    const e164 = nextNational ? toE164(nextCountry, nextNational) : ""
    const valid = nextNational ? isValidNationalNumber(nextCountry, nextNational) : false
    syncedFromValue.current = e164
    onChange(e164, { country: nextCountry, national: nextNational, valid })
  }

  const error = useMemo(() => {
    if (!national) return null
    return phoneValidationMessage(country, national)
  }, [country, national])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return PHONE_COUNTRIES
    return PHONE_COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.iso.toLowerCase().includes(q) ||
        c.dial.includes(q) ||
        `+${c.dial}`.includes(q)
    )
  }, [query])

  const valid = national ? isValidNationalNumber(country, national) : false

  return (
    <div ref={rootRef} className={`relative ${className || ""}`} style={style}>
      <div
        className="flex items-stretch h-12 rounded-[14px] border overflow-hidden"
        style={{
          borderColor: error ? BP.red : national && valid ? BP.green : BP.border,
          background: "#FFFFFF",
        }}
      >
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1.5 px-2.5 shrink-0 border-r disabled:opacity-50"
          style={{ borderColor: BP.border, background: "#F7F9FC" }}
          aria-label="Choisir le pays"
        >
          <span className="text-[18px] leading-none">{country.flag}</span>
          <span className="text-[13px] font-bold" style={{ color: BP.text }}>
            +{country.dial}
          </span>
          <ChevronDown className="w-3.5 h-3.5" style={{ color: BP.muted }} />
        </button>

        <input
          type="tel"
          inputMode="numeric"
          disabled={disabled}
          value={national}
          placeholder={placeholder || country.example}
          onChange={(e) => {
            const next = digitsOnly(e.target.value).slice(0, 15)
            setNational(next)
            emit(country, next)
          }}
          className={`flex-1 min-w-0 h-full px-3 text-[15px] font-semibold outline-none bg-transparent ${inputClassName || ""}`}
          style={{ color: BP.text }}
          autoComplete="tel-national"
        />

        {national && (
          <div className="flex items-center pr-3">
            {valid ? (
              <Check className="w-4 h-4" style={{ color: BP.green }} />
            ) : (
              <span className="text-[11px] font-bold" style={{ color: BP.red }}>
                !
              </span>
            )}
          </div>
        )}
      </div>

      {showError && error && (
        <p className="text-[11px] font-semibold mt-1.5 px-0.5" style={{ color: BP.red }}>
          {error}
        </p>
      )}

      {open && (
        <div
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 rounded-[16px] border bg-white overflow-hidden"
          style={{
            borderColor: BP.border,
            boxShadow: "0 12px 32px rgba(14,26,46,0.14)",
            maxHeight: 280,
          }}
        >
          <div className="p-2 border-b flex items-center gap-2" style={{ borderColor: BP.border }}>
            <Search className="w-4 h-4 shrink-0" style={{ color: BP.muted }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Pays ou indicatif…"
              className="flex-1 h-9 text-sm font-semibold outline-none bg-transparent"
              style={{ color: BP.text }}
              autoFocus
            />
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: 220 }}>
            {filtered.map((c) => {
              const selected = c.iso === country.iso
              return (
                <button
                  key={c.iso}
                  type="button"
                  onClick={() => {
                    const next = findCountryByIso(c.iso) || c
                    setCountry(next)
                    setOpen(false)
                    setQuery("")
                    emit(next, national)
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-[#F4F7FB]"
                  style={{ background: selected ? "rgba(14,159,110,0.08)" : undefined }}
                >
                  <span className="text-[20px] leading-none">{c.flag}</span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[13px] font-bold truncate" style={{ color: BP.text }}>
                      {c.name}
                    </span>
                    <span className="text-[11px] font-semibold" style={{ color: BP.muted }}>
                      +{c.dial}
                    </span>
                  </span>
                  {selected && <Check className="w-4 h-4" style={{ color: BP.green }} />}
                </button>
              )
            })}
            {filtered.length === 0 && (
              <p className="px-3 py-4 text-sm text-center" style={{ color: BP.muted }}>
                Aucun pays trouvé
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export { isValidNationalNumber, toE164, splitPhoneNumber, phoneValidationMessage }
