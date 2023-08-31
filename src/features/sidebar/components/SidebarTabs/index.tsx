import React, { FC, useMemo } from 'react'
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
import cloneDeep from 'lodash-es/cloneDeep'
import { AppSettingsState } from '@/store'
import Typography from '@mui/material/Typography'
import DevContent from '@/components/DevContent'
import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import Button from '@mui/material/Button'
import useAutoTwitterReferral from '@/features/referral/hooks/twitter'

export const sidebarTabsData: Array<{
  label: I18nextKeysType
  value: ISidebarConversationType
  tooltip?: I18nextKeysType
}> = [
  {
    label: 'client:sidebar__tabs__chat__title',
    tooltip: 'client:sidebar__tabs__chat__tooltip',
    value: 'Chat',
  },
  {
    label: 'client:sidebar__tabs__summary__title',
    tooltip: 'client:sidebar__tabs__summary__tooltip',
    value: 'Summary',
  },
]

const SidebarTabs: FC = () => {
  const { t } = useTranslation(['common', 'client'])
  const { autoTwitterReferral, loading } = useAutoTwitterReferral()
  const sidebarConversationID = useRecoilValue(SidebarConversationIdSelector)
  const [sidebarSettings, setSidebarSettings] =
    useRecoilState(SidebarSettingsState)
  const appSettings = useRecoilValue(AppSettingsState)
  const conversationMap = useRecoilValue(ClientConversationMapState)
  const conversation = useRecoilValue(ChatGPTConversationState)
  const renderConversation = useMemo(() => {
    const conversation: any = cloneDeep(
      conversationMap[sidebarConversationID] || {},
    )
    if (conversation.messages) {
      delete conversation.messages
    }
    return conversation
  }, [conversationMap, sidebarConversationID])
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
              label={
                <TextOnlyTooltip title={t(item.tooltip as any)}>
                  <Typography fontSize={'14px'} color={'text.primary'}>
                    {t(item.label as any)}
                  </Typography>
                </TextOnlyTooltip>
              }
            />
          ))}
        </Tabs>
      </Stack>
      <DevContent>
        <Stack
          sx={{
            position: 'absolute',
            top: '0',
            maxWidth: '400px',
            overflowX: 'auto',
            zIndex: 1,
            bgcolor: 'background.paper',
            color: 'text.primary',
            right: '100%',
            border: '1px solid',
            borderColor: 'customColor.borderColor',
            borderRadius: '4px',
            '& > pre, & > p': {
              p: 0,
              m: 0,
              fontSize: '12px',
            },
          }}
        >
          <Stack direction={'row'} gap={1}>
            <Button
              variant={'contained'}
              disabled={loading}
              onClick={autoTwitterReferral}
            >
              Twitter
            </Button>
          </Stack>
          <p>loading: {conversation.loading ? 'loading' : 'done'}</p>
          <pre>{JSON.stringify(sidebarSettings, null, 2)}</pre>
          <p>
            appSettings: {appSettings.chatTypeConversationId}
            {'=='}
            {appSettings.currentAIProvider}
          </p>
          <p>currentTabUsingID: {sidebarConversationID}</p>
          <pre>{JSON.stringify(renderConversation, null, 2)}</pre>
        </Stack>
      </DevContent>
    </>
  )
}
export default SidebarTabs
