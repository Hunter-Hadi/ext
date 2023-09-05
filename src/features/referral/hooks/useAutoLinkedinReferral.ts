import { useShortCutsWithMessageChat } from '@/features/shortcuts/hooks/useShortCutsWithMessageChat'
import { useCallback } from 'react'
import { useUserInfo } from '@/features/auth/hooks/useUserInfo'
import ReferralConfig from '@/features/referral/config'
import { IShortcutEngineListenerType } from '@/features/shortcuts'
import Action from '@/features/shortcuts/core/Action'
import { sendLarkBotMessage } from '@/utils/larkBot'
import { clientFetchMaxAIAPI } from '@/features/shortcuts/utils'

const useAutoLinkedinReferral = () => {
  const { userInfo } = useUserInfo()
  const { setShortCuts, runShortCuts, loading, shortCutsEngineRef } =
    useShortCutsWithMessageChat()
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
                text: ReferralConfig.inviteLink(userInfo?.referral_code || ''),
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
              afterDelay: 3000,
            },
          },
        },
        {
          type: 'OPERATION_ELEMENT',
          parameters: {
            OperationElementConfig: {
              elementSelectors: ['a.inshare-success-state__continue-btn'],
              actionType: 'getText',
            },
          },
        },
        {
          type: 'SCRIPTS_CONDITIONAL',
          parameters: {
            WFCondition: 'Contains',
            WFMatchTextCaseSensitive: false,
            WFFormValues: {
              Value: 'linkedin',
              WFSerializationType: 'WFDictionaryFieldValue',
            },
            WFConditionalIfTrueActions: [
              {
                type: 'SET_VARIABLE',
                parameters: {
                  VariableName: 'AutoTwitterReferralResult',
                  WFFormValues: {
                    Value: true,
                    WFSerializationType: 'WFDictionaryFieldValue',
                  },
                },
              },
            ],
            WFConditionalIfFalseActions: [
              {
                type: 'SET_VARIABLE',
                parameters: {
                  VariableName: 'AutoTwitterReferralResult',
                  WFFormValues: {
                    Value: false,
                    WFSerializationType: 'WFDictionaryFieldValue',
                  },
                },
              },
            ],
          },
        },
        {
          type: 'CLOSE_URLS',
          parameters: {},
        },
        {
          type: 'OPEN_URLS',
          parameters: {
            URLActionURL: 'current_page',
          },
        },
      ])
      const listener: IShortcutEngineListenerType = (event, data) => {
        const action = data?.action as Action
        if (
          event === 'afterRunAction' &&
          action?.type === 'SET_VARIABLE' &&
          action.parameters?.VariableName === 'AutoTwitterReferralResult'
        ) {
          const isSuccess = action.parameters.WFFormValues?.Value === true
          sendLarkBotMessage(
            `[Referral] One-click button [Linkedin] ${
              isSuccess ? 'Success' : 'Fail'
            }`,
            JSON.stringify(
              {
                email: userInfo?.email || 'unknown',
                success: isSuccess,
              },
              null,
              4,
            ),
            {
              uuid: '608156c7-e65d-4a69-a055-6c10a6ba7217',
            },
          )
            .then()
            .catch()
          if (isSuccess) {
            clientFetchMaxAIAPI('/user/complete_referral', {
              referral_types: ['LINKEDIN_SHARE'],
            }).then()
          }
        }
      }
      shortCutsEngineRef.current?.addListener(listener)
      await runShortCuts()
      shortCutsEngineRef.current?.removeListener(listener)
      return true
    }
    return false
  }, [loading, runShortCuts, setShortCuts, userInfo?.referral_code])
  return {
    autoLinkedinReferral,
    autoLinkedinReferralLoading: loading,
  }
}

export default useAutoLinkedinReferral