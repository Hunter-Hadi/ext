import React, { FC } from 'react'
import DynamicComponent from '@/components/DynamicComponent'
import Button from '@mui/material/Button'
import useFindElement from '@/hooks/useFindElement'
import Box from '@mui/material/Box'
import { UseChatGptIcon } from '@/components/CustomIcon'
import { useTranslation } from 'react-i18next'
import { getAppRootElement, showChatBox } from '@/utils'
import { ISidebarConversationType } from '@/features/sidebar/store'

const GmailSummaryButton: FC = () => {
  const { t } = useTranslation(['client'])
  const isPopout = location.pathname.includes('popout')
  const { element } = useFindElement(
    isPopout ? 'div[jsaction] .G-tF' : 'div[jsaction] > .adF',
  )
  return (
    <DynamicComponent
      rootContainer={element}
      customElementName={'max-ai-gmail-summary-button'}
    >
      <Box
        sx={
          isPopout
            ? {
                height: 36,
                position: 'absolute',
                right: 0,
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
        <Button
          startIcon={
            <UseChatGptIcon
              sx={{
                fontSize: 16,
                color: 'inherit',
              }}
            />
          }
          variant={'contained'}
          onClick={() => {
            showChatBox()
            const timer = setInterval(() => {
              if (
                getAppRootElement()?.querySelector(
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
      </Box>
    </DynamicComponent>
  )
}
export default GmailSummaryButton
