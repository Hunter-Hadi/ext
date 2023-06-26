import React, { FC, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import createCache, { EmotionCache } from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { ROOT_CONTEXT_MENU_PORTAL_ID } from '@/constants'
import { FloatingContextMenu } from '@/features/contextMenu/components/FloatingContextMenu'

const AppNameToClassName = String(process.env.APP_ENV || '')
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
      if (modalRoot.shadowRoot) {
        modalRoot.shadowRoot.appendChild(shadowRootElement)
        modalRoot.shadowRoot.appendChild(emotionRoot)
      } else {
        const shadowContainer = modalRoot.attachShadow({ mode: 'open' })
        shadowContainer.appendChild(shadowRootElement)
        shadowContainer.appendChild(emotionRoot)
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
