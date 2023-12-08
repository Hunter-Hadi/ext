import createCache, { EmotionCache } from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import React, { FC, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Browser from 'webextension-polyfill'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {
  MAXAI_CHROME_EXTENSION_ID,
  ROOT_CONTEXT_MENU_PORTAL_ID,
} from '@/constants'
import { FloatingContextMenu } from '@/features/contextMenu/components/FloatingContextMenu'

const AppNameToClassName = String(MAXAI_CHROME_EXTENSION_ID)
  .toLowerCase()
  .replace(/_/g, '-')
const Portal: FC<{
  containerId?: string
  children: React.ReactNode
}> = ({ containerId = 'modal-root', children }) => {
  const [modalContainer, setModalContainer] = useState<HTMLDivElement | null>(
    null,
  )
  const emotionCacheRef = useRef<EmotionCache | null>(null)
  /**
   * Create the modal container element that we'll put the children in.
   * Also make sure the documentElement has the modal root element inserted
   * so that we do not have to manually insert it into our HTML.
   */
  useEffect(() => {
    const modalRoot = document.getElementById(containerId)
    if (modalRoot) {
      const shadowRootElement = document.createElement('div')
      shadowRootElement.id = ROOT_CONTEXT_MENU_PORTAL_ID
      const emotionRoot = document.createElement('style')
      const contentStyle = document.createElement('link')
      contentStyle.rel = 'stylesheet'
      contentStyle.href = Browser.runtime.getURL('content_style.css')
      if (modalRoot.shadowRoot) {
        modalRoot.shadowRoot.appendChild(shadowRootElement)
        modalRoot.shadowRoot.appendChild(emotionRoot)
        modalRoot.shadowRoot.appendChild(contentStyle)
      } else {
        const shadowContainer = modalRoot.attachShadow({ mode: 'open' })
        shadowContainer.appendChild(shadowRootElement)
        shadowContainer.appendChild(emotionRoot)
        shadowContainer.appendChild(contentStyle)
      }
      emotionCacheRef.current = createCache({
        key: `${AppNameToClassName}-context-menu`,
        prepend: true,
        container: emotionRoot,
      })
      setModalContainer(shadowRootElement)
    }
  }, [containerId])

  /**
   * Make sure the modal container is there before we insert any of the
   * Portal contents into the document.
   */
  if (!modalContainer || !emotionCacheRef.current) {
    return null
  }

  /**
   * Append the children of the Portal component to the modal container.
   * The modal container already exists in the modal root.
   */
  return createPortal(
    <CacheProvider value={emotionCacheRef.current}>
      <FloatingContextMenu root={modalContainer} />
      {children}
    </CacheProvider>,
    modalContainer,
  )
}
export default Portal
