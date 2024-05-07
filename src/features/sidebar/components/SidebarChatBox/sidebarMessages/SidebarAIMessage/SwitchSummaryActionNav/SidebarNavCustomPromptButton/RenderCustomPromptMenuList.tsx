import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import React, {
  type ReactNode,
} from 'react'

import { type IContextMenuItemWithChildren } from '@/features/contextMenu/types'

import SidebarNavCustomPromptMenuItem from './SidebarNavCustomPromptMenuItem'

const RenderCustomPromptMenuList = (
  menuList: IContextMenuItemWithChildren[],
  {
    level = 0,
    actionPromptId,
    onClick,
  }: {
    level?: number,
    actionPromptId?: string,
    onClick: (menuItem: IContextMenuItemWithChildren) => void,
  }
) => {
  const nodeList: ReactNode[] = []
  menuList.forEach((menuItem) => {
    if (menuItem.data.type === 'group' && level === 0) {
      nodeList.push(
        <Divider textAlign="left" sx={{ my: '1px!important' }}>
          <Typography
            textAlign={'left'}
            fontSize={12}
            color={'text.secondary'}
          >
            {menuItem.text}
          </Typography>
        </Divider>,
      )
      nodeList.push(
        ...RenderCustomPromptMenuList(menuItem.children, { level: level + 1, actionPromptId, onClick }),
      )
    } else {
      nodeList.push(<SidebarNavCustomPromptMenuItem actionPromptId={actionPromptId} menuItem={menuItem} level={level} onClick={onClick} key={menuItem.id} />)
    }
  })

  return nodeList
}

export default RenderCustomPromptMenuList
