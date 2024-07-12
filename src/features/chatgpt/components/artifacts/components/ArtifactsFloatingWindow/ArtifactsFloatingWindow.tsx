import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import throttle from 'lodash-es/throttle'
import React, { FC, useCallback, useEffect, useState } from 'react'

interface IArtifactsFloatingWindowProps {
  children: React.ReactNode
  reference: React.RefObject<HTMLElement>
  offset?: number
  sx?: SxProps
}
const ArtifactsFloatingWindow: FC<IArtifactsFloatingWindowProps> = (props) => {
  const { children, reference, offset = 16, sx } = props

  const [containerWidth, setContainerWidth] = useState<number>(680)
  const [x, setX] = useState(0)
  const [y, setY] = useState(0)

  const handleComputeContainerWidth = useCallback(() => {
    if (!reference.current) {
      return
    }
    const referenceRect = reference.current.getBoundingClientRect()
    const windowWidth = window.innerWidth
    const containerWidth = Math.min(
      680,
      windowWidth - referenceRect.width - offset,
    )
    const left = referenceRect.left - containerWidth - offset
    setY(referenceRect.top)
    setX(left)
    setContainerWidth(containerWidth)
  }, [offset, reference])

  useEffect(() => {
    if (!reference.current) {
      return
    }
    const referenceResizeListener = throttle(() => {
      handleComputeContainerWidth()
    }, 0)
    const handleResize = () =>
      throttle(() => {
        handleComputeContainerWidth()
      }, 0)
    const resizeObserver = new ResizeObserver(referenceResizeListener)
    resizeObserver.observe(reference.current)
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      resizeObserver.disconnect()
    }
  }, [reference])

  return (
    <Stack
      sx={{
        position: 'fixed',
        zIndex: 1000,
        width: containerWidth,
        marginTop: `${offset}px`,
        height: `calc(100vh - ${offset * 2}px)`,
        ...sx,
        left: x,
        top: y,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {children}
    </Stack>
  )
}
export { ArtifactsFloatingWindow }
