import React from 'react'
import { v4 as uuidV4 } from 'uuid'

export type Alignment = 'start' | 'end'
export type Side = 'top' | 'right' | 'bottom' | 'left'
export type AlignedPlacement = `${Side}-${Alignment}`
export type Placement = Side | AlignedPlacement

import type { PosInfo } from './hooks/useTarget'

const COVER_PROPS = {
  fill: 'transparent',
  pointerEvents: 'auto',
}

export interface TourMaskProps {
  pos: PosInfo //	获取引导卡片指向的元素
  showMask?: boolean
  fill?: string
  open?: boolean
  zIndex?: number
  disabledInteraction?: boolean
  animation?: boolean
  animationDuration?: number
  maskMode?: 'absolute' | 'fixed'
}

const TourMask = (props: TourMaskProps) => {
  const {
    pos,
    showMask,
    fill = 'rgba(0,0,0,0.5)',
    open,
    zIndex,
    disabledInteraction,
    animation,
    animationDuration = 300,
    maskMode = 'fixed',
  } = props

  const id = uuidV4()
  const maskId = `MaxAITourMask-${id}`
  const isSafari =
    typeof navigator !== 'undefined' &&
    /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
  const maskRectSize = isSafari
    ? { width: '100%', height: '100%' }
    : { width: '100vw', height: '100vh' }
  if (!open) {
    return null
  }
  return (
    <div
      style={{
        position: maskMode,
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        zIndex,
        pointerEvents: pos && !disabledInteraction ? 'none' : 'auto',
      }}
    >
      {showMask ? (
        <svg
          style={{
            width: '100%',
            height: '100%',
          }}
        >
          <defs>
            <mask id={maskId}>
              <rect x='0' y='0' {...maskRectSize} fill='white' />
              {pos && (
                <rect
                  x={pos.left}
                  y={pos.top}
                  rx={pos.radius}
                  width={pos.width}
                  height={pos.height}
                  fill='black'
                  style={{
                    transition: animation
                      ? `all ${animationDuration}ms`
                      : 'none',
                  }}
                />
              )}
            </mask>
          </defs>
          <rect
            x='0'
            y='0'
            width='100%'
            height='100%'
            fill={fill}
            mask={`url(#${maskId})`}
          />

          {/* Block click region */}
          {pos && (
            <>
              <rect
                {...COVER_PROPS}
                x='0'
                y='0'
                width='100%'
                height={pos.top}
              />
              <rect
                {...COVER_PROPS}
                x='0'
                y='0'
                width={pos.left}
                height='100%'
              />
              <rect
                {...COVER_PROPS}
                x='0'
                y={pos.top + pos.height}
                width='100%'
                height={`calc(100vh - ${pos.top + pos.height}px)`}
              />
              <rect
                {...COVER_PROPS}
                x={pos.left + pos.width}
                y='0'
                width={`calc(100vw - ${pos.left + pos.width}px)`}
                height='100%'
              />
            </>
          )}
        </svg>
      ) : null}
    </div>
  )
}

export default TourMask
