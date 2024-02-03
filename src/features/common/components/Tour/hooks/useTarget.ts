import { useEffect, useLayoutEffect, useMemo, useState } from 'react'

import { TourStepInfo } from '@/features/common/components/Tour/TourStep'
import useEvent from '@/features/common/hooks/useEvent'

import { isInViewPort } from '../util'

export interface Gap {
  offset?: number | [number, number]
  radius?: number
}

export interface PosInfo {
  left: number
  top: number
  height: number
  width: number
  radius: number
}

export default function useTarget(
  target: TourStepInfo['target'],
  open: boolean,
  container?: HTMLElement,
  gap?: Gap,
  scrollIntoViewOptions?: boolean | ScrollIntoViewOptions,
): [PosInfo | null, HTMLElement | null] {
  // ========================= Target =========================
  // We trade `undefined` as not get target by function yet.
  // `null` as empty target.
  const [targetElement, setTargetElement] = useState<null | HTMLElement>(null)

  useEffect(() => {
    const nextElement =
      typeof target === 'function' ? (target as any)(container) : target
    setTargetElement(nextElement || null)
  }, [container, target])

  // ========================= Align ==========================
  const [posInfo, setPosInfo] = useState<PosInfo | null>(null)

  const updatePos = useEvent(() => {
    if (targetElement) {
      console.log('useTarget updatePos 1', targetElement)
      // Exist target element. We should scroll and get target position
      if (!isInViewPort(targetElement, container) && open) {
        console.log('useTarget updatePos 2')
        targetElement?.scrollIntoView?.(scrollIntoViewOptions)
      }
      console.log('useTarget updatePos 3')
      const targetElementRect = targetElement.getBoundingClientRect()
      let { left, top } = targetElementRect
      const { width, height } = targetElementRect
      const { left: containerLeft, top: containerTop } = container
        ? container.getBoundingClientRect()
        : {
            left: 0,
            top: 0,
          }
      // 计算基于container的位置
      left = left - containerLeft
      top = top - containerTop
      const nextPosInfo: PosInfo = { left, top, width, height, radius: 0 }
      setPosInfo((origin) => {
        if (JSON.stringify(origin) !== JSON.stringify(nextPosInfo)) {
          console.log('useTarget updatePos 4', nextPosInfo)
          return nextPosInfo
        }
        console.log('useTarget updatePos 4', origin)
        return origin
      })
    } else {
      // Not exist target which means we just show in center
      setPosInfo(null)
    }
  })

  const getGapOffset = (index: number) =>
    (Array.isArray(gap?.offset) ? gap?.offset[index] : gap?.offset) ?? 6

  useLayoutEffect(() => {
    updatePos()
    // update when window resize
    window.addEventListener('resize', updatePos)
    return () => {
      window.removeEventListener('resize', updatePos)
    }
  }, [targetElement, open, updatePos, container])

  // ======================== PosInfo =========================
  const mergedPosInfo = useMemo(() => {
    if (!posInfo) {
      return posInfo
    }

    const gapOffsetX = getGapOffset(0)
    const gapOffsetY = getGapOffset(1)
    const gapRadius = gap?.radius || 8

    return {
      left: posInfo.left - gapOffsetX,
      top: posInfo.top - gapOffsetY,
      width: posInfo.width + gapOffsetX * 2,
      height: posInfo.height + gapOffsetY * 2,
      radius: gapRadius,
    }
  }, [posInfo, gap])

  return [mergedPosInfo, targetElement]
}
