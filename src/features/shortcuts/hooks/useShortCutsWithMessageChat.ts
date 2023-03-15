import { pingUntilLogin, useMessageWithChatGPT } from '@/features/chatgpt'
import { useCallback, useRef, useState } from 'react'
import ShortCutsEngine from '@/features/shortcuts/core/ShortCutsEngine'
import { useShortCutsParameters } from '@/features/shortcuts/hooks'
import { useCurrentMessageView, useInboxComposeViews } from '@/features/gmail'
import { ISetActionsType } from '@/features/shortcuts/types'
import { ChatBoxIsOpen, showChatBox } from '@/utils'

const shortCutsEngine = new ShortCutsEngine()
const useShortCutsWithMessageChat = (defaultInputValue?: string) => {
  const [loading, setLoading] = useState(false)
  const getParams = useShortCutsParameters()
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
      if (isLoginSuccess) {
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
      setLoading(false)
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
    loading,
  }
}
export { useShortCutsWithMessageChat }
