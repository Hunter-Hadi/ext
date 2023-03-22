import React, { FC, forwardRef, useEffect, useMemo, useState } from 'react'
import { useRangy } from '@/features/contextMenu/hooks'
import {
  getChromeExtensionSettings,
  IChromeExtensionSettingsKey,
} from '@/utils'

import {
  IContextMenuItemWithChildren,
  IContextMenuItem,
} from '@/features/contextMenu/store'
import {
  fuzzySearchContextMenuList,
  groupByContextMenuItem,
} from '@/features/contextMenu/utils'
import cloneDeep from 'lodash-es/cloneDeep'
import {
  DropdownMenu,
  DropdownMenuItem,
  MenuProps,
} from '@/features/contextMenu/components/FloatingContextMenu/DropdownMenu'
import { Box, Typography } from '@mui/material'
import { ContextMenuIcon } from '@/features/contextMenu/components/ContextMenuIcon'

export const useFloatingContextMenuList = (
  settingsKey: IChromeExtensionSettingsKey,
  defaultList: IContextMenuItem[],
  query?: string,
) => {
  const { rangyState, parseRangySelectRangeData } = useRangy()
  const [list, setList] = useState<IContextMenuItem[]>([])
  useEffect(() => {
    let isDestroy = false
    const getList = async () => {
      const settings = await getChromeExtensionSettings()
      if (isDestroy) return
      setList(settings[settingsKey] || defaultList)
    }
    getList()
    return () => {
      isDestroy = true
    }
  }, [])
  return useMemo(() => {
    console.log('useFloatingContextMenuList', query)
    if (query?.trim()) {
      return fuzzySearchContextMenuList(
        groupByContextMenuItem(cloneDeep(list)),
        query,
      )
    }
    if (settingsKey === 'gmailToolBarContextMenu') {
      return groupByContextMenuItem(cloneDeep(list)).map((group, index) => {
        if (index === 0) {
          // gmail只有一个group
          // group第一个作为cta button
          group.children = group.children.slice(1)
        }
        return group
      })
    } else if (settingsKey === 'contextMenus') {
      const groupList = groupByContextMenuItem(cloneDeep(list))
      const editOrReviewSelection = groupList.find(
        (group) => group.text === 'Edit or review selection',
      )
      const generateFromSelection = groupList.find(
        (group) => group.text === 'Generate from selection',
      )
      const currentRange = rangyState.lastSelectionRanges
      if (editOrReviewSelection && generateFromSelection) {
        if (currentRange) {
          const selectionData = parseRangySelectRangeData(
            currentRange?.selectRange,
            'ContextMenuList',
          )
          if (selectionData.isCanInputElement) {
            return [editOrReviewSelection, generateFromSelection]
          } else {
            return [generateFromSelection, editOrReviewSelection]
          }
        } else if (rangyState.currentActiveWriteableElement) {
          return [editOrReviewSelection, generateFromSelection]
        }
      }
    }
    return groupByContextMenuItem(cloneDeep(list))
  }, [
    rangyState.lastSelectionRanges,
    rangyState.currentActiveWriteableElement,
    list,
    settingsKey,
    query,
  ])
}

// eslint-disable-next-line react/display-name
const RenderDropdownItem = forwardRef<
  any,
  { menuItem: IContextMenuItemWithChildren; rootMenu?: boolean } & MenuProps
>((props, ref) => {
  const { menuItem, root } = props
  if (menuItem.data.type === 'group') {
    return (
      <DropdownMenu
        zIndex={props.zIndex}
        ref={ref}
        root={root}
        label={menuItem.text}
        referenceElement={
          <DropdownMenuItem label={menuItem.text} menuItem={menuItem} />
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
    <DropdownMenuItem menuItem={menuItem} ref={ref} label={menuItem.text} />
  )
})

const FloatingContextMenuList: FC<
  Omit<MenuProps, 'label'> & {
    menuList: IContextMenuItemWithChildren[]
  }
> = (props) => {
  const { root, referenceElement, referenceElementOpen, menuList } = props
  console.log(menuList)
  return (
    <DropdownMenu
      zIndex={2147483601}
      label={''}
      root={root}
      customOpen
      referenceElement={referenceElement}
      referenceElementOpen={referenceElementOpen}
    >
      {menuList.map((menuItem, index) => {
        if (menuItem.data.type === 'group') {
          return [
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
              {menuItem?.data?.icon && (
                <ContextMenuIcon
                  size={16}
                  icon={menuItem.data.icon}
                  sx={{ color: 'primary.main', mr: 1 }}
                />
              )}
              <Typography
                textAlign={'left'}
                fontSize={12}
                color={'text.secondary'}
              >
                {menuItem.text}
              </Typography>
            </Box>,
          ].concat(
            menuItem.children.map((childMenuItem, index) => {
              return (
                <RenderDropdownItem
                  zIndex={2147483601 + 1}
                  key={childMenuItem.id}
                  label={''}
                  menuItem={childMenuItem}
                  root={root as any}
                />
              )
            }),
          )
        }
        return (
          <RenderDropdownItem
            zIndex={2147483601 + 1}
            rootMenu
            key={menuItem.id}
            label={''}
            menuItem={menuItem}
            root={root as any}
          />
        )
      })}
    </DropdownMenu>
  )
}
export default FloatingContextMenuList
