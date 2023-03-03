import { useMessageWithChatGPT } from '@/features/chatgpt'
import { useEffect, useRef, useState } from 'react'
import { ShortCutsEngine, useShortCutsParameters } from '@/features/shortcuts'

const delay = (t: number) => new Promise((resolve) => setTimeout(resolve, t))
const useShortCutsWithMessageChat = (defaultInputValue?: string) => {
  const [loading, setLoading] = useState(false)
  const getParams = useShortCutsParameters()
  const shortCutsEngineRef = useRef<ShortCutsEngine | null>(null)
  const messageWithChatGPT = useMessageWithChatGPT(defaultInputValue || '')

  const runShortCuts = async () => {
    if (!shortCutsEngineRef.current) {
      return
    }
    try {
      setLoading(true)
      await shortCutsEngineRef.current.run(getParams().shortCutsParameters)
      const currentAction = shortCutsEngineRef.current.getCurrentAction()
      if (currentAction) {
        console.log(currentAction)
        if (
          currentAction.type === 'prompt' &&
          currentAction.output &&
          !currentAction.error
        ) {
          const { success, answer } = await messageWithChatGPT.sendQuestion(
            currentAction.output,
          )
          if (shortCutsEngineRef.current) {
            if (!success) {
              // 回到上一步
              shortCutsEngineRef.current.stepIndex = Math.max(
                shortCutsEngineRef.current.stepIndex - 1,
                0,
              )
              return
            }
            if (answer) {
              shortCutsEngineRef.current.setVariable(
                'LAST_CHAT_GPT_ANSWER',
                answer,
                true,
              )
            }
          }
        }
        messageWithChatGPT.setInputValue('')
        if (currentAction?.autoNext) {
          await delay(1000)
          await runShortCuts()
        }
      }
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
