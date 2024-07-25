import {
  Elements,
  flip,
  FlipOptions,
  Middleware,
  offset,
  Placement,
} from '@floating-ui/react'
import { get } from 'lodash-es'
import cloneDeep from 'lodash-es/cloneDeep'
import forEach from 'lodash-es/forEach'
import groupBy from 'lodash-es/groupBy'
import uniqBy from 'lodash-es/uniqBy'
import { MutableRefObject, RefObject } from 'react'

import {
  MAXAI_FLOATING_CONTEXT_MENU_REFERENCE_ELEMENT_ID,
  MAXAI_SIDEBAR_CHAT_BOX_INPUT_ID,
} from '@/features/common/constants'
import {
  CONTEXT_MENU_DRAFT_LIST,
  CONTEXT_MENU_DRAFT_TYPES,
} from '@/features/contextMenu/constants'
import {
  ContextMenuDraftType,
  IContextMenuItem,
  IContextMenuItemWithChildren,
  IRangyRect,
} from '@/features/contextMenu/types'
import { ContextMenuSearchTextStoreI18nStore } from '@/features/sidebar/store/contextMenuSearchTextStore'
import { getInputMediator } from '@/store/InputMediator'
import {
  getMaxAIFloatingContextMenuRootElement,
  getMaxAISidebarRootElement,
} from '@/utils'

export const groupByContextMenuItem = (
  items: IContextMenuItem[],
): IContextMenuItemWithChildren[] => {
  const result: IContextMenuItemWithChildren[] = []
  const groups = groupBy(items, 'parent')
  const createChildren = (node: IContextMenuItemWithChildren) => {
    node.children = (groups[node.id] as IContextMenuItemWithChildren[]) || []
    if (node.children.length > 0) {
      forEach(node.children, createChildren)
    }
  }
  forEach(groups['root'], (node: any) => {
    createChildren(node as IContextMenuItemWithChildren)
    result.push(node as IContextMenuItemWithChildren)
  })
  return result
}
interface Rect {
  left: number
  right: number
  top: number
  bottom: number
}

interface Rect {
  left: number
  right: number
  top: number
  bottom: number
}
export const isRectangleCollidingWithBoundary = (
  rect: Rect,
  boundary: Rect,
): boolean => {
  // 检查矩形是否与边界相交
  return !(
    rect.left >= boundary.left &&
    rect.right <= boundary.right &&
    rect.top >= boundary.top &&
    rect.bottom <= boundary.bottom
  )
}

const isRectangleColliding = (rect1: Rect, rect2: Rect): boolean => {
  // 检查两个矩形是否相交
  return (
    rect1.left <= rect2.right &&
    rect1.right >= rect2.left &&
    rect1.top <= rect2.bottom &&
    rect1.bottom >= rect2.top
  )
}

const checkCollision = (rect1: Rect, rect2: Rect, boundary: Rect): boolean => {
  // 检测是否碰撞边界或碰撞
  console.log('isRectangleColliding', isRectangleColliding(rect1, rect2))
  console.log(
    'isRectangleCollidingWithBoundary',
    isRectangleCollidingWithBoundary(rect2, boundary),
  )
  return (
    !isRectangleColliding(rect1, rect2) &&
    isRectangleCollidingWithBoundary(rect2, boundary)
  )
}
// bottom
//   541.078125
// height
//   292.421875
// left
//   25
// right
//   814.484375
// top
//   248.65625
// width
//   789.484375
/**
 * 计算获取contextMenu渲染的位置，尽量将context menu做到不遮挡rect且不超出页面范围的位置
 * @param highlightedRect 选择高亮的区域（selection）
 * @param contextMenuWidth context menu的渲染长度
 * @param contextMenuHeight context menu的高度
 * @returns 返回{x: number, y: number}的一个起始点位置
 */
