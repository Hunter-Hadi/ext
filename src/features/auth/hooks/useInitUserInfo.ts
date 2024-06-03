import cloneDeep from 'lodash-es/cloneDeep'
import { useEffect, useRef } from 'react'
import { useRecoilState, useSetRecoilState } from 'recoil'
import { v4 as uuidV4 } from 'uuid'

import { AuthUserInfoState, UserQuotaUsageState } from '@/features/auth/store'
import { IUserQuotaUsageInfo } from '@/features/auth/types'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import { ContentScriptConnectionV2 } from '@/features/chatgpt/utils'
import useEffectOnce from '@/features/common/hooks/useEffectOnce'
import { useFocus } from '@/features/common/hooks/useFocus'
import { ClientConversationMessageManager } from '@/features/indexed_db/conversations/ClientConversationMessageManager'
import { ISystemChatMessage } from '@/features/indexed_db/conversations/models/Message'
import { listReverseFind } from '@/utils/dataHelper/arrayHelper'
import Log from '@/utils/Log'
const port = new ContentScriptConnectionV2()
const log = new Log('Features/Auth/UseChatGPTPlusChat')

const useInitUserInfo = (isInit = true) => {
  const [userInfo, setUserInfo] = useRecoilState(AuthUserInfoState)
  const setUserQuotaUsageInfo = useSetRecoilState(UserQuotaUsageState)
  const { clientConversationMessages, currentConversationIdRef } =
    useClientConversation()
  const needPushUpgradeMessage = useRef(false)
  const upgradeTextRef = useRef('')
  const syncUserInfo = async (forceUpdate = false) => {
    try {
      setUserInfo((prevState) => {
        return {
          ...prevState,
          loading: true,
        }
      })
      const result = await port.postMessage({
        event: 'Client_getUseChatGPTUserInfo',
        data: {
          forceUpdate,
        },
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
      /**
       * Client_getUseChatGPTUserSubscriptionInfo只返回userInfo.role
       * 处理subscription_payment_failed_at的信息，这里改成调用Client_getUseChatGPTUserInfo
       */
      // const result = await port.postMessage({
      //   event: 'Client_getUseChatGPTUserSubscriptionInfo',
      //   data: {},
      // })
      const result = await port.postMessage({
        event: 'Client_getUseChatGPTUserInfo',
        data: { forceUpdate: true },
      })
      if (result.success && result.data?.role?.name) {
        const newRole = result.data?.role
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
                'You have successfully upgraded to MaxAI Elite.'
            } else if (newRole.name === 'pro') {
              upgradeTextRef.current =
                'You have successfully upgraded to MaxAI Pro.'
            } else if (newRole.name === 'basic') {
              upgradeTextRef.current =
                'You have successfully upgraded to MaxAI Basic.'
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
      if (result.success && result.data?.email) {
        setUserInfo({
          user: result.data,
          loading: false,
        })
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

  const syncUserQuotaUsageInfo = async () => {
    try {
      setUserQuotaUsageInfo((prevState) => {
        return {
          ...prevState,
          loading: true,
        }
      })
      const result = await port.postMessage({
        event: 'Client_getMaxAIUserQuotaUsageInfo',
        data: {
          forceUpdate: true,
        },
      })
      if (result && result.data) {
        setUserQuotaUsageInfo({
          loading: false,
          ...(result.data as IUserQuotaUsageInfo),
        })
        return true
      } else {
        setUserQuotaUsageInfo((prevState) => {
          return {
            ...prevState,
            updateAt: Date.now(),
            loading: false,
          }
        })
        return false
      }
    } catch (e) {
      log.error(e)
      setUserQuotaUsageInfo((prevState) => {
        return {
          ...prevState,
          loading: false,
        }
      })
      return false
    }
  }

  const isPushUpgradeMessageRef = useRef(false)
  useEffect(() => {
    if (
      !needPushUpgradeMessage.current ||
      !upgradeTextRef.current ||
      isPushUpgradeMessageRef.current
    ) {
      return
    }
    // 如果是升级，需要在侧边栏显示升级消息
    if (
      currentConversationIdRef.current &&
      !listReverseFind(
        clientConversationMessages,
        (message) =>
          message.text === 'You have successfully upgraded to MaxAI Elite.' ||
          message.text === 'You have successfully upgraded to MaxAI Pro.' ||
          message.text === 'You have successfully upgraded to MaxAI Basic.',
      )
    ) {
      ClientConversationMessageManager.addMessages(
        currentConversationIdRef.current,
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
      isPushUpgradeMessageRef.current = true
    }
  }, [clientConversationMessages])
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
    syncUserQuotaUsageInfo,
  }
}
export default useInitUserInfo
