import { useMemo } from 'react'

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
  referenceElementSelector: string
  tooltipProps?: Partial<
    Omit<IOnboardingTooltipProps, 'children' | 'sceneType'>
  >
}

const useOnboardingTooltipConfig = (sceneType: IOnBoardingSceneType) => {
  const { chatBoxShortCutKey } = useCommands()

  const config = useMemo<IOnBoardingTooltipConfigType | null>(() => {
    if (sceneType === 'CONTEXT_MENU_CTA_BUTTON') {
      return {
        referenceElementSelector: `button#max_ai__floating_context_menu__cta_button`,
        tooltipProps: {
          floatingMenuTooltip: true,
          placement: 'bottom-start',
          sx: {
            maxWidth: 400,
          },
          style: {
            zIndex: 2147483621,
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
          floatingMenuTooltip: true,
          placement: 'left',
          sx: {
            maxWidth: 300,
          },
        },
      }
    }

    return null
  }, [sceneType, chatBoxShortCutKey])

  return config
}

export default useOnboardingTooltipConfig
