import Portal from '@/components/Portal'
import React from 'react'
import { Paper } from '@mui/material'
import { Menu } from 'react-contexify'
import ContextMenuList from '@/features/contextMenu/components/RangyContextMenu/ContextMenuList'
import defaultGmailToolbarContextMenuJson from '@/pages/options/defaultGmailToolbarContextMenuJson'
import ClickContextMenu from './ClickContextMenu'
import {
  ROOT_CONTEXT_MENU_GMAIL_TOOLBAR_ID,
  ROOT_CONTEXT_MENU_ID,
} from '@/types'

const RangyContextMenu = () => {
  return (
    <Portal containerId={ROOT_CONTEXT_MENU_ID}>
      <ClickContextMenu />
      <Paper elevation={3}>
        <Menu
          style={{
            zIndex: 999998,
          }}
          id={ROOT_CONTEXT_MENU_GMAIL_TOOLBAR_ID}
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