export const getContextMenuRenderPosition = (
  highlightedRect: Rect,
  contextMenuWidth = 220,
  contextMenuHeight = 400,
  options = {
    offset: 8,
    directions: ['bottom', 'top', 'right', 'left'],
  },
) => {
  const { offset = 16, directions } = options
  const boundary = {
    left: 0,
    right: window.innerWidth,
    top: 0,
    bottom: window.innerHeight,
  }
  const currentDirections = directions || ['bottom', 'top', 'right', 'left']
  const detectRects: Array<Rect & { direction: string }> = []
  // render highlightedRect
  // document.querySelector('#highlightedRectElement')?.remove()
  // const highlightedRectElement = document.createElement('div')
  // highlightedRectElement.id = 'highlightedRectElement'
  // highlightedRectElement.style.position = 'fixed'
  // highlightedRectElement.style.left = `${highlightedRect.left}px`
  // highlightedRectElement.style.top = `${highlightedRect.top}px`
  // highlightedRectElement.style.width = `${
  //   highlightedRect.right - highlightedRect.left
  // }px`
  // highlightedRectElement.style.height = `${
  //   highlightedRect.bottom - highlightedRect.top
  // }px`
  // highlightedRectElement.style.border = '1px solid yellow'
  // highlightedRectElement.style.zIndex = '9999'
  // highlightedRectElement.style.pointerEvents = 'none'
  // document.body.appendChild(highlightedRectElement)
  currentDirections.map((direction) => {
    switch (direction) {
      case 'bottom':
        detectRects.push({
          left: highlightedRect.left,
          right: highlightedRect.left + contextMenuWidth,
          top: highlightedRect.bottom + offset,
          bottom: highlightedRect.bottom + offset + contextMenuHeight,
          direction,
        })
        break
      case 'top':
        detectRects.push({
          left: highlightedRect.left,
          right: highlightedRect.left + contextMenuWidth,
          top: highlightedRect.top - offset - contextMenuHeight,
          bottom: highlightedRect.top - offset,
          direction,
        })
        break
      case 'left':
        detectRects.push({
          left: highlightedRect.left - offset - contextMenuWidth,
          right: highlightedRect.left - offset,
          top: highlightedRect.top,
          bottom: highlightedRect.top + contextMenuHeight,
          direction,
        })
        detectRects.push({
          left: highlightedRect.left - offset - contextMenuWidth,
          right: highlightedRect.left - offset,
          top: boundary.bottom - contextMenuHeight - offset,
          bottom: boundary.bottom - offset,
          direction,
        })
        break
      case 'right':
        detectRects.push({
          left: highlightedRect.right + offset,
          right: highlightedRect.right + offset + contextMenuWidth,
          top: highlightedRect.top,
          bottom: highlightedRect.top + contextMenuHeight,
          direction,
        })
        detectRects.push({
          left: highlightedRect.right + offset,
          right: highlightedRect.right + offset + contextMenuWidth,
          top: boundary.bottom - contextMenuHeight - offset,
          bottom: boundary.bottom - offset,
          direction,
        })
        break
      default:
        break
    }
  })
  console.log('开始碰撞检测detectRects', highlightedRect, detectRects)
  const canRenderContextMenuRect = detectRects.find((rect, index) => {
    console.log('检测碰撞', rect.direction, 'index', index)
    return !checkCollision(highlightedRect, rect, boundary)
  })
  if (canRenderContextMenuRect) {
    return {
      // 61 cta button width
      x: canRenderContextMenuRect.left - 62,
      y: canRenderContextMenuRect.top,
    }
  } else {
    console.log('左上角')
    return {
      x: offset,
      y: offset,
    }
  }
}

export const cloneRect = (rect: IRangyRect): IRangyRect => {
  return {
    left: rect.left,
    right: rect.right,
    top: rect.top,
    bottom: rect.bottom,
    width: rect.width || rect.right - rect.left,
    height: rect.height || rect.bottom - rect.top,
    x: rect.x || rect.left,
    y: rect.y || rect.top,
  }
}

