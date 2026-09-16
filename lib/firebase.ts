import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth, GoogleAuthProvider, OAuthProvider } from "firebase/auth"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

// Check if Firebase config is complete
const isFirebaseConfigured = Object.values(firebaseConfig).every(val => val && typeof val === 'string')

// Initialize Firebase only if configuration is complete and not already initialized
let app: any = null
let auth: any = null
let googleProvider: any = null
let appleProvider: any = null

if (isFirebaseConfigured) {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
  auth = getAuth(app)
  googleProvider = new GoogleAuthProvider()
  appleProvider = new OAuthProvider('apple.com')
}

export { app, auth, googleProvider, appleProvider, isFirebaseConfigured }
