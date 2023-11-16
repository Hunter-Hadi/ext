import React, { FC } from 'react'
import DynamicComponent from '@/components/DynamicComponent'
import Button from '@mui/material/Button'
import useFindElement from '@/hooks/useFindElement'
import { UseChatGptIcon } from '@/components/CustomIcon'
import { useTranslation } from 'react-i18next'
import { getAppRootElement, showChatBox } from '@/utils'
import { ISidebarConversationType } from '@/features/sidebar/store'
import Stack from '@mui/material/Stack'

const OutlookSummaryButton: FC = () => {
  const { t } = useTranslation(['client'])
  const { element } = useFindElement(
    '#ReadingPaneContainerId div[role="heading"]',
    {
      style: 'display: flex;align-items: center;gap: 8px;',
    },
  )
  return (
    <DynamicComponent
      rootContainer={element}
      customElementName={'max-ai-outlook-summary-button'}
      style={'order:1'}
    >
      <Button
        sx={{
          padding: '3.5px 8px',
          mr: 1,
          borderRadius: '16px',
        }}
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
    </DynamicComponent>
  )
}
export default OutlookSummaryButton
