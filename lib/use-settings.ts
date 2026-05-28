import { useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { useSettingsStore } from "@/store/settings-store"

export function useSettings() {
  const { token, user } = useAuth()
  const { settings, isLoading, updateSetting, setSettings, fetchSettings, initSocket } = useSettingsStore()

  useEffect(() => {
    if (token) {
      fetchSettings(token)
      const userId = (user as any)?.id || (user as any)?.uid || (user as any)?._id
      if (userId) {
        initSocket(userId)
      }
    }
  }, [token, user, fetchSettings, initSocket])

  const handleUpdateSetting = (settingType: string, value: any) => {
    updateSetting(settingType, value, token || "")
  }

  return { 
    settings, 
    loading: isLoading, 
    updateSetting: handleUpdateSetting,
    updateSettings: setSettings 
  }
}

