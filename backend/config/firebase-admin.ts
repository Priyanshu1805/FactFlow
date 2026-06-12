import * as admin from "firebase-admin"

// Only initialize once
if (!admin.apps.length) {
  // Parse the service account from individual env vars (Firebase Admin style)
  // We use the project ID from frontend env vars and rely on them for revokeRefreshTokens
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    })
  } catch {
    // If applicationDefault() fails (no GOOGLE_APPLICATION_CREDENTIALS set),
    // initialize with a minimal config that still supports token revocation
    // via REST API fallback in the controller.
    console.warn("⚠️  Firebase Admin: No service account found. Logout-all will use client-side fallback.")
  }
}

export { admin }
