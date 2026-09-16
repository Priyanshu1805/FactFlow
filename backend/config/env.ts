const requiredEnvKeys = [
  "MONGODB_URI",
  "JWT_SECRET",
  "JWT_REFRESH_SECRET",
] as const

const placeholderPatterns = ["your_", "YOUR_", "placeholder", "replace_me", "example.com", "XXXXXXXX", "XXXXXXXXXXXXXXXX"]

export function validateEnvironment() {
  const missing: string[] = []

  for (const key of requiredEnvKeys) {
    const value = process.env[key]
    const hasPlaceholder = !!value && placeholderPatterns.some((pattern) => value.toLowerCase().includes(pattern))
    if (!value || hasPlaceholder) {
      missing.push(key)
    }
  }

  if (missing.length > 0) {
    console.warn(
      `[env] Missing or placeholder values for: ${missing.join(", ")}. Configure your .env file before production launch.`
    )
  }

  const adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || ""
  if (adsenseClientId && adsenseClientId.includes("XXXXXXXXXXXXXXXX")) {
    console.warn("[env] NEXT_PUBLIC_ADSENSE_CLIENT_ID is still set to a placeholder value; Ads will be disabled until replaced.")
  }
}
