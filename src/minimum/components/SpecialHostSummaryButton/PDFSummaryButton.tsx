import React, { FC } from 'react'
import DynamicComponent from '@/components/DynamicComponent'
import Button from '@mui/material/Button'
import useFindElement from '@/hooks/useFindElement'
import { UseChatGptIcon } from '@/components/CustomIcon'
import { useTranslation } from 'react-i18next'
import { getAppRootElement, showChatBox } from '@/utils'
import { ISidebarConversationType } from '@/features/sidebar/store'
import Stack from '@mui/material/Stack'

const PDFSummaryButton: FC = () => {
  const { t } = useTranslation(['client'])
  const { element } = useFindElement('#toolbarViewerRight')
  return (
    <DynamicComponent
      rootContainer={element}
      customElementName={'max-ai-gmail-summary-button'}
    >
      <Button
        sx={{
          py: 0,
          px: 1,
          mr: 1,
          mt: 0.5,
          borderRadius: '12px',
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
export default PDFSummaryButton
