import debounce from 'lodash-es/debounce'
import { useSnackbar } from 'notistack'
import { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { IChromeExtensionDBStorage } from '@/background/utils'
import { setChromeExtensionDBStorage } from '@/background/utils/chromeExtensionStorage/chromeExtensionDBStorage'
import {
  checkSettingsSync,
  isSettingsLastModifiedEqual,
  syncLocalSettingsToServerSettings,
  syncServerSettingsToLocalSettings,
} from '@/background/utils/syncSettings'
const useSyncSettingsChecker = () => {
  // Syncing your settings...
  // Sync successful!
  // Sync failed!
  const { t } = useTranslation(['settings'])
  const { enqueueSnackbar } = useSnackbar()
  const [isSyncing, setIsSyncing] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [showErrorAlert, setShowErrorAlert] = useState(false)
  const [showCheckAlert, setShowCheckAlert] = useState(false)
  const localSettingsCacheRef = useRef<IChromeExtensionDBStorage | undefined>(
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
      setIsSyncing(true)
      return await syncServerSettingsToLocalSettings()
    } catch (e) {
      enqueueSnackbar(t('settings:sync__sync_failed'), {
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
    async (saveSettings?: IChromeExtensionDBStorage) => {
      try {
        console.log('同步本地设置到服务器')
        setIsSyncing(true)
        if (saveSettings) {
          await setChromeExtensionDBStorage(saveSettings)
        }
        if (!(await isSettingsLastModifiedEqual())) {
          const checkResult = await checkSettingsSync()
          if (!checkResult.success) {
            return false
          }
        }
        const isSuccess = await syncLocalSettingsToServerSettings()
        if (isSuccess) {
          debounceEnqueueSnackbar(t('settings:sync__save_success'), {
            variant: 'success',
            autoHideDuration: 1000,
          })
        }
        return isSuccess
      } catch (e) {
        enqueueSnackbar(t('settings:sync__sync_failed'), {
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
      setShowErrorAlert(false)
      setShowCheckAlert(false)
      localSettingsCacheRef.current = undefined
      if (await isSettingsLastModifiedEqual()) {
        return {
          success: true,
          status: 'ok',
        }
      }
      setIsChecking(true)
      const result = await checkSettingsSync()
      if (result.status === 'error') {
        setShowErrorAlert(true)
        return {
          success: false,
          status: 'error',
        }
      } else {
        return result
      }
    } catch (e: any) {
      console.error('对比设置异常: \t', e)
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
