import { useShortCutsWithMessageChat } from '@/features/shortcuts/hooks/useShortCutsWithMessageChat'
import { useCallback } from 'react'

const useAutoLinkedinReferral = () => {
  const { setShortCuts, runShortCuts, loading } = useShortCutsWithMessageChat()
  const autoLinkedinReferral = useCallback(async () => {
    if (!loading) {
      setShortCuts([
        {
          type: 'OPEN_URLS',
          parameters: {
            URLActionURL: `https://www.linkedin.com/shareArticle/?url=https%3A%2F%2Fapp.maxai.me%3Finvite%3DIPn7Xnby`,
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
              elementSelectors: ['button.artdeco-button'],
              actionType: 'click',
              beforeDelay: 2000,
              afterDelay: 2000,
            },
          },
        },
        {
          type: 'OPERATION_ELEMENT',
          parameters: {
            OperationElementConfig: {
              elementSelectors: ['div[contenteditable="true"]'],
              actionType: 'insertText',
              actionExtraData: {
                clearBeforeInsertText: true,
                text: 'Join me at MaxAI.me for a free week of MaxAI Pro rewards. It lets you use AI on any webpage with one click, powered by ChatGPT, Claude, Bard, and Bing AI. Click here: https://app.maxai.me',
              },
              afterDelay: 1000,
            },
          },
        },
        {
          type: 'OPERATION_ELEMENT',
          parameters: {
            OperationElementConfig: {
              elementSelectors: ['button.share-actions__primary-action'],
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
    autoLinkedinReferral,
    autoLinkedinReferralLoading: loading,
  }
}

export default useAutoLinkedinReferral
