import { useMemo, useState } from 'react'
import { useSnackbar } from 'notistack'
import { get, post } from '@/utils/request'
import {
  getChromeExtensionSettings,
  IChromeExtensionSettings,
  setChromeExtensionSettings,
} from '@/background/utils'
import debounce from 'lodash-es/debounce'

const useAutoSync = () => {
  // Syncing your settings...
  // Sync successful!
  // Sync failed!
  const { enqueueSnackbar } = useSnackbar()
  const [isSyncing, setIsSyncing] = useState(false)
  const syncSettings = useMemo(
    () =>
      debounce(async () => {
        try {
          setIsSyncing(true)
          enqueueSnackbar('Syncing your settings...', {
            variant: 'info',
            autoHideDuration: 1000,
          })
          const result = await post<{
            status: 'OK' | 'ERROR'
          }>('/user/save_user_settings', {
            settings: await getChromeExtensionSettings(),
          })
          if (result?.status === 'OK') {
            enqueueSnackbar('Sync successful!', {
              variant: 'success',
              autoHideDuration: 1000,
            })
          }
        } catch (e) {
          enqueueSnackbar('Sync failed!', {
            variant: 'error',
            autoHideDuration: 1000,
          })
          console.error(e)
        } finally {
          setIsSyncing(false)
        }
      }, 3000),
    [],
  )
  const checkSync = async (): Promise<IChromeExtensionSettings> => {
    console.log('检测本地设置和服务器设置')
    const localSettings = await getChromeExtensionSettings()
    try {
      const result = await get<{
        settings: IChromeExtensionSettings
      }>('/user/get_user_info')
      if (result?.status === 'OK') {
        console.log(result)
        const serverSettings = result.data?.settings
        if (serverSettings) {
          const serverLastModified = serverSettings.lastModified
          const localLastModified = localSettings.lastModified
          // 服务器已经有设置
          if (serverLastModified) {
            console.log('服务器已经有设置')
            if (!localLastModified) {
              // 本地没有设置, 同步云端的设置
              console.log('本地没有设置, 同步云端的设置')
              await setChromeExtensionSettings(serverSettings)
              return serverSettings
            }
            if (localLastModified === serverLastModified) {
              // 本地和云端设置一致
              console.log('本地和云端设置一致')
              return localSettings
            }
            if (localLastModified < serverLastModified) {
              // 本地设置过期, 同步云端的设置
              console.log('本地设置过期, 同步云端的设置')
              await setChromeExtensionSettings(serverSettings)
              return serverSettings
            }
            if (localLastModified > serverLastModified) {
              // 本地设置更新, 同步到云端
              console.log('本地设置更新, 同步到云端')
              await syncSettings()
              return localSettings
            }
          }
        }
      }
      return localSettings
    } catch (e) {
      console.error('对比设置失败: \t', e)
      return localSettings
    }
  }
  return {
    isSyncing,
    checkSync,
    syncSettings,
  }
}
export default useAutoSync
