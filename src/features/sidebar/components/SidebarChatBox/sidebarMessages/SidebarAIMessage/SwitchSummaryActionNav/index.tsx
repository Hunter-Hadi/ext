import { Button, ButtonGroup } from '@mui/material'
import throttle from 'lodash-es/throttle'
import React, { FC, useEffect, useMemo, useState } from 'react'

import { setChromeExtensionLocalStorage } from '@/background/utils/chromeExtensionStorage/chromeExtensionLocalStorage'
import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import useClientChat from '@/features/chatgpt/hooks/useClientChat'
import { IAIResponseMessage } from '@/features/chatgpt/types'
import {
  allSummaryNavList,
  getPageSummaryType,
  getSummaryNavActions,
} from '@/features/sidebar/utils/pageSummaryHelper'
import {
  summaryGetPromptObject,
  SummaryParamsPromptType,
} from '@/features/sidebar/utils/pageSummaryNavPrompt'
interface IProps {
  message: IAIResponseMessage
  loading: boolean
}
let speedChangeKey = 'all'
export const SwitchSummaryActionNav: FC<IProps> = ({ message, loading }) => {
  const [summaryActionKey, setSummaryActionKey] = useState('all')
  const { askAIWIthShortcuts } = useClientChat()
  const summaryType = useMemo(() => getPageSummaryType(), [])
  const changeSummaryActionKey = (key: SummaryParamsPromptType) => {
    speedChangeKey = key
    setSummaryActionKey(key)
  }
  useEffect(() => {
    const autoChangeNav = throttle(() => {
      const messageNavTitle = message.originalMessage?.metadata?.title?.title
      if (messageNavTitle && allSummaryNavList[summaryType]) {
        const currentMessageNav = allSummaryNavList[summaryType].find(
          (item) => item.title === messageNavTitle,
        )
        if (currentMessageNav) {
          changeSummaryActionKey(currentMessageNav.key)
        }
      }
    }, 100)
    autoChangeNav()
  }, [message.originalMessage?.metadata?.title?.title])
  const clickNavTriggerActionChange = async (navItem: {
    title: string
    titleIcon: string
    key: SummaryParamsPromptType
  }) => {
    if (loading || speedChangeKey === navItem.key) return//防止多次触发
    changeSummaryActionKey(navItem.key)
    const promptText = summaryGetPromptObject[summaryType](navItem.key)
    await setChromeExtensionLocalStorage({
      sidebarSettings: {
        summary: {
          currentNavType: { [summaryType]: navItem.key },
        },
      },
    })
    const actions = await getSummaryNavActions({
      type: summaryType,
      messageId: message.messageId,
      prompt: promptText,
      title: navItem.title,
      key: navItem.key,
    })
    askAIWIthShortcuts(actions)
  }
  return (
    <ButtonGroup variant="outlined" aria-label="Basic button group">
      {allSummaryNavList[summaryType].map((navItem) => (
        <TextOnlyTooltip key={navItem.key} title={navItem.title}>
          <Button
            disabled={loading}
            variant={
              summaryActionKey === navItem.key ? 'contained' : 'outlined'
            }
            onClick={() => clickNavTriggerActionChange(navItem)}
          >
            <ContextMenuIcon
              sx={{
                color:
                  summaryActionKey === navItem.key ? '#fff' : 'primary.main',
                fontSize: 18,
              }}
              icon={navItem.titleIcon}
            />
          </Button>
        </TextOnlyTooltip>
      ))}
    </ButtonGroup>
  )
}
