import React, { FC } from 'react'
import Portal from '@/components/Portal'
import { ROOT_CONTEXT_MENU_ID } from '@/constants'
import FloatingMiniMenu from '@/features/contextMenu/components/FloatingMiniMenu'
import FloatingShortCutsTip from '@/features/contextMenu/components/FloatingContextMenu/FloatingShortCutsTip'
import { DisabledPDFViewer } from '@/components/AppInit'
import InputAssistantButtonPortal from '@/features/contextMenu/components/InputAssistantButton/InputAssistantButtonPortal'

const ContextMenuRoot: FC = () => {
  return (
    <>
      <Portal containerId={ROOT_CONTEXT_MENU_ID}>
        <FloatingMiniMenu />
        <FloatingShortCutsTip />
        <DisabledPDFViewer />
      </Portal>
      <InputAssistantButtonPortal />
    </>
  )
}

export default ContextMenuRoot