export const computedRectPosition = (rect: IRangyRect, rate = 0.8) => {
  const { width, height } = rect
  const boundary = {
    left: 0,
    right: window.innerWidth,
    top: 0,
    bottom: window.innerHeight,
    width: window.innerWidth,
    height: window.innerHeight,
    x: 0,
    y: 0,
  }
  if (width * height > boundary.width * boundary.height * rate) {
    // return center position
    return {
      x: boundary.width / 2,
      y: boundary.height / 2,
      left: boundary.width / 2,
      right: boundary.width / 2,
      top: boundary.height / 2,
      bottom: boundary.height / 2,
      width: 0,
      height: 0,
    }
  } else {
    return rect
  }
}

export const emptyRect: IRangyRect = {
  x: 0,
  y: 0,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: 0,
  height: 0,
}

/**
 * 检测两个元素是否相交
 * @param rect1
 * @param rect2
 */
export const isRectIntersect = (rect1: IRangyRect, rect2: IRangyRect) => {
  return !(
    rect1.top >= rect2.bottom ||
    rect1.bottom <= rect2.top ||
    rect1.left >= rect2.right ||
    rect1.right <= rect2.left
  )
}

/**
 * 判断两个位置是否不同
 * @param rect1
 * @param rect2
 */
export const isRectChange = (rect1: IRangyRect, rect2: IRangyRect) => {
  return (
    rect1.top !== rect2.top ||
    rect1.bottom !== rect2.bottom ||
    rect1.left !== rect2.left ||
    rect1.right !== rect2.right
  )
}

/**
 * 计算目标元素相对于compare元素位置和大小
 * @param compare
 * @param target
 */
export const calculateRectLayout = (
  compare: IRangyRect,
  target: IRangyRect,
) => {
  const offsetX = target.left - compare.left
  const offsetY = target.top - compare.top
  return {
    x: target.x - compare.x,
    y: target.y - compare.y,
    top: offsetY,
    left: offsetX,
    right: offsetX + target.width,
    bottom: offsetY + target.height,
    width: target.width,
    height: target.height,
  }
}

/**
 * 检测坐标是否位于元素内
 * @param x
 * @param y
 * @param rects
 */
export const isPointInRects = (x: number, y: number, rects: IRangyRect[]) => {
  for (const rect of rects) {
    if (
      x >= rect.left &&
      x <= rect.right &&
      y >= rect.top &&
      y <= rect.bottom
    ) {
      return true
    }
  }
  return false
}

/**
 * 判断元素是否超出可视区域
 */
export const isOutOfViewport = (rect: IRangyRect) => {
  return (
    rect.top < 0 ||
    rect.left < 0 ||
    rect.bottom >
      (window.innerHeight || document.documentElement.clientHeight) ||
    rect.right > (window.innerWidth || document.documentElement.clientWidth)
  )
}

export const mergeRects = (rects: IRangyRect[]) => {
  if (!rects.length) return emptyRect
  const rect = { ...rects[0] }
  rects.forEach((item) => {
    rect.top = Math.min(rect.top, item.top)
    rect.left = Math.min(rect.left, item.left)
    rect.right = Math.max(rect.right, item.right)
    rect.bottom = Math.max(rect.bottom, item.bottom)
  })
  rect.x = rect.left
  rect.y = rect.top
  rect.width = Math.abs(rect.right - rect.left)
  rect.height = Math.abs(rect.bottom - rect.top)
  return rect
}

