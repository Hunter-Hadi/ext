import { getCurrentDomainHost } from '@/utils'
import inputAssistantButtonBaseConfig, {
  IInputAssistantButton,
  IInputAssistantButtonGroupConfig,
} from '@/features/contextMenu/components/InputAssistantButton/config'
import Log from '@/utils/Log'
import isNumber from 'lodash-es/isNumber'
import { v4 as uuidV4 } from 'uuid'
import getInputAssistantButtonGroupWithHost from '@/features/contextMenu/components/InputAssistantButton/getInputAssistantButtonGroupWithHost'

const log = new Log('ContextMenu/InputAssistantButtonManager')

export interface IInputAssistantButtonObserverData {
  id: string
  observer: MutationObserver
  shadowRootElement: ShadowRoot
  renderRootElement: HTMLElement
  destroy: () => void
  buttonGroup: IInputAssistantButton[]
}

class InputAssistantButtonManager {
  host: string
  timer?: ReturnType<typeof setInterval>
  interval = 1000
  config: IInputAssistantButtonGroupConfig | null
  observerMap: Map<HTMLElement, IInputAssistantButtonObserverData>
  stop: boolean
  constructor() {
    this.stop = false
    this.host = getCurrentDomainHost()
    this.config = inputAssistantButtonBaseConfig[this.host]
    this.observerMap = new Map()
  }
  createInputAssistantButtonListener(
    listener: (
      allObserverData: IInputAssistantButtonObserverData[],
      config: IInputAssistantButtonGroupConfig,
    ) => void,
  ) {
    this.timer = setInterval(() => {
      if (this.stop) {
        return
      }
      if (this.config) {
        const {
          rootSelector,
          rootSelectorStyle,
          rootParentDeep = 0,
        } = this.config
        const rootElements = document.querySelectorAll(rootSelector)
        let isAddNew = false
        rootElements.forEach((element) => {
          const origin = element as HTMLElement
          let rootElement = element
          let deep = rootParentDeep
          while (deep > 0) {
            deep--
            rootElement = rootElement.parentElement as HTMLElement
          }
          if (rootSelectorStyle) {
            origin.style.cssText = rootSelectorStyle
          }
          const newObserverData = this.attachInputAssistantButton(
            rootElement as HTMLElement,
          )
          if (newObserverData) {
            isAddNew = true
            log.info(`newObserverData: `, newObserverData)
          }
        })
        // remove unused observer
        const isClean = this.cleanObserverMap()
        if (isClean || isAddNew) {
          listener(this.getAllObserverData(), this.config)
        }
      }
    }, this.interval)
  }
  attachInputAssistantButton(rootElement: HTMLElement) {
    if (
      !this.config ||
      rootElement.querySelector('[maxai-input-assistant-button-id]')
    ) {
      return null
    }
    const { rootStyle, rootParentStyle, rootParentStyleDeep = 1 } = this.config
    if (rootElement && rootStyle) {
      rootElement.style.cssText = rootStyle
    }
    if (rootParentStyle) {
      let deep = 0
      let parentElement: HTMLElement = rootElement
      while (deep < rootParentStyleDeep) {
        deep++
        parentElement = parentElement?.parentElement as HTMLElement
      }
      if (parentElement) {
        parentElement.style.cssText = rootParentStyle
      }
    }
    const id = uuidV4()
    const { rootWrapperTagName, appendPosition, rootWrapperStyle } = this.config
    const isSupportWebComponent = 'customElements' in window
    const rootWrapperElement = document.createElement(rootWrapperTagName)
    if (rootWrapperStyle) {
      rootWrapperElement.style.cssText = rootWrapperStyle
    }
    const webComponentRoot = document.createElement(
      isSupportWebComponent ? 'maxai-input-assistant-button' : 'div',
    )
    webComponentRoot.setAttribute('maxai-input-assistant-button-id', id)
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
    shadowContainer?.appendChild(container)
    log.info(`appendElement: `, rootWrapperElement)
    const observer = new MutationObserver(() => {
      // TODO 监听元素位置更新位置
    })
    observer.observe(rootElement, {
      childList: true,
      subtree: true,
    })
    const observerData = {
      id,
      destroy: () => {
        observer.disconnect()
        rootWrapperElement.remove()
      },
      renderRootElement: container,
      observer,
      shadowRootElement: shadowContainer as ShadowRoot,
      buttonGroup: getInputAssistantButtonGroupWithHost({
        keyElement: rootElement,
        buttonGroupConfig: this.config,
      }),
    } as IInputAssistantButtonObserverData
    this.observerMap.set(rootElement, observerData)
    return observerData
  }
  cleanObserverMap() {
    let isClean = false
    this.observerMap.forEach((observer, rootElement) => {
      if (document.body.contains(rootElement)) {
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
