import { useCallback, useRef, useState } from 'react'
import { useSnackbar } from 'notistack'
import { get, post } from '@/utils/request'
import {
  FILTER_SAVE_KEYS,
  getChromeExtensionSettings,
  IChromeExtensionSettings,
  setChromeExtensionSettings,
} from '@/background/utils'
import dayjs from 'dayjs'
import debounce from 'lodash-es/debounce'

const useSyncSettingsChecker = () => {
  // Syncing your settings...
  // Sync successful!
  // Sync failed!
  const { enqueueSnackbar } = useSnackbar()
  const [isSyncing, setIsSyncing] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [showErrorAlert, setShowErrorAlert] = useState(false)
  const [showCheckAlert, setShowCheckAlert] = useState(false)
  const localSettingsCacheRef = useRef<IChromeExtensionSettings | undefined>(
    undefined,
  )
  const debounceEnqueueSnackbar = useCallback(
    debounce((message: string, options?: any) => {
      enqueueSnackbar(message, {
        variant: 'info',
        autoHideDuration: 1000,
        ...options,
      })
    }, 2000),
    [enqueueSnackbar],
  )
  const syncServerToLocal = useCallback(async () => {
    try {
      console.log('同步服务器设置到本地')
      setIsSyncing(true)
      // enqueueSnackbar('Syncing your settings...', {
      //   variant: 'info',
      //   autoHideDuration: 1000,
      // })
      const result = await get<{
        settings: IChromeExtensionSettings
      }>('/user/get_user_info')
      if (result?.status === 'OK') {
        const serverSettings = result.data?.settings
        if (serverSettings) {
          // HACK: remove conversationId
          if (serverSettings?.conversationId) {
            delete serverSettings.conversationId
          }
          await setChromeExtensionSettings((settings) => ({
            ...settings,
            ...serverSettings,
          }))
          // debounceEnqueueSnackbar('Settings updated', {
          //   variant: 'success',
          //   autoHideDuration: 1000,
          // })
        }
      }
      return true
    } catch (e) {
      enqueueSnackbar('Sync failed!', {
        variant: 'error',
        autoHideDuration: 1000,
      })
      console.error(e)
      return false
    } finally {
      setIsSyncing(false)
    }
  }, [])
  const syncLocalToServer = useCallback(
    async (saveSettings?: IChromeExtensionSettings) => {
      try {
        console.log('同步本地设置到服务器')
        setIsSyncing(true)
        const lastModified = dayjs().utc().valueOf()
        // 更新本地设置的最后修改时间
        if (saveSettings) {
          await setChromeExtensionSettings({
            ...saveSettings,
            lastModified,
          })
        } else {
          await setChromeExtensionSettings({
            lastModified,
          })
        }
        // enqueueSnackbar('Syncing your settings...', {
        //   variant: 'info',
        //   autoHideDuration: 1000,
        // })
        const localSettings = await getChromeExtensionSettings()
        FILTER_SAVE_KEYS.forEach((deleteKey) => {
          delete localSettings[deleteKey]
        })
        const result = await post<{
          status: 'OK' | 'ERROR'
        }>('/user/save_user_settings', {
          settings: localSettings,
        })
        if (result?.status === 'OK') {
          debounceEnqueueSnackbar('Settings updated', {
            variant: 'success',
            autoHideDuration: 1000,
          })
          return true
        }
        return false
      } catch (e) {
        enqueueSnackbar('Sync failed!', {
          variant: 'error',
          autoHideDuration: 1000,
        })
        console.error(e)
        return false
      } finally {
        setIsSyncing(false)
      }
    },
    [],
  )
  const checkSync = async (): Promise<{
    success: boolean
    status: 'ok' | 'needSync' | 'error' | 'needLogin'
  }> => {
    try {
      console.log('检测本地设置和服务器设置')
      const localSettings = await getChromeExtensionSettings()
      setShowErrorAlert(false)
      setShowCheckAlert(false)
      localSettingsCacheRef.current = undefined
      setIsChecking(true)
      const result = await get<{
        settings: IChromeExtensionSettings
      }>('/user/get_user_info')
      if (result?.status === 'OK') {
        const serverSettings = result.data?.settings
        if (serverSettings) {
          const serverLastModified = serverSettings.lastModified // timestamp
          const localLastModified = localSettings.lastModified // timestamp
          if (serverLastModified) {
            // 服务器已经有设置
            console.log('服务器已经有设置')
            if (!localLastModified) {
              // 本地没有设置, 判断是否有自定义prompt
              if (
                localSettings.contextMenus?.find(
                  (menuItem) => menuItem.data.editable,
                )
              ) {
                // 本地有自定义prompt, 询问是否同步
                console.log('本地有自定义prompt, 询问是否同步')
                setShowCheckAlert(true)
                localSettingsCacheRef.current = localSettings
                return {
                  success: false,
                  status: 'needSync',
                }
              } else {
                console.log('本地没有自定义prompt, 同步服务器的设置到本地')
                await setChromeExtensionSettings((settings) => ({
                  ...settings,
                  ...serverSettings,
                }))
                return {
                  success: true,
                  status: 'ok',
                }
              }
            }
            if (localLastModified === serverLastModified) {
              // 本地和服务器设置一致
              console.log('本地和服务器设置一致')
              return {
                success: true,
                status: 'ok',
              }
            }
            if (localLastModified < serverLastModified) {
              // 本地设置过期, 同步服务器的设置到本地
              console.log('本地设置过期, 同步服务器的设置到本地')
              await setChromeExtensionSettings((settings) => ({
                ...settings,
                ...serverSettings,
              }))
              return {
                success: true,
                status: 'ok',
              }
            }
            if (localLastModified > serverLastModified) {
              // 本地设置更新, 同步到云端
              console.log('本地设置更新, 同步到云端')
              await syncLocalToServer()
              return {
                success: true,
                status: 'ok',
              }
            }
          }
        } else {
          // 服务器返回status为OK, 没有获取到服务器设置
          // 本地设置保存到服务器
          await syncLocalToServer()
          return {
            success: true,
            status: 'ok',
          }
        }
      }
      // 接口调用失败
      setShowErrorAlert(true)
      return {
        success: false,
        status: 'error',
      }
    } catch (e: any) {
      console.error('对比设置异常: \t', e)
      if (e.status === 401) {
        // 未登录
        return {
          success: false,
          status: 'needLogin',
        }
      }
      setShowErrorAlert(true)
      return {
        success: false,
        status: 'error',
      }
    } finally {
      setIsChecking(false)
    }
  }
  return {
    isSyncing,
    isChecking,
    showCheckAlert,
    showErrorAlert,
    checkSync,
    syncLocalToServer,
    syncServerToLocal,
    localSettingsCacheRef,
  }
}

export default useSyncSettingsChecker
