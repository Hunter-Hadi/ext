import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import React, { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { UseChatGptIcon } from '@/components/CustomIcon'
import DynamicComponent from '@/components/DynamicComponent'
import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import useFindElement from '@/features/common/hooks/useFindElement'
import { sendMixpanelButtonClickedEvent } from '@/features/mixpanel/utils/mixpanelButtonClicked'
import { OnboardingTooltipPortal } from '@/features/onboarding/components/OnboardingTooltip'
import { ISidebarConversationType } from '@/features/sidebar/types'
import { showChatBox } from '@/features/sidebar/utils/sidebarChatBoxHelper'
import { getMaxAISidebarRootElement } from '@/utils'

const GmailSummaryButton: FC = () => {
  const { t } = useTranslation(['client'])
  const isPopout = location.pathname.includes('popout')
  const { element } = useFindElement(
    isPopout ? 'div[jsaction] .G-tF' : 'div[jsaction] > .adF',
  )

  const [summaryButtonContainer, setSummaryButtonContainer] =
    useState<HTMLElement | null>(null)

  return (
    <DynamicComponent
      rootContainer={element}
      customElementName={'max-ai-gmail-summary-button'}
      onSetContainer={setSummaryButtonContainer}
    >
      <Box
        sx={
          isPopout
            ? {
                height: 36,
                position: 'absolute',
                right: 16,
                top: 4,
              }
            : {
                height: 20,
                position: 'relative',
                top: -8,
                mr: 1,
              }
        }
      >
        <TextOnlyTooltip
          arrow
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
            startIcon={
              <UseChatGptIcon
                sx={{
                  fontSize: 16,
                  color: 'inherit',
                }}
              />
            }
            id='page-summary-button'
            data-testid='maxai-gmail-summary-button'
            variant={'contained'}
            onClick={(e) => {
              sendMixpanelButtonClickedEvent(
                'maxai-gmail-summary-button',
                e.currentTarget,
              )
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
            sx={{
              borderRadius: '18px',
            }}
          >
            {t('client:social_media_summary_button__text')}
          </Button>
        </TextOnlyTooltip>
        {summaryButtonContainer && (
          <OnboardingTooltipPortal
            sceneType='EMAIL_SUMMARY_BUTTON'
            container={summaryButtonContainer}
          />
        )}
      </Box>
    </DynamicComponent>
  )
}
export default GmailSummaryButton
