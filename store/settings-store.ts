import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { toast } from 'sonner'
import { io, Socket } from 'socket.io-client'

export type SettingsData = {
  appearance?: { theme: string; fontSize: string; fontStyle: string }
  feed?: { autoplayVideos: boolean; dataSaver: boolean; layout?: string }
  layout?: string
  displayOptions?: { thumbnails: boolean }
  accessibility?: {
    highContrast: boolean;
    reduceMotion: boolean;
    largeTapTargets: boolean;
    boldText: boolean;
    textSize: number;
    screenReaderSupport: boolean;
    imageAltText: boolean;
  }
  privacy?: {
    profileVisibility: string
    incognitoMode: boolean
    anonymousFactCheck: boolean
    hideLiveStatus: boolean
    blurGraphicImagery: boolean
    commentVisibility: "public" | "followers" | "private"
    allowAITraining: boolean
  }
}

interface SettingsState {
  settings: SettingsData
  isLoading: boolean
  socket: Socket | null
  initSocket: (userId: string) => void
  setSettings: (newSettings: Partial<SettingsData>) => void
  updateSetting: (settingType: string, value: any, token: string) => void
  fetchSettings: (token: string) => Promise<void>
}

let timeoutId: NodeJS.Timeout

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: {
        appearance: { theme: 'light', fontSize: 'default', fontStyle: 'sans' },
        layout: 'comfortable',
        displayOptions: { thumbnails: true },
        accessibility: {
          highContrast: false,
          reduceMotion: false,
          largeTapTargets: false,
          boldText: false,
          textSize: 100,
          screenReaderSupport: false,
          imageAltText: true,
        },
        privacy: {
          profileVisibility: "public",
          incognitoMode: false,
          anonymousFactCheck: false,
          hideLiveStatus: false,
          blurGraphicImagery: false,
          commentVisibility: "public",
          allowAITraining: true,
        }
      },
      isLoading: false,
      socket: null,
      initSocket: (userId) => {
        if (get().socket) return
        const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000')
        
        newSocket.on('connect', () => {
          newSocket.emit('register_user', userId)
        })

        newSocket.on('settingsChanged', (data: { settingType: string; value: any }) => {
          // Sync changes from other devices instantly
          const { settingType, value } = data
          set((state) => {
            const newSet = { ...state.settings }
            if (settingType === 'theme' || settingType === 'fontSize' || settingType === 'fontStyle') {
              newSet.appearance = { ...newSet.appearance, [settingType]: value } as any
            } else if (settingType === 'layout') {
              newSet.layout = value
            } else if (settingType === 'displayOptions') {
              newSet.displayOptions = { ...newSet.displayOptions, ...value } as any
            } else if (settingType === 'accessibility') {
              newSet.accessibility = { ...newSet.accessibility, ...value } as any
            } else if (settingType === 'privacy') {
              newSet.privacy = { ...newSet.privacy, ...value } as any
            }
            return { settings: newSet }
          })
        })

        set({ socket: newSocket })
      },
      setSettings: (newSettings) => {
        set((state) => ({ settings: { ...state.settings, ...newSettings } }))
      },
      updateSetting: async (settingType: string, value: any, token: string) => {
        // Optimistic update (works even if user is not logged in)
        set((state) => {
          const newSet = { ...state.settings }
          if (settingType === 'theme' || settingType === 'fontSize' || settingType === 'fontStyle') {
            newSet.appearance = { ...newSet.appearance, [settingType]: value } as any
          } else if (settingType === 'layout') {
            newSet.layout = value
          } else if (settingType === 'displayOptions') {
            newSet.displayOptions = { ...newSet.displayOptions, ...value } as any
          } else if (settingType === 'accessibility') {
            newSet.accessibility = { ...newSet.accessibility, ...value } as any
          } else if (settingType === 'privacy') {
            newSet.privacy = { ...newSet.privacy, ...value } as any
          }
          return { settings: newSet }
        })

        // If no token, user is guest, just save locally via persist
        if (!token) return;

        // Instant save to backend
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/settings`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ settingType, value })
          })
          if (!res.ok) throw new Error('Failed to update')
        } catch (error) {
          toast.error("Failed to sync settings changes.")
        }
      },
      fetchSettings: async (token: string) => {
        if (!token) return;
        set({ isLoading: true })
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/settings`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
          if (res.ok) {
            const data = await res.json()
            if (data.success && data.settings) {
              set({ settings: { ...get().settings, ...data.settings }, isLoading: false })
            }
          }
        } catch (error) {
          set({ isLoading: false })
        }
      },

    }),
    {
      name: 'factflow-settings-storage',
      partialize: (state) => ({ settings: state.settings }), // don't persist socket
    }
  )
)
