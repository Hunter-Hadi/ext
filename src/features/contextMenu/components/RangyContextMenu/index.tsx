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
import GmailActionRunner from '@/features/sidebar/components/GmailActionRunner'
import { useRecoilValue } from 'recoil'
import { AppState } from '@/store'
import { DisabledPDFViewer } from '@/components/AppInit'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore

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
          <ContextMenuList buttonKey={'gmailButton'} />
        </Menu>
      </Paper>
      <ClickContextMenu />
      <FloatingShortCutsTip />
      <GmailActionRunnerBox />
      <DisabledPDFViewer />
    </Portal>
  )
}
const GmailActionRunnerBox = () => {
  const appState = useRecoilValue(AppState)
  if (appState.env === 'gmail') {
    return <GmailActionRunner />
  }
  return <></>
}
export { RangyContextMenu }
