import { ContentScriptConnectionV2 } from '@/features/chatgpt/utils'
import Log from '@/utils/Log'
import { useRecoilState, useSetRecoilState } from 'recoil'
import { ChatGPTMessageState } from '@/features/sidebar'
import { v4 as uuidV4 } from 'uuid'
import { ISystemChatMessage } from '@/features/chatgpt/types'
import cloneDeep from 'lodash-es/cloneDeep'
import { AuthUserInfoState } from '@/features/auth/store'
import useEffectOnce from '@/hooks/useEffectOnce'
import { useFocus } from '@/hooks/useFocus'

const port = new ContentScriptConnectionV2()
const log = new Log('Features/Auth/UseChatGPTPlusChat')

const upgradeText =
  'You have successfully upgraded to MaxAI Pro. Enjoy unlimited usage!'

const userInitUserInfo = (isInit = true) => {
  const [userInfo, setUserInfo] = useRecoilState(AuthUserInfoState)
  const updateMessage = useSetRecoilState(ChatGPTMessageState)
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
              updateMessage((prevState) => {
                // 避免重复添加
                for (let i = prevState.length - 1; i >= 0; i--) {
                  const message = prevState[i]
                  if (message.type === 'system') {
                    if (message.text === upgradeText) {
                      return prevState
                    }
                  }
                }
                return prevState.concat({
                  messageId: uuidV4(),
                  type: 'system',
                  parentMessageId: undefined,
                  text: upgradeText,
                  extra: {
                    status: 'success',
                  },
                } as ISystemChatMessage)
              })
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
