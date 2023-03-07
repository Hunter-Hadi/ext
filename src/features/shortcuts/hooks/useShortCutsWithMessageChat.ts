import { pingDaemonProcess, useMessageWithChatGPT } from '@/features/chatgpt'
import { useRef, useState } from 'react'
import { ShortCutsEngine } from '../core'
import { useShortCutsParameters } from '../hooks'
import { useCurrentMessageView, useInboxComposeViews } from '@/features/gmail'
import { ISetActionsType } from '../types'
import { EzMailBoxIsOpen, showEzMailBox } from '@/utils'

const shortCutsEngine = new ShortCutsEngine()
const useShortCutsWithMessageChat = (defaultInputValue?: string) => {
  const [loading, setLoading] = useState(false)
  const getParams = useShortCutsParameters()
  const shortCutsEngineRef = useRef<ShortCutsEngine | null>(shortCutsEngine)
  const messageWithChatGPT = useMessageWithChatGPT(defaultInputValue || '')
  const { currentComposeView } = useInboxComposeViews()
  const { currentMessageView } = useCurrentMessageView()
  const setShortCuts = (actions: ISetActionsType) => {
    if (!shortCutsEngineRef.current) {
      return false
    }
    shortCutsEngineRef.current?.setActions(actions)
    return true
  }
  const runShortCuts = async () => {
    if (!shortCutsEngineRef.current) {
      return
    }
    if (!EzMailBoxIsOpen()) {
      showEzMailBox()
    }
    try {
      setLoading(true)
      await pingDaemonProcess()
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

  return {
    ...messageWithChatGPT,
    shortCutsEngineRef,
    runShortCuts,
    setShortCuts,
    loading,
  }
}
export { useShortCutsWithMessageChat }
