import {
  IContextMenuItem,
  IContextMenuItemWithChildren,
  IRangyRect,
} from '../store'
import forEach from 'lodash-es/forEach'
import groupBy from 'lodash-es/groupBy'
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
    width: rect.width,
    height: rect.height,
    x: rect.x,
    y: rect.y,
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
