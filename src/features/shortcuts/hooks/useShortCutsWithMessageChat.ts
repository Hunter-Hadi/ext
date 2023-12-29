import { useCallback, useRef } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'

import { useAuthLogin } from '@/features/auth'
import {
  ContentScriptConnectionV2,
  pingUntilLogin,
  useMessageWithChatGPT,
} from '@/features/chatgpt'
import ShortCutsEngine from '@/features/shortcuts/core/ShortCutsEngine'
import { useShortCutsParameters } from '@/features/shortcuts/hooks'
import { ShortCutsState } from '@/features/shortcuts/store'
import { ISetActionsType } from '@/features/shortcuts/types/Action'
import { ChatGPTConversationState } from '@/features/sidebar/store'
import { isShowChatBox, showChatBox } from '@/utils'

const shortCutsEngine = new ShortCutsEngine()
const port = new ContentScriptConnectionV2({
  runtime: 'shortcut',
})

const useShortCutsWithMessageChat = (defaultInputValue?: string) => {
  const { isLogin } = useAuthLogin()
  const getParams = useShortCutsParameters()
  const [shortCutsState, setShortsCutsState] = useRecoilState(ShortCutsState)
  const { loading: chatGPTConversationLoading } = useRecoilValue(
    ChatGPTConversationState,
  )
  const shortCutsEngineRef = useRef<ShortCutsEngine | null>(shortCutsEngine)
  const messageWithChatGPT = useMessageWithChatGPT(defaultInputValue || '')
  const setShortCuts = (actions: ISetActionsType) => {
    if (!shortCutsEngineRef.current) {
      return false
    }
    shortCutsEngineRef.current?.setActions(actions)
    return true
  }
  const runShortCuts = useCallback(
    async (needShowChatBox = false) => {
      if (!shortCutsEngineRef.current) {
        return
      }
      if (!isLogin || (needShowChatBox && !isShowChatBox())) {
        showChatBox()
      }
      try {
        const isLoginSuccess = await pingUntilLogin()
        // 确保没有在运行
        if (
          isLoginSuccess &&
          (shortCutsEngineRef.current?.stepIndex === -1 ||
            shortCutsEngineRef.current.status === 'stop')
        ) {
          const needLoading = shortCutsEngineRef.current?.actions.find(
            (action) => action.type === 'ASK_CHATGPT',
          )
          if (needLoading) {
            setShortsCutsState({
              status: 'running',
            })
          }
          await shortCutsEngineRef.current.run({
            parameters: getParams().shortCutsParameters,
            engine: {
              getShortCutsEngine: (): ShortCutsEngine | null => {
                return shortCutsEngineRef.current
              },
              getChartGPT: () => {
                return messageWithChatGPT
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
    },
    [messageWithChatGPT, shortCutsEngineRef, getParams, isLogin],
  )
  const stopShortCuts = useCallback(() => {
    if (!shortCutsEngineRef.current) {
      return
    }
    shortCutsEngineRef.current.stop()
    setShortsCutsState({
      status: shortCutsEngine.status || 'idle',
    })
  }, [shortCutsEngineRef])

  const resetShortCuts = useCallback(() => {
    if (!shortCutsEngineRef.current) {
      return
    }
    shortCutsEngineRef.current.reset()
    setShortsCutsState({
      status: shortCutsEngine.status || 'idle',
    })
  }, [])

  return {
    ...messageWithChatGPT,
    shortCutsEngineRef,
    runShortCuts,
    setShortCuts,
    loading: shortCutsState.status === 'running' || chatGPTConversationLoading,
    status: shortCutsState.status,
    stopShortCuts,
    resetShortCuts,
  }
}
export { useShortCutsWithMessageChat }
