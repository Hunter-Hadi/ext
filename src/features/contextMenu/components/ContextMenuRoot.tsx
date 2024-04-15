import React, { FC } from 'react'

import Portal from '@/components/Portal'
import { MAXAI_CONTEXT_MENU_ID } from '@/features/common/constants'
import FloatingShortCutsTip from '@/features/contextMenu/components/FloatingContextMenu/FloatingShortCutsTip'
import FloatingMiniMenu from '@/features/contextMenu/components/FloatingMiniMenu'
import GoogleDocInject from '@/features/contextMenu/components/GoogleDocInject'
import InputAssistantButtonPortal from '@/features/contextMenu/components/InputAssistantButton/InputAssistantButtonPortal'

const ContextMenuRoot: FC = () => {
  return (
    <>
      <Portal containerId={MAXAI_CONTEXT_MENU_ID}>
        <FloatingMiniMenu />
        <FloatingShortCutsTip />
      </Portal>
      <InputAssistantButtonPortal />
      <GoogleDocInject />
    </>
  )
}

export default ContextMenuRoot
