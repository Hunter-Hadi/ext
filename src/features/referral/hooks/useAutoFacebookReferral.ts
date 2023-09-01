import { useShortCutsWithMessageChat } from '@/features/shortcuts/hooks/useShortCutsWithMessageChat'
import { useCallback } from 'react'

const useAutoFacebookReferral = () => {
  const { setShortCuts, runShortCuts, loading } = useShortCutsWithMessageChat()
  const autoFacebookReferral = useCallback(async () => {
    if (!loading) {
      setShortCuts([
        {
          type: 'OPEN_URLS',
          parameters: {
            URLActionURL: `https://www.facebook.com/sharer/sharer.php?u=https://app.maxai.me`,
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
              elementSelectors: ['textarea[title]'],
              actionType: 'insertText',
              actionExtraData: {
                clearBeforeInsertText: true,
                text: 'Join me at MaxAI.me for a free week of MaxAI Pro rewards. It lets you use AI on any webpage with one click, powered by ChatGPT, Claude, Bard, and Bing AI. Click here: https://app.maxai.me',
              },
              beforeDelay: 2000,
            },
          },
        },
        {
          type: 'OPERATION_ELEMENT',
          parameters: {
            OperationElementConfig: {
              elementSelectors: ['button[name="__CONFIRM__"]'],
              actionType: 'click',
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
    autoFacebookReferral,
    autoFacebookReferralLoading: loading,
  }
}

export default useAutoFacebookReferral
