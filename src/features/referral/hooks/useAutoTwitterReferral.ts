import { useShortCutsWithMessageChat } from '@/features/shortcuts/hooks/useShortCutsWithMessageChat'
import { useCallback } from 'react'

const useAutoTwitterReferral = () => {
  const { setShortCuts, runShortCuts, loading } = useShortCutsWithMessageChat()
  const autoTwitterReferral = useCallback(async () => {
    if (!loading) {
      setShortCuts([
        {
          type: 'OPEN_URLS',
          parameters: {
            URLActionURL: `https://twitter.com/intent/tweet?text=
Join me at MaxAI.me for a free week of MaxAI Pro rewards. It lets you use AI on any webpage with one click, powered by ChatGPT, Claude, Bard, and Bing AI. Click here: &url=https://app.maxai.me?invite=UJlbFI6U`,
          },
        },
        {
          type: 'SET_VARIABLE',
          parameters: {
            VariableName: 'OperationElementTabID',
          },
        },
        {
          type: 'OPERATION_ELEMENT',
          parameters: {
            OperationElementConfig: {
              elementSelectors: ['div[data-testid="tweetButton"]'],
              actionType: 'click',
              beforeDelay: 2000,
              //留点时间发接口
              afterDelay: 2000,
            },
          },
        },
        {
          type: 'CLOSE_URLS',
          parameters: {},
        },
      ])
      await runShortCuts()
      return true
    }
    return false
  }, [loading, runShortCuts, setShortCuts])
  return {
    autoTwitterReferral,
    loading,
  }
}
export default useAutoTwitterReferral
