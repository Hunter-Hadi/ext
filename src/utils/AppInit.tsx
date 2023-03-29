import { ChatGPTConversationState, useInitInboxSdk } from '@/features/gmail'
import { RangyContextMenu, useInitRangy } from '@/features/contextMenu'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import React, { useEffect } from 'react'
import {
  getChromeExtensionContextMenu,
  getChromeExtensionSettings,
  setChromeExtensionSettings,
} from '@/utils/index'
import defaultGmailToolbarContextMenuJson from '@/pages/options/defaultGmailToolbarContextMenuJson'
import defaultContextMenuJson from '@/pages/options/defaultContextMenuJson'
import { AppSettingsState, AppState } from '@/store'
import { useInitChatGPTClient } from '@/features/chatgpt'

const isEzMailApp = process.env.APP_ENV === 'EZ_MAIL_AI'

const GmailInit = () => {
  useInitInboxSdk()
  return (
    <>
      <style>{'.aSt {max-width: calc(100% - 700px)}'}</style>
    </>
  )
}
const RangyInit = () => {
  useInitRangy()
  return <></>
}

const ForceUpdateContextMenuReadOnlyOption = () => {
  useEffect(() => {
    const menuType = isEzMailApp ? 'gmailToolBarContextMenu' : 'contextMenus'
    const defaultJsonData = isEzMailApp
      ? defaultGmailToolbarContextMenuJson
      : defaultContextMenuJson
    getChromeExtensionContextMenu(menuType).then(async (menuList) => {
      const defaultJsonMap = new Map()
      defaultJsonData.forEach((item) => {
        defaultJsonMap.set(item.id, item)
      })
      let updateCount = 0
      const updateMenuList = menuList.map((item) => {
        // TODO - 因为早版本用户的editable都是true，所以这里先强制更新
        const defaultItem = defaultJsonMap.get(item.id)
        if (defaultItem) {
          updateCount++
          return defaultItem
        }
        // TODO - v0.0.5 开放编辑options后启用此处逻辑
        // if (!item.data.editable) {
        //   // force update
        //   const defaultItem = defaultJsonMap.get(item.id)
        //   if (defaultItem) {
        //     updateCount++
        //     return defaultItem
        //   }
        // }
        return item
      })
      console.log('force update menu count', updateCount, menuList)
      await setChromeExtensionSettings({
        [menuType]: updateMenuList,
      })
    })
  }, [])
  return <></>
}

const AppSettingsInit = () => {
  const setAppSettings = useSetRecoilState(AppSettingsState)
  const updateConversation = useSetRecoilState(ChatGPTConversationState)
  useEffect(() => {
    getChromeExtensionSettings().then((settings) => {
      if (settings) {
        setAppSettings(settings)
        if (settings?.currentModel) {
          updateConversation((conversation) => {
            return {
              ...conversation,
              model: settings.currentModel || '',
            }
          })
        }
      }
    })
  }, [])
  return <></>
}

const AppInit = () => {
  const appState = useRecoilValue(AppState)
  useInitChatGPTClient()
  return (
    <>
      {appState.env === 'gmail' && isEzMailApp && <GmailInit />}
      {!isEzMailApp && <RangyInit />}
      <RangyContextMenu />
      <ForceUpdateContextMenuReadOnlyOption />
      <AppSettingsInit />
    </>
  )
}

export default AppInit
