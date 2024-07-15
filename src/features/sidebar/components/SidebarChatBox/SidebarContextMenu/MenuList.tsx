import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { cloneDeep } from 'lodash-es'
import React, { FC, forwardRef, useCallback, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useRecoilState, useResetRecoilState } from 'recoil'

import useClientChat from '@/features/chatgpt/hooks/useClientChat'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import { SPECIAL_NEED_DIVIDER_KEYS } from '@/features/contextMenu/constants'
import {
  contextMenuIsFavoriteContextMenu,
  FAVORITE_CONTEXT_MENU_GROUP_ID,
} from '@/features/contextMenu/hooks/useFavoriteContextMenuList'
import {
  IContextMenuItem,
  IContextMenuItemWithChildren,
} from '@/features/contextMenu/types'
import {
  checkIsDraftContextMenuId,
  findDraftContextMenuById,
} from '@/features/contextMenu/utils'
import { ClientConversationManager } from '@/features/indexed_db/conversations/ClientConversationManager'
import { ISetActionsType } from '@/features/shortcuts/types/Action'

import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSelectedItemState,
  MenuProps,
} from './DropdownMenu'

const DropdownItemWrapper = forwardRef<
  any,
  { menuItem: IContextMenuItemWithChildren; rootMenu?: boolean } & Omit<
    MenuProps,
    'label'
  >
>((props, ref) => {
  const {
    menuItem,
    root,
    referenceElement,
    referenceElementOpen,
    rootMenu,
    customOpen,
    onClickContextMenu,
    menuWidth,
    ...rest
  } = props
  const { t } = useTranslation(['prompt'])
  const getMenuLabel = useCallback(
    (menuItem: IContextMenuItemWithChildren) => {
      if (t(`prompt:${menuItem.id}` as any) !== menuItem.id) {
        return t(`prompt:${menuItem.id}` as any)
      }
      return menuItem.text
    },
    [t],
  )
  const menuLabel = useMemo(
    () => getMenuLabel(menuItem),
    [menuItem.text, getMenuLabel],
  )
  if (menuItem.data.type === 'group') {
    return (
      <DropdownMenu
        zIndex={props.zIndex}
        ref={ref}
        root={root}
        label={menuLabel}
        menuWidth={menuWidth}
        onClickContextMenu={onClickContextMenu}
        referenceElement={
          <DropdownMenuItem {...rest} label={menuLabel} menuItem={menuItem} />
        }
      >
        {menuItem.children.map((childMenuItem) => {
          return (
            <DropdownItemWrapper
              {...rest}
              root={root}
              key={childMenuItem.id}
              menuItem={childMenuItem}
            />
          )
        })}
      </DropdownMenu>
    )
  }
  return (
    <DropdownMenuItem
      {...rest}
      menuItem={menuItem}
      ref={ref}
      label={menuLabel}
    />
  )
})

DropdownItemWrapper.displayName = 'DropdownItemWrapper'

