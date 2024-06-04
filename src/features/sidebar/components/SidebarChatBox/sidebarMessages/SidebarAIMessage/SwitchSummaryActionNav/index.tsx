import { ButtonGroup } from '@mui/material'
import Button from '@mui/material/Button'
import React, { type FC, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSetRecoilState } from 'recoil'

import { setChromeExtensionLocalStorage } from '@/background/utils/chromeExtensionStorage/chromeExtensionLocalStorage'
import { ContextMenuIcon, type IContextMenuIconKey } from '@/components/ContextMenuIcon'
import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import useClientChat from '@/features/chatgpt/hooks/useClientChat'
import { type IAIResponseMessage, type IAIResponseOriginalMessageNavMetadata } from '@/features/chatgpt/types'
import { type IContextMenuItemWithChildren } from '@/features/contextMenu/types'
import { SidebarPageSummaryNavKeyState } from '@/features/sidebar/store'
import {
  allSummaryNavList,
  getPageSummaryType,
  getSummaryCustomPromptActions,
  getSummaryNavActions,
  getSummaryNavItemByType,
  // getSummaryNavItemByType,
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
  const [actionNavMetadata, setActionNavMetadata] = useState(message.originalMessage?.metadata?.navMetadata)
  const { askAIWIthShortcuts } = useClientChat()
  const summaryType = useMemo(() => getPageSummaryType(), [])
  const summaryNavList = useMemo(() => allSummaryNavList[summaryType], [summaryType])

  const updateCurrentPageSummaryKey = useSetRecoilState(
    SidebarPageSummaryNavKeyState,
  )

  const changeSummaryAction = useCallback((navMetadata: IAIResponseOriginalMessageNavMetadata) => {
    if (navMetadata.key) {
      speedChangeKey = navMetadata.key
      setActionNavMetadata(navMetadata)
    }
  }, [])

  const clickNavTriggerActionChange = async (navItem: {
    title: string
    titleIcon: string
    key: SummaryParamsPromptType
  }) => {
    if (loading || speedChangeKey === navItem.key) return //防止多次触发
    changeSummaryAction({
      key: navItem.key,
      title: navItem.title,
      icon: navItem.titleIcon,
    })

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

    const promptText = summaryGetPromptObject[summaryType](navItem.key)
    const actions = await getSummaryNavActions({
      type: summaryType,
      messageId: message.messageId,
      prompt: promptText,
      title: navItem.title,
      icon: navItem.titleIcon,
      key: navItem.key,
    })
    await askAIWIthShortcuts(actions)
  }

  const clickCustomPromptTriggerActionChange = async (menuItem: IContextMenuItemWithChildren) => {
    if (loading || speedChangeKey === menuItem.id) return //防止多次触发
    changeSummaryAction({
      key: menuItem.id,
      title: menuItem.text,
      icon: menuItem.data.icon,
    })
    updateCurrentPageSummaryKey((summaryKeys) => {
      return {
        ...summaryKeys,
        [summaryType]: menuItem.id as SummaryParamsPromptType,
      }
    })
    await setChromeExtensionLocalStorage({
      sidebarSettings: {
        summary: {
          currentNavType: { [summaryType]: menuItem.id as SummaryParamsPromptType },
        },
      },
    })
    const actions = await getSummaryCustomPromptActions({
      type: summaryType,
      messageId: message.messageId,
      title: menuItem.text,
      icon: menuItem.data.icon as IContextMenuIconKey,
      actions: menuItem.data.actions!,
      key: menuItem.id
    })
    askAIWIthShortcuts(actions)
  }

  // 点扫把的时候需要 initialize speedChangeKey
  useEffect(() => {
    return () => {
      speedChangeKey = ''
    }
  }, [])

  useEffect(() => {
    if (!speedChangeKey && message.originalMessage?.metadata?.navMetadata?.key) {
      changeSummaryAction(message.originalMessage.metadata.navMetadata)
      //新进页面，变更 顶部的状态保存
      updateCurrentPageSummaryKey((summaryKeys) => {
        if (summaryKeys[summaryType]) {
          return summaryKeys
        } else {
          return {
            ...summaryKeys,
            [summaryType]: speedChangeKey as SummaryParamsPromptType,
          }
        }
      })
    }
  }, [message.originalMessage?.metadata?.navMetadata])

  // 旧版 Summary message 逻辑: 通过 title 判断哪个 nav 选中
  // 如果已经有新版逻辑的 navMetadata 了，就不走这个逻辑了
  // 但理论上说，现在获取 actions 时就会附加新版逻辑的 navMetadata，所以应该不会进到这个逻辑
  useEffect(() => {
    const messageTitle = message.originalMessage?.metadata?.title?.title
    if (!speedChangeKey && messageTitle && !message.originalMessage?.metadata?.navMetadata) {
      const summaryNavInfo = getSummaryNavItemByType(
        summaryType,
        messageTitle,
        'title',
      )
      if (summaryNavInfo) {
        changeSummaryAction({
          key: summaryNavInfo.key,
          title: summaryNavInfo.title,
          icon: summaryNavInfo.titleIcon,
        })
        //新进页面，变更 顶部的状态保存
        updateCurrentPageSummaryKey((summaryKeys) => {
          if (summaryKeys[summaryType]) {
            return summaryKeys
          } else {
            return {
              ...summaryKeys,
              [summaryType]: speedChangeKey as SummaryParamsPromptType,
            }
          }
        })
      }
      if (!speedChangeKey) {
        changeSummaryAction({
          key: 'all',
          title: 'Summarize',
        })
      }
    }
  }, [message.originalMessage?.metadata?.title?.title])

  return (
    <div>
      <ButtonGroup
        variant="outlined"
        aria-label="Basic button group"
        sx={{
          boxShadow:
            '0px 1px 2px 0px rgba(16, 24, 40, 0.05)',
        }}
      >
        {summaryNavList.map((navItem) => (
          <TextOnlyTooltip key={navItem.key} title={t(navItem.tooltip as any)}>
            <Button
              disabled={loading}
              variant={
                actionNavMetadata?.key === navItem.key ? 'contained' : 'outlined'
              }
              sx={{
                bgcolor: (t) =>
                  t.palette.mode === 'dark' || actionNavMetadata?.key === navItem.key
                    ? undefined
                    : 'background.paper',
                color: actionNavMetadata?.key === navItem.key ? undefined : 'primary.main',
                boxShadow: 'none',
              }}
              onClick={() => clickNavTriggerActionChange(navItem)}
            >
              <ContextMenuIcon
                sx={{
                  color:
                    actionNavMetadata?.key === navItem.key ? '#fff' : 'primary.main',
                  fontSize: 18,
                }}
                icon={navItem.titleIcon}
              />
            </Button>
          </TextOnlyTooltip>
        ))}
        <SidebarNavCustomPromptButton
          // 如果 custom prompt 被删了那默认也会显示 system prompt，所以粗暴一点直接判断 actived 不是 system prompt 就是 custom prompt
          actived={actionNavMetadata && summaryNavList.every(navItem => actionNavMetadata.key !== navItem.key)}
          message={message}
          summaryType={summaryType}
          loading={loading}
          actionNavMetadata={actionNavMetadata}
          onChange={clickCustomPromptTriggerActionChange}
        />
      </ButtonGroup>
    </div>
  )
}
