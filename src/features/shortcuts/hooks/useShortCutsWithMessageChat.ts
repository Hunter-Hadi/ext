import { useCallback, useRef } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'

import { useAuthLogin } from '@/features/auth'
import { ContentScriptConnectionV2, pingUntilLogin } from '@/features/chatgpt'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import ShortCutsEngine from '@/features/shortcuts/core/ShortCutsEngine'
import { useShortCutsParameters } from '@/features/shortcuts/hooks'
import { IShortCutsParameter } from '@/features/shortcuts/hooks/useShortCutsParameters'
import { ShortCutsState } from '@/features/shortcuts/store'
import { ISetActionsType } from '@/features/shortcuts/types/Action'
import { ChatGPTConversationState } from '@/features/sidebar/store'
import {
  isShowChatBox,
  showChatBox,
} from '@/features/sidebar/utils/sidebarChatBoxHelper'

const shortCutsEngine = new ShortCutsEngine()
const clientMessageChannelEngine = new ContentScriptConnectionV2({
  runtime: 'client',
})
const shortcutsMessageChannelEngine = new ContentScriptConnectionV2({
  runtime: 'shortcut',
})
const useShortCutsWithMessageChat = () => {
  const { isLogin } = useAuthLogin()
  const getParams = useShortCutsParameters()
  const [shortCutsState, setShortsCutsState] = useRecoilState(ShortCutsState)
  const { loading: chatGPTConversationLoading } = useRecoilValue(
    ChatGPTConversationState,
  )
  const shortCutsEngineRef = useRef<ShortCutsEngine | null>(shortCutsEngine)
  const clientConversationEngine = useClientConversation()
  const setShortCuts = (actions: ISetActionsType) => {
    if (!shortCutsEngineRef.current) {
      return false
    }
    shortCutsEngineRef.current?.setActions(actions)
    return true
  }
  const runShortCuts = useCallback(
    async (
      needShowChatBox = false,
      overwriteParameters?: IShortCutsParameter[],
    ) => {
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
            parameters: overwriteParameters || getParams().shortCutsParameters,
            engine: {
              shortcutsEngine: shortCutsEngineRef.current,
              clientConversationEngine,
              clientMessageChannelEngine,
              shortcutsMessageChannelEngine,
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
    [shortCutsEngineRef, getParams, isLogin],
  )
  const stopShortCuts = useCallback(async () => {
    if (!shortCutsEngineRef.current) {
      return
    }
    await shortCutsEngineRef.current.stop()
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
    getParams,
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
