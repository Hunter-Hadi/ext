import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import React, { FC, forwardRef, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { SPECIAL_NEED_DIVIDER_KEYS } from '@/features/contextMenu/constants'
import { FAVORITE_CONTEXT_MENU_GROUP_ID } from '@/features/contextMenu/hooks/useFavoriteContextMenuList'
import { IContextMenuItemWithChildren } from '@/features/contextMenu/types'

import { DropdownItem, DropdownMenu, MenuProps } from './DropdownMenu'

const DropdownItemWrapper = forwardRef<
  HTMLElement,
  { menuItem: IContextMenuItemWithChildren; rootMenu?: boolean } & Omit<
    MenuProps,
    'label'
  >
>((props, ref) => {
  const { menuItem, root, onClickContextMenu, menuWidth, ...rest } = props
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
  const menuLabel = useMemo(() => getMenuLabel(menuItem), [menuItem.text])

  if (menuItem.data.type === 'group') {
    return (
      <DropdownMenu
        zIndex={props.zIndex}
        ref={ref}
        root={root}
        label={menuLabel}
        menuWidth={menuWidth}
        onClickContextMenu={onClickContextMenu}
        referenceElement={<DropdownItem {...rest} menuItem={menuItem} />}
        matcher={rest.matcher}
        open={rest.matcher?.matchOpenGroup(menuItem)}
        menuItem={menuItem}
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
  return <DropdownItem {...rest} menuItem={menuItem} ref={ref} />
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
    inputValue?: string
  }
> = (props) => {
  const {
    root,
    referenceElement,
    referenceElementRef,
    menuList,
    open,
    needAutoUpdate,
    defaultPlacement,
    defaultFallbackPlacements,
    onClickContextMenu,
    menuWidth,
    hoverIcon,
    ...rest
  } = props
  const { t } = useTranslation(['prompt'])

  const RenderMenuList = useMemo(() => {
    const nodeList: React.ReactNode[] = []
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
              key={childMenuItem.id}
              menuItem={childMenuItem}
              root={root}
              {...rest}
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
            matcher={rest.matcher}
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
      label=''
      root={root}
      open={open}
      needAutoUpdate={needAutoUpdate}
      referenceElement={referenceElement}
      referenceElementRef={referenceElementRef}
      defaultPlacement={defaultPlacement}
      defaultFallbackPlacements={defaultFallbackPlacements}
      onClickContextMenu={onClickContextMenu}
      menuWidth={menuWidth}
      hoverIcon={hoverIcon}
      matcher={rest.matcher}
      maxHeight={rest.maxHeight}
    >
      {RenderMenuList}
    </DropdownMenu>
  )
}

export default ContextMenuList
