import { useMemo } from 'react'

import { IOnboardingTooltipProps } from '@/features/onboarding/components/OnboardingTooltip'
import { IOnBoardingSceneType } from '@/features/onboarding/types'
import useCommands from '@/hooks/useCommands'
import { CONTEXT_MENU_DRAFT_TYPES } from '@/features/contextMenu/constants'
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
          floatingMenuTooltip: true,
          placement: 'top-start',
          sx: {
            maxWidth: 420,
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
          title: 'Click to replace selected text with AI-generated content.',
          floatingMenuTooltip: true,
          placement: 'right-start',
          sx: {
            maxWidth: 370,
          },
          InformationBarProps: {
            shortcut: 'Enter',
          },
        },
      }
    }

    return null
  }, [sceneType, chatBoxShortCutKey])

  return config
}

export default useOnboardingTooltipConfig