// 1. 基于queryText生成queryWords
// 2. 过滤掉不符合queryWords的节点
// 3. 还原一层的树级结构
export const fuzzySearchContextMenuList = (
  data: IContextMenuItem[],
  query: string,
  contextMenuSearchTextStore?: ContextMenuSearchTextStoreI18nStore,
) => {
  const queryText = query.toLowerCase().trim()
  const queryWords = queryText.split(/\s+/).filter(Boolean)
  const filterResult = cloneDeep(
    data.filter((item) => {
      const {
        data: { searchText },
      } = item
      const currentSearchText =
        contextMenuSearchTextStore?.[item.id] || searchText
      if (!currentSearchText) {
        return false
      }
      const searchWords = currentSearchText.split(/\s/)
      let found = true
      for (const queryWord of queryWords) {
        const searchWordIndex = searchWords.findIndex((word) =>
          word.includes(queryWord),
        )
        if (searchWordIndex === -1) {
          found = false
          break
        }
        searchWords.splice(searchWordIndex, 1)
      }
      return found
    }),
  )
  console.log(filterResult, queryWords)
  // 还原一层的树级结构
  const results: IContextMenuItemWithChildren[] = []
  const groupByParent = groupBy(uniqBy(filterResult, 'id'), 'parent')
  console.log(groupByParent)
  Object.keys(groupByParent).forEach((parent) => {
    const children = (
      groupByParent[parent] as IContextMenuItemWithChildren[]
    ).filter((item) => item.data.type !== 'group')
    if (children.length > 0) {
      if (parent === 'root') {
        results.push(...children)
        return
      } else {
        const parentItem = data.find((item) => item.id === parent)
        if (parentItem) {
          results.push({
            ...parentItem,
            children,
          })
        }
      }
    }
  })
  console.log(results)
  return results
}

export const findFirstTierMenuHeight = (menuList: IContextMenuItem[] = []) => {
  const OPTION_HEIGHT = 33
  const GROUP_HEIGHT = 18
  let height = 0
  // let itemCount = 0
  // find groupid
  const rootItemIds = menuList
    .filter((item) => item.parent === 'root')
    .map((item) => {
      if (item.data.type === 'group') {
        height += GROUP_HEIGHT
      } else {
        height += OPTION_HEIGHT
      }
      return item.id
    })

  for (let i = 0; i < menuList.length; i++) {
    const menuItem = menuList[i]
    // not rootItem and parent is rootItem
    if (menuItem.parent !== 'root' && rootItemIds.includes(menuItem.parent)) {
      height += OPTION_HEIGHT
      // itemCount += 1
    }
  }

  // console.log('itemCount', itemCount)
  // console.log('rootItemIds', rootItemIds.length)

  return height
}

/**
 * absolute 定位用的
 */
// class FloatingUIMiddlewareCache {
//   private cache: Record<string, any> = {}
//   get(key: string) {
//     return this.cache[key]
//   }
//   set(key: string, value: any) {
//     this.cache[key] = value
//   }
// }
// const floatingUIMiddlewareCache = new FloatingUIMiddlewareCache()
//
type IDragOffsetRef = MutableRefObject<{
  x: number
  y: number
  dragged: boolean
}>

type IFloatingSizeOffsetRef = MutableRefObject<{
  dx: number
  dy: number
  minWidth: number
  defaultMinHeight: number
  /**
   * 默认不resize的最大大高度
   */
  defaultMaxHeight: number
  resized: boolean
}>

/**
 * 模拟floating ui的size中间件，
 * 因为此处使用计算方法和floating ui的计算方法不太一致，
 * 而且在sizeMiddleware之前还会有flip的存在需要重新计算位置，
 * 遂重写
 * WARNING: 只处理了bottom-start, top-start, right和left四种情况
 */
