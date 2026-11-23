/** Design tokens — Blaffa Pay Partners (PDF + cahier client) */

export const BP = {
  navy: "#0E1A2E",
  bg: "#EEF2F8",
  card: "#FFFFFF",
  green: "#0E9F6E",
  red: "#E5484D",
  blue: "#2F6BFF",
  amber: "#C77A08",
  violet: "#7C3AED",
  text: "#0F1B2D",
  muted: "#74839A",
  border: "#E6ECF4",
  radius: 18,
  /** Logo B sur login / menu */
  logoBlue: "#2F6BFF",
} as const

export const NICKNAME_STORAGE_KEY = "blaffa_partner_nickname"

export function getStoredNickname(userUid?: string): string | null {
  if (typeof window === "undefined") return null
  if (userUid) {
    const scoped = localStorage.getItem(`${NICKNAME_STORAGE_KEY}_${userUid}`)
    if (scoped) return scoped
  }
  return localStorage.getItem(NICKNAME_STORAGE_KEY)
}

export function setStoredNickname(nickname: string, userUid?: string) {
  if (typeof window === "undefined") return
  const cleaned = normalizeNickname(nickname)
  localStorage.setItem(NICKNAME_STORAGE_KEY, cleaned)
  if (userUid) localStorage.setItem(`${NICKNAME_STORAGE_KEY}_${userUid}`, cleaned)
}

export function normalizeNickname(raw: string): string {
  const stripped = raw.trim().replace(/^@+/, "").toLowerCase().replace(/[^a-z0-9._]/g, "_")
  return stripped ? `@${stripped}` : ""
}

export function toPublicHandle(displayName: string | undefined | null): string {
  if (!displayName) return "@partenaire"
  if (displayName.startsWith("@")) return normalizeNickname(displayName)
  const slug = displayName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9._]/g, "")
  return slug ? `@${slug}` : "@partenaire"
}

export function initialsFromHandle(handle: string): string {
  const clean = handle.replace(/^@/, "")
  if (!clean) return "?"
  const parts = clean.split(/[._-]/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return clean.slice(0, 2).toUpperCase()
}

/** Couleurs d’avatar stables (PDF transfert) */
const AVATAR_COLORS = ["#0E9F6E", "#2F6BFF", "#7C3AED", "#C77A08", "#E5484D", "#0E9F6E"] as const
export function avatarColor(seed: string): string {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h + seed.charCodeAt(i) * (i + 1)) % AVATAR_COLORS.length
  return AVATAR_COLORS[h]
}

export function formatFcfa(amount: string | number | undefined | null): string {
  if (amount === undefined || amount === null || amount === "") return "0"
  const n = typeof amount === "number" ? amount : parseFloat(String(amount).replace(/\s/g, "").replace(",", "."))
  if (Number.isNaN(n)) return String(amount)
  return n.toLocaleString("fr-FR")
}

export function statusPillClass(status: string): string {
  const s = (status || "").toLowerCase()
  if (["success", "completed", "réussi", "reussi", "sent_to_user", "terminée", "terminee"].includes(s))
    return "bp-pill-success"
  if (["sent", "envoyé", "envoye"].includes(s)) return "bp-pill-sent"
  if (
    ["pending", "cancellation_requested", "annulation demandée", "annulation demandee", "en attente"].includes(s)
  )
    return "bp-pill-pending"
  if (["failed", "cancelled", "annulée", "annulee", "échec", "echec"].includes(s)) return "bp-pill-failed"
  return "bp-pill-sent"
}

/** Surfaces page — toujours calées sur le PDF (clair). Dark = fond navy, cartes un peu plus sombres. */
export function pageBg(isDark: boolean) {
  return isDark ? "#0A1220" : BP.bg
}
export function cardBg(isDark: boolean) {
  return isDark ? "#121C2E" : BP.card
}
export function textPrimary(isDark: boolean) {
  return isDark ? "#F3F6FB" : BP.text
}