const divider = (id: string) => {
  return (
    <Box
      data-testid={`max-ai-context-menu-divider`}
      aria-disabled={true}
      key={`${id}_group_spector`}
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

const ContextMenuList: FC<
  Omit<MenuProps, 'label'> & {
    menuList: IContextMenuItemWithChildren[]
    onRunActions: (actions: ISetActionsType) => Promise<void>
  }
> = (props) => {
  const {
    root,
    referenceElement,
    referenceElementOpen,
    referenceElementRef,
    menuList,
    customOpen,
    needAutoUpdate,
    defaultPlacement,
    defaultFallbackPlacements,
    onClickContextMenu,
    menuWidth,
    onClickReferenceElement,
    hoverOpen,
    hoverIcon,
    onRunActions,
    ...rest
  } = props
  const { t } = useTranslation(['prompt'])
  const [menuSelectedItemState, setMenuSelectedItemState] = useRecoilState(
    DropdownMenuSelectedItemState,
  )
  const resetDropdownState = useResetRecoilState(DropdownMenuSelectedItemState)
  const { checkAttachments, shortCutsEngine } = useClientChat()
  const { currentConversationId } = useClientConversation()

  useEffect(() => {
    console.log(
      'onRunActions selectedDraftContextMenuId effect',
      menuSelectedItemState,
      currentConversationId
        ? ClientConversationManager.getConversationById(currentConversationId)
        : '',
    )
    if (menuSelectedItemState.selectedContextMenuId && menuList.length > 0) {
      let currentSelectedId = menuSelectedItemState.selectedContextMenuId
      // 是否为[推荐]菜单的动作
      let isSuggestedContextMenu = false
      // 当前选中的contextMenu
      let currentContextMenu: IContextMenuItem | null = null
      // 如果是[推荐]菜单的动作，则需要去掉前缀
      if (contextMenuIsFavoriteContextMenu(currentSelectedId)) {
        currentSelectedId = currentSelectedId.replace(
          FAVORITE_CONTEXT_MENU_GROUP_ID,
          '',
        )
        isSuggestedContextMenu = true
      }

      // 是否为[草稿]菜单的动作
      const isDraftContextMenu = checkIsDraftContextMenuId(currentSelectedId)
      // 先从[草稿]菜单中查找
      if (isDraftContextMenu) {
        const draftContextMenu = findDraftContextMenuById(currentSelectedId)
        if (draftContextMenu) {
          currentContextMenu = draftContextMenu
        }
      } else {
        // 如果不是[草稿]菜单的动作，则从原始菜单中查找
        // currentContextMenu =
        //   originContextMenuList.find(
        //     (contextMenu) => contextMenu.id === currentSelectedId,
        //   ) || null
        currentContextMenu =
          menuList.find((item) => item.id === currentSelectedId) || null
      }

      if (!currentContextMenu || !currentContextMenu.id) return

      const runActions: ISetActionsType = cloneDeep(
        currentContextMenu.data.actions || [],
      )
      console.log('onRunActions prepare', runActions)
      resetDropdownState()

      if (runActions.length > 0) {
        checkAttachments().then((status) => {
          if (!status) return

          onRunActions(runActions)
            .then(() => {
              const error = shortCutsEngine?.getNextAction()?.error || ''
              if (error) {
                console.log('[ContextMenu Module] error', error)
              }
            })
            .catch((err) => {
              // TODO: 错误处理
              console.error('onRunActions catch error', err)
            })

          // return askAIWIthShortcuts(
          //   // getDetectHasContextWindowDraftActions().concat(runActions),
          //   {
          //     overwriteParameters: selectionElement?.selectionText
          //       ? [
          //           {
          //             key: 'SELECTED_TEXT',
          //             value: selectionElement.selectionText,
          //             label: 'Selected text',
          //             isBuiltIn: true,
          //             overwrite: true,
          //           },
          //         ]
          //       : [],
          //   },
          // )
        })

        // setActions(runActions)
      } else {
        // if (isDraftContextMenu) {
        //   if (
        //     getDraftContextMenuTypeById(currentContextMenuId) === 'TRY_AGAIN'
        //   ) {
        //     setContextWindowDraftContextMenu((prev) => {
        //       return {
        //         ...prev,
        //         selectedDraftContextMenuId: null,
        //       }
        //     })
        //     stopGenerateRef.current().then(() => {
        //       regenerateRef.current()
        //     })
        //   } else {
        //     setContextWindowDraftContextMenu((prev) => {
        //       return {
        //         ...prev,
        //         selectedDraftContextMenuId: currentContextMenu?.id || null,
        //       }
        //     })
        //   }
        // }
      }
    }
  }, [menuSelectedItemState])

  const RenderMenuList = useMemo(() => {
    const nodeList: React.ReactNode[] = []
    // console.log('Context Menu List Render', menuList)
    menuList.forEach((menuItem, index) => {
      const menuLabel =
        t(`prompt:${menuItem.id}` as any) !== menuItem.id
          ? t(`prompt:${menuItem.id}` as any)
          : menuItem.text
      if (menuItem.data.type === 'group') {
        if (index > 0) {
          nodeList.push(divider(menuItem.id))
        }
        // 组按钮的标签
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
            <Typography
              textAlign={'left'}
              fontSize={12}
              color={'text.secondary'}
            >
              {menuLabel}
            </Typography>
          </Box>,
        )
        menuItem.children.forEach((childMenuItem, _) => {
          if (SPECIAL_NEED_DIVIDER_KEYS.includes(childMenuItem.id)) {
            nodeList.push(divider(menuItem.id))
          }
          nodeList.push(
            <DropdownItemWrapper
              menuWidth={menuWidth}
              hoverIcon={hoverIcon}
              onClickContextMenu={onClickContextMenu}
              zIndex={2147483602}
              {...rest}
              key={childMenuItem.id}
              menuItem={childMenuItem}
              root={root as any}
            />,
          )
        })
        if (
          index === 0 &&
          menuItem.id === FAVORITE_CONTEXT_MENU_GROUP_ID &&
          menuList[index + 1].data.type === 'shortcuts'
        ) {
          nodeList.push(divider(menuItem.id))
        }
      } else {
        if (SPECIAL_NEED_DIVIDER_KEYS.includes(menuItem.id)) {
          nodeList.push(divider(menuItem.id))
        }
        nodeList.push(
          <DropdownItemWrapper
            menuWidth={menuWidth}
            hoverIcon={hoverIcon}
            onClickContextMenu={onClickContextMenu}
            key={menuItem.id}
            menuItem={menuItem}
            root={root}
          />,
        )
      }
    })
    return nodeList
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuList, t])

  useEffect(
    () => () => {
      resetDropdownState()
    },
    [],
  )

  return (
    <DropdownMenu
      zIndex={2147483601}
      label={''}
      root={root}
      customOpen={customOpen}
      needAutoUpdate={needAutoUpdate}
      referenceElement={referenceElement}
      referenceElementOpen={referenceElementOpen}
      referenceElementRef={referenceElementRef}
      defaultPlacement={defaultPlacement}
      defaultFallbackPlacements={defaultFallbackPlacements}
      onClickContextMenu={onClickContextMenu}
      onClickReferenceElement={onClickReferenceElement}
      hoverOpen={hoverOpen}
      menuWidth={menuWidth}
      hoverIcon={hoverIcon}
    >
      {RenderMenuList}
    </DropdownMenu>
  )
}

export default ContextMenuList