const sizeMiddleware = ({
  dragOffsetRef,
  apply,
}: {
  dragOffsetRef: IDragOffsetRef
  apply: (args: {
    availableWidth: number
    availableHeight: number
    elements: Elements
  }) => void
}): Middleware => {
  return {
    name: 'sizeMiddleware',
    fn(state) {
      const { x, y, elements, placement } = state
      const availableWidth = document.documentElement.clientWidth - x
      const availableHeight = document.documentElement.clientHeight - y
      // let availableWidth = 0
      // let availableHeight = 0
      // const rect = elements.reference.getBoundingClientRect()
      // elements.reference.getBoundingClientRect()
      // if (placement.startsWith('bottom') || placement.startsWith('right')) {
      //   availableWidth = document.documentElement.clientWidth - x
      //   availableHeight = document.documentElement.clientHeight - y
      // } else if (placement.startsWith('top')) {
      //   const dragY = dragOffsetRef.current.y
      //   availableWidth = document.documentElement.clientWidth - x
      //   // availableHeight = rect.top
      //   availableHeight = rect.top + dragY
      // } else {
      //   const dragX = dragOffsetRef.current.x
      //   availableWidth = rect.left + dragX
      //   availableHeight = document.documentElement.clientHeight - y
      // }

      // -8 是因为有使用offset中间件的存在
      apply({
        availableHeight: availableHeight - 8,
        availableWidth: availableWidth - 8,
        elements,
      })

      return {}
    },
  }
}

/**
 * 模拟了floating ui的flip中间件，但在产生拖动之后不变化位置placement
 */
function filpMiddleware(
  options: {
    sizeOffsetRef: IFloatingSizeOffsetRef
    dragOffsetRef: IDragOffsetRef
    defaultPlacement?: Placement
  } & FlipOptions,
): Middleware {
  let lastPlacement = options.defaultPlacement ?? 'bottom-start'
  const dragOffsetRef = options.dragOffsetRef
  const sizeOffsetRef = options.sizeOffsetRef
  const middleware = flip(options)
  let lastXy: { x: number; y: number } | null = null

  return {
    name: 'flipMiddleware',
    async fn(state) {
      if (!dragOffsetRef.current.dragged && !sizeOffsetRef.current.resized) {
        const result = await middleware.fn(state)

        // 记录最后一次位置
        lastPlacement = get(result, 'reset.placement', lastPlacement)

        lastXy = null
        return result
      }
      if (!lastXy) {
        lastXy = {
          x: state.elements.floating.offsetLeft,
          y: state.elements.floating.offsetTop,
        }
      }
      return {
        x: lastXy.x,
        y: lastXy.y,
      }
    },
  }
}

/**
 * 拖拽位置
 */
function dragMiddleware({
  dragOffsetRef,
}: {
  dragOffsetRef: IDragOffsetRef
}): Middleware {
  return {
    name: 'dragMiddleware',
    fn: (state) => {
      let currentX = state.x + dragOffsetRef.current.x
      let currentY = state.y + dragOffsetRef.current.y

      // 这里是为了去除padding
      const minX = 8
      const minY = 8
      const maxX =
        document.documentElement.clientWidth -
        state.elements.floating.clientWidth -
        minX
      const maxY =
        document.documentElement.clientHeight -
        state.elements.floating.clientHeight -
        minY

      if (currentX > maxX) {
        currentX = maxX
        dragOffsetRef.current.x = currentX - state.x
      } else if (currentX < minX) {
        currentX = minX
        dragOffsetRef.current.x = currentX - state.x
      }

      if (currentY > maxY) {
        currentY = maxY
        dragOffsetRef.current.y = currentY - state.y
      } else if (currentY < minY) {
        currentY = minY
        dragOffsetRef.current.y = currentY - state.y
      }

      return {
        x: currentX,
        y: currentY,
        // reset: {
        //   rects: true,
        // },
      }
    },
  }
}

/**
 * @description: floating ui的middleware
 */
