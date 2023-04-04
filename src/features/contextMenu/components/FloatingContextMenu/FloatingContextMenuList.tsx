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
            <RenderDropdownItem
              {...rest}
              root={root}
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
  const {
    root,
    referenceElement,
    referenceElementOpen,
    menuList,
    customOpen,
    needAutoUpdate,
    ...rest
  } = props
  const RenderMenuList = useMemo(() => {
    const nodeList: React.ReactNode[] = []
    menuList.forEach((menuItem, index) => {
      if (menuItem.data.type === 'group') {
        if (index > 0) {
          // spector
          nodeList.push(
            <Box
              key={menuItem.id + '_group_spector'}
              aria-disabled={true}
              onClick={(event) => {
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
            />,
          )
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
            onClick={(event) => {
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
    console.log('RenderMenuList', menuList, nodeList)
    return nodeList
  }, [menuList])
  return (
    <DropdownMenu
      zIndex={2147483601}
      label={''}
      root={root}
      customOpen={customOpen}
      needAutoUpdate={needAutoUpdate}
      referenceElement={referenceElement}
      referenceElementOpen={referenceElementOpen}
    >
      {RenderMenuList}
    </DropdownMenu>
  )
}

export default FloatingContextMenuList
