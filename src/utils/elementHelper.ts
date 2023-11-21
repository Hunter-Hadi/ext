import { v4 as uuidV4 } from 'uuid'

export function getPossibleElementByQuerySelector<T extends HTMLElement>(
  queryArray: string[],
): T | undefined {
  for (const query of queryArray) {
    const element = document.querySelector(query)
    if (element) {
      return element as T
    }
  }
  return undefined
}

interface ICreateShadowRootProps {
  containerId?: string
  presetContainerElement?: (container: HTMLElement) => void
  shadowRootId?: string
  presetShadowRootElement?: (shadowRoot: HTMLElement) => void
  // 使用 web component 的方式创建 shadow root
  webComponent?: boolean
}
/**
 * @name createShadowRoot
 *
 * @param ICreateShadowRootProps
 * @returns {
 *  shadowRoot: HTMLElement, shadow root 的容器
 *  container: HTMLElement, shadow root里的 root div, 一般作为 react render root
 *  emotionRoot: HTMLElement
 * }
 */
export const createShadowRoot = (props: ICreateShadowRootProps) => {
  const {
    containerId,
    presetContainerElement,
    shadowRootId,
    presetShadowRootElement,
    webComponent = true,
  } = props
  const isSupportWebComponent = 'customElements' in window
  const shadowRoot = document.createElement(
    isSupportWebComponent && webComponent
      ? `webchatgpt-custom-element-${uuidV4()}`
      : 'div',
  )
  if (shadowRootId) {
    shadowRoot.id = shadowRootId
  }

  if (presetShadowRootElement) {
    presetShadowRootElement(shadowRoot)
  }

  const shadowContainerWindow = shadowRoot.attachShadow({ mode: 'open' })

  const emotionRoot = document.createElement('style')
  if (containerId) {
    emotionRoot.id = `${containerId}-emotion-style`
  }

  const container = document.createElement('div')
  if (containerId) {
    container.id = containerId
  }

  if (presetContainerElement) {
    presetContainerElement(shadowRoot)
  }

  shadowContainerWindow.appendChild(emotionRoot)
  shadowContainerWindow.appendChild(container)

  return {
    container,
    shadowRoot,
    emotionRoot,
  }
}

export function insertAfter(newNode: Element, existingNode: any) {
  existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling)
}

export function queryShadowContainerElementSelector<T extends Element>(
  shadowRootId: string,
  selectors: string,
) {
  return document
    .querySelector(`#${shadowRootId}`)
    ?.shadowRoot?.querySelector<T>(selectors)
}

export function getConversationMessagesEl() {
  return document.querySelectorAll<HTMLElement>(
    'div[data-testid^=conversation-turn-]',
  )
}
