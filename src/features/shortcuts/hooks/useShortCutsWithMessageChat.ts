import {
  ContentScriptConnectionV2,
  pingUntilLogin,
  useMessageWithChatGPT,
} from '@/features/chatgpt'
import { useCallback, useRef } from 'react'
import ShortCutsEngine from '@/features/shortcuts/core/ShortCutsEngine'
import { useShortCutsParameters } from '@/features/shortcuts/hooks'
import {
  useCurrentMessageView,
  useInboxComposeViews,
} from '@/features/gmail/hooks'
import { isShowChatBox, showChatBox } from '@/utils'
import { useRecoilState, useRecoilValue } from 'recoil'
import { ShortCutsState } from '@/features/shortcuts/store'
import { ChatGPTConversationState } from '@/features/gmail/store'
import { ISetActionsType } from '@/features/shortcuts/types/Action'

const shortCutsEngine = new ShortCutsEngine()
const port = new ContentScriptConnectionV2({
  runtime: 'shortcut',
})
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
    if (!isShowChatBox()) {
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
            getShortCutsEngine: (): ShortCutsEngine | null => {
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
            getBackgroundConversation: () => {
              return port
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
