import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { FC, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import { getPageSummaryType } from '@/features/chat-base/summary/utils/pageSummaryHelper'
import SidebarTabIcons from '@/features/sidebar/components/SidebarTabs/SidebarTabIcons'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import { ISidebarConversationType } from '@/features/sidebar/types'
import { useCustomTheme } from '@/hooks/useCustomTheme'
import { I18nextKeysType } from '@/i18next'
import { isMaxAIImmersiveChatPage } from '@/utils/dataHelper/websiteHelper'

export const sidebarTabsData: Array<{
  label: I18nextKeysType
  value: ISidebarConversationType
  icon: string
  tooltip?: () => I18nextKeysType
}> = [
  {
    label: 'client:sidebar__tabs__rewrite__title',
    tooltip: () => 'client:sidebar__tabs__rewrite__tooltip',
    icon: 'Rewrite',
    value: 'ContextMenu',
  },
  {
    label: 'client:sidebar__tabs__chat__title',
    tooltip: () => 'client:sidebar__tabs__chat__tooltip',
    icon: 'Chat',
    value: 'Chat',
  },
  {
    label: 'client:sidebar__tabs__summary__title',
    tooltip: () => {
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
    },
    icon: 'Summary',
    value: 'Summary',
  },
  {
    label: 'client:sidebar__tabs__search__title',
    tooltip: () => 'client:sidebar__tabs__search__tooltip',
    icon: 'Search',
    value: 'Search',
  },
  {
    label: 'client:sidebar__tabs__art__title',
    tooltip: () => 'client:sidebar__tabs__art__tooltip',
    icon: 'Art',
    value: 'Art',
  },
]

const SidebarTabs: FC = () => {
  const { t } = useTranslation(['common', 'client'])
  const { isDarkMode } = useCustomTheme()

  const { currentSidebarConversationType, updateSidebarConversationType } =
    useSidebarSettings()

  // 在 immersive chat 页面, 有特殊的渲染逻辑
  const isInImmersiveChatPage = useMemo(() => isMaxAIImmersiveChatPage(), [])

  useEffect(() => {
    const listener = (event: any) => {
      const type: ISidebarConversationType = event?.detail?.type
      if (type) {
        updateSidebarConversationType(type)
      }
    }
    window.addEventListener('MaxAISwitchSidebarTab', listener)
    return () => {
      window.removeEventListener('MaxAISwitchSidebarTab', listener)
    }
  })
  const memoSidebarTabsData = useMemo(() => {
    return sidebarTabsData.filter((tab) => {
      if (tab.value === 'Summary' && isInImmersiveChatPage) {
        return false
      }
      return true
    })
  }, [])

  return (
    <Stack
      data-testid={'maxAISidebarTabsContainer'}
      alignItems={'center'}
      width={'100%'}
      spacing={2}
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 1,
      }}
    >
      {memoSidebarTabsData.map((item) => {
        const isActive = currentSidebarConversationType === item.value
        // context window分离后允许各个tab之间切换
        const disabled = false // smoothConversationLoading
        const bgcolor = isActive
          ? isDarkMode
            ? 'rgba(44, 44, 44, 1)'
            : 'rgba(144, 101, 176, 0.16)'
          : 'transparent'

        return (
          <Box width={1} px={isInImmersiveChatPage ? 1 : 0.5} key={item.value}>
            <TextOnlyTooltip
              placement='left'
              title={t(item.tooltip?.() as any)}
            >
              <Stack
                data-testid={`maxai--sidebar--${item.value.toLowerCase()}_tab`}
                data-button-clicked-name={`maxai--sidebar--${item.value.toLowerCase()}_tab`}
                spacing={0.5}
                justifyContent='center'
                alignItems='center'
                sx={{
                  width: '100%',
                  // [isInImmersiveChatPage
                  //   ? 'borderRight'
                  //   : 'borderLeft']: '2px solid',
                  // borderColor: isActive ? 'primary.main' : 'transparent',
                  color: isActive ? 'primary.main' : 'text.secondary',
                  cursor: disabled ? 'auto' : 'pointer',
                  bgcolor: bgcolor,
                  py: 0.5,
                  position: 'relative',
                  borderRadius: 2,
                  '&:hover': {
                    bgcolor: isActive ? bgcolor : '#9065b014',
                  },
                }}
                onClick={() => {
                  !disabled && updateSidebarConversationType(item.value)
                }}
              >
                <SidebarTabIcons icon={item.icon} />
                <Typography
                  fontSize={12}
                  color={'inherit'}
                  data-testid={`max-ai__${item.value.toLowerCase()}-tab`}
                  lineHeight={1}
                >
                  {t(item.label as any)}
                </Typography>
              </Stack>
            </TextOnlyTooltip>
          </Box>
        )
      })}
    </Stack>
  )
}
export default SidebarTabs
