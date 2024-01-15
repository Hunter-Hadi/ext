import Button from '@mui/material/Button'
import React, { useEffect } from 'react'
import { useSetRecoilState } from 'recoil'

import { getChromeExtensionLocalStorage } from '@/background/utils/chromeExtensionStorage/chromeExtensionLocalStorage'
import initClientProxyWebsocket from '@/background/utils/clientProxyWebsocket/client'
import {
  MAXAIPDFAIViewerErrorAlert,
  MaxAIPDFAIViewerTopBarButtonGroup,
} from '@/components/AppInit/MaxAIPDFViewerInit'
import useInitWebPageMessageChannel from '@/components/AppInit/useInitWebPageMessageChannel'
import { useAuthLogin } from '@/features/auth'
import userInitUserInfo from '@/features/auth/hooks/useInitUserInfo'
import { useInitChatGPTClient } from '@/features/chatgpt'
import useInitClientConversationMap from '@/features/chatgpt/hooks/useInitClientConversationMap'
import useEffectOnce from '@/features/common/hooks/useEffectOnce'
import ContextMenuRoot from '@/features/contextMenu/components/ContextMenuRoot'
import useInitRangy from '@/features/contextMenu/hooks/useInitRangy'
import useThemeUpdateListener from '@/features/contextMenu/hooks/useThemeUpdateListener'
import useInitOneClickShareButton from '@/features/referral/hooks/useInitOneClickShareButton'
import useInjectShortCutsRunTime from '@/features/shortcuts/hooks/useInjectShortCutsRunTime'
import { ShortcutMessageClientInit } from '@/features/shortcuts/messageChannel/client'
import useInitSidebar from '@/features/sidebar/hooks/useInitSidebar'
import { showChatBox } from '@/features/sidebar/utils/sidebarChatBoxHelper'
import { useInitI18n } from '@/i18n/hooks'
import useHideInHost from '@/minimum/hooks/useHideInHost'
import { AppDBStorageState, AppLocalStorageState } from '@/store'
import { chromeExtensionClientOpenPage } from '@/utils'
import clientGetLiteChromeExtensionDBStorage from '@/utils/clientGetLiteChromeExtensionDBStorage'
import { isMaxAIImmersiveChatPage } from '@/utils/dataHelper/websiteHelper'
import { renderGlobalSnackbar } from '@/utils/globalSnackbar'
import { clientGetBrowserInfo } from '@/utils/larkBot'
import Log from '@/utils/Log'
const log = new Log('AppInit')

const UseChatGPTWebPageJumpToShortCuts = () => {
  if (
    window.location.host !== 'www.usechatgpt.ai' &&
    window.location.host !== 'www.maxai.me'
  ) {
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

export const AppSettingsInit = () => {
  const setAppDBStorage = useSetRecoilState(AppDBStorageState)
  const setAppLocalStorage = useSetRecoilState(AppLocalStorageState)
  useThemeUpdateListener()
  useEffect(() => {
    const updateAppSettings = async () => {
      const liteChromeExtensionDBStorage = await clientGetLiteChromeExtensionDBStorage()
      if (liteChromeExtensionDBStorage) {
        setAppDBStorage({
          ...liteChromeExtensionDBStorage,
        })
        log.info('get db settings', liteChromeExtensionDBStorage)
      }
      const chromeExtensionLocalStorage = await getChromeExtensionLocalStorage()
      if (chromeExtensionLocalStorage) {
        setAppLocalStorage({
          ...chromeExtensionLocalStorage,
        })
        log.info('get local settings', chromeExtensionLocalStorage)
      }
    }
    updateAppSettings()
    window.addEventListener('focus', updateAppSettings)
    return () => {
      window.removeEventListener('focus', updateAppSettings)
    }
  }, [])
  return <></>
}

const AppInit = () => {
  useHideInHost()
  useInitChatGPTClient()
  useAuthLogin()
  userInitUserInfo()
  useInitI18n()
  useInjectShortCutsRunTime()
  useInitWebPageMessageChannel()
  useInitClientConversationMap()
  useInitSidebar()
  useEffectOnce(() => {
    if (isMaxAIImmersiveChatPage()) {
      showChatBox()
    }
    // 判断是不是chrome自带的pdf viewer
    if (
      document.querySelector('embed[name][type="application/pdf"][internalid]')
    ) {
      chromeExtensionClientOpenPage({
        key: 'pdf_viewer',
      })
    }
    renderGlobalSnackbar()
    ShortcutMessageClientInit()
    clientGetBrowserInfo().then().catch()
    initClientProxyWebsocket()
  })
  // 初始化one-click referral, https://app.maxai.me/referral
  useInitOneClickShareButton()
  useInitRangy()
  return (
    <>
      <MAXAIPDFAIViewerErrorAlert />
      <MaxAIPDFAIViewerTopBarButtonGroup />
      <ContextMenuRoot />
      <AppSettingsInit />
      <UseChatGPTWebPageJumpToShortCuts />
    </>
  )
}

export default AppInit
