import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import React, { type ReactNode } from 'react'

import { type IContextMenuItemWithChildren } from '@/features/contextMenu/types'

import SidebarNavCustomPromptMenuItem from './SidebarNavCustomPromptMenuItem'

export const checkIsValidGroup = (
  menuItem: IContextMenuItemWithChildren,
): boolean => {
  if (menuItem.children.length === 0) {
    return false
  }
  let result = false
  for (let i = 0; i < menuItem.children.length; i++) {
    const childItem = menuItem.children[i]
    if (childItem.data.type === 'shortcuts') {
      result = true
    } else {
      result = checkIsValidGroup(childItem)
    }
    if (result) {
      break
    }
  }
  return result
}

const RenderCustomPromptMenuList = (
  menuList: IContextMenuItemWithChildren[],
  {
    level = 0,
    actionPromptId,
    onClick,
  }: {
    level?: number
    actionPromptId?: string
    onClick: (menuItem: IContextMenuItemWithChildren) => void
  },
) => {
  const nodeList: ReactNode[] = []
  menuList.forEach((menuItem) => {
    if (menuItem.data.type === 'group' && level === 0) {
      if (checkIsValidGroup(menuItem)) {
        nodeList.push(
          <Divider
            textAlign='left'
            sx={{ maxWidth: '100%', my: '1px!important', overflow: 'hidden' }}
          >
            <Typography
              textAlign={'left'}
              fontSize={12}
              color={'text.secondary'}
              sx={{
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
              }}
            >
              {menuItem.text}
            </Typography>
          </Divider>,
        )
        nodeList.push(
          ...RenderCustomPromptMenuList(menuItem.children, {
            level: level + 1,
            actionPromptId,
            onClick,
          }),
        )
      }
    } else {
      nodeList.push(
        <SidebarNavCustomPromptMenuItem
          actionPromptId={actionPromptId}
          menuItem={menuItem}
          level={level}
          onClick={onClick}
          key={menuItem.id}
        />,
      )
    }
  })

  return nodeList
}

export default RenderCustomPromptMenuList
