import { get, post } from '@/utils/request'
import {
  FILTER_SAVE_KEYS,
  getChromeExtensionSettings,
  setChromeExtensionSettings,
} from '@/background/utils/index'
import forceUpdateContextMenuReadOnlyOption from '@/features/contextMenu/utils/forceUpdateContextMenuReadOnlyOption'
import dayjs from 'dayjs'
import cloneDeep from 'lodash-es/cloneDeep'
import { IChromeExtensionSettings } from '@/background/types/Settings'
import { mergeWithObject } from '@/utils/dataHelper/objectHelper'

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
        const buttonSettings: any = {}
        if (
          serverSettings.contextMenus &&
          serverSettings.contextMenus?.length > 0
        ) {
          buttonSettings.textSelectPopupButton = {
            contextMenu: cloneDeep(serverSettings.contextMenus),
          }
          serverSettings.contextMenus = []
        }
        if (
          serverSettings.gmailToolBarContextMenu &&
          serverSettings.gmailToolBarContextMenu?.length > 0
        ) {
          buttonSettings.gmailButton = {
            contextMenu: cloneDeep(serverSettings.gmailToolBarContextMenu),
          }
          serverSettings.gmailToolBarContextMenu = []
        }
        await setChromeExtensionSettings((localSettings) => {
          // 从本地获取openai api key
          const openaiAPIKey =
            localSettings.thirdProviderSettings?.OPENAI_API?.apiKey
          return mergeWithObject([
            localSettings,
            serverSettings,
            {
              buttonSettings,
            },
            {
              thirdProviderSettings: {
                OPENAI_API: {
                  apiKey: openaiAPIKey,
                },
              },
            },
          ]) as IChromeExtensionSettings
        })
      }
    }
    return true
  } catch (e) {
    console.error(e)
    return false
  }
}

export const syncLocalSettingsToServerSettings = async () => {
  try {
    console.log('同步本地设置到服务器')
    const lastModified = dayjs().utc().valueOf()
    // 更新本地设置的最后修改时间
    await setChromeExtensionSettings({
      lastModified,
    })
    const localSettings = cloneDeep(await getChromeExtensionSettings())
    FILTER_SAVE_KEYS.forEach((deleteKey) => {
      delete localSettings[deleteKey]
    })
    // 不上传用户的openai api key
    if (localSettings.thirdProviderSettings?.OPENAI_API) {
      localSettings.thirdProviderSettings.OPENAI_API.apiKey = ''
    }
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
export const isSettingsLastModifiedEqual = async (): Promise<boolean> => {
  try {
    // 更新的时候要强制更新contextMenu
    await forceUpdateContextMenuReadOnlyOption()
    console.log('检测本地设置和服务器设置时间是否一致')
    const result = await get<{
      settings: IChromeExtensionSettings
    }>('/user/get_user_settings_last_modified')
    if (result?.status === 'OK') {
      const localSettings = await getChromeExtensionSettings()
      const serverLastModified = String(result.data) // timestamp
      const localLastModified = String(localSettings.lastModified) // timestamp
      if (serverLastModified && localLastModified) {
        // 服务器已经有设置
        const isLastModifiedEqual = serverLastModified === localLastModified
        console.log('本地设置和服务器设置时间是否一致', isLastModifiedEqual)
        return isLastModifiedEqual
      }
      console.log('本地设置和服务器设置时间不一致')
      return false
    }
    console.log('本地设置和服务器设置时间不一致')
    return false
  } catch (e) {
    console.log('本地设置和服务器设置时间不一致')
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
            console.log('本地设置过期, 同步服务器设置到本地')
            await syncServerSettingsToLocalSettings()
            return {
              success: true,
              status: 'ok',
            }
          }
          if (localLastModified > serverLastModified) {
            // 本地设置更新, 同步到云端
            console.log('本地设置比服务器新, 同步到服务器')
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
