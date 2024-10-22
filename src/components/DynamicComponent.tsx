import createCache, { EmotionCache } from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import React, { FC, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { elementCheckVisibility } from '@/utils/dataHelper/elementHelper'

/**
 * 用于在页面不同位置插入不同的组件渲染
 * @param props
 * @constructor
 * @since 2023-10-23
 */
const DynamicComponent: FC<{
  rootContainer?: HTMLElement
  customElementName: string
  style?: string
  children: React.ReactNode
  checkVisibility?: boolean
  onSetContainer?: (container: HTMLElement) => void
}> = (props) => {
  const {
    rootContainer,
    customElementName,
    children,
    style,
    checkVisibility = true,
    onSetContainer,
  } = props
  const [container, setContainer] = useState<HTMLElement | null>(null)
  const emotionCacheRef = useRef<EmotionCache | null>(null)
  /**
   * Create the modal container element that we'll put the children in.
   * Also make sure the documentElement has the modal root element inserted
   * so that we do not have to manually insert it into our HTML.
   */
  useEffect(() => {
    if (rootContainer && !container) {
      if (checkVisibility && !elementCheckVisibility(rootContainer)) {
        return
      }
      const isSupportWebComponent = 'customElements' in window
      const container = document.createElement(
        isSupportWebComponent ? customElementName : 'div',
      )
      if (style) {
        container.style.cssText = style
      }
      rootContainer.insertBefore(container, rootContainer.firstChild)
      const shadowContainer = container.attachShadow({ mode: 'open' })
      const emotionRoot = document.createElement('style')
      const shadowRootElement = document.createElement('div')
      shadowContainer.appendChild(emotionRoot)
      shadowContainer.appendChild(shadowRootElement)
      const emotionName = String(customElementName)
        .toLowerCase()
        .replace(/_/g, '-')
      emotionCacheRef.current = createCache({
        key: `${emotionName}-emotion-cache`,
        prepend: true,
        container: emotionRoot,
      })
      setContainer((prevState) => {
        if (prevState) {
          console.log('remove', prevState.getRootNode())
          ;((prevState.getRootNode() as any)?.host as HTMLElement)?.remove()
        }
        return shadowRootElement
      })
    } else if (container && !rootContainer) {
      setContainer(null)
    }
    return () => {}
  }, [rootContainer, container, customElementName, checkVisibility, style])

  useEffect(() => {
    if (onSetContainer && container) {
      onSetContainer(container)
    }
  }, [container, onSetContainer])

  if (!container || !emotionCacheRef.current) {
    return null
  }

  return createPortal(
    <CacheProvider value={emotionCacheRef.current}>{children}</CacheProvider>,
    container,
  )
}
export default DynamicComponent
