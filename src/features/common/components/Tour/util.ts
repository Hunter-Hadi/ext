import { TourPlacement } from '@/features/common/components/Tour/TourMask'

export function isInViewPort(
  element: HTMLElement,
  rootContainer?: HTMLElement,
) {
  let viewWidth = window.innerWidth || document.documentElement.clientWidth
  let viewHeight = window.innerHeight || document.documentElement.clientHeight
  if (rootContainer) {
    viewWidth = rootContainer.clientWidth
    viewHeight = rootContainer.clientHeight
  }
  const { top, right, bottom, left } = element.getBoundingClientRect()

  return top >= 0 && left >= 0 && right <= viewWidth && bottom <= viewHeight
}

/**
 * getPlacement
 * @param targetElement
 * @param placement
 * @param stepPlacement
 */
export function getPlacement(
  targetElement?: HTMLElement | null,
  placement?: TourPlacement,
  stepPlacement?: TourPlacement,
) {
  return (
    stepPlacement ?? placement ?? (targetElement === null ? 'center' : 'bottom')
  )
}
