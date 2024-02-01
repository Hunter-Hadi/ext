import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React from 'react'
import { useTranslation } from 'react-i18next'

import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import { getPageSummaryType } from '@/features/sidebar/utils/pageSummaryHelper'
import { isMaxAIImmersiveChatPage } from '@/utils/dataHelper/websiteHelper'

import HomeViewContentNavIcons from './HomeViewContentNavIcons'

const textWithPageSummaryType = () => {
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

const HomeViewPageSummaryButton = () => {
  const { t } = useTranslation(['client'])

  const { updateSidebarConversationType } = useSidebarSettings()

  const handleClick = () => {
    updateSidebarConversationType('Summary')
  }

  if (isMaxAIImmersiveChatPage()) {
    return null
  }

  return (
    <Stack
      direction={'row'}
      alignItems="center"
      spacing={0.5}
      sx={(t) => {
        const isDark = t.palette.mode === 'dark'

        return {
          p: 1,
          color: 'text.primary',
          cursor: 'pointer',
          borderRadius: 2,
          // transition: 'all 0.3s ease',
          bgcolor: isDark ? 'customColor.secondaryBackground' : '#F5F6F7',

          '&:hover': {
            bgcolor: isDark
              ? 'rgba(255, 255, 255, 0.10)'
              : 'rgba(0, 0, 0, 0.10)',
          },
        }
      }}
      onClick={handleClick}
    >
      <HomeViewContentNavIcons icon={'summary'} />
      <Typography
        fontSize={14}
        fontWeight={400}
        lineHeight={1.5}
        color="inherit"
      >
        {t(textWithPageSummaryType() as any)}
      </Typography>
    </Stack>
  )
}

export default HomeViewPageSummaryButton
