import isNumber from 'lodash-es/isNumber'
import { v4 as uuidV4 } from 'uuid'

import inputAssistantButtonBaseConfig, {
  IInputAssistantButton,
  IInputAssistantButtonGroupConfig,
  InputAssistantButtonGroupConfigHostType,
} from '@/features/contextMenu/components/InputAssistantButton/config'
import getInputAssistantButtonGroupWithHost from '@/features/contextMenu/components/InputAssistantButton/getInputAssistantButtonGroupWithHost'
import { mergeElementCssText } from '@/features/contextMenu/utils'
import { getCurrentDomainHost } from '@/utils/dataHelper/websiteHelper'
import Log from '@/utils/Log'

const log = new Log('ContextMenu/InputAssistantButtonManager')

export interface IInputAssistantButtonObserverData {
  id: string
  observer: MutationObserver
  shadowRootElement: ShadowRoot
  renderRootElement: HTMLElement
  destroy: () => void
  buttonGroup: IInputAssistantButton[]
  config: IInputAssistantButtonGroupConfig
}

export const InputAssistantButtonElementRouteMap = new Map<
  any,
  Document | ShadowRoot | HTMLElement | Element
>()

class InputAssistantButtonManager {
  host: InputAssistantButtonGroupConfigHostType
  timer?: ReturnType<typeof setInterval>
  interval = 1000
  configs: IInputAssistantButtonGroupConfig[] | null
  observerMap: Map<HTMLElement, IInputAssistantButtonObserverData>
  stop: boolean
  constructor() {
    this.stop = false
    this.host =
      getCurrentDomainHost() as InputAssistantButtonGroupConfigHostType
    this.configs = (() => {
      const configs = inputAssistantButtonBaseConfig[this.host]
      return Array.isArray(configs) ? configs : [configs]
    })()
    this.observerMap = new Map()
  }
  createInputAssistantButtonListener(
    listener: (allObserverData: IInputAssistantButtonObserverData[]) => void,
  ) {
    const createInputAssistantButton = () => {
      if (this.stop) {
        return
      }
      if (this.configs) {
        for (const config of this.configs) {
          const {
            enable,
            rootSelectors,
            rootSelectorStyle,
            rootParentDeep = 0,
          } = config
          let isAddNew = false
          // temp fix select shadowRoot
          for (const rootSelector of rootSelectors) {
            const selectorLayer = Array.isArray(rootSelector)
              ? [...rootSelector]
              : [rootSelector]

            const elements: (Document | ShadowRoot | Element)[] = [document]
            for (const layer of selectorLayer) {
              const length = elements.length
              for (let i = 0; i < length; i++) {
                let rootElement = elements.shift()!
                if ((rootElement as Element).shadowRoot) {
                  rootElement = (rootElement as any).shadowRoot
                }
                rootElement.querySelectorAll(layer).forEach((element: any) => {
                  InputAssistantButtonElementRouteMap.set(element, rootElement)
                  elements.push(element)
                })
              }
            }
            for (const element of elements) {
              const origin = element as HTMLElement
              let rootElement = element
              let deep = rootParentDeep
              while (deep > 0) {
                deep--
                const topLevelElement =
                  InputAssistantButtonElementRouteMap.get(rootElement)!
                InputAssistantButtonElementRouteMap.delete(rootElement)
                rootElement = rootElement.parentElement as HTMLElement
                InputAssistantButtonElementRouteMap.set(
                  rootElement,
                  topLevelElement,
                )
              }
              if (rootSelectorStyle) {
                mergeElementCssText(origin, rootSelectorStyle)
              }
              if (
                !(typeof enable === 'function' ? enable(rootElement) : enable)
              ) {
                this.observerMap.get(rootElement as HTMLElement)?.destroy()
                continue
              }

              const newObserverData = this.attachInputAssistantButton(
                rootElement as HTMLElement,
                config,
              )
              if (newObserverData) {
                isAddNew = true
                log.info(`newObserverData: `, newObserverData)
              }
            }
          }
          // remove unused observer
          const isClean = this.cleanObserverMap()
          if (isClean || isAddNew) {
            listener(this.getAllObserverData())
          }
        }
      }
    }
    setTimeout(createInputAssistantButton, 0)
    this.timer = setInterval(createInputAssistantButton, this.interval)
  }
  attachInputAssistantButton(
    rootElement: HTMLElement,
    config: IInputAssistantButtonGroupConfig,
  ) {
    if (
      !this.configs ||
      rootElement.querySelector('[maxai-input-assistant-button-id]')
    ) {
      return null
    }
    const {
      enable,
      rootStyle,
      rootParentStyle,
      rootParentStyleDeep = 1,
      rootNextElementSiblingStyle,
      rootPreviousElementSiblingStyle,
    } = config
    if (rootElement && rootStyle) {
      if (
        rootPreviousElementSiblingStyle &&
        rootElement.previousElementSibling
      ) {
        const previousElementSibling =
          rootElement.previousElementSibling as HTMLElement
        mergeElementCssText(
          previousElementSibling,
          rootPreviousElementSiblingStyle,
        )
      }
      rootElement.style.cssText = rootStyle
      if (rootNextElementSiblingStyle && rootElement.nextElementSibling) {
        const nextElementSibling = rootElement.nextElementSibling as HTMLElement
        mergeElementCssText(nextElementSibling, rootNextElementSiblingStyle)
      }
    }
    if (rootParentStyle) {
      let deep = 0
      let parentElement: HTMLElement = rootElement
      while (deep < rootParentStyleDeep) {
        deep++
        parentElement = parentElement?.parentElement as HTMLElement
      }
      if (parentElement) {
        mergeElementCssText(parentElement, rootParentStyle)
      }
    }
    const id = uuidV4()
    const { rootWrapperTagName, appendPosition, rootWrapperStyle } = config
    const isSupportWebComponent = 'customElements' in window
    const rootWrapperElement = document.createElement(rootWrapperTagName)
    if (rootWrapperStyle) {
      mergeElementCssText(rootWrapperElement, rootWrapperStyle)
    }
    const webComponentRoot = document.createElement(
      isSupportWebComponent ? 'maxai-input-assistant-button' : 'div',
    )
    webComponentRoot.setAttribute('maxai-input-assistant-button-id', id)
    webComponentRoot.style.height = 'inherit'
    InputAssistantButtonElementRouteMap.set(
      `[maxai-input-assistant-button-id="${id}"]`,
      webComponentRoot,
    )
    rootWrapperElement.appendChild(webComponentRoot)
    if (isNumber(appendPosition)) {
      const referenceElement = rootElement.childNodes[
        appendPosition
      ] as HTMLElement
      referenceElement
        ? rootElement.insertBefore(rootWrapperElement, referenceElement)
        : rootElement.appendChild(rootWrapperElement)
    } else {
      rootElement.appendChild(rootWrapperElement)
    }
    webComponentRoot.attachShadow({
      mode: 'open',
    })
    const shadowContainer = webComponentRoot.shadowRoot
    const container = document.createElement('div')
    container.style.height = '100%'
    shadowContainer?.appendChild(container)
    log.info(`appendElement: `, rootWrapperElement)
    const observer = new MutationObserver(() => {
      // TODO 监听元素位置更新位置

      // temp feature: `Help me write`
      // when clicking the explicit quick reply button, it should open reply textarea automatically and destroy the button itself
      const shouldDestroy = !(typeof enable === 'function'
        ? enable(rootElement)
        : enable)
      if (shouldDestroy) {
        setTimeout(() => {
          rootWrapperElement?.remove()
        }, 0)
      }
    })
    observer.observe(rootElement, {
      childList: true,
      subtree: true,
    })
    const buttonGroup = getInputAssistantButtonGroupWithHost({
      keyElement: rootElement,
      buttonGroupConfig: config,
    })
    if (buttonGroup.length === 0) {
      observer.disconnect()
      rootWrapperElement.remove()
      return null
    }
    const observerData = {
      id,
      destroy: () => {
        observer.disconnect()
        rootWrapperElement.remove()
        InputAssistantButtonElementRouteMap.delete(
          `[maxai-input-assistant-button-id="${id}"]`,
        )
        InputAssistantButtonElementRouteMap.delete(rootElement)
      },
      renderRootElement: container,
      observer,
      config,
      shadowRootElement: shadowContainer as ShadowRoot,
      buttonGroup: getInputAssistantButtonGroupWithHost({
        keyElement: rootElement,
        buttonGroupConfig: config,
      }),
    } as IInputAssistantButtonObserverData
    this.observerMap.set(rootElement, observerData)
    return observerData
  }
  cleanObserverMap() {
    let isClean = false
    this.observerMap.forEach((observer, rootElement) => {
      const emotionElement = Array.from(
        observer.shadowRootElement.querySelectorAll(
          'style[data-emotion]',
        ) as any as HTMLStyleElement[],
      )
      const hasEmptyEmotion = emotionElement.find(
        (element) =>
          element.sheet?.cssRules.length === 0 && element.innerHTML === '',
      )
      // temp fix select shadowRoot
      let isContain = true
      let topLevelElement = InputAssistantButtonElementRouteMap.get(rootElement)
      let currentLevelElement = rootElement
      while (isContain && topLevelElement) {
        isContain = topLevelElement.contains(currentLevelElement)
        currentLevelElement = topLevelElement as HTMLElement
        topLevelElement =
          InputAssistantButtonElementRouteMap.get(topLevelElement)
      }
      if (isContain && !hasEmptyEmotion) {
        return
      }
      isClean = true
      observer.destroy()
      this.observerMap.delete(rootElement)
    })
    return isClean
  }
  clearObserverMap() {
    this.observerMap.forEach((observer, rootElement) => {
      observer.destroy()
      this.observerMap.delete(rootElement)
    })
  }
  getAllObserverData() {
    const allObserverData: IInputAssistantButtonObserverData[] = []
    this.observerMap.forEach((value) => allObserverData.push(value))
    return allObserverData
  }
  pause() {
    this.stop = true
    this.clearObserverMap()
  }
  continue() {
    this.stop = false
  }
}
export default InputAssistantButtonManager
