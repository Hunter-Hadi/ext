import { Box } from '@mui/material'
import React, { FC, useEffect,useRef } from 'react'

const ResizeAnchor: FC<{
  anchorSize?: string
  onResize?: (dx: number, dy: number) => void
}> = ({ anchorSize = '10px', onResize }) => {
  const mouseDownRef = useRef(false)

  const callbackRef = useRef(onResize)

  callbackRef.current = onResize

  function handleMouseDown(e: React.MouseEvent) {
    mouseDownRef.current = true
    document.body.style.cursor = 'se-resize'
    e.stopPropagation()
    e.preventDefault()
  }

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (!mouseDownRef.current) return

      callbackRef.current?.(e.movementX, e.movementY)
      e.stopPropagation()
    }

    function handleMouseUp() {
      mouseDownRef.current = false
      document.body.style.cursor = 'inherit'
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: 0,
        right: 0,
        height: anchorSize,
        width: anchorSize,
        background: 'none',
        backgroundColor: 'none',
        cursor: 'se-resize',
        zIndex: 1,
      }}
      onMouseDown={handleMouseDown}
    />
  )
}

export default ResizeAnchor