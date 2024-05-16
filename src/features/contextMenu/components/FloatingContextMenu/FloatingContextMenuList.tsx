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
// import { ContextMenuIcon } from '@/components/ContextMenuIcon'

// eslint-disable-next-line react/display-name
const RenderDropdownItem = forwardRef<
  any,
  { menuItem: IContextMenuItemWithChildren; rootMenu?: boolean } & MenuProps
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
  const menuLabel = useMemo(() => {
    if (t(`prompt:${menuItem.id}` as any) !== menuItem.id) {
      return t(`prompt:${menuItem.id}` as any)
    }
    return menuItem.text
  }, [menuItem.text, t])
  const getMenuLabel = useCallback(
    (menuItem: IContextMenuItemWithChildren) => {
      if (t(`prompt:${menuItem.id}` as any) !== menuItem.id) {
        return t(`prompt:${menuItem.id}` as any)
      }
      return menuItem.text
    },
    [t],
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
        {menuItem.children.map((childMenuItem, index) => {
          return (
            <RenderDropdownItem
              {...rest}
              root={root}
              key={childMenuItem.id}
              menuItem={childMenuItem}
              label={getMenuLabel(childMenuItem)}
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

const FloatingContextMenuList: FC<
  Omit<MenuProps, 'label'> & {
    menuList: IContextMenuItemWithChildren[]
  }
> = (props) => {
  const {
    root,
    referenceElement,
    referenceElementOpen,
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
    console.log('Context Menu List Render', menuList)
    menuList.forEach((menuItem, index) => {
      const menuLabel =
        t(`prompt:${menuItem.id}` as any) !== menuItem.id
          ? t(`prompt:${menuItem.id}` as any)
          : menuItem.text
      if (menuItem.data.type === 'group') {
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
            {/*{menuItem?.data?.icon && (*/}
            {/*  <ContextMenuIcon*/}
            {/*    size={16}*/}
            {/*    icon={menuItem.data.icon}*/}
            {/*    sx={{ color: 'primary.main', mr: 1 }}*/}
            {/*  />*/}
            {/*)}*/}
            <Typography
              textAlign={'left'}
              fontSize={12}
              color={'text.secondary'}
            >
              {menuLabel}
            </Typography>
          </Box>,
        )
        menuItem.children.forEach((childMenuItem, index) => {
          console.log(
            `SPECIAL_NEED_DIVIDER_KEYS`,
            SPECIAL_NEED_DIVIDER_KEYS,
            childMenuItem.id,
            childMenuItem.text,
          )
          if (SPECIAL_NEED_DIVIDER_KEYS.includes(childMenuItem.id)) {
            nodeList.push(
              <ContextMenuDivider contextMenuId={childMenuItem.id} />,
            )
          }
          nodeList.push(
            <RenderDropdownItem
              menuWidth={menuWidth}
              hoverIcon={hoverIcon}
              onClickContextMenu={onClickContextMenu}
              zIndex={2147483602}
              {...rest}
              key={childMenuItem.id}
              label={''}
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
          nodeList.push(<ContextMenuDivider contextMenuId={menuItem.id} />)
        }
      } else {
        console.log(
          `SPECIAL_NEED_DIVIDER_KEYS`,
          SPECIAL_NEED_DIVIDER_KEYS,
          menuItem.id,
          menuItem.text,
        )
        if (SPECIAL_NEED_DIVIDER_KEYS.includes(menuItem.id)) {
          nodeList.push(<ContextMenuDivider contextMenuId={menuItem.id} />)
        }
        nodeList.push(
          <RenderDropdownItem
            menuWidth={menuWidth}
            hoverIcon={hoverIcon}
            onClickContextMenu={onClickContextMenu}
            key={menuItem.id}
            label={''}
            menuItem={menuItem}
            root={root as any}
          />,
        )
      }
    })
    // console.log('RenderMenuList', menuList, nodeList)
    return nodeList
  }, [menuList, t])
  // console.log('FloatingContextMenuList', defaultPlacement)
  return (
    <DropdownMenu
      zIndex={2147483601}
      label={''}
      root={root}
      customOpen={customOpen}
      needAutoUpdate={needAutoUpdate}
      referenceElement={referenceElement}
      referenceElementOpen={referenceElementOpen}
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
