/**
 * 单页面应用下 react root 的 守护进程
 *
 * 1. 确保在 root 被移除后，能够重新创建 root
 * 2. 确保在 root 被移除后，react 组件中的副作用能正确移除
 */

import { Root } from 'react-dom/client'

interface ISPARootProtectorProps {
  // shadowRoot 的 id
  rootId: string

  // react root, 一般为 createRoot 的返回值
  reactRoot?: Root

  // render 函数
  renderFn: () => void
}

// 需要进行保护的 SPA 网站的 host
const SPA_HOST_LIST = ['www.baidu.com']

class SPARootProtector {
  private observer: MutationObserver | null

  private protectedRootList: ISPARootProtectorProps[]

  constructor() {
    this.protectedRootList = []
    this.observer = null

    console.log('SPARootProtector init constructor 一次')

    if (!SPA_HOST_LIST.includes(location.host)) {
      return
    }

    this.observer = new MutationObserver((mutationsList) => {
      if (this.protectedRootList.length <= 0) {
        return
      }

      for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
          mutation.removedNodes.forEach((node) => {
            const element = node as HTMLElement

            const removedRootIndex = this.protectedRootList.findIndex(
              (item) => item.rootId === element.id,
            )

            if (removedRootIndex >= 0) {
              const removeRootObj = this.protectedRootList[removedRootIndex]

              removeRootObj.reactRoot && removeRootObj.reactRoot.unmount()

              // 从集合中移除
              this.removeProtectedRoot(element.id)

              // 执行 render 函数
              removeRootObj.renderFn()
            }
          })
        }
      }
    })

    this.observer.observe(document.body, { childList: true, subtree: true })

    window.addEventListener('beforeunload', () => {
      this.observer?.disconnect()
    })
  }

  addProtectedRoot(rootProps: ISPARootProtectorProps) {
    this.protectedRootList.push(rootProps)
  }

  removeProtectedRoot(id: string) {
    this.protectedRootList = this.protectedRootList.filter(
      (item) => item.rootId !== id,
    )
  }
}

export default new SPARootProtector()