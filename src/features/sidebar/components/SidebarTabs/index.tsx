import React, { FC } from 'react'
import Stack from '@mui/material/Stack'
import { isMaxAINewTabPage } from '@/pages/chat/util'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import {
  ChatGPTConversationState,
  ISidebarConversationType,
  SidebarConversationIdSelector,
  SidebarSettingsState,
} from '@/features/sidebar/store'
import { useRecoilState, useRecoilValue } from 'recoil'
import { I18nextKeysType } from '@/i18next'
import { useTranslation } from 'react-i18next'
import { ClientConversationMapState } from '@/features/chatgpt/store'

export const sidebarTabsData: Array<{
  label: I18nextKeysType
  value: ISidebarConversationType
}> = [
  {
    label: 'client:sidebar__tabs__chat__title',
    value: 'Chat',
  },
  {
    label: 'client:sidebar__tabs__summary__title',
    value: 'Summary',
  },
]

const SidebarTabs: FC = () => {
  const { t } = useTranslation(['common', 'client'])
  const sidebarConversationID = useRecoilValue(SidebarConversationIdSelector)
  const [sidebarSettings, setSidebarSettings] =
    useRecoilState(SidebarSettingsState)
  const conversationMap = useRecoilValue(ClientConversationMapState)
  const conversation = useRecoilValue(ChatGPTConversationState)
  if (isMaxAINewTabPage()) {
    return null
  }
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
          value={sidebarSettings.type}
          onChange={(event, value) => {
            setSidebarSettings((prev) => {
              return {
                ...prev,
                type: value,
              }
            })
          }}
          textColor="inherit"
          indicatorColor="primary"
        >
          {sidebarTabsData.map((item) => (
            <Tab
              disabled={conversation.loading}
              key={item.value}
              value={item.value}
              label={t(item.label as any)}
            />
          ))}
        </Tabs>
      </Stack>
      <Stack>{JSON.stringify(sidebarSettings, null, 2)}</Stack>
      <Stack>{JSON.stringify(Object.keys(conversationMap), null, 2)}</Stack>
      <p>sidebarConversationID: {sidebarConversationID}</p>
    </>
  )
}
export default SidebarTabs
