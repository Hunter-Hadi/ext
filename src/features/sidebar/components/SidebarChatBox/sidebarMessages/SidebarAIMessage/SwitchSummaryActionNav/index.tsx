import { Button, ButtonGroup } from '@mui/material'
import React, { FC, useEffect, useMemo, useState } from 'react'

import {
  getChromeExtensionLocalStorage,
  setChromeExtensionLocalStorage,
} from '@/background/utils/chromeExtensionStorage/chromeExtensionLocalStorage'
import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import useClientChat from '@/features/chatgpt/hooks/useClientChat'
import { IAIResponseMessage } from '@/features/chatgpt/types'
import { ISetActionsType } from '@/features/shortcuts/types/Action'
import {
  allSummaryNavList,
  getPageSummaryType,
  getSummaryNavActions,
} from '@/features/sidebar/utils/pageSummaryHelper'
import {
  summaryGetPromptObject,
  TSummaryParamsPromptType,
} from '@/features/sidebar/utils/pageSummaryNavPrompt'
interface IProps {
  message: IAIResponseMessage
  loading: boolean
}
export const SwitchSummaryActionNav: FC<IProps> = ({ message, loading }) => {
  const [actionKey, setActionKey] = useState('all')
  const { askAIWIthShortcuts } = useClientChat()
  const summaryType = useMemo(() => getPageSummaryType(), [])
  useEffect(() => {
    setSwitchSummaryDefault()
  }, [])
  const setSwitchSummaryDefault = async () => {
    const chromeExtensionData = await getChromeExtensionLocalStorage()
    const summaryNavKey =
      chromeExtensionData.sidebarSettings?.summary?.currentNavType?.[
        summaryType
      ] || 'all'
    setActionKey(summaryNavKey)
  }
  const clickNavTriggerActionChange = async (navItem: {
    title: string
    titleIcon: string
    key: TSummaryParamsPromptType
  }) => {
    if (loading) return
    setActionKey(navItem.key)
    const promptText = summaryGetPromptObject[summaryType](navItem.key as 'all') //as假过判断ts，实际不是all
    await setChromeExtensionLocalStorage({
      sidebarSettings: {
        summary: {
          currentNavType: { [summaryType]: navItem.key },
        },
      },
    })
    const actions = getSummaryNavActions({
      type: summaryType,
      messageId: message.messageId,
      prompt: promptText,
      title: navItem.title,
    })
    askAIWIthShortcuts(actions as ISetActionsType)
  }
  return (
    <ButtonGroup variant="outlined" aria-label="Basic button group">
      {allSummaryNavList[summaryType].map((navItem) => (
        <TextOnlyTooltip key={navItem.key} title={navItem.title}>
          <Button
            disabled={loading}
            variant={actionKey === navItem.key ? 'contained' : 'outlined'}
            onClick={() => clickNavTriggerActionChange(navItem)}
          >
            <ContextMenuIcon
              sx={{
                color: actionKey === navItem.key ? '#fff' : 'primary.main',
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
