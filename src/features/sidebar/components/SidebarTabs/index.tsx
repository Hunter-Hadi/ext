import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { FC, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useRecoilValue } from 'recoil'

import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import SidebarTabIcons from '@/features/sidebar/components/SidebarTabs/SidebarTabIcons'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import {
  ChatGPTConversationState,
  ISidebarConversationType,
} from '@/features/sidebar/store'
import { getPageSummaryType } from '@/features/sidebar/utils/pageSummaryHelper'
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
  const { isDarkMode } = useCustomTheme()
  const { t } = useTranslation(['common', 'client'])

  const {
    currentSidebarConversationType,
    updateSidebarConversationType,
  } = useSidebarSettings()

  const conversation = useRecoilValue(ChatGPTConversationState)

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
      if (tab.value === 'Summary') {
        if (isInImmersiveChatPage) {
          return false
        }
      }
      return true
    })
  }, [])
  return (
    <Stack
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
        const disabled = conversation.loading
        // const bgcolor = isActive
        //   ? isDarkMode
        //     ? 'rgba(255, 255, 255, 0.08)'
        //     : 'rgba(118, 1, 211, 0.08)'
        //   : 'transparent'

        return (
          <TextOnlyTooltip
            key={item.value}
            placement="left"
            title={t(item.tooltip?.() as any)}
          >
            <Stack
              spacing={0.5}
              justifyContent="center"
              alignItems="center"
              sx={{
                width: '100%',
                // [isInImmersiveChatPage
                //   ? 'borderRight'
                //   : 'borderLeft']: '2px solid',
                // borderColor: isActive ? 'primary.main' : 'transparent',
                color: isActive ? 'primary.main' : 'text.secondary',
                cursor: disabled ? 'auto' : 'pointer',
                // bgcolor: bgcolor,
                py: 1,
                position: 'relative',
                [isInImmersiveChatPage ? 'right' : 'left']: -1,
              }}
              onClick={() => {
                !disabled && updateSidebarConversationType(item.value)
              }}
            >
              <SidebarTabIcons icon={item.icon} />
              <Typography
                fontSize={12}
                color={'inherit'}
                data-testid={'max-ai__summary-tab'}
                lineHeight={1}
              >
                {t(item.label as any)}
              </Typography>
            </Stack>
          </TextOnlyTooltip>
        )
      })}
    </Stack>
  )
}
export default SidebarTabs
