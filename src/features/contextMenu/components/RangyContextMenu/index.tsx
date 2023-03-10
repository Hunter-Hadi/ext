import Portal from '@/components/Portal'
import React from 'react'
import { Paper } from '@mui/material'
import { Menu } from 'react-contexify'
import ContextMenuList from '@/features/contextMenu/components/RangyContextMenu/ContextMenuList'
export const RangyGmailToolBarContextMenuId =
  'EzMail_AI_ROOT_Gmail_Toolbar_Context_Menu_ID'
import defaultGmailToolbarContextMenuJson from '@/pages/options/defaultGmailToolbarContextMenuJson'
import ClickContextMenu from './ClickContextMenu'

const RangyContextMenu = () => {
  return (
    <Portal containerId={'EzMail_AI_ROOT_Context_Menu'}>
      <ClickContextMenu />
      <Paper elevation={3}>
        <Menu
          style={{
            zIndex: 999998,
          }}
          id={RangyGmailToolBarContextMenuId}
        >
          <ContextMenuList
            defaultContextMenuJson={defaultGmailToolbarContextMenuJson}
            settingsKey={'gmailToolBarContextMenu'}
          />
        </Menu>
      </Paper>
    </Portal>
  )
}
export { RangyContextMenu }
