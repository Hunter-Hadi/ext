import { useShortCutsWithMessageChat } from '@/features/shortcuts/hooks/useShortCutsWithMessageChat'
import { useCallback } from 'react'
import { IShortcutEngineListenerType } from '@/features/shortcuts'
import Action from '@/features/shortcuts/core/Action'
import { useUserInfo } from '@/features/auth/hooks/useUserInfo'
import ReferralConfig from '@/features/referral/config'
import { sendLarkBotMessage } from '@/utils/larkBot'

const useAutoTwitterReferral = () => {
  const { userInfo } = useUserInfo()
  const { setShortCuts, runShortCuts, loading, shortCutsEngineRef } =
    useShortCutsWithMessageChat()
  const autoTwitterReferral = useCallback(async () => {
    if (!loading) {
      setShortCuts([
        {
          type: 'OPEN_URLS',
          parameters: {
            URLActionURL: `https://twitter.com/intent/tweet?text=${ReferralConfig.inviteLink(
              userInfo?.referral_code || '',
            )}`,
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
            WFFormValues: {
              Value: ReferralConfig.inviteLinkMatchText,
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
      const listener: IShortcutEngineListenerType = (event, data) => {
        const action = data?.action as Action
        if (
          event === 'afterRunAction' &&
          action?.type === 'SET_VARIABLE' &&
          action.parameters?.VariableName === 'AutoTwitterReferralResult'
        ) {
          const isSuccess = action.parameters.WFFormValues?.Value === true
          sendLarkBotMessage(
            `[Referral] One-click button [Twitter] ${
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
            // alert('发送api')
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
    autoTwitterReferral,
    autoTwitterReferralLoading: loading,
  }
}
export default useAutoTwitterReferral
