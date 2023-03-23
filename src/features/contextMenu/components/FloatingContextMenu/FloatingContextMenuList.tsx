import React, { FC, forwardRef, useMemo } from 'react'

import { IContextMenuItemWithChildren } from '@/features/contextMenu/store'
import {
  DropdownMenu,
  DropdownMenuItem,
  MenuProps,
} from '@/features/contextMenu/components/FloatingContextMenu/DropdownMenu'
import { Box, Typography } from '@mui/material'
// import { ContextMenuIcon } from '@/features/contextMenu/components/ContextMenuIcon'

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
    ...rest
  } = props
  if (menuItem.data.type === 'group') {
    return (
      <DropdownMenu
        zIndex={props.zIndex}
        ref={ref}
        root={root}
        label={menuItem.text}
        referenceElement={
          <DropdownMenuItem
            {...rest}
            label={menuItem.text}
            menuItem={menuItem}
          />
        }
      >
        {menuItem.children.map((childMenuItem, index) => {
          return (
            <DropdownMenuItem
              key={childMenuItem.id}
              menuItem={childMenuItem}
              label={childMenuItem.text}
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
      label={menuItem.text}
    />
  )
})

const FloatingContextMenuList: FC<
  Omit<MenuProps, 'label'> & {
    menuList: IContextMenuItemWithChildren[]
  }
> = (props) => {
  const { root, referenceElement, referenceElementOpen, menuList, ...rest } =
    props
  const RenderMenuList = useMemo(() => {
    const nodeList: React.ReactNode[] = []
    menuList.forEach((menuItem, index) => {
      if (menuItem.data.type === 'group') {
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
              direction: 'row',
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
              {menuItem.text}
            </Typography>
          </Box>,
        )
        menuItem.children.forEach((childMenuItem, index) => {
          nodeList.push(
            <RenderDropdownItem
              zIndex={2147483602}
              {...rest}
              key={childMenuItem.id}
              label={''}
              menuItem={childMenuItem}
              root={root as any}
            />,
          )
        })
      } else {
        nodeList.push(
          <RenderDropdownItem
            key={menuItem.id}
            label={''}
            menuItem={menuItem}
            root={root as any}
          />,
        )
      }
    })
    return nodeList
  }, [menuList])
  return (
    <DropdownMenu
      zIndex={2147483601}
      label={''}
      root={root}
      customOpen
      referenceElement={referenceElement}
      referenceElementOpen={referenceElementOpen}
    >
      {RenderMenuList}
    </DropdownMenu>
  )
}

export default FloatingContextMenuList
