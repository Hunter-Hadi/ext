import { useMessageWithChatGPT } from '@/features/chatgpt'
import { useEffect, useRef, useState } from 'react'
import { ShortCutsEngine, useShortCutsParameters } from '@/features/shortcuts'
import { useCurrentMessageView, useInboxComposeViews } from '@/features/gmail'

const useShortCutsWithMessageChat = (defaultInputValue?: string) => {
  const [loading, setLoading] = useState(false)
  const getParams = useShortCutsParameters()
  const shortCutsEngineRef = useRef<ShortCutsEngine | null>(null)
  const messageWithChatGPT = useMessageWithChatGPT(defaultInputValue || '')
  const { currentComposeView } = useInboxComposeViews()
  const { currentMessageView } = useCurrentMessageView()
  const runShortCuts = async () => {
    if (!shortCutsEngineRef.current) {
      return
    }
    try {
      setLoading(true)
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
    } catch (e) {
      console.log('run short cuts error: \t', e)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    shortCutsEngineRef.current = new ShortCutsEngine()
  }, [])

  return {
    ...messageWithChatGPT,
    shortCutsEngineRef,
    runShortCuts,
    loading,
  }
}
export { useShortCutsWithMessageChat }
