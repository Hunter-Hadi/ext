export interface IRect {
  x: number
  y: number
  top: number
  left: number
  right: number
  bottom: number
  width: number
  height: number
}

export const emptyRect: IRect = {
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
export const isRectIntersect = (rect1: IRect, rect2: IRect) => {
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
export const isRectChange = (rect1: IRect, rect2: IRect) => {
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
export const calculateRectLayout = (compare: IRect, target: IRect) => {
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
export const isPointInRects = (x: number, y: number, rects: IRect[]) => {
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

export const mergeRects = (rects: IRect[]) => {
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
