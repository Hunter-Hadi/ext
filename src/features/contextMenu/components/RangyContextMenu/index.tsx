import Portal from '@/components/Portal'
import React from 'react'
import Paper from '@mui/material/Paper'
import { Menu } from 'react-contexify'
import ContextMenuList from '@/features/contextMenu/components/RangyContextMenu/ContextMenuList'
import ClickContextMenu from './ClickContextMenu'
import {
  ROOT_CONTEXT_MENU_GMAIL_TOOLBAR_ID,
  ROOT_CONTEXT_MENU_ID,
} from '@/types'
import FloatingShortCutsTip from '@/features/contextMenu/components/FloatingContextMenu/FloatingShortCutsTip'

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
          <ContextMenuList settingsKey={'gmailToolBarContextMenu'} />
        </Menu>
      </Paper>
      <ClickContextMenu />
      <FloatingShortCutsTip />
    </Portal>
  )
}
export { RangyContextMenu }
