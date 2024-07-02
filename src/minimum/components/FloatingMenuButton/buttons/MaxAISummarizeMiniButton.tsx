import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import { getPageSummaryType } from '@/features/chat-base/summary/utils/pageSummaryHelper'
import { ISidebarConversationType } from '@/features/sidebar/types'
import { showChatBox } from '@/features/sidebar/utils/sidebarChatBoxHelper'
import { getMaxAISidebarRootElement } from '@/utils'

const tooltipKey = () => {
  const summaryType = getPageSummaryType()
  switch (summaryType) {
    case 'DEFAULT_EMAIL_SUMMARY':
      return 'client:sidebar__tabs__summary__tooltip__default_email'
    case 'PAGE_SUMMARY':
      return 'client:sidebar__tabs__summary__tooltip__page'
    case 'PDF_CRX_SUMMARY':
      return 'client:sidebar__tabs__summary__tooltip__pdf_crx'
    case 'YOUTUBE_VIDEO_SUMMARY':
      return 'client:sidebar__tabs__summary__tooltip__youtube_video'
    default:
      return 'client:sidebar__tabs__summary__tooltip__page'
  }
}
const MaxAISummarizeMiniButton = () => {
  const { t } = useTranslation(['common', 'client'])
  return (
    <Stack
      sx={{
        bgcolor: 'background.paper',
        width: 32,
        height: 32,
        borderRadius: '50%',
      }}
      alignItems={'center'}
      justifyContent={'center'}
    >
      <TextOnlyTooltip
        arrow
        minimumTooltip
        title={t(tooltipKey() as any)}
        placement={'left'}
      >
        <Button
          sx={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            minWidth: 'unset',
            display: 'flex',
            color: 'primary.main',
            boxShadow:
              '0px 0px 0.5px 0px rgba(0, 0, 0, 0.40), 0px 1px 3px 0px rgba(0, 0, 0, 0.09), 0px 4px 8px 0px rgba(0, 0, 0, 0.09)',
            '&:hover': {
              color: 'primary.main',
            },
          }}
          onClick={(event) => {
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
          <ContextMenuIcon
            sx={{
              fontSize: '20px',
              color: 'inherit',
            }}
            icon={'Summarize'}
          />
        </Button>
      </TextOnlyTooltip>
    </Stack>
  )
}
export default MaxAISummarizeMiniButton
