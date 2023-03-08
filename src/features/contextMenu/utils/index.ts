import { IContextMenuItem, IContextMenuItemWithChildren } from '../store'
import { forEach, groupBy } from 'lodash-es'

export const checkIsCanInputElement = (element: HTMLElement) => {
  let parentElement: HTMLElement | null = element
  let maxLoop = 10
  while (parentElement && maxLoop > 0) {
    if (
      parentElement.tagName === 'INPUT' ||
      parentElement.tagName === 'TEXTAREA' ||
      parentElement.getAttribute('contenteditable') === 'true'
    ) {
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
const isRectangleCollidingWithBoundary = (
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
  contextMenuHeight = 420,
  options = {
    offset: 16,
  },
) => {
  const { offset } = options
  const scrollY = window.scrollY || 0
  const boundary = {
    left: 0,
    right: window.innerWidth,
    top: 0,
    bottom: window.innerHeight,
  }
  highlightedRect.top -= scrollY
  highlightedRect.bottom -= scrollY
  // 下方检测
  let success = false
  console.log('开始下方检测')
  console.log(boundary, highlightedRect, {
    left: highlightedRect.left,
    right: highlightedRect.left + contextMenuWidth,
    top: highlightedRect.bottom + offset,
    bottom: highlightedRect.bottom + offset + contextMenuHeight,
  })
  // // draw 3 rect
  // const rect1 = document.createElement('div')
  // rect1.style.position = 'absolute'
  // rect1.style.left = `${boundary.left}px`
  // rect1.style.top = `${boundary.top}px`
  // rect1.style.width = `${boundary.right - boundary.left}px`
  // rect1.style.height = `${boundary.bottom - boundary.top}px`
  // rect1.style.border = '1px solid red'
  // document.body.appendChild(rect1)
  // const rect2 = document.createElement('div')
  // rect2.style.position = 'absolute'
  // rect2.style.left = `${highlightedRect.left}px`
  // rect2.style.top = `${highlightedRect.top}px`
  // rect2.style.width = `${highlightedRect.right - highlightedRect.left}px`
  // rect2.style.height = `${highlightedRect.bottom - highlightedRect.top}px`
  // rect2.style.border = '1px solid green'
  // document.body.appendChild(rect2)
  // const rect3 = document.createElement('div')
  // rect3.style.position = 'absolute'
  // rect3.style.left = `${highlightedRect.left}px`
  // rect3.style.top = `${highlightedRect.bottom + offset}px`
  // rect3.style.width = `${contextMenuWidth}px`
  // rect3.style.height = `${contextMenuHeight}px`
  // rect3.style.border = '1px solid yellow'
  // document.body.appendChild(rect3)
  success = !checkCollision(
    highlightedRect,
    {
      left: highlightedRect.left,
      right: highlightedRect.left + contextMenuWidth,
      top: highlightedRect.bottom + offset,
      bottom: highlightedRect.bottom + offset + contextMenuHeight,
    },
    boundary,
  )
  if (success) {
    return {
      x: highlightedRect.left,
      y: highlightedRect.bottom + offset,
    }
  } else {
    // 上方检测
    console.log('开始上方检测')
    console.log(boundary, highlightedRect, {
      left: highlightedRect.left,
      right: highlightedRect.left + contextMenuWidth,
      top: highlightedRect.top - offset - contextMenuHeight,
      bottom: highlightedRect.top - offset,
    })
    success = !checkCollision(
      highlightedRect,
      {
        left: highlightedRect.left,
        right: highlightedRect.left + contextMenuWidth,
        top: highlightedRect.top - offset - contextMenuHeight,
        bottom: highlightedRect.top - offset,
      },
      boundary,
    )
    if (success) {
      return {
        x: highlightedRect.left,
        y: highlightedRect.top - offset - contextMenuHeight,
      }
    } else {
      // 左侧检测
      console.log('开始左侧检测')
      success = !checkCollision(
        highlightedRect,
        {
          left: highlightedRect.left - offset - contextMenuWidth,
          right: highlightedRect.left - offset,
          top: highlightedRect.top,
          bottom: highlightedRect.top + contextMenuHeight,
        },
        boundary,
      )
      if (!success) {
        // 如果左侧碰撞了top再减多一点
        console.log('左侧碰撞了top再减多一点')
        success = !checkCollision(
          highlightedRect,
          {
            left: highlightedRect.left - offset - contextMenuWidth,
            right: highlightedRect.left - offset,
            top: boundary.bottom - contextMenuHeight - offset,
            bottom: boundary.bottom - offset,
          },
          boundary,
        )
        if (success) {
          return {
            x: highlightedRect.left - offset - contextMenuWidth,
            y: boundary.bottom - contextMenuHeight - offset,
          }
        }
      }
      if (success) {
        return {
          x: highlightedRect.left - offset - contextMenuWidth,
          y: highlightedRect.top,
        }
      } else {
        // 右侧检测
        console.log('开始右侧检测')
        success = !checkCollision(
          highlightedRect,
          {
            left: highlightedRect.right + offset,
            right: highlightedRect.right + offset + contextMenuWidth,
            top: highlightedRect.top,
            bottom: highlightedRect.top + contextMenuHeight,
          },
          boundary,
        )
        if (!success) {
          // 如果右侧碰撞了top再减多一点
          console.log('右侧碰撞了top再减多一点')
          success = !checkCollision(
            highlightedRect,
            {
              left: highlightedRect.right + offset,
              right: highlightedRect.right + offset + contextMenuWidth,
              top: boundary.bottom - contextMenuHeight - offset,
              bottom: boundary.bottom - offset,
            },
            boundary,
          )
          if (success) {
            return {
              x: highlightedRect.right + offset,
              y: boundary.bottom - contextMenuHeight - offset,
            }
          }
        }
        if (success) {
          return {
            x: highlightedRect.right + offset,
            y: highlightedRect.top,
          }
        } else {
          // 默认下方
          console.log('左上角')
          return {
            x: offset,
            y: offset,
          }
        }
      }
    }
  }
}
