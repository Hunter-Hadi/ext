import { Box } from '@mui/material'
import React, { FC, useEffect, useMemo, useRef } from 'react'

import { getBrowserZoom } from '@/utils'

export type IResizeDirType =
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

  const { topLeft, topRight, bottomLeft, bottomRight } = useMemo(() => {
    const base = {
      position: 'absolute',
      height: anchorSize,
      width: anchorSize,
      background: 'none',
      backgroundColor: 'none',
      zIndex: 1,
    }
    return {
      topLeft: { ...base, cursor: 'nw-resize', top: 0, left: 0 },
      topRight: { ...base, cursor: 'ne-resize', top: 0, right: 0 },
      bottomLeft: { ...base, cursor: 'sw-resize', bottom: 0, left: 0 },
      bottomRight: { ...base, cursor: 'se-resize', bottom: 0, right: 0 },
    }
  }, [anchorSize])

  return (
    <>
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
