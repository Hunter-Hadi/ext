import { pingUntilLogin, useMessageWithChatGPT } from '@/features/chatgpt'
import { useCallback, useRef } from 'react'
import ShortCutsEngine from '@/features/shortcuts/core/ShortCutsEngine'
import { useShortCutsParameters } from '@/features/shortcuts/hooks'
import {
  useCurrentMessageView,
  useInboxComposeViews,
} from '@/features/gmail/hooks'
import { ISetActionsType } from '@/features/shortcuts/types'
import { ChatBoxIsOpen, showChatBox } from '@/utils'
import { useRecoilState, useRecoilValue } from 'recoil'
import { ShortCutsState } from '@/features/shortcuts/store'
import { ChatGPTConversationState } from '@/features/gmail/store'

const shortCutsEngine = new ShortCutsEngine()
const useShortCutsWithMessageChat = (defaultInputValue?: string) => {
  const getParams = useShortCutsParameters()
  const [shortCutsState, setShortsCutsState] = useRecoilState(ShortCutsState)
  const { loading: chatGPTConversationLoading } = useRecoilValue(
    ChatGPTConversationState,
  )
  const shortCutsEngineRef = useRef<ShortCutsEngine | null>(shortCutsEngine)
  const messageWithChatGPT = useMessageWithChatGPT(defaultInputValue || '')
  const { messageViewText } = useCurrentMessageView()
  const { currentComposeView } = useInboxComposeViews()
  const { currentMessageView } = useCurrentMessageView()
  const setShortCuts = (actions: ISetActionsType) => {
    if (!shortCutsEngineRef.current) {
      return false
    }
    shortCutsEngineRef.current?.setActions(actions)
    return true
  }
  const runShortCuts = useCallback(async () => {
    if (!shortCutsEngineRef.current) {
      return
    }
    if (!ChatBoxIsOpen()) {
      showChatBox()
    }
    try {
      const isLoginSuccess = await pingUntilLogin()
      // 确保没有在运行
      if (isLoginSuccess && shortCutsEngineRef.current?.stepIndex === -1) {
        setShortsCutsState({
          status: 'running',
        })
        await shortCutsEngineRef.current.run({
          parameters: getParams().shortCutsParameters,
          engine: {
            getShortCuts: (): ShortCutsEngine | null => {
              return shortCutsEngineRef.current
            },
            getChartGPT: () => {
              return messageWithChatGPT
            },
            getInbox: () => {
              return {
                currentComposeView,
                currentMessageView,
              }
            },
          },
        })
      }
    } catch (e) {
      console.log('run short cuts error: \t', e)
    } finally {
      setShortsCutsState({
        status: shortCutsEngine.status || 'idle',
      })
    }
  }, [
    messageWithChatGPT,
    currentMessageView,
    currentComposeView,
    shortCutsEngineRef,
    messageViewText,
    getParams,
  ])

  return {
    ...messageWithChatGPT,
    shortCutsEngineRef,
    runShortCuts,
    setShortCuts,
    loading: shortCutsState.status === 'running' || chatGPTConversationLoading,
  }
}
export { useShortCutsWithMessageChat }
