import React, { FC, useEffect, useMemo } from 'react'
import Stack from '@mui/material/Stack'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import {
  ChatGPTConversationState,
  ISidebarConversationType,
} from '@/features/sidebar/store'
import { useRecoilValue } from 'recoil'
import { I18nextKeysType } from '@/i18next'
import { useTranslation } from 'react-i18next'
import Typography from '@mui/material/Typography'
import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import { getPageSummaryType } from '@/features/sidebar/utils/pageSummaryHelper'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import { isMaxAIImmersiveChatPage } from '@/utils/dataHelper/websiteHelper'
import HistoryShareButton from '@/features/chatgpt/components/share/HistoryShareButton'

export const sidebarTabsData: Array<{
  label: I18nextKeysType
  value: ISidebarConversationType
  tooltip?: () => I18nextKeysType
}> = [
  {
    label: 'client:sidebar__tabs__chat__title',
    tooltip: () => 'client:sidebar__tabs__chat__tooltip',
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
    value: 'Summary',
  },
  {
    label: 'client:sidebar__tabs__search__title',
    tooltip: () => 'client:sidebar__tabs__search__tooltip',
    value: 'Search',
  },
]

const SidebarTabs: FC = () => {
  const { t } = useTranslation(['common', 'client'])
  const {
    currentSidebarConversationType,
    updateSidebarConversationType,
  } = useSidebarSettings()
  const conversation = useRecoilValue(ChatGPTConversationState)
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
        if (isMaxAIImmersiveChatPage()) {
          return false
        }
      }
      return true
    })
  }, [])
  return (
    <>
      <Stack
        direction={'row'}
        height={36}
        alignItems={'center'}
        width={'100%'}
        borderBottom={'1px solid'}
        borderColor="customColor.borderColor"
        bgcolor={'background.paper'}
        justifyContent={'space-between'}
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1,
        }}
      >
        <Tabs
          sx={{
            minHeight: '36px',
            '& .use-chat-gpt-ai--MuiButtonBase-root': {
              height: '36px',
              minHeight: '36px',
              p: 1,
            },
          }}
          value={currentSidebarConversationType}
          onChange={async (event, value) => {
            updateSidebarConversationType(value)
          }}
          textColor="inherit"
          indicatorColor="primary"
        >
          {memoSidebarTabsData.map((item) => (
            <Tab
              disabled={conversation.loading}
              key={item.value}
              value={item.value}
              label={
                <TextOnlyTooltip title={t(item.tooltip?.() as any)}>
                  <Typography
                    fontSize={'14px'}
                    color={'text.primary'}
                    data-testid={'max-ai__summary-tab'}
                  >
                    {t(item.label as any)}
                  </Typography>
                </TextOnlyTooltip>
              }
            />
          ))}
        </Tabs>
        <Stack direction={'row'} alignItems={'center'} pr={1}>
          <HistoryShareButton />
        </Stack>
      </Stack>
    </>
  )
}
export default SidebarTabs
