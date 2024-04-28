import { ButtonGroup } from '@mui/material'
import Button from '@mui/material/Button'
import React, { FC, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSetRecoilState } from 'recoil'

import { setChromeExtensionLocalStorage } from '@/background/utils/chromeExtensionStorage/chromeExtensionLocalStorage'
import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import useClientChat from '@/features/chatgpt/hooks/useClientChat'
import { IAIResponseMessage } from '@/features/chatgpt/types'
import {
  useContextMenuList,
} from '@/features/contextMenu'
import { SidebarPageSummaryNavKeyState } from '@/features/sidebar/store'
import {
  allSummaryNavList,
  getPageSummaryType,
  getSummaryNavActions,
  getSummaryNavItemByType,
} from '@/features/sidebar/utils/pageSummaryHelper'
import {
  summaryGetPromptObject,
  SummaryParamsPromptType,
} from '@/features/sidebar/utils/pageSummaryNavPrompt'

import SidebarNavCustomPromptButton from './SidebarNavCustomPromptButton'

interface IProps {
  message: IAIResponseMessage
  loading: boolean
}
let speedChangeKey = ''
export const SwitchSummaryActionNav: FC<IProps> = ({ message, loading }) => {
  const { t } = useTranslation(['client'])
  const [summaryActionKey, setSummaryActionKey] = useState<
    SummaryParamsPromptType | undefined
  >(undefined)
  const { askAIWIthShortcuts } = useClientChat()
  const summaryType = useMemo(() => getPageSummaryType(), [])
  const { contextMenuList } = useContextMenuList('sidebarSummaryButton', '', false)
  const updateCurrentPageSummaryKey = useSetRecoilState(
    SidebarPageSummaryNavKeyState,
  )
  const changeSummaryActionKey = (key: SummaryParamsPromptType) => {
    speedChangeKey = key
    setSummaryActionKey(key)
  }
  useEffect(() => {
    const messageNavTitle = message.originalMessage?.metadata?.title?.title
    if (messageNavTitle) {
      const summaryNavInfo = getSummaryNavItemByType(
        summaryType,
        messageNavTitle,
        'title',
      )
      if (summaryNavInfo) {
        //新进页面，变更 顶部的状态保存
        updateCurrentPageSummaryKey((summaryKeys) => {
          if (summaryKeys[summaryType]) {
            return summaryKeys
          } else {
            return {
              ...summaryKeys,
              [summaryType]: summaryNavInfo.key,
            }
          }
        })
        changeSummaryActionKey(summaryNavInfo.key)
      }
    }
    if (!speedChangeKey) {
      changeSummaryActionKey('all')
    }
  }, [message.originalMessage?.metadata?.title?.title])
  const clickNavTriggerActionChange = async (navItem: {
    title: string
    titleIcon: string
    key: SummaryParamsPromptType
  }) => {
    if (loading || speedChangeKey === navItem.key) return //防止多次触发
    changeSummaryActionKey(navItem.key)
    const promptText = summaryGetPromptObject[summaryType](navItem.key)

    updateCurrentPageSummaryKey((summaryKeys) => {
      return {
        ...summaryKeys,
        [summaryType]: navItem.key,
      }
    })
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
        <TextOnlyTooltip key={navItem.key} title={t(navItem.tooltip as any)}>
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
      <SidebarNavCustomPromptButton menuList={contextMenuList} />
    </ButtonGroup>
  )
}
