import { useCallback } from 'react'

import { useUserInfo } from '@/features/auth/hooks/useUserInfo'
import useClientChat from '@/features/chatgpt/hooks/useClientChat'
import ReferralConfig from '@/features/referral/config'
import { IShortcutEngineListenerType } from '@/features/shortcuts'
import Action from '@/features/shortcuts/core/Action'
import { clientFetchMaxAIAPI } from '@/features/shortcuts/utils'
import { clientSendMaxAINotification } from '@/utils/sendMaxAINotification/client'

const useAutoFacebookReferral = () => {
  const { userInfo } = useUserInfo()
  const { askAIWIthShortcuts, shortCutsEngine, loading } = useClientChat()
  const autoFacebookReferral = useCallback(async () => {
    if (!loading) {
      const postText = ReferralConfig.inviteLink(userInfo?.referral_code || '')

      const listener: IShortcutEngineListenerType = (event, data) => {
        const action = data?.action as Action
        if (
          event === 'afterRunAction' &&
          action?.type === 'SET_VARIABLE' &&
          action.parameters?.VariableName === 'AutoTwitterReferralResult'
        ) {
          const isSuccess = action.parameters.WFFormValues?.Value === true
          clientSendMaxAINotification(
            'REFERRAL',
            `[Referral] One-click button [Facebook] ${
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
              referral_types: ['FACEBOOK_SHARE'],
            }).then()
          }
        }
      }
      shortCutsEngine?.addListener(listener)
      await askAIWIthShortcuts([
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
                text: ReferralConfig.inviteLink(userInfo?.referral_code || ''),
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
              afterDelay: 3000,
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
            URLActionURL: 'https://www.facebook.com/profile.php',
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
                'div[data-ad-preview="message"]',
                'div[data-ad-comet-preview="message"]',
              ],
              executeElementCount: 10,
              actionType: 'getText',
              beforeDelay: 2000,
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
    autoFacebookReferral,
    autoFacebookReferralLoading: loading,
  }
}

export default useAutoFacebookReferral
