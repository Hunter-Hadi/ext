import Box from '@mui/material/Box'
import React, { FC, useCallback, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useRecoilState, useRecoilValue } from 'recoil'
import Browser from 'webextension-polyfill'

import WarningBar from '@/components/WarningBar'
import { APP_USE_CHAT_GPT_HOST } from '@/constants'
import { useUserInfo } from '@/features/auth/hooks/useUserInfo'
import { DailyLimitState } from '@/features/auth/store'
import { getMaxAIChromeExtensionUserId } from '@/features/auth/utils'
import { authEmitPricingHooksLog } from '@/features/auth/utils/log'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import { useFocus } from '@/features/common/hooks/useFocus'
import { AppState } from '@/store'
import { isMaxAIImmersiveChatPage } from '@/utils/dataHelper/websiteHelper'

type IDailyLimitStatus = {
  userId?: string
  show?: boolean
}

const DAILY_LIMIT_STATUS_KEY = 'DAILY_LIMIT_STATUS_KEY'

const getDailyLimitStatus = async (): Promise<IDailyLimitStatus> => {
  try {
    const localData = await Browser.storage.local.get(DAILY_LIMIT_STATUS_KEY)
    if (localData[DAILY_LIMIT_STATUS_KEY]) {
      return JSON.parse(localData[DAILY_LIMIT_STATUS_KEY])
    }
  } catch (e) {
    console.error(e)
  }
  return {}
}

const setDailyLimitStatus = async (status: IDailyLimitStatus) => {
  try {
    await Browser.storage.local.set({
      [DAILY_LIMIT_STATUS_KEY]: JSON.stringify(status),
    })
    return true
  } catch (e) {
    console.error(e)
    return false
  }
}

const PermissionDailyLimitBar: FC = () => {
  const { t } = useTranslation(['client'])
  const { currentConversationIdRef, clientConversation } =
    useClientConversation()
  const { isFreeUser } = useUserInfo()
  const appState = useRecoilValue(AppState)

  const [dailyLimitState, setDailyLimitState] = useRecoilState(DailyLimitState)

  const { show } = dailyLimitState

  const handleShow = useCallback(async () => {
    setDailyLimitState((prev) => ({ ...prev, show: true }))
    const userId = await getMaxAIChromeExtensionUserId()
    setDailyLimitStatus({
      userId,
      show: true,
    })
  }, [])

  const handleClose = useCallback(async () => {
    setDailyLimitState((prev) => ({ ...prev, show: false }))
    setDailyLimitStatus({})
  }, [])

  const handleInit = useCallback(async () => {
    const userId = await getMaxAIChromeExtensionUserId()
    const status = await getDailyLimitStatus()
    if (!userId || userId !== status.userId) {
      // 退出登录或者切换账号
      handleClose()
      return
    }
    if (!isFreeUser) {
      // 付费用户
      handleClose()
      return
    }
    if (status.show) {
      handleShow()
    }
  }, [isFreeUser])

  /**
   * MIXPANEL事件监听
   */
  useEffect(() => {
    handleInit()
    const listener = (event: MessageEvent) => {
      if (event.data?.event === 'MAX_AI_MIXPANEL_TRACK') {
        const { data } = event.data
        if (data.paywallName === 'FAST_TEXT_MODEL') {
          handleShow()
        }
      }
    }
    window.addEventListener('message', listener)
    return () => {
      window.removeEventListener('message', listener)
    }
  }, [handleInit])

  /**
   * sidebar打开的时候 / type切换的时候需要记录
   */
  const conversationTypeRef = useRef(clientConversation?.type)
  useEffect(() => {
    if (!isMaxAIImmersiveChatPage() && !appState.open) return
    if (!show) return
    if (!currentConversationIdRef.current || !clientConversation?.type) return
    if (conversationTypeRef.current === clientConversation.type) return
    conversationTypeRef.current = clientConversation.type
    authEmitPricingHooksLog('show', 'TOP_BAR_FAST_TEXT_MODEL', {
      conversationId: currentConversationIdRef.current,
      conversationType: clientConversation.type,
    })
  }, [appState.open, show, clientConversation?.type])

  /**
   * focus去同步下状态
   */
  useFocus(handleInit)

  if (!show || !isFreeUser) return null

  return (
    <Box
      id="maxai-daily-limit-bar"
      ref={(ref: any) => {
        if (ref && dailyLimitState.barHeight !== ref.offsetHeight) {
          setDailyLimitState((prev) => ({
            ...prev,
            barHeight: ref.offsetHeight,
          }))
        }
      }}
    >
      <WarningBar
        title={t('client:sidebar__daily_limit__title')}
        content={t('client:sidebar__daily_limit__link__title')}
        href={`${APP_USE_CHAT_GPT_HOST}/pricing`}
        onClose={handleClose}
      />
    </Box>
  )
}

export default PermissionDailyLimitBar
