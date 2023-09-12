import React, { FC, useCallback, useEffect, useMemo } from 'react'
import { atom, useRecoilState } from 'recoil'
import {
  FloatingDropdownMenuSelectedItemState,
  FloatingDropdownMenuState,
} from '@/features/contextMenu/store'
import { v4 as uuidV4 } from 'uuid'

import { useContextMenuList } from '@/features/contextMenu/hooks/useContextMenuList'
import FloatingContextMenuList from '@/features/contextMenu/components/FloatingContextMenu/FloatingContextMenuList'
import { useShortCutsWithMessageChat } from '@/features/shortcuts/hooks/useShortCutsWithMessageChat'
import { getAppRootElement, getCurrentDomainHost } from '@/utils'
import Button from '@mui/material/Button'
import { UseChatGptIcon } from '@/components/CustomIcon'
import TooltipIconButton from '@/components/TooltipIconButton'
import Box from '@mui/material/Box'
import { IContextMenuItemWithChildren } from '@/features/contextMenu/types'

const CurrentFloatingContextMenuButtonState = atom({
  key: 'CurrentFloatingContextMenuButtonState',
  default: {
    id: '',
  },
})

const NO_SUPPORT_HOST = ['teams.live.com', 'notion.so']

/**
 * @description 空的contextMenuList 用于loading, 初次渲染的时候不占用太多资源
 */
const EMPTY_CONTEXT_MENU_ARRAY = [
  {
    id: 'f3501f51b708',
    parent: 'root',
    droppable: false,
    text: 'Loading...',
    data: {
      editable: false,
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_TEMPLATE',
          parameters: {
            template: '',
          },
        },
      ],
      icon: 'ThumbUp',
      searchText: 'Loading...',
    },
    children: [],
  },
] as IContextMenuItemWithChildren[]

/**
 * use chatgpt的button
 * @param buttonText
 * @param templateText
 * @param iconButton
 * @param preLoading - 是否预加载
 * @constructor
 */
const FloatingContextMenuButton: FC<{
  preLoading?: boolean
  buttonText?: string
  templateText?: string
  iconButton?: boolean
}> = ({ buttonText, templateText, iconButton, preLoading }) => {
  const root = getAppRootElement()
  const [floatingDropdownMenu] = useRecoilState(FloatingDropdownMenuState)
  const [
    currentFloatingContextMenuButton,
    updateCurrentFloatingContextMenuButton,
  ] = useRecoilState(CurrentFloatingContextMenuButtonState)
  const [
    floatingDropdownMenuSelectedItem,
    updateFloatingDropdownMenuSelectedItem,
  ] = useRecoilState(FloatingDropdownMenuSelectedItemState)
  const { setShortCuts, runShortCuts, loading } =
    useShortCutsWithMessageChat('')
  const { contextMenuList, originContextMenuList } = useContextMenuList(
    'textSelectPopupButton',
  )
  const buttonId = useMemo(() => uuidV4(), [])
  const [isVisited, setIsVisited] = React.useState(false)
  const updateCurrentFloatingContextMenuButtonId = useCallback(() => {
    setIsVisited(true)
    updateCurrentFloatingContextMenuButton(() => {
      return {
        id: buttonId,
      }
    })
  }, [buttonId])
  useEffect(() => {
    /**
     * @description
     * 1. 必须有选中的id
     * 2. 必须有子菜单
     * 3. contextMenu必须是关闭状态
     * 4. 必须不是loading
     * 5. 必须是当前的button
     */
    if (buttonId !== currentFloatingContextMenuButton.id) {
      return
    }
    if (
      floatingDropdownMenuSelectedItem.selectedContextMenuId &&
      originContextMenuList.length > 0 &&
      !floatingDropdownMenu.open &&
      !loading
    ) {
      const findContextMenu = originContextMenuList.find(
        (contextMenu) =>
          contextMenu.id ===
          floatingDropdownMenuSelectedItem.selectedContextMenuId,
      )
      if (
        findContextMenu &&
        findContextMenu.data.actions &&
        findContextMenu.data.actions.length > 0
      ) {
        updateFloatingDropdownMenuSelectedItem(() => {
          return {
            lastHoverContextMenuId: null,
            selectedContextMenuId: null,
            hoverContextMenuIdMap: {},
          }
        })
        setShortCuts(
          findContextMenu.data.actions.map((action) => {
            if (action.type === 'RENDER_TEMPLATE') {
              return {
                ...action,
                parameters: {
                  ...action.parameters,
                  template: (action.parameters?.template || '').replace(
                    /\{\{SELECTED_TEXT\}\}/g,
                    templateText || '{{LAST_AI_OUTPUT}}',
                  ),
                },
              }
            }
            return action
          }),
        )
        runShortCuts().then()
      }
    }
  }, [
    floatingDropdownMenuSelectedItem.selectedContextMenuId,
    floatingDropdownMenu.open,
    originContextMenuList,
    loading,
    templateText,
    buttonId,
    currentFloatingContextMenuButton.id,
  ])
  if (!root || NO_SUPPORT_HOST.includes(getCurrentDomainHost())) {
    return null
  }
  if (iconButton) {
    return (
      <FloatingContextMenuList
        referenceElement={
          <Box>
            <TooltipIconButton
              title={'Use prompt'}
              onClick={updateCurrentFloatingContextMenuButtonId}
            >
              <UseChatGptIcon
                sx={{
                  fontSize: 16,
                  color: 'inherit',
                }}
              />
            </TooltipIconButton>
          </Box>
        }
        root={root}
        menuList={isVisited ? contextMenuList : EMPTY_CONTEXT_MENU_ARRAY}
      />
    )
  }
  return (
    <FloatingContextMenuList
      referenceElement={
        <Box>
          <Button
            startIcon={
              <UseChatGptIcon
                sx={{
                  fontSize: 16,
                  color: 'inherit',
                }}
              />
            }
            variant={'outlined'}
            onClick={updateCurrentFloatingContextMenuButtonId}
          >
            {buttonText || 'Use ChatGPT'}
          </Button>
        </Box>
      }
      root={root}
      menuList={
        isVisited || preLoading ? contextMenuList : EMPTY_CONTEXT_MENU_ARRAY
      }
    />
  )
}
export { FloatingContextMenuButton }
