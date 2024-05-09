import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
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
import { v4 as uuidV4 } from 'uuid'

import { UseChatGptIcon } from '@/components/CustomIcon'
import MaxAIClickAwayListener from '@/components/MaxAIClickAwayListener'
import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import TooltipIconButton from '@/components/TooltipIconButton'
import useClientChat from '@/features/chatgpt/hooks/useClientChat'
import useSmoothConversationLoading from '@/features/chatgpt/hooks/useSmoothConversationLoading'
import { IChatMessage } from '@/features/chatgpt/types'
import { useContextMenuList } from '@/features/contextMenu'
import {
  DropdownMenu,
  LiteDropdownMenuItem,
} from '@/features/contextMenu/components/FloatingContextMenu/DropdownMenu'
import { FAVORITE_CONTEXT_MENU_GROUP_ID } from '@/features/contextMenu/hooks/useFavoriteContextMenuList'
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
 * @returns
 */
const SidebarUsePromptButton: FC<{
  message?: IChatMessage
  text?: string
  className?: string
  iconButton?: boolean
  sx?: SxProps
}> = (props) => {
  const { message, className, sx, iconButton, text } = props
  const buttonId = useRef(message?.messageId || uuidV4())
  const [
    sidebarUsePromptSelectContextMenu,
    setSidebarUsePromptSelectContextMenu,
  ] = useRecoilState(SidebarUsePromptSelectContextMenuState(buttonId.current))
  const { askAIWIthShortcuts } = useClientChat()
  const { smoothConversationLoading } = useSmoothConversationLoading()
  const [root, setRoot] = React.useState<HTMLElement | null>(null)
  const testid = 'max-ai__actions__button--use-prompt'
  const [open, setOpen] = useState(false)
  const { t } = useTranslation(['common', 'client'])
  const { contextMenuList } = useContextMenuList(
    'textSelectPopupButton',
    '',
    false,
  )
  const currentContext = useMemo(() => {
    return text || (message && formatChatMessageContent(message, false)) || ''
  }, [message, text])
  const isRunningRef = useRef(false)
  useEffect(() => {
    if (isRunningRef.current) {
      return
    }
    if (sidebarUsePromptSelectContextMenu && currentContext) {
      const actions: ISetActionsType = cloneDeep(
        sidebarUsePromptSelectContextMenu.data.actions || [],
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
            value: currentContext,
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
  }, [sidebarUsePromptSelectContextMenu, currentContext, askAIWIthShortcuts])
  useEffect(() => {
    setRoot(getMaxAISidebarRootElement() || document.body)
  }, [])
  console.log('SidebarUsePromptButton', sx)
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
            {iconButton ? (
              <TooltipIconButton
                id={`MaxAISidebarUsePromptButton`}
                title={t('client:sidebar__button__use_prompt')}
                sx={sx}
                data-testid={testid}
                className={className}
                disabled={smoothConversationLoading}
                onClick={() => {
                  setOpen(!open)
                }}
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
            ) : (
              <TextOnlyTooltip title={t('client:sidebar__button__use_prompt')}>
                <Button
                  id={`MaxAISidebarUsePromptButton`}
                  variant={'outlined'}
                  sx={{
                    p: '5px',
                    minWidth: 'unset',
                    ...sx,
                  }}
                  data-testid={testid}
                  className={className}
                  disabled={smoothConversationLoading}
                  onClick={() => {
                    setOpen(!open)
                  }}
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
                </Button>
              </TextOnlyTooltip>
            )}
          </Box>
        }
        menuSx={{
          width: 320,
        }}
        zIndex={2147483611}
        label={''}
      >
        <NestedPromptList
          deep={0}
          buttonId={buttonId.current}
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
  deep: number
}> = ({ promptList, root, buttonId, deep }) => {
  return (
    <>
      {promptList.map((item, index) => {
        return (
          <RenderDropdownItem
            buttonId={buttonId}
            deep={deep}
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
  const { t } = useTranslation(['prompt'])
  const menuLabel = useMemo(() => {
    const id = menuItem.id.replace(FAVORITE_CONTEXT_MENU_GROUP_ID, '')
    const key: any = `prompt:${id}`
    if (t(key) !== id) {
      return t(key)
    }
    return menuItem.text
  }, [menuItem.text, t])
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
            {menuLabel}
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
    return <>{nodeList}</>
  }
  return (
    <LiteDropdownMenuItem
      icon={menuItem.data.icon}
      label={menuLabel}
      onClick={() => {
        setSelectContextMenu(menuItem)
      }}
    />
  )
}

export default SidebarUsePromptButton
