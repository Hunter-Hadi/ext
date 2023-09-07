import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import Button from '@mui/material/Button'
import { getAppRootElement, showChatBox } from '@/utils'
import React from 'react'
import { getPageSummaryType } from '@/features/sidebar/utils/pageSummaryHelper'
import { useTranslation } from 'react-i18next'
import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import Stack from '@mui/material/Stack'
import { ISidebarConversationType } from '@/features/sidebar'

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
            color: 'text.secondary',
            '&:hover': {
              color: 'primary.main',
            },
          }}
          onClick={(event) => {
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
