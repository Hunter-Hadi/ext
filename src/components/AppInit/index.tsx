import Button from '@mui/material/Button'
import React, { useEffect } from 'react'
import { useSetRecoilState } from 'recoil'

import { getChromeExtensionLocalStorage } from '@/background/utils/chromeExtensionStorage/chromeExtensionLocalStorage'
import initClientProxyWebsocket from '@/background/utils/clientProxyWebsocket/client'
import {
  detectBrowserDefaultPDFViewer,
  MAXAIPDFAIViewerErrorAlert,
  MaxAIPDFAIViewerTopBarButtonGroup,
} from '@/components/AppInit/MaxAIPDFViewerInit'
import { APP_USE_CHAT_GPT_HOST } from '@/constants'
import { useAuthLogin } from '@/features/auth'
import useInitUserInfo from '@/features/auth/hooks/useInitUserInfo'
import { useUserInfo } from '@/features/auth/hooks/useUserInfo'
import { useInitSyncConversation } from '@/features/chatgpt/hooks/useSyncConversation'
import useEffectOnce from '@/features/common/hooks/useEffectOnce'
import ContextMenuRoot from '@/features/contextMenu/components/ContextMenuRoot'
import useInitRangy from '@/features/contextMenu/hooks/useInitRangy'
import useThemeUpdateListener from '@/features/contextMenu/hooks/useThemeUpdateListener'
import useButtonClickedTracker from '@/features/mixpanel/hooks/useButtonClickedTracker'
import useInitOneClickShareButton from '@/features/referral/hooks/useInitOneClickShareButton'
import useInjectShortCutsRunTime from '@/features/shortcuts/hooks/useInjectShortCutsRunTime'
import { ShortcutMessageClientInit } from '@/features/shortcuts/messageChannel/client'
import useClientMessageListenerForBackground from '@/features/sidebar/hooks/useClientMessageListenerForBackground'
import { showChatBox } from '@/features/sidebar/utils/sidebarChatBoxHelper'
import useInitSurveyState from '@/features/survey/hooks/useInitSurveyState'
import { useInitI18n } from '@/i18n/hooks'
import useHideInHost from '@/minimum/hooks/useHideInHost'
import { AppDBStorageState, AppLocalStorageState } from '@/store'
import { chromeExtensionClientOpenPage } from '@/utils'
import clientGetLiteChromeExtensionDBStorage from '@/utils/clientGetLiteChromeExtensionDBStorage'
import {
  getCurrentDomainHost,
  isMaxAIImmersiveChatPage,
} from '@/utils/dataHelper/websiteHelper'
import { renderGlobalSnackbar } from '@/utils/globalSnackbar'
import Log from '@/utils/Log'
import { clientSetBrowserUAInfo } from '@/utils/sendMaxAINotification/client'
const log = new Log('AppInit')

const UseChatGPTWebPageJumpToShortCuts = () => {
  if (
    window.location.host === 'www.usechatgpt.ai' ||
    window.location.host === 'www.maxai.me' ||
    window.location.host === 'app.maxai.me'
  ) {
    return (
      <Button
        onClick={() => {
          chromeExtensionClientOpenPage({
            key: 'shortcuts',
          })
        }}
        id={'usechatgpt-www-to-shortcuts'}
        sx={{
          position: 'absolute',
          width: 1,
          height: 1,
          zIndex: -1,
          opacity: 0,
        }}
      />
    )
  }

  return <></>
}

export const AppSettingsInit = () => {
  const setAppDBStorage = useSetRecoilState(AppDBStorageState)
  const setAppLocalStorage = useSetRecoilState(AppLocalStorageState)
  useThemeUpdateListener()
  useEffect(() => {
    const updateAppSettings = async () => {
      const liteChromeExtensionDBStorage =
        await clientGetLiteChromeExtensionDBStorage()
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

/**
 * 在访问my-plan等页面时，更新用户的订阅信息.
 * @constructor
 */
export const MaxAISubscriptionUpdate = () => {
  const { syncUserInfo, syncUserSubscriptionInfo } = useUserInfo()
  useEffectOnce(() => {
    syncUserInfo().then()
    if (String(APP_USE_CHAT_GPT_HOST).includes(getCurrentDomainHost())) {
      const pathname = window.location.pathname
      if (
        [
          '/my-plan',
          '/pricing',
          '/payment/error',
          '/payment/success',
          '/subscription/failed',
        ].includes(pathname)
      ) {
        syncUserSubscriptionInfo().then()
      }
    }
  })
  return null
}

export const ContextMenuInit = () => {
  useInitRangy()
  return <ContextMenuRoot />
}

const AppInit = () => {
  useHideInHost()
  useClientMessageListenerForBackground()
  useAuthLogin()
  useInitUserInfo()
  useInitI18n()
  useInjectShortCutsRunTime()
  useEffectOnce(() => {
    if (isMaxAIImmersiveChatPage()) {
      showChatBox()
    }
    detectBrowserDefaultPDFViewer()
    renderGlobalSnackbar()
    ShortcutMessageClientInit()
    clientSetBrowserUAInfo().then().catch()
    initClientProxyWebsocket()
  })
  // 初始化one-click referral, https://app.maxai.me/referral
  useInitOneClickShareButton()
  // 初始化是否开启同步对话
  useInitSyncConversation()

  useInitSurveyState()
  useButtonClickedTracker()

  const isInMaxAIImmersiveChatPage = isMaxAIImmersiveChatPage()
  return (
    <>
      <MaxAISubscriptionUpdate />
      <MAXAIPDFAIViewerErrorAlert />
      <MaxAIPDFAIViewerTopBarButtonGroup />
      {!isInMaxAIImmersiveChatPage && <ContextMenuInit />}
      <AppSettingsInit />
      <UseChatGPTWebPageJumpToShortCuts />
    </>
  )
}

export default AppInit
