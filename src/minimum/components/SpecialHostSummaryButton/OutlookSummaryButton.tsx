import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import React, { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { UseChatGptIcon } from '@/components/CustomIcon'
import DynamicComponent from '@/components/DynamicComponent'
import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import useFindElement from '@/features/common/hooks/useFindElement'
import OnboardingTooltipTempPortal from '@/features/onboarding/components/OnboardingTooltipTempPortal'
import { ISidebarConversationType } from '@/features/sidebar/types'
import { showChatBox } from '@/features/sidebar/utils/sidebarChatBoxHelper'
import { getMaxAISidebarRootElement } from '@/utils'

const OutlookSummaryButton: FC = () => {
  const { t } = useTranslation(['client'])
  const { element } = useFindElement(
    '#ReadingPaneContainerId div[role="heading"]',
    {
      style: 'display: flex;align-items: center;gap: 8px;',
    },
  )
  const [summaryButtonContainer, setSummaryButtonContainer] =
    useState<HTMLElement | null>(null)

  return (
    <DynamicComponent
      rootContainer={element}
      customElementName={'max-ai-outlook-summary-button'}
      style={'order:1'}
      onSetContainer={setSummaryButtonContainer}
    >
      <TextOnlyTooltip
        arrow
        placement={'bottom'}
        PopperProps={{
          disablePortal: true,
          sx: {
            '& > div': {
              maxWidth: 'unset',
              width: 'max-content',
            },
          },
        }}
        title={t('client:sidebar__tabs__summary__tooltip__default_email')}
      >
        <Button
          sx={{
            padding: '3.5px 8px',
            mr: 1,
            borderRadius: '16px',
          }}
          data-testid="maxai-outlook-summary-button"
          variant={'contained'}
          onClick={() => {
            showChatBox()
            const timer = setInterval(() => {
              if (
                getMaxAISidebarRootElement()?.querySelector(
                  'p[data-testid="max-ai__summary-tab"]',
                )
              ) {
                clearInterval(timer)
                window.dispatchEvent(
                  new CustomEvent('MaxAISwitchSidebarTab', {
                    detail: {
                      type: 'Summary' as ISidebarConversationType,
                    },
                  }),
                )
              }
            }, 500)
          }}
        >
          <Stack direction={'row'} alignItems={'center'} gap={1}>
            <UseChatGptIcon
              sx={{
                fontSize: 14,
                color: 'inherit',
              }}
            />
            {t('client:social_media_summary_button__text')}
          </Stack>
        </Button>
      </TextOnlyTooltip>
      {summaryButtonContainer && (
        <OnboardingTooltipTempPortal
          sceneType="EMAIL_SUMMARY_BUTTON"
          container={summaryButtonContainer}
        />
      )}
    </DynamicComponent>
  )
}
export default OutlookSummaryButton
