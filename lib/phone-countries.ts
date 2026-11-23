/** Pays + indicatifs — focus Afrique de l’Ouest / CFA + FR */

export type PhoneCountry = {
  iso: string
  name: string
  dial: string
  flag: string
  /** Longueurs nationales acceptées (sans indicatif) */
  lengths: number[]
  example: string
}

export const PHONE_COUNTRIES: PhoneCountry[] = [
  { iso: "CI", name: "Côte d'Ivoire", dial: "225", flag: "🇨🇮", lengths: [10], example: "0700000000" },
  { iso: "BJ", name: "Bénin", dial: "229", flag: "🇧🇯", lengths: [8, 10], example: "97000000" },
  { iso: "SN", name: "Sénégal", dial: "221", flag: "🇸🇳", lengths: [9], example: "770000000" },
  { iso: "ML", name: "Mali", dial: "223", flag: "🇲🇱", lengths: [8], example: "70000000" },
  { iso: "BF", name: "Burkina Faso", dial: "226", flag: "🇧🇫", lengths: [8], example: "70000000" },
  { iso: "TG", name: "Togo", dial: "228", flag: "🇹🇬", lengths: [8], example: "90000000" },
  { iso: "NE", name: "Niger", dial: "227", flag: "🇳🇪", lengths: [8], example: "90000000" },
  { iso: "GN", name: "Guinée", dial: "224", flag: "🇬🇳", lengths: [9], example: "620000000" },
  { iso: "CM", name: "Cameroun", dial: "237", flag: "🇨🇲", lengths: [9], example: "670000000" },
  { iso: "GA", name: "Gabon", dial: "241", flag: "🇬🇦", lengths: [7, 8], example: "06000000" },
  { iso: "CG", name: "Congo", dial: "242", flag: "🇨🇬", lengths: [9], example: "060000000" },
  { iso: "CD", name: "RDC", dial: "243", flag: "🇨🇩", lengths: [9], example: "970000000" },
  { iso: "GH", name: "Ghana", dial: "233", flag: "🇬🇭", lengths: [9], example: "240000000" },
  { iso: "NG", name: "Nigeria", dial: "234", flag: "🇳🇬", lengths: [10], example: "8010000000" },
  { iso: "FR", name: "France", dial: "33", flag: "🇫🇷", lengths: [9], example: "612345678" },
]

export const DEFAULT_PHONE_COUNTRY =
  PHONE_COUNTRIES.find((c) => c.iso === "CI") || PHONE_COUNTRIES[0]

export function digitsOnly(value: string): string {
  return (value || "").replace(/\D/g, "")
}

export function findCountryByDial(dialOrPhone: string): PhoneCountry | undefined {
  const digits = digitsOnly(dialOrPhone)
  const sorted = [...PHONE_COUNTRIES].sort((a, b) => b.dial.length - a.dial.length)
  return sorted.find((c) => digits.startsWith(c.dial))
}

export function findCountryByIso(iso: string): PhoneCountry | undefined {
  return PHONE_COUNTRIES.find((c) => c.iso === iso)
}

/** Décompose un numéro stocké (+22507…) en pays + national */
export function splitPhoneNumber(raw: string | null | undefined): {
  country: PhoneCountry
  national: string
} {
  const digits = digitsOnly(raw || "")
  if (!digits) {
    return { country: DEFAULT_PHONE_COUNTRY, national: "" }
  }
  const country = findCountryByDial(digits) || DEFAULT_PHONE_COUNTRY
  let national = digits.startsWith(country.dial) ? digits.slice(country.dial.length) : digits
  // CI souvent saisi 07… avec 0 national
  if (national.startsWith("0") && country.lengths.every((l) => l === national.length - 1 || l === national.length)) {
    // garder le 0 si la longueur cible l'inclut (ex. CI 10 chiffres avec 0)
  }
  return { country, national }
}

export function toE164(country: PhoneCountry, nationalRaw: string): string {
  let national = digitsOnly(nationalRaw)
  // FR : drop leading 0
  if (country.iso === "FR" && national.startsWith("0")) {
    national = national.slice(1)
  }
  return `+${country.dial}${national}`
}

export function isValidNationalNumber(country: PhoneCountry, nationalRaw: string): boolean {
  let national = digitsOnly(nationalRaw)
  if (country.iso === "FR" && national.startsWith("0")) {
    national = national.slice(1)
  }
  if (!national) return false
  return country.lengths.includes(national.length)
}

export function phoneValidationMessage(country: PhoneCountry, nationalRaw: string): string | null {
  const national = digitsOnly(nationalRaw)
  if (!national) return "Entre un numéro de téléphone"
  if (!isValidNationalNumber(country, nationalRaw)) {
    const lens = country.lengths.join(" ou ")
    return `Numéro ${country.name} invalide (${lens} chiffres)`
  }
  return null
}
