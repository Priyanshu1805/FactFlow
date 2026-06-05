import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { RSSItem } from "./fetchRSS"

export interface SavedStore {
  savedItems: RSSItem[]
  saveItem: (item: RSSItem) => void
  removeItem: (id: string) => void
  isSaved: (id: string) => boolean
}

export const useSavedStore = create<SavedStore>()(
  persist(
    (set, get) => ({
      savedItems: [],
      saveItem: (item) => {
        set((state) => {
          if (state.savedItems.some(i => i.id === item.id)) return state
          return { savedItems: [item, ...state.savedItems] }
        })
      },
      removeItem: (id) => {
        set((state) => ({
          savedItems: state.savedItems.filter((i) => i.id !== id)
        }))
      },
      isSaved: (id) => {
        return get().savedItems.some((i) => i.id === id)
      }
    }),
    {
      name: "ff_saved_items"
    }
  )
)
