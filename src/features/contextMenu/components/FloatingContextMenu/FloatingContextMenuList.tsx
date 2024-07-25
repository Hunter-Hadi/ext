import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import React, { FC, forwardRef, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import {
  DropdownMenu,
  DropdownMenuItem,
  MenuProps,
} from '@/features/contextMenu/components/FloatingContextMenu/DropdownMenu'
import { SPECIAL_NEED_DIVIDER_KEYS } from '@/features/contextMenu/constants'
import { FAVORITE_CONTEXT_MENU_GROUP_ID } from '@/features/contextMenu/hooks/useFavoriteContextMenuList'
import { IContextMenuItemWithChildren } from '@/features/contextMenu/types'

const RenderDropdownItem = forwardRef<
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
        needAutoUpdate={rest.needAutoUpdate}
      >
        {menuItem.children.map((childMenuItem) => {
          return (
            <RenderDropdownItem
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

RenderDropdownItem.displayName = 'RenderDropdownItem'

const createDivider = (id: string) => {
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

const FloatingContextMenuList: FC<
  Omit<MenuProps, 'label'> & {
    menuList: IContextMenuItemWithChildren[]
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
    ...rest
  } = props
  const { t } = useTranslation(['prompt'])
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
          nodeList.push(createDivider(menuItem.id))
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
            nodeList.push(createDivider(menuItem.id))
          }
          nodeList.push(
            <RenderDropdownItem
              menuWidth={menuWidth}
              hoverIcon={hoverIcon}
              onClickContextMenu={onClickContextMenu}
              zIndex={2147483602}
              needAutoUpdate={needAutoUpdate}
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
          nodeList.push(createDivider(menuItem.id))
        }
      } else {
        if (SPECIAL_NEED_DIVIDER_KEYS.includes(menuItem.id)) {
          nodeList.push(createDivider(menuItem.id))
        }
        nodeList.push(
          <RenderDropdownItem
            menuWidth={menuWidth}
            hoverIcon={hoverIcon}
            onClickContextMenu={onClickContextMenu}
            needAutoUpdate={needAutoUpdate}
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

export default FloatingContextMenuList
