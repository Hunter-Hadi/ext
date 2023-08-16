import React, { FC } from 'react'
import Stack from '@mui/material/Stack'
import { isMaxAINewTabPage } from '@/pages/chat/util'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import {
  ISidebarChatType,
  SidebarSettingsState,
} from '@/features/sidebar/store'
import { useRecoilState } from 'recoil'
import { I18nextKeysType } from '@/i18next'
import { useTranslation } from 'react-i18next'

export const sidebarTabsData: Array<{
  label: I18nextKeysType
  value: ISidebarChatType
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
  const [sidebarSettings, setSidebarSettings] =
    useRecoilState(SidebarSettingsState)
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
              key={item.value}
              value={item.value}
              label={t(item.label as any)}
            />
          ))}
        </Tabs>
      </Stack>
      <Stack>{JSON.stringify(sidebarSettings, null, 2)}</Stack>
    </>
  )
}
export default SidebarTabs
