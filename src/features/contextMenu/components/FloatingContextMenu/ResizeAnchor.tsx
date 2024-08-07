import { Box } from '@mui/material'
import React, { FC, useEffect, useMemo, useRef } from 'react'

import { getBrowserZoom } from '@/utils'

export type IResizeDirType =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'

const ResizeAnchor: FC<{
  anchorSize?: string
  onStart?: (dir: IResizeDirType) => void
  onResize?: (dx: number, dy: number, dir: IResizeDirType) => void
  onStop?: () => void
}> = ({ anchorSize = '10px', onStart, onResize, onStop }) => {
  const mouseDownRef = useRef<IResizeDirType>()

  const callbackRef = useRef({ onStart, onResize, onStop })
  callbackRef.current.onStart = onStart
  callbackRef.current.onResize = onResize
  callbackRef.current.onStop = onStop

  const zoomRef = useRef(1)

  function handleMouseDown(e: React.MouseEvent, type: IResizeDirType) {
    zoomRef.current = getBrowserZoom()
    mouseDownRef.current = type
    document.body.style.cursor = 'se-resize'
    onStart?.(type)
    e.stopPropagation()
    e.preventDefault()
  }

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (!mouseDownRef.current) return

      callbackRef.current.onResize?.(
        e.movementX / zoomRef.current,
        e.movementY / zoomRef.current,
        mouseDownRef.current,
      )
      e.stopPropagation()
    }

    function handleMouseUp() {
      if (mouseDownRef.current) {
        callbackRef.current.onStop?.()
        mouseDownRef.current = undefined
        document.body.style.cursor = 'inherit'
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  const {
    top,
    bottom,
    left,
    right,
    topLeft,
    topRight,
    bottomLeft,
    bottomRight,
  } = useMemo(() => {
    const base = {
      position: 'absolute',
      height: anchorSize,
      width: anchorSize,
      background: 'none',
      backgroundColor: 'none',
      zIndex: 1,
    }
    return {
      top: {
        ...base,
        cursor: 'n-resize',
        width: '100%',
        top: 0,
        left: 0,
      },
      bottom: {
        ...base,
        cursor: 's-resize',
        width: '100%',
        bottom: 0,
        left: 0,
      },
      left: {
        ...base,
        cursor: 'w-resize',
        height: '100%',
        top: 0,
        left: 0,
      },
      right: {
        ...base,
        cursor: 'e-resize',
        height: '100%',
        top: 0,
        right: 0,
      },
      topLeft: { ...base, cursor: 'nw-resize', top: 0, left: 0 },
      topRight: { ...base, cursor: 'ne-resize', top: 0, right: 0 },
      bottomLeft: { ...base, cursor: 'sw-resize', bottom: 0, left: 0 },
      bottomRight: { ...base, cursor: 'se-resize', bottom: 0, right: 0 },
    }
  }, [anchorSize])

  return (
    <>
      <Box sx={top} onMouseDown={(e) => handleMouseDown(e, 'top')} />
      <Box sx={bottom} onMouseDown={(e) => handleMouseDown(e, 'bottom')} />
      <Box sx={left} onMouseDown={(e) => handleMouseDown(e, 'left')} />
      <Box sx={right} onMouseDown={(e) => handleMouseDown(e, 'right')} />
      <Box sx={topLeft} onMouseDown={(e) => handleMouseDown(e, 'top-left')} />
      <Box sx={topRight} onMouseDown={(e) => handleMouseDown(e, 'top-right')} />
      <Box
        sx={bottomLeft}
        onMouseDown={(e) => handleMouseDown(e, 'bottom-left')}
      />
      <Box
        sx={bottomRight}
        onMouseDown={(e) => handleMouseDown(e, 'bottom-right')}
      />
    </>
  )
}

export default ResizeAnchor
