export function getAdminOverrideEmail(): string | null {
  const adminEmail = (
    process.env.NEXT_PUBLIC_SUPER_OWNER_EMAIL ||
    process.env.SUPER_OWNER_EMAIL ||
    ""
  ).trim().toLowerCase()

  return adminEmail || null
}

export function isAdminUser(user?: { role?: string | null; email?: string | null; dbRole?: string | null } | null): boolean {
  if (!user) return false

  const roles = [user.role, user.dbRole].filter(Boolean) as string[]
  if (roles.some((role) => role.toLowerCase() === "admin")) return true

  const email = (user.email || "").trim().toLowerCase()
  const adminEmail = getAdminOverrideEmail()

  return !!adminEmail && email === adminEmail
}
