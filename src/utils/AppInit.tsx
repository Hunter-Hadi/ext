import { ChatGPTConversationState, useInitInboxSdk } from '@/features/gmail'
import { RangyContextMenu, useInitRangy } from '@/features/contextMenu'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import React, { useEffect } from 'react'
import {
  chromeExtensionClientOpenPage,
  getChromeExtensionContextMenu,
  getChromeExtensionSettings,
  setChromeExtensionSettings,
} from '@/utils/index'
import defaultGmailToolbarContextMenuJson from '@/pages/options/defaultGmailToolbarContextMenuJson'
import defaultContextMenuJson from '@/pages/options/defaultContextMenuJson'
import { AppSettingsState, AppState } from '@/store'
import { useInitChatGPTClient } from '@/features/chatgpt'
import { Button } from '@mui/material'

const isEzMailApp = process.env.APP_ENV === 'EZ_MAIL_AI'

const GmailInit = () => {
  useInitInboxSdk()
  return (
    <>
      <style>{'.aSt {max-width: calc(100% - 700px)}'}</style>
    </>
  )
}
const UseChatGPTWebPageJumpToShortCuts = () => {
  if (window.location.host !== 'www.usechatgpt.ai') {
    return <></>
  }
  return (
    <Button
      onClick={() => {
        chromeExtensionClientOpenPage({
          key: 'shortcuts',
        })
      }}
      id={'usechatgpt-www-to-shortcuts'}
      sx={{ position: 'absolute', width: 1, height: 1, zIndex: -1, opacity: 0 }}
    />
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
        if (!item.data.editable) {
          // force update
          const defaultItem = defaultJsonMap.get(item.id)
          if (defaultItem) {
            updateCount++
            return {
              ...defaultItem,
              id: item.id,
              parent: item.parent,
            }
          }
        }
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

export const AppSettingsInit = () => {
  const setAppSettings = useSetRecoilState(AppSettingsState)
  const updateConversation = useSetRecoilState(ChatGPTConversationState)
  useEffect(() => {
    getChromeExtensionSettings().then((settings) => {
      if (settings) {
        setAppSettings({
          colorSchema: window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light',
          ...settings,
        })
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
      <UseChatGPTWebPageJumpToShortCuts />
    </>
  )
}

export default AppInit