export const getFloatingContextMenuMiddleware = (
  dragOffsetRef: IDragOffsetRef,
  referenceElementRef: RefObject<HTMLDivElement>,
  floatingSizeOffsetRef: IFloatingSizeOffsetRef,
): Middleware[] => {
  return [
    filpMiddleware({
      sizeOffsetRef: floatingSizeOffsetRef,
      dragOffsetRef,
      fallbackPlacements: ['top-start', 'right', 'left'],
      defaultPlacement: 'bottom-start',
    }),
    // shift({
    //   crossAxis: true,
    // }),
    offset(8),
    dragMiddleware({ dragOffsetRef }),

    sizeMiddleware({
      dragOffsetRef,
      apply: ({ availableWidth, availableHeight, elements }) => {
        if (!referenceElementRef.current) return

        const { dx, dy, resized } = floatingSizeOffsetRef.current
        const markdown = elements.floating.querySelector(
          '.markdown-body',
        ) as HTMLElement

        // 当未调整大小时，使用默认增长大小
        if (!resized) {
          markdown.style.maxHeight = '320px'
          elements.floating.style.height = 'auto'
          referenceElementRef.current.style.height = 'auto'
          elements.floating.style.width = `${floatingSizeOffsetRef.current.minWidth}px`
          elements.floating.style.maxHeight = `${floatingSizeOffsetRef.current.defaultMaxHeight}px`
          referenceElementRef.current.style.maxHeight = `${floatingSizeOffsetRef.current.defaultMaxHeight}px`
          return
        }

        const minWidth = Math.min(
          floatingSizeOffsetRef.current.minWidth,
          availableWidth,
        )
        const currentWidth = elements.floating.clientWidth

        const width = Math.min(
          availableWidth,
          Math.max(currentWidth + dx, minWidth),
        )

        floatingSizeOffsetRef.current.dx = 0
        // 这里处理高度的方法和宽度的稍显不同，因为高度会一开始就限制一个minWidth，
        // 而在刚开始回答时高度不会有minWidth，因为content的内容需要动态增长到maxHeight
        let height = 0
        let maxHeight = 0
        const currentHeight = elements.floating.clientHeight

        if (currentHeight < floatingSizeOffsetRef.current.defaultMinHeight) {
          // 当未增长到minHeight的情况下，只需要处理变大的
          height = Math.min(
            dy > 0 ? currentHeight + dy : currentHeight,
            availableHeight,
          )

          maxHeight = height
        } else {
          // 当增长到minHeight的时候，按正常处理

          height = Math.min(
            Math.max(
              dy + currentHeight,
              floatingSizeOffsetRef.current.defaultMinHeight,
            ),
            availableHeight,
          )

          maxHeight = height
        }

        floatingSizeOffsetRef.current.dy = 0

        referenceElementRef.current.style.height = `${height}px`
        referenceElementRef.current.style.maxHeight = `${maxHeight}px`
        elements.floating.style.height = `${height}px`
        elements.floating.style.maxHeight = `${maxHeight}px`

        elements.floating.style.width = `${width}px`

        // 需要放在获取floating.clientHeight之后，不然会影响clientHeight的获取
        markdown.style.maxHeight = 'unset'
      },
    }),
  ]
}
/**
 * @deprecated
 * @param iframeElement
 */
export const computedIframeSelection = (iframeElement: HTMLIFrameElement) => {
  const frame = iframeElement
  const frameWindow: any = frame && frame.contentWindow
  const frameDocument: any = frameWindow && frameWindow.document
  const frameClientRect = frame.getBoundingClientRect()
  const computedSelectionString = () => {
    if (frameDocument) {
      if (frameDocument.getSelection) {
        // Most browsers
        return String(frameDocument.getSelection())
      } else if (frameDocument.selection) {
        // Internet Explorer 8 and below
        return frameDocument.selection.createRange().text
      } else if (frameWindow.getSelection) {
        // Safari 3
        return String(frameWindow.getSelection())
      }
    }
    /* Fall-through. This could happen if this function is called
         on a frame that doesn't exist or that isn't ready yet. */
    return ''
  }
  const computedSelectionRect = () => {
    const selection = frameWindow.getSelection()
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      return {
        x: rect.x + frameClientRect.x,
        y: rect.y + frameClientRect.y,
        width: rect.width,
        height: rect.height,
        top: rect.top + frameClientRect.y,
        left: rect.left + frameClientRect.x,
        right: rect.left + frameClientRect.x + rect.width,
        bottom: rect.top + frameClientRect.y + rect.height,
      }
    }
    return {
      x: frameClientRect.x,
      y: frameClientRect.y,
      width: 0,
      height: 0,
      top: frameClientRect.y,
      left: frameClientRect.x,
      right: frameClientRect.x + frameClientRect.width,
      bottom: frameClientRect.y + frameClientRect.height,
    }
  }
  return {
    iframeSelectionText: computedSelectionString().trim(),
    iframeSelectionRect: computedSelectionRect(),
    iframeSelectionHtml: frameDocument.getSelection().toString(),
    iframeSelectionElement: frameDocument.getSelection().anchorNode,
  }
}

