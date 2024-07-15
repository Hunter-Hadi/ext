import React, { FC } from 'react'
import { createPortal } from 'react-dom'

import { getMaxAISidebarRootElement } from '@/utils'

export const IMMERSIVE_CHAT_PORTAL_ID = 'immersive-chat-portal'

const ImmersiveChatPortalWrapper: FC<{
  children: React.ReactNode
}> = (props) => {
  // 渲染到指定的 DOM 节点
  const portal = getMaxAISidebarRootElement()?.querySelector(
    `#${IMMERSIVE_CHAT_PORTAL_ID}`,
  )
  if (portal) {
    return createPortal(props.children, portal)
  }
  return null
}
export default ImmersiveChatPortalWrapper
