import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { UseChatGptIcon } from '@/components/CustomIcon'
import DynamicComponent from '@/components/DynamicComponent'
import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import useFindElement from '@/features/common/hooks/useFindElement'
import { ISidebarConversationType } from '@/features/sidebar/types'
import { showChatBox } from '@/features/sidebar/utils/sidebarChatBoxHelper'
import { getMaxAISidebarRootElement } from '@/utils'

const PDFSummaryButton: FC = () => {
  const { t } = useTranslation(['client'])
  const { element } = useFindElement('#toolbarViewerRight')
  return (
    <DynamicComponent
      rootContainer={element}
      customElementName={'max-ai-pdf-summary-button'}
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
        title={t('client:sidebar__tabs__summary__tooltip__pdf_crx')}
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
    </DynamicComponent>
  )
}
export default PDFSummaryButton
