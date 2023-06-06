import { get, post } from '@/utils/request'
import {
  FILTER_SAVE_KEYS,
  getChromeExtensionSettings,
  IChromeExtensionSettings,
  setChromeExtensionSettings,
} from '@/background/utils/index'
import forceUpdateContextMenuReadOnlyOption from '@/features/contextMenu/utils/forceUpdateContextMenuReadOnlyOption'
import merge from 'lodash-es/merge'
import dayjs from 'dayjs'
import cloneDeep from 'lodash-es/cloneDeep'

export const syncServerSettingsToLocalSettings = async () => {
  try {
    console.log('同步服务器设置到本地')
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
        await setChromeExtensionSettings((localSettings) => {
          return merge(localSettings, serverSettings)
        })
      }
    }
    // 更新的时候要强制更新contextMenu
    await forceUpdateContextMenuReadOnlyOption()
    return true
  } catch (e) {
    console.error(e)
    return false
  }
}

export const syncLocalSettingsToServerSettings = async () => {
  try {
    console.log('同步本地设置到服务器')
    // 更新的时候要强制更新contextMenu
    await forceUpdateContextMenuReadOnlyOption()
    const lastModified = dayjs().utc().valueOf()
    // 更新本地设置的最后修改时间
    await setChromeExtensionSettings({
      lastModified,
    })
    const localSettings = cloneDeep(await getChromeExtensionSettings())
    FILTER_SAVE_KEYS.forEach((deleteKey) => {
      delete localSettings[deleteKey]
    })
    const result = await post<{
      status: 'OK' | 'ERROR'
    }>('/user/save_user_settings', {
      settings: {
        ...localSettings,
        lastModified,
      },
    })
    return result?.status === 'OK'
  } catch (e) {
    console.error(e)
    return false
  }
}

export const checkSettingsSync = async (): Promise<{
  success: boolean
  status: 'ok' | 'needSync' | 'error' | 'needLogin'
  cacheLocalSettings?: IChromeExtensionSettings
}> => {
  try {
    console.log('检测本地设置和服务器设置')
    const localSettings = await getChromeExtensionSettings()
    // 更新的时候要强制更新contextMenu
    await forceUpdateContextMenuReadOnlyOption()
    const result = await get<{
      settings: IChromeExtensionSettings
    }>('/user/get_user_info')
    if (result?.status === 'OK') {
      const serverSettings = result.data?.settings
      if (serverSettings && serverSettings.lastModified) {
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
              return {
                success: false,
                status: 'needSync',
                cacheLocalSettings: localSettings,
              }
            } else {
              console.log('本地没有自定义prompt, 同步服务器的设置到本地')
              await syncServerSettingsToLocalSettings()
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
            await setChromeExtensionSettings((localSettings) => {
              return merge(localSettings, serverSettings)
            })
            return {
              success: true,
              status: 'ok',
            }
          }
          if (localLastModified > serverLastModified) {
            // 本地设置更新, 同步到云端
            console.log('本地设置更新, 同步到云端')
            await syncLocalSettingsToServerSettings()
            return {
              success: true,
              status: 'ok',
            }
          }
        }
      } else {
        // 服务器返回status为OK, 没有获取到服务器设置
        // 本地设置保存到服务器
        await syncLocalSettingsToServerSettings()
        return {
          success: true,
          status: 'ok',
        }
      }
    }
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
    return {
      success: false,
      status: 'error',
    }
  }
}
