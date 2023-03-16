import Portal from '@/components/Portal'
import React from 'react'
import { Paper } from '@mui/material'
import { Menu } from 'react-contexify'
import ContextMenuList from '@/features/contextMenu/components/RangyContextMenu/ContextMenuList'
import defaultGmailToolbarContextMenuJson from '@/pages/options/defaultGmailToolbarContextMenuJson'
import ClickContextMenu from './ClickContextMenu'
import {
  ROOT_CONTEXT_MENU_CONTAINER_ID,
  ROOT_CONTEXT_MENU_GMAIL_TOOLBAR_ID,
  ROOT_CONTEXT_MENU_ID,
} from '@/types'
import defaultContextMenuJson from '@/pages/options/defaultContextMenuJson'

const RangyContextMenu = () => {
  return (
    <Portal containerId={ROOT_CONTEXT_MENU_ID}>
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
      <ClickContextMenu />
      <Menu
        style={{
          zIndex: 2147483601,
          border: '1px solid rgb(237,237,236)',
        }}
        id={ROOT_CONTEXT_MENU_CONTAINER_ID + 'StaticButton'}
      >
        <ContextMenuList
          staticButton
          defaultContextMenuJson={defaultContextMenuJson}
          settingsKey={'contextMenus'}
        />
      </Menu>
    </Portal>
  )
}
export { RangyContextMenu }
