// lib/api/saved.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function saveItem(firebaseUid: string, itemId: string, itemType: "post" | "video" | "short") {
  const res = await fetch(`${API_URL}/users/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ firebaseUid, itemId, itemType })
  })
  if (!res.ok) throw new Error("Failed to save item")
  return res.json()
}

export async function unsaveItem(firebaseUid: string, itemId: string, itemType: "post" | "video" | "short") {
  const res = await fetch(`${API_URL}/users/unsave`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ firebaseUid, itemId, itemType })
  })
  if (!res.ok) throw new Error("Failed to unsave item")
  return res.json()
}

export async function getSavedItems(firebaseUid: string) {
  const res = await fetch(`${API_URL}/users/saved/${firebaseUid}`, { cache: "no-store" })
  if (!res.ok) throw new Error("Failed to fetch saved items")
  return res.json()
}