export const isFloatingContextMenuVisible = () => {
  const floatingMenu = getMaxAIFloatingContextMenuRootElement()?.querySelector(
    `#${MAXAI_FLOATING_CONTEXT_MENU_REFERENCE_ELEMENT_ID}`,
  )
  return floatingMenu && floatingMenu.getAttribute('aria-hidden') === 'false'
}

/**
 * 确认是否是草稿的contextMenuId
 * @param id
 */
export const checkIsDraftContextMenuId = (id: string) => {
  return (
    Object.values(CONTEXT_MENU_DRAFT_TYPES).find((item) => item === id) !==
    undefined
  )
}
/**
 * 根据id找到对应的草稿contextMenu
 * @param id
 */
export const findDraftContextMenuById = (id: string) => {
  return Object.values(CONTEXT_MENU_DRAFT_LIST).find(
    (contextMenu) => contextMenu.id === id,
  )
}
export const getDraftContextMenuTypeById = (
  id: string,
): ContextMenuDraftType | undefined => {
  let typeName: ContextMenuDraftType | undefined = undefined
  Object.keys(CONTEXT_MENU_DRAFT_TYPES).forEach((key) => {
    if ((CONTEXT_MENU_DRAFT_TYPES as any)[key] === id) {
      typeName = key as ContextMenuDraftType
    }
  })
  return typeName
}

export const floatingContextMenuSaveDraftToChatBox = () => {
  const floatingContextMenuDraft = getInputMediator(
    'floatingMenuInputMediator',
  ).getInputValue()
  if (!floatingContextMenuDraft) {
    return
  }
  const maxTime = 3 * 1000
  const timer = setInterval(() => {
    const appRootElement = getMaxAISidebarRootElement()
    const chatBoxInput = appRootElement?.querySelector(
      `#${MAXAI_SIDEBAR_CHAT_BOX_INPUT_ID}`,
    ) as HTMLInputElement
    if (chatBoxInput) {
      clearInterval(timer)
      getInputMediator('chatBoxInputMediator').updateInputValue(
        floatingContextMenuDraft,
      )
      setTimeout(() => {
        chatBoxInput?.focus()
      }, 100)
    }
  }, 50)
  setTimeout(() => {
    clearInterval(timer)
  }, maxTime)
}
/**
 * 合并元素的 cssText
 * @param element
 * @param newCssText
 */
export const mergeElementCssText = (
  element: HTMLElement,
  newCssText: string,
) => {
  // 解析原始的 cssText
  const style = element.style
  const originalCssText = style.cssText
  const originalProperties = originalCssText.split(';')

  // 解析新的 cssText
  const newProperties = newCssText.split(';')

  // 创建一个用于存储合并后属性的对象
  const mergedProperties: Record<string, string> = {}

  // 将原始属性添加到合并属性对象
  originalProperties.forEach((property) => {
    const [name, value] = property.split(':')
    if (name && value) {
      mergedProperties[name.trim()] = value.trim()
    }
  })

  // 将新属性添加或替换合并属性对象中的属性
  newProperties.forEach((property) => {
    const [name, value] = property.split(':')
    if (name && value) {
      mergedProperties[name.trim()] = value.trim()
    }
  })

  // 根据合并属性对象生成新的 cssText
  const mergedCssText = Object.keys(mergedProperties)
    .map((name) => `${name}:${mergedProperties[name]}`)
    .join(';')

  // 更新元素的 cssText
  style.cssText = mergedCssText
}
