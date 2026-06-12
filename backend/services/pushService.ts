import webpush from "web-push"
import { Server } from "socket.io"

// Trigger restart

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || ""
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || ""

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails("mailto:support@factflow.app", vapidPublicKey, vapidPrivateKey)
}

let ioInstance: Server | null = null

export function setSocket(io: Server): void {
  ioInstance = io
}

export function getSocket(): Server | null {
  return ioInstance
}

export async function sendPushNotification(
  subscription: webpush.PushSubscription,
  payload: { title: string; body: string; icon?: string; url?: string }
): Promise<boolean> {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload))
    return true
  } catch (err: any) {
    if (err.statusCode === 410) {
      console.warn("🔔 Push subscription expired")
    } else {
      console.error("❌ Push send failed:", err.message)
    }
    return false
  }
}
