import { useCallback } from 'react'

import { useUserInfo } from '@/features/auth/hooks/useUserInfo'
import useClientChat from '@/features/chatgpt/hooks/useClientChat'
import ReferralConfig from '@/features/referral/config'
import { IShortcutEngineListenerType } from '@/features/shortcuts'
import Action from '@/features/shortcuts/core/Action'
import { clientFetchMaxAIAPI } from '@/features/shortcuts/utils'
import { clientSendMaxAINotification } from '@/utils/sendMaxAINotification/client'

const useAutoLinkedinReferral = () => {
  const { userInfo } = useUserInfo()
  const { askAIWIthShortcuts, shortCutsEngine, loading } = useClientChat()
  const autoLinkedinReferral = useCallback(async () => {
    if (!loading) {
      const postText = ReferralConfig.inviteLink(userInfo?.referral_code || '')
      let shareLink = ''
      const listener: IShortcutEngineListenerType = (event, data) => {
        const action = data?.action as Action
        if (event === 'afterRunAction' && action?.type === 'SET_VARIABLE') {
          if (action.parameters?.VariableName === 'SHARE_POST_LINK') {
            shareLink = action.output
          } else if (
            action.parameters?.VariableName === 'AutoTwitterReferralResult'
          ) {
            const isSuccess = action.parameters.WFFormValues?.Value === true
            clientSendMaxAINotification(
              'REFERRAL',
              `[Referral] One-click button [Linkedin] ${
                isSuccess ? 'Success' : 'Fail'
              }`,
              JSON.stringify(
                {
                  email: userInfo?.email || 'unknown',
                  success: isSuccess,
                  shareLink: `[ ${shareLink} ]`,
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
              })
            }
          }
        }
      }
      shortCutsEngine?.addListener(listener)
      await askAIWIthShortcuts([
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
                text: postText,
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
              elementSelectors: ['a.inshare-success-state__view-btn'],
              actionType: 'getLink',
            },
          },
        },
        {
          type: 'SET_VARIABLE',
          parameters: {
            VariableName: 'SHARE_POST_LINK',
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
      shortCutsEngine?.removeListener(listener)
      return true
    }
    return false
  }, [askAIWIthShortcuts, loading, userInfo?.referral_code])
  return {
    autoLinkedinReferral,
    autoLinkedinReferralLoading: loading,
  }
}

export default useAutoLinkedinReferral
