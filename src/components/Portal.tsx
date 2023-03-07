/**
 * Create a React Portal to contain the child elements outside of your current
 * component's context.
 * @param visible {boolean} - Whether the Portal is visible or not. This merely changes the container's styling.
 * @param containerId {string} - The ID attribute used for the Portal container. Change to support multiple Portals.
 * @param children {JSX.Element} - A child or list of children to render in the document.
 * @return {React.ReactPortal|null}
 * @constructor
 */
import React, { FC, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useRecoilValue } from 'recoil'
import { RangyState } from '@/features/contextMenu'
import createCache, { EmotionCache } from '@emotion/cache'
import { CacheProvider } from '@emotion/react'

const Portal: FC<{
  visible?: boolean
  containerId?: string
  children: React.ReactNode
}> = ({ visible = false, containerId = 'modal-root', children }) => {
  const [modalContainer, setModalContainer] = useState<HTMLDivElement | null>(
    null,
  )
  const emotionCacheRef = useRef<EmotionCache | null>(null)
  const rangyState = useRecoilValue(RangyState)
  /**
   * Create the modal container element that we'll put the children in.
   * Also make sure the documentElement has the modal root element inserted
   * so that we do not have to manually insert it into our HTML.
   */
  useEffect(() => {
    const modalRoot = document.getElementById(containerId)
    if (modalRoot) {
      const shadowRootElement = document.createElement('div')
      shadowRootElement.id = `EzMail_AI_ROOT_Context_Menu_Portal`
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
        key: 'ezmail-ai-context-menu',
        prepend: true,
        container: emotionRoot,
      })
      setModalContainer(shadowRootElement)
    }
  }, [containerId])

  /**
   * If both the modal root and container elements are present we want to
   * insert the container into the root.
   */
  useEffect(() => {
    const modalRoot = document.getElementById(containerId)
    if (modalRoot && modalContainer) {
      modalRoot.shadowRoot?.appendChild(modalContainer)
    }
    /**
     * On cleanup we remove the container from the root element.
     */
    return function cleanup() {
      if (modalContainer) {
        modalRoot?.shadowRoot?.removeChild(modalContainer)
      }
    }
  }, [containerId, modalContainer])

  /**
   * To prevent the non-visible elements from taking up space on the bottom of
   * the documentElement, we want to use CSS to hide them until we need them.
   */
  useEffect(() => {
    if (modalContainer) {
      modalContainer.className = visible ? 'visible' : 'hidden'
      modalContainer.style.position = visible ? 'absolute' : 'absolute'
      modalContainer.style.opacity = visible ? '1' : '0'
      modalContainer.style.zIndex = visible ? '999998' : '-1'
      modalContainer.style.top = visible
        ? `${rangyState.position.y + 8}px`
        : '0px'
      modalContainer.style.left = visible
        ? `${rangyState.position.x + 8}px`
        : '0px'
    }
  }, [modalContainer, visible, rangyState])

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
    <CacheProvider value={emotionCacheRef.current}>{children}</CacheProvider>,
    modalContainer,
  )
}
export default Portal
