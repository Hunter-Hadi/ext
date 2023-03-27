import {
  IContextMenuItem,
  IContextMenuItemWithChildren,
  IRangyRect,
} from '@/features/contextMenu/store'
import forEach from 'lodash-es/forEach'
import groupBy from 'lodash-es/groupBy'
import cloneDeep from 'lodash-es/cloneDeep'
import { flip, offset, shift, size } from '@floating-ui/react'
export const checkIsCanInputElement = (
  element: HTMLElement,
  defaultMaxLoop = 10,
) => {
  if (!element) {
    return false
  }
  let parentElement: HTMLElement | null = element
  let maxLoop = defaultMaxLoop
  while (parentElement && maxLoop > 0) {
    if (
      parentElement?.tagName === 'INPUT' ||
      parentElement?.tagName === 'TEXTAREA' ||
      parentElement?.getAttribute?.('contenteditable') === 'true'
    ) {
      const type = parentElement.getAttribute('type')
      if (type && type !== 'text') {
        return false
      }
      return true
    }
    parentElement = parentElement.parentElement
    maxLoop--
  }
  return false
}
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
      x: canRenderContextMenuRect.left,
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

type IContextMenuItemWithChildrenFilterItem = IContextMenuItemWithChildren & {
  deep: number
  searchText: string
  matchedRate: number
}

// 1. 递归所有节点，生成deep和searchText(拼接每一级的text)
// 2. 过滤掉不符合的节点
// 3. 基于过滤后的节点,生成新的children和matchedRate
// 4. 基于matchedRate进行排序，越符合搜索条件的越靠前
export const fuzzySearchContextMenuList = (
  data: IContextMenuItemWithChildren[],
  query: string,
) => {
  const queryText = query.replace(/\s/g, '').toLowerCase()
  const filterList: IContextMenuItemWithChildrenFilterItem[] = []
  const flattenList: IContextMenuItemWithChildren[] = []
  const filterData = (
    data: IContextMenuItemWithChildren[],
    textPrefix: string,
    deep = 0,
  ) => {
    data.forEach((item: IContextMenuItemWithChildren) => {
      flattenList.push(item)
      const filterItem: IContextMenuItemWithChildrenFilterItem = {
        ...item,
        searchText: (textPrefix + item.text).replace(/\s/g, '').toLowerCase(),
        deep,
        matchedRate: 0,
      }
      filterList.push(filterItem)
      if (item.children && item.children.length > 0) {
        filterData(item.children, item.text, deep + 1)
      }
    })
  }
  filterData(cloneDeep(data), '')
  const filterResult = filterList.filter((item) => {
    return item.searchText.includes(queryText)
  })
  console.log(filterResult)
  const results: IContextMenuItemWithChildrenFilterItem[] = []
  const findChildren = (parent: string) => {
    const newChildren: IContextMenuItemWithChildren[] = []
    filterResult.forEach((item) => {
      if (item.parent === parent) {
        if (findChildren(item.id).length === 0) {
          newChildren.push(item)
        }
      }
    })
    return newChildren
  }
  filterResult.forEach((item) => {
    item.children = []
    item.children = findChildren(item.id)
    if (item.children.length > 0) {
      item.matchedRate = queryText.length / item.searchText.length
      results.push(item)
    } else {
      if (results.find((i) => i.id === item.parent)) {
        return
      }
      const parent = cloneDeep(
        flattenList.find((i) => i.id === item.parent),
      ) as IContextMenuItemWithChildrenFilterItem
      if (parent) {
        parent.searchText = item.text
        parent.matchedRate = queryText.length / item.text.length
        parent.deep = 2
        parent.children = [item]
        results.push(parent)
      }
    }
  })
  results.map((item) => {
    console.log(item.searchText, item.matchedRate)
  })
  return results
    .sort((prev, next) => next.matchedRate - prev.matchedRate)
    .map((item) => {
      const node: any = cloneDeep(item)
      delete node.searchText
      delete node.matchedRate
      delete node.deep
      return node as IContextMenuItemWithChildren
    })
}

export const findFirstTierMenuLength = (menuList: IContextMenuItem[] = []) => {
  let count = 0
  // find groupid
  const rootItemIds = menuList
    .filter((item) => item.parent === 'root')
    .map((item) => item.id)
  count += rootItemIds.length
  for (let i = 0; i < menuList.length; i++) {
    const menuItem = menuList[i]
    // not rootItem and parent is rootItem
    if (menuItem.parent !== 'root' && rootItemIds.includes(menuItem.parent)) {
      count++
    }
  }
  return count
}

/**
 * @description: floating ui的middleware
 */
export const FloatingContextMenuMiddleware = [
  flip({
    fallbackPlacements: ['top-start', 'right', 'left'],
  }),
  size(),
  shift({
    crossAxis: true,
    padding: 16,
  }),
  offset((params) => {
    console.log('[ContextMenu Module]: [offset]', params)
    if (params.placement.indexOf('bottom') > -1) {
      const boundary = {
        left: 0,
        right: window.innerWidth,
        top: 0,
        bottom: window.innerHeight + window.scrollY,
      }
      if (
        isRectangleCollidingWithBoundary(
          {
            top: params.y,
            left: params.x,
            bottom: params.y + params.rects.floating.height + 50,
            right: params.rects.floating.width + params.x,
          },
          boundary,
        )
      ) {
        return (
          params.rects.reference.y - params.y - params.rects.floating.height - 8
        )
      }
      return 8
    } else {
      return 8
    }
  }),
]
