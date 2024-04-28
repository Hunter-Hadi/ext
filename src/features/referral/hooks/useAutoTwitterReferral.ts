import { useCallback } from 'react'

import { useUserInfo } from '@/features/auth/hooks/useUserInfo'
import useClientChat from '@/features/chatgpt/hooks/useClientChat'
import ReferralConfig from '@/features/referral/config'
import { IShortcutEngineListenerType } from '@/features/shortcuts'
import Action from '@/features/shortcuts/core/Action'
import { clientFetchMaxAIAPI } from '@/features/shortcuts/utils'
import { clientSendMaxAINotification } from '@/utils/sendMaxAINotification/client'

const useAutoTwitterReferral = () => {
  const { userInfo } = useUserInfo()
  const { askAIWIthShortcuts, shortCutsEngine, loading } = useClientChat()

  const autoTwitterReferral = useCallback(async () => {
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
                referral_types: ['TWITTER_SHARE'],
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
            URLActionURL: `https://twitter.com/intent/tweet?text=${postText}`,
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
          type: 'OPERATION_ELEMENT',
          parameters: {
            OperationElementConfig: {
              elementSelectors: ['a[data-testid="AppTabBar_Profile_Link"]'],
              actionType: 'click',
              afterDelay: 2000,
            },
          },
        },
        {
          type: 'OPERATION_ELEMENT',
          parameters: {
            OperationElementConfig: {
              elementSelectors: [
                'article[data-testid="tweet"] div[data-testid="User-Name"] a[role="link"]',
              ],
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
              elementSelectors: ['div[data-testid="tweetText"]'],
              actionType: 'getText',
              executeElementCount: 10,
            },
          },
        },
        {
          type: 'SCRIPTS_CONDITIONAL',
          parameters: {
            WFCondition: 'Contains',
            WFMatchTextCaseSensitive: false,
            WFFormValues: {
              Value: postText.slice(0, 10),
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
              {
                type: 'CLOSE_URLS',
                parameters: {},
              },
              {
                type: 'OPEN_URLS',
                parameters: {
                  URLActionURL: 'https://twitter.com/MaxAI_HQ',
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
                    elementSelectors: [
                      'div[data-testid="1667007582270296064-follow"]',
                    ],
                    actionType: 'click',
                    beforeDelay: 2000,
                    //留点时间发接口
                    afterDelay: 3000,
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
  }, [loading, askAIWIthShortcuts, userInfo?.referral_code])
  return {
    autoTwitterReferral,
    autoTwitterReferralLoading: loading,
  }
}
export default useAutoTwitterReferral
