import { useCallback, useEffect, useState } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'

import { useAuthLogin } from '@/features/auth'
import { ContentScriptConnectionV2, pingUntilLogin } from '@/features/chatgpt'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import { IShortcutEngine } from '@/features/shortcuts'
import ShortCutsEngineFactory from '@/features/shortcuts/core/ShortCutsEngine'
import { useShortCutsParameters } from '@/features/shortcuts/hooks'
import { IShortCutsParameter } from '@/features/shortcuts/hooks/useShortCutsParameters'
import { ShortCutsState } from '@/features/shortcuts/store'
import { ISetActionsType } from '@/features/shortcuts/types/Action'
import { ClientWritingMessageState } from '@/features/sidebar/store'
import {
  isShowChatBox,
  showChatBox,
} from '@/features/sidebar/utils/sidebarChatBoxHelper'

const clientMessageChannelEngine = new ContentScriptConnectionV2({
  runtime: 'client',
})
const shortcutsMessageChannelEngine = new ContentScriptConnectionV2({
  runtime: 'shortcut',
})
const useShortCutsEngine = () => {
  const { isLogin } = useAuthLogin()
  const getParams = useShortCutsParameters()
  const [shortCutsState, setShortsCutsState] = useRecoilState(ShortCutsState)
  const { loading: chatGPTConversationLoading } = useRecoilValue(
    ClientWritingMessageState,
  )
  const clientConversationEngine = useClientConversation()
  const [shortCutsEngine, setShortCutsEngine] =
    useState<IShortcutEngine | null>(ShortCutsEngineFactory.create(''))
  useEffect(() => {
    if (clientConversationEngine.currentConversationId) {
      setShortCutsEngine(
        ShortCutsEngineFactory.create(
          clientConversationEngine.currentConversationId,
        ),
      )
    }
  }, [clientConversationEngine.currentConversationId])
  const setShortCuts = (actions: ISetActionsType) => {
    if (!shortCutsEngine) {
      return false
    }
    shortCutsEngine?.setActions(actions)
    return true
  }
  const runShortCuts = useCallback(
    async (
      isOpenSidebarChatBox = false,
      overwriteParameters?: IShortCutsParameter[],
    ) => {
      if (!shortCutsEngine) {
        return
      }
      if (!isLogin || (isOpenSidebarChatBox && !isShowChatBox())) {
        showChatBox()
      }
      try {
        const isLoginSuccess = await pingUntilLogin(
          shortCutsEngine.conversationId,
        )
        // 确保没有在运行
        if (
          isLoginSuccess &&
          (shortCutsEngine?.stepIndex === -1 ||
            shortCutsEngine.status === 'stop')
        ) {
          const needLoading = shortCutsEngine?.actions.find(
            (action) => action.type === 'ASK_CHATGPT',
          )
          if (needLoading) {
            setShortsCutsState({
              status: 'running',
            })
          }
          const overwriteParametersMap: Record<string, IShortCutsParameter> = {}
          if (overwriteParameters) {
            overwriteParameters.forEach((param) => {
              overwriteParametersMap[param.key] = param
            })
          }
          const shortCutsParameters = getParams().shortCutsParameters.map(
            (shortCutsParameter) => {
              const overwriteParam =
                overwriteParametersMap[shortCutsParameter.key]
              if (overwriteParam) {
                return overwriteParam
              }
              return shortCutsParameter
            },
          )
          await shortCutsEngine.run({
            parameters: shortCutsParameters,
            engine: {
              shortcutsEngine: shortCutsEngine,
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
          status: shortCutsEngine?.status || 'idle',
        })
      }
    },
    [
      shortCutsEngine,
      clientConversationEngine,
      clientMessageChannelEngine,
      shortcutsMessageChannelEngine,
      getParams,
      isLogin,
    ],
  )
  const stopShortCuts = useCallback(async () => {
    if (!shortCutsEngine) {
      return
    }
    await shortCutsEngine.stop({
      engine: {
        shortcutsEngine: shortCutsEngine,
        clientConversationEngine,
        clientMessageChannelEngine,
        shortcutsMessageChannelEngine,
      },
    })
    setShortsCutsState({
      status: shortCutsEngine?.status || 'idle',
    })
  }, [
    shortCutsEngine,
    clientConversationEngine,
    clientMessageChannelEngine,
    shortcutsMessageChannelEngine,
  ])

  const resetShortCuts = useCallback(() => {
    if (!shortCutsEngine) {
      return
    }
    shortCutsEngine.reset()
    setShortsCutsState({
      status: shortCutsEngine?.status || 'idle',
    })
  }, [shortCutsEngine])

  return {
    getParams,
    shortCutsEngine,
    runShortCuts,
    setShortCuts,
    loading: shortCutsState.status === 'running' || chatGPTConversationLoading,
    status: shortCutsState.status,
    stopShortCuts,
    resetShortCuts,
  }
}
export { useShortCutsEngine }
