import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { CONTEXT_MENU_DRAFT_TYPES } from '@/features/contextMenu/constants'
import { IOnboardingTooltipProps } from '@/features/onboarding/components/OnboardingTooltip'
import { IOnBoardingSceneType } from '@/features/onboarding/types'
import {
  findOnboardingTooltipElement,
  getAlreadyOpenedCacheBySceneType,
} from '@/features/onboarding/utils'
import useCommands from '@/hooks/useCommands'
import { getMaxAIFloatingContextMenuRootElement } from '@/utils'
export type IOnBoardingTooltipConfigType = {
  // 选择器支持字符串数组
  referenceElementSelector: string | string[]
  containerFinder?: () => HTMLElement
  tooltipProps?: Partial<
    Omit<IOnboardingTooltipProps, 'children' | 'sceneType'>
  >
}

const useOnboardingTooltipConfig = (sceneType: IOnBoardingSceneType) => {
  const { chatBoxShortCutKey } = useCommands()

  const { t } = useTranslation(['onboarding'])

  const config = useMemo<IOnBoardingTooltipConfigType | null>(() => {
    if (sceneType === 'CONTEXT_MENU_CTA_BUTTON') {
      return {
        referenceElementSelector: `button#max_ai__floating_context_menu__cta_button`,
        tooltipProps: {
          title: t(
            'onboarding:onboarding_tooltip__CONTEXT_MENU_CTA_BUTTON__text',
          ),
          floatingMenuTooltip: true,
          placement: 'bottom-start',
          sx: {
            maxWidth: 400,
          },
          InformationBarProps: {
            shortcut: chatBoxShortCutKey,
          },
        },
      }
    }

    if (sceneType === 'FLOATING_CONTEXT_MENU_INPUT_BOX') {
      return {
        // referenceElementSelector: `textarea#${MAXAI_FLOATING_CONTEXT_MENU_INPUT_ID}`,
        referenceElementSelector: `div#ONBOARDING_TOOLTIP__FLOATING_CONTEXT_MENU_INPUT_BOX__REFERENCE_ELEMENT`,
        tooltipProps: {
          beforeTooltipShow: async () => {
            // FLOATING_CONTEXT_MENU_LIST_BOX 没打开过，不展示 FLOATING_CONTEXT_MENU_INPUT_BOX
            const contextMenuListBoxOpened =
              await getAlreadyOpenedCacheBySceneType(
                'FLOATING_CONTEXT_MENU_LIST_BOX',
              )
            // 不能和 FLOATING_CONTEXT_MENU_LIST_BOX tooltip 同时显示
            const root = getMaxAIFloatingContextMenuRootElement()
            if (
              !contextMenuListBoxOpened ||
              !!findOnboardingTooltipElement(
                'FLOATING_CONTEXT_MENU_LIST_BOX',
                root,
              )
            ) {
              // 阻止 Tooltip 打开
              return false
            } else {
              return true
            }
          },
          floatingMenuTooltip: true,
          placement: 'left',
          sx: {
            maxWidth: 440,
          },
        },
      }
    }

    if (sceneType === 'FLOATING_CONTEXT_MENU_LIST_BOX') {
      return {
        referenceElementSelector: `div[role=menu].dropdown-menu`,
        tooltipProps: {
          floatingMenuTooltip: true,
          placement: 'left',
          sx: {
            maxWidth: 320,
          },
        },
      }
    }

    if (sceneType === 'FLOATING_CONTEXT_MENU_REPLACE_SELECTION_MENUITEM') {
      return {
        referenceElementSelector: `div[data-id="${CONTEXT_MENU_DRAFT_TYPES.REPLACE_SELECTION}"].floating-context-menu-item`,
        tooltipProps: {
          title: t(
            'onboarding:onboarding_tooltip__FLOATING_CONTEXT_MENU_REPLACE_SELECTION_MENUITEM__text1',
          ),
          floatingMenuTooltip: true,
          placement: 'right-start',
          sx: {
            maxWidth: 390,
          },
          InformationBarProps: {
            shortcut: 'Enter',
          },
          slotProps: {
            popper: {
              modifiers: [
                {
                  name: 'offset',
                  options: {
                    offset: [0, 8],
                  },
                },
              ],
            },
          },
        },
      }
    }

    if (sceneType === 'FLOATING_CONTEXT_MENU_INPUT_BOX_AFTER_AI_RESPONSE') {
      return {
        referenceElementSelector: `div#ONBOARDING_TOOLTIP__FLOATING_CONTEXT_MENU_INPUT_BOX__REFERENCE_ELEMENT`,
        tooltipProps: {
          title: t(
            'onboarding:onboarding_tooltip__FLOATING_CONTEXT_MENU_INPUT_BOX_AFTER_AI_RESPONSE__text1',
          ),
          beforeTooltipShow: async () => {
            return new Promise((resolve) => {
              // 因为 FLOATING_CONTEXT_MENU_INPUT_BOX_AFTER_AI_RESPONSE tooltip 可能比 FLOATING_CONTEXT_MENU_REPLACE_SELECTION_MENUITEM tooltip 先执行渲染判断，
              // 所以 需要延迟一点再判断是否展示
              setTimeout(() => {
                const root = getMaxAIFloatingContextMenuRootElement()
                // 不能和 FLOATING_CONTEXT_MENU_REPLACE_SELECTION_MENUITEM tooltip 同时显示
                if (
                  findOnboardingTooltipElement(
                    'FLOATING_CONTEXT_MENU_REPLACE_SELECTION_MENUITEM',
                    root,
                  )
                ) {
                  // 阻止 Tooltip 打开
                  resolve(false)
                } else {
                  resolve(true)
                }
              }, 500)
            })
          },
          floatingMenuTooltip: true,
          placement: 'left',
          sx: {
            maxWidth: 300,
          },
        },
      }
    }

    if (sceneType === 'QUICK_ACCESS_CTA_BUTTON') {
      return {
        referenceElementSelector: `button[data-testid="quick-access-maxai-mini-button"]`,
        tooltipProps: {
          title: t(
            'onboarding:onboarding_tooltip__QUICK_ACCESS_CTA_BUTTON__text',
          ),
          // beforeTooltipShow: async () => {
          //   return new Promise((resolve) => {
          //     // 因为 FLOATING_CONTEXT_MENU_INPUT_BOX_AFTER_AI_RESPONSE tooltip 可能比 FLOATING_CONTEXT_MENU_REPLACE_SELECTION_MENUITEM tooltip 先执行渲染判断，
          //     // 所以 需要延迟一点再判断是否展示
          //     setTimeout(() => {
          //       const root = getMaxAIFloatingContextMenuRootElement()
          //       // 不能和 FLOATING_CONTEXT_MENU_REPLACE_SELECTION_MENUITEM tooltip 同时显示
          //       if (
          //         findOnboardingTooltipElement(
          //           'FLOATING_CONTEXT_MENU_REPLACE_SELECTION_MENUITEM',
          //           root,
          //         )
          //       ) {
          //         // 阻止 Tooltip 打开
          //         resolve(false)
          //       } else {
          //         resolve(true)
          //       }
          //     }, 500)
          //   })
          // },
          minimumTooltip: true,
          placement: 'left',
          sx: {
            maxWidth: 364,
          },
          InformationBarProps: {
            shortcut: chatBoxShortCutKey,
          },
          PopperProps: {
            sx: {
              '&[data-popper-placement*="left"] > div': {
                marginRight: '20px!important',
              },
            },
          },
        },
      }
    }

    if (sceneType === 'EMAIL_SUMMARY_BUTTON') {
      return {
        referenceElementSelector: [
          `button[data-testid="maxai-gmail-summary-button"]`,
          `button[data-testid="maxai-outlook-summary-button"]`,
        ],
        tooltipProps: {
          title: t('onboarding:onboarding_tooltip__EMAIL_SUMMARY_BUTTON__text'),
          placement: 'bottom',
        },
      }
    }

    if (sceneType === 'PDF_SUMMARY_BUTTON') {
      return {
        referenceElementSelector: `button[data-testid="maxai-pdf-summary-button"]`,
        tooltipProps: {
          title: t('onboarding:onboarding_tooltip__PDF_SUMMARY_BUTTON__text'),
          placement: 'bottom',
          sx: {
            width: 365,
          },
        },
      }
    }

    // ==================== instant reply start ====================
    // compose reply button
    if (
      sceneType === 'INSTANT_REPLY__GMAIL__COMPOSE_REPLY_BUTTON' ||
      sceneType === 'INSTANT_REPLY__OUTLOOK__COMPOSE_REPLY_BUTTON' ||
      sceneType === 'INSTANT_REPLY__TWITTER__COMPOSE_REPLY_BUTTON' ||
      sceneType === 'INSTANT_REPLY__LINKEDIN__COMPOSE_REPLY_BUTTON'
    ) {
      return {
        referenceElementSelector: `button[data-testid="maxai-input-assistant-cta-button"]`,
        tooltipProps: {
          title: 'Click to generate a personalized reply instantly.',
          placement: 'bottom',
          style: {
            zIndex: 2147483601,
          },
        },
      }
    }

    // refine draft button
    if (
      sceneType === 'INSTANT_REPLY__GMAIL__REFINE_DRAFT_BUTTON' ||
      sceneType === 'INSTANT_REPLY__OUTLOOK__REFINE_DRAFT_BUTTON' ||
      sceneType === 'INSTANT_REPLY__TWITTER__REFINE_DRAFT_BUTTON' ||
      sceneType === 'INSTANT_REPLY__LINKEDIN__REFINE_DRAFT_BUTTON'
    ) {
      return {
        referenceElementSelector: `button[data-testid="maxai-input-assistant-dropdown-button"]`,
        tooltipProps: {
          title: 'Click to improve your draft.',
          placement: 'right',
        },
      }
    }

    // compose new button
    if (
      sceneType === 'INSTANT_REPLY__GMAIL__COMPOSE_NEW_BUTTON' ||
      sceneType === 'INSTANT_REPLY__OUTLOOK__COMPOSE_NEW_BUTTON' ||
      sceneType === 'INSTANT_REPLY__TWITTER__COMPOSE_NEW_BUTTON' ||
      sceneType === 'INSTANT_REPLY__LINKEDIN__COMPOSE_NEW_BUTTON'
    ) {
      return {
        referenceElementSelector: `button[data-testid="maxai-input-assistant-cta-button"]`,
        tooltipProps: {
          title: 'Click to generate a personalized draft instantly.',
          placement: 'bottom',
        },
      }
    }
    // ==================== instant reply end ====================

    return null
  }, [sceneType, chatBoxShortCutKey, t])

  return config
}

export default useOnboardingTooltipConfig
