import cloneDeep from 'lodash-es/cloneDeep'
import { useEffect, useRef } from 'react'
import { useRecoilState } from 'recoil'
import { v4 as uuidV4 } from 'uuid'

import { AuthUserInfoState } from '@/features/auth/store'
import { ISystemChatMessage } from '@/features/chatgpt/types'
import { ContentScriptConnectionV2 } from '@/features/chatgpt/utils'
import { clientChatConversationModifyChatMessages } from '@/features/chatgpt/utils/clientChatConversation'
import useEffectOnce from '@/features/common/hooks/useEffectOnce'
import { useFocus } from '@/features/common/hooks/useFocus'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import { listReverseFind } from '@/utils/dataHelper/arrayHelper'
import Log from '@/utils/Log'
const port = new ContentScriptConnectionV2()
const log = new Log('Features/Auth/UseChatGPTPlusChat')

const userInitUserInfo = (isInit = true) => {
  const [userInfo, setUserInfo] = useRecoilState(AuthUserInfoState)
  const { currentSidebarConversationMessages, currentSidebarConversationId } =
    useSidebarSettings()
  const needPushUpgradeMessage = useRef(false)
  const upgradeTextRef = useRef('')
  const syncUserInfo = async () => {
    try {
      setUserInfo((prevState) => {
        return {
          ...prevState,
          loading: true,
        }
      })
      const result = await port.postMessage({
        event: 'Client_getUseChatGPTUserInfo',
        data: {},
      })
      if (result.success && result.data?.email) {
        setUserInfo({
          user: result.data,
          loading: false,
        })
        return true
      }
      return false
    } catch (e) {
      log.error(e)
      return false
    } finally {
      setUserInfo((prevState) => {
        return {
          ...prevState,
          loading: false,
        }
      })
    }
  }
  const syncUserSubscriptionInfo = async () => {
    try {
      setUserInfo((prevState) => {
        return {
          ...prevState,
          loading: true,
        }
      })
      let currentUserInfo = cloneDeep(userInfo.user)
      if (!currentUserInfo) {
        const result = await port.postMessage({
          event: 'Client_getUseChatGPTUserInfo',
          data: {},
        })
        if (result.success && result.data?.email) {
          currentUserInfo = result.data
        }
      }
      if (!currentUserInfo) {
        return false
      }
      const result = await port.postMessage({
        event: 'Client_getUseChatGPTUserSubscriptionInfo',
        data: {},
      })
      if (result.success && result.data?.name) {
        const newRole = result.data
        if (newRole) {
          setUserInfo((prevState) => {
            let newUserInfo = cloneDeep(prevState.user)
            if (!newUserInfo) {
              newUserInfo = cloneDeep(currentUserInfo)
            }
            if (!newUserInfo) {
              return {
                user: null,
                loading: false,
              }
            }
            if (
              newUserInfo.role?.name &&
              newUserInfo.role.name !== newRole.name &&
              newRole.name !== 'free'
            ) {
              // 角色发生变化
              needPushUpgradeMessage.current = true
              if (newRole.name === 'elite') {
                upgradeTextRef.current =
                  'You have successfully upgraded to MaxAI Elite. Enjoy unlimited usage!'
              } else if (newRole.name === 'pro') {
                upgradeTextRef.current =
                  'You have successfully upgraded to MaxAI Pro. Enjoy enhanced productivity!'
              }
            }
            return {
              user: {
                ...newUserInfo,
                role: newRole,
              },
              loading: false,
            }
          })
        }
      }
      return false
    } catch (e) {
      log.error(e)
      return false
    } finally {
      setUserInfo((prevState) => {
        return {
          ...prevState,
          loading: false,
        }
      })
    }
  }
  useEffect(() => {
    if (!needPushUpgradeMessage.current || !upgradeTextRef.current) {
      return
    }
    // 如果是升级，需要在侧边栏显示升级消息
    if (
      currentSidebarConversationId &&
      !listReverseFind(
        currentSidebarConversationMessages,
        (message) =>
          message.text ===
            'You have successfully upgraded to MaxAI Elite. Enjoy unlimited usage!' ||
          message.text ===
            'You have successfully upgraded to MaxAI Pro. Enjoy enhanced productivity!',
      )
    ) {
      clientChatConversationModifyChatMessages(
        'add',
        currentSidebarConversationId,
        0,
        [
          {
            messageId: uuidV4(),
            type: 'system',
            parentMessageId: undefined,
            text: upgradeTextRef.current,
            meta: {
              status: 'success',
            },
          } as ISystemChatMessage,
        ],
      )
    }
  }, [currentSidebarConversationId, currentSidebarConversationMessages])
  useEffectOnce(() => {
    if (isInit) {
      syncUserInfo()
    }
  })
  useFocus(() => {
    if (isInit) {
      syncUserInfo()
    }
  })
  return {
    userInfo,
    syncUserInfo,
    syncUserSubscriptionInfo,
  }
}
export default userInitUserInfo
