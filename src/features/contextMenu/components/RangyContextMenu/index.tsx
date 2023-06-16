import Portal from '@/components/Portal'
import React from 'react'
import Paper from '@mui/material/Paper'
import { Menu } from 'react-contexify'
import ContextMenuList from '@/features/contextMenu/components/RangyContextMenu/ContextMenuList'
import ClickContextMenu from './ClickContextMenu'
import {
  ROOT_CONTEXT_MENU_GMAIL_TOOLBAR_ID,
  ROOT_CONTEXT_MENU_ID,
} from '@/constants'
import FloatingShortCutsTip from '@/features/contextMenu/components/FloatingContextMenu/FloatingShortCutsTip'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import markdownCss from '@/pages/markdown.less'

const RangyContextMenu = () => {
  return (
    <Portal containerId={ROOT_CONTEXT_MENU_ID}>
      <style>{markdownCss}</style>
      <Paper elevation={3}>
        <Menu
          style={{
            zIndex: 999998,
          }}
          id={ROOT_CONTEXT_MENU_GMAIL_TOOLBAR_ID}
        >
          <ContextMenuList buttonKey={'gmailButton'} />
        </Menu>
      </Paper>
      <ClickContextMenu />
      <FloatingShortCutsTip />
    </Portal>
  )
}
export { RangyContextMenu }
