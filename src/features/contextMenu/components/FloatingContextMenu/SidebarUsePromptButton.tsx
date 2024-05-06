import Box from '@mui/material/Box'
import { SxProps } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import cloneDeep from 'lodash-es/cloneDeep'
import React, {
  FC,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { atomFamily, useRecoilState, useSetRecoilState } from 'recoil'

import { UseChatGptIcon } from '@/components/CustomIcon'
import MaxAIClickAwayListener from '@/components/MaxAIClickAwayListener'
import TooltipIconButton from '@/components/TooltipIconButton'
import useClientChat from '@/features/chatgpt/hooks/useClientChat'
import { IChatMessage } from '@/features/chatgpt/types'
import { useContextMenuList } from '@/features/contextMenu'
import {
  DropdownMenu,
  LiteDropdownMenuItem,
} from '@/features/contextMenu/components/FloatingContextMenu/DropdownMenu'
import { IContextMenuItemWithChildren } from '@/features/contextMenu/types'
import { ISetActionsType } from '@/features/shortcuts/types/Action'
import { formatChatMessageContent } from '@/features/sidebar/utils/chatMessagesHelper'
import { getMaxAISidebarRootElement } from '@/utils'
import { getCurrentDomainHost } from '@/utils/dataHelper/websiteHelper'

const NO_SUPPORT_HOST: string[] = []

const SidebarUsePromptSelectContextMenuState = atomFamily<
  IContextMenuItemWithChildren | null,
  string
>({
  key: 'SidebarUsePromptSelectContextMenuState',
  default: null,
})
/**
 * 输入框呼出按钮
 * @param message
 * @constructor
 */
const SidebarUsePromptButton: FC<{
  message: IChatMessage
  className?: string
  iconButton?: boolean
  sx?: SxProps
}> = (props) => {
  const { message, iconButton, className, sx } = props
  const [
    sidebarUsePromptSelectContextMenu,
    setSidebarUsePromptSelectContextMenu,
  ] = useRecoilState(SidebarUsePromptSelectContextMenuState(message.messageId))
  const { askAIWIthShortcuts } = useClientChat()
  const [root, setRoot] = React.useState<HTMLElement | null>(null)
  const testid = 'max-ai__actions__button--use-prompt'
  const [open, setOpen] = useState(false)
  const { t } = useTranslation(['common', 'client'])
  const { contextMenuList } = useContextMenuList(
    'textSelectPopupButton',
    '',
    false,
  )
  const messageContext = useMemo(() => {
    return formatChatMessageContent(message)
  }, [message])
  const isRunningRef = useRef(false)
  useEffect(() => {
    if (isRunningRef.current) {
      return
    }
    if (sidebarUsePromptSelectContextMenu && messageContext) {
      const actions: ISetActionsType = cloneDeep(
        sidebarUsePromptSelectContextMenu.data.actions,
      ).map((action) => {
        if (action.type === 'FETCH_ACTIONS') {
          // 本次不携带history，但是后续需要携带
          action.parameters.ActionFetchActionsWithHistory = true
        }
        return action
      })
      // 最前面插入一个action
      actions.unshift({
        type: 'SET_VARIABLE',
        parameters: {
          Variable: {
            key: 'SELECTED_TEXT',
            value: messageContext,
            label: 'Selected text',
            isBuiltIn: true,
            overwrite: true,
          },
        },
      })
      if (actions && actions.length > 0) {
        isRunningRef.current = true
        setSidebarUsePromptSelectContextMenu(null)
        askAIWIthShortcuts(actions)
          .then()
          .catch()
          .finally(() => {
            isRunningRef.current = false
          })
      }
    }
  }, [sidebarUsePromptSelectContextMenu, messageContext, askAIWIthShortcuts])
  useEffect(() => {
    setRoot(getMaxAISidebarRootElement() || document.body)
  }, [])
  if (NO_SUPPORT_HOST.includes(getCurrentDomainHost()) || !root) {
    return null
  }
  return (
    <MaxAIClickAwayListener
      onClickAway={() => {
        setOpen(false)
      }}
    >
      <DropdownMenu
        customOpen={true}
        hoverOpen={false}
        referenceElementOpen={open}
        defaultPlacement={'bottom-start'}
        defaultFallbackPlacements={[
          'bottom-end',
          'top-start',
          'top-end',
          'bottom-start',
        ]}
        root={root}
        referenceElement={
          <Box component={'div'}>
            <TooltipIconButton
              id={`MaxAISidebarUsePromptButton`}
              title={t('client:sidebar__button__use_prompt')}
              sx={sx}
              data-testid={testid}
              className={className}
              onClick={() => setOpen(!open)}
            >
              <UseChatGptIcon
                sx={{
                  color: (t: any) =>
                    t.palette.mode === 'dark'
                      ? 'rgba(255,255,255,.87)'
                      : 'rgba(0,0,0,.6)',
                  fontSize: '18px',
                }}
              />
            </TooltipIconButton>
          </Box>
        }
        menuSx={{
          width: 320,
        }}
        zIndex={2147483611}
        label={''}
      >
        <NestedPromptList
          buttonId={message.messageId}
          root={root}
          promptList={contextMenuList}
        />
      </DropdownMenu>
    </MaxAIClickAwayListener>
  )
}
const NestedPromptList: FC<{
  root: HTMLElement
  promptList: IContextMenuItemWithChildren[]
  buttonId: string
}> = ({ promptList, root, buttonId }) => {
  return (
    <>
      {promptList.map((item, index) => {
        return (
          <RenderDropdownItem
            buttonId={buttonId}
            deep={0}
            key={item.id}
            menuItem={item}
            root={root}
            index={index}
          />
        )
      })}
    </>
  )
}

const ContextMenuDivider: FC<{
  contextMenuId: string
}> = (props) => {
  const { contextMenuId } = props
  return (
    <Box
      data-testid={`max-ai-context-menu-divider`}
      key={contextMenuId + '_group_spector'}
      aria-disabled={true}
      onClick={(event: any) => {
        event.stopPropagation()
        event.preventDefault()
      }}
      component={'div'}
      sx={{
        pointerEvents: 'none',
        borderTop: '1px solid',
        borderColor: 'customColor.borderColor',
        my: 1,
      }}
    />
  )
}

const RenderDropdownItem: FC<{
  buttonId: string
  menuItem: IContextMenuItemWithChildren
  root: HTMLElement
  index: number
  deep?: number
}> = ({ buttonId, menuItem, root, index, deep = 0 }) => {
  const nodeList: ReactNode[] = []
  const setSelectContextMenu = useSetRecoilState(
    SidebarUsePromptSelectContextMenuState(buttonId),
  )

  if (menuItem.data.type === 'group') {
    if (deep === 0) {
      if (index > 0) {
        // spector
        nodeList.push(<ContextMenuDivider contextMenuId={menuItem.id} />)
      }
      nodeList.push(
        <Box
          key={menuItem.id + '_group_name'}
          component={'div'}
          aria-disabled={true}
          sx={{
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            width: '100%',
            boxSizing: 'border-box',
            direction: 'row',
            px: 1,
            pointerEvents: 'none',
          }}
          onClick={(event: any) => {
            event.stopPropagation()
            event.preventDefault()
          }}
        >
          <Typography textAlign={'left'} fontSize={12} color={'text.secondary'}>
            {menuItem.text}
          </Typography>
        </Box>,
      )
      menuItem.children.forEach((childMenuItem, index) => {
        nodeList.push(
          <RenderDropdownItem
            buttonId={buttonId}
            key={childMenuItem.id}
            menuItem={childMenuItem}
            root={root}
            index={index}
            deep={deep + 1}
          />,
        )
      })
    } else {
      nodeList.push(
        <DropdownMenu
          defaultPlacement={'right-start'}
          defaultFallbackPlacements={['right', 'left', 'bottom', 'top']}
          root={root}
          referenceElement={
            <LiteDropdownMenuItem
              isGroup
              icon={menuItem.data.icon}
              label={menuItem.text}
            />
          }
          menuSx={{
            width: 320,
          }}
          hoverOpen
          zIndex={2147483611}
          label={''}
        >
          <NestedPromptList
            buttonId={buttonId}
            deep={deep + 1}
            root={root}
            promptList={menuItem.children}
          />
        </DropdownMenu>,
      )
    }
    return nodeList
  }
  return (
    <LiteDropdownMenuItem
      index={index}
      icon={menuItem.data.icon}
      label={menuItem.text}
      onClick={() => {
        setSelectContextMenu(menuItem)
      }}
    />
  )
}

export default SidebarUsePromptButton
