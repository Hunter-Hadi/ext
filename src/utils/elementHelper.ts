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
  shadowContainerId?: string
  presetShadowContainerElement?: (shadowContainer: HTMLElement) => void
  // 使用 web component 的方式创建 shadow root
  webComponent?: boolean
}
/**
 * @name createShadowRoot
 *
 * @param ICreateShadowRootProps
 * @returns
 *  container: HTMLElement, shadow root 的容器
 *  shadowContainer: HTMLElement, shadow root里的 root div, 一般作为 react render root
 *  emotionRoot: HTMLElement
 *
 */
export const createShadowRoot = (props: ICreateShadowRootProps) => {
  const {
    containerId,
    presetContainerElement,
    shadowContainerId,
    presetShadowContainerElement,
    webComponent = true,
  } = props
  const isSupportWebComponent = 'customElements' in window
  const container = document.createElement(
    isSupportWebComponent && webComponent
      ? `maxai-custom-element-${uuidV4()}`
      : 'div',
  )
  if (containerId) {
    container.id = containerId
  }

  if (presetContainerElement) {
    presetContainerElement(container)
  }

  const shadowContainerWindow = container.attachShadow({ mode: 'open' })

  const emotionRoot = document.createElement('style')
  if (containerId) {
    emotionRoot.id = `${containerId}-emotion-style`
  }

  const shadowContainer = document.createElement('div')
  if (shadowContainerId) {
    shadowContainer.id = shadowContainerId
  }

  if (presetShadowContainerElement) {
    presetShadowContainerElement(shadowContainer)
  }

  shadowContainerWindow.appendChild(emotionRoot)
  shadowContainerWindow.appendChild(shadowContainer)

  return {
    container,
    shadowContainer,
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
