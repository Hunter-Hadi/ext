import React, { useEffect } from 'react'

import { useFloatingContextMenu } from '@/features/contextMenu'
import GlobalVideoPopup from '@/features/video_popup/components/GlobalVideoPopup'
import useVideoPopupController from '@/features/video_popup/hooks/useVideoPopupController'

/**
 * ContextWindowVideoPlayer
 * @constructor
 */
const ContextWindowVideoPlayer = () => {
  const { isFloatingMenuVisible } = useFloatingContextMenu()
  const { closeVideoPopup } = useVideoPopupController()
  useEffect(() => {
    if (!isFloatingMenuVisible) {
      closeVideoPopup()
    }
  }, [isFloatingMenuVisible])
  return <GlobalVideoPopup />
}

export default ContextWindowVideoPlayer
