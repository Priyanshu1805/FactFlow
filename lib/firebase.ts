import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth, GoogleAuthProvider, OAuthProvider } from "firebase/auth"
import { getAnalytics, isSupported } from "firebase/analytics"

const rawApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
export const isFirebaseConfigured = Boolean(
  rawApiKey && 
  rawApiKey.trim() !== "" && 
  !rawApiKey.startsWith("AIzaSyA00000") && 
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID !== "factflow"
)

const firebaseConfig = {
  apiKey: rawApiKey || "AIzaSyA00000000000000000000000000000000",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "factflow.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "factflow",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "factflow.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789012:web:1234567890abcdef",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
}

let app: any = null
let auth: any = null
let googleProvider: any = null
let appleProvider: any = null
let analytics: any = null

try {
  if (typeof window !== "undefined" || !getApps().length) {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
    auth = getAuth(app)
    googleProvider = new GoogleAuthProvider()
    googleProvider.setCustomParameters({ prompt: 'select_account' })
    appleProvider = new OAuthProvider('apple.com')

    if (typeof window !== "undefined") {
      isSupported().then((supported) => {
        if (supported && firebaseConfig.measurementId) {
          analytics = getAnalytics(app)
        }
      }).catch(() => {})
    }
  }
} catch (e) {
  console.warn("⚠️ Firebase client initialization failed:", e)
}

export { app, auth, googleProvider, appleProvider, analytics }
