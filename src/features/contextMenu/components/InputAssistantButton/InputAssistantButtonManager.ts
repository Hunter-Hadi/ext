import { getCurrentDomainHost } from '@/utils'
import inputAssistantButtonBaseConfig, {
  IInputAssistantButtonBaseConfig,
} from '@/features/contextMenu/components/InputAssistantButton/config'
import Log from '@/utils/Log'
import isNumber from 'lodash-es/isNumber'
import { v4 as uuidV4 } from 'uuid'

const log = new Log('ContextMenu/InputAssistantButtonManager')
export interface IInputAssistantButtonObserverData {
  id: string
  observer: MutationObserver
  shadowRootElement: ShadowRoot
  renderRootElement: HTMLElement
  destroy: () => void
}

class InputAssistantButtonManager {
  host: string
  timer?: ReturnType<typeof setInterval>
  interval = 1000
  config: IInputAssistantButtonBaseConfig | null
  observerMap: Map<HTMLElement, IInputAssistantButtonObserverData>
  constructor() {
    this.host = getCurrentDomainHost()
    this.config = inputAssistantButtonBaseConfig[this.host]
    this.observerMap = new Map()
  }
  createInputAssistantButtonListener(
    listener: (allObserverData: IInputAssistantButtonObserverData[]) => void,
  ) {
    this.timer = setInterval(() => {
      if (this.config) {
        const { rootSelector } = this.config
        const rootElements = document.querySelectorAll(rootSelector)
        let isAddNew = false
        rootElements.forEach((rootElement) => {
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
          listener(this.getAllObserverData())
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
    const id = uuidV4()
    const { rootWrapperTagName, appendPosition } = this.config
    const isSupportWebComponent = 'customElements' in window
    const rootWrapperElement = document.createElement(rootWrapperTagName)
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
    }
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
  getAllObserverData() {
    const allObserverData: IInputAssistantButtonObserverData[] = []
    this.observerMap.forEach((value) => allObserverData.push(value))
    return allObserverData
  }
}
export default InputAssistantButtonManager
