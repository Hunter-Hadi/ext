import Box from '@mui/material/Box'
import { SxProps } from '@mui/material/styles'
import React from 'react'

interface TriangleArrowProps {
  placement:
    | 'top'
    | 'right'
    | 'bottom'
    | 'left'
    | 'top-start'
    | 'top-end'
    | 'right-start'
    | 'right-end'
    | 'bottom-start'
    | 'bottom-end'
    | 'left-start'
    | 'left-end'
  arrowColor?: string
  arrowSize?: number
  borderRadius?: number
}

const TriangleArrow: React.FC<TriangleArrowProps> = ({
  placement,
  arrowColor = '#000',
  arrowSize = 6,
  borderRadius = arrowSize,
}) => {
  let arrowPlacementStyle: SxProps = {}

  switch (placement) {
    case 'top':
      arrowPlacementStyle = {
        bottom: -arrowSize,
        left: `calc(50% - ${arrowSize}px)`,
        borderWidth: `${arrowSize}px ${arrowSize}px 0 ${arrowSize}px`,
        borderColor: `${arrowColor} transparent transparent transparent`,
      }
      break
    case 'left':
      arrowPlacementStyle = {
        top: `calc(50% - ${arrowSize}px)`,
        right: -arrowSize,
        borderWidth: `${arrowSize}px 0 ${arrowSize}px ${arrowSize}px`,
        borderColor: `transparent transparent transparent ${arrowColor}`,
      }
      break
    case 'bottom':
      arrowPlacementStyle = {
        top: -arrowSize,
        left: `calc(50% - ${arrowSize}px)`,
        borderWidth: `0 ${arrowSize}px ${arrowSize}px ${arrowSize}px`,
        borderColor: `transparent transparent ${arrowColor} transparent`,
      }
      break
    case 'right':
      arrowPlacementStyle = {
        top: `calc(50% - ${arrowSize}px)`,
        left: -arrowSize,
        borderWidth: `${arrowSize}px ${arrowSize}px ${arrowSize}px 0`,
        borderColor: `transparent ${arrowColor} transparent transparent`,
      }
      break
    case 'bottom-start':
      arrowPlacementStyle = {
        top: -arrowSize,
        left: borderRadius,
        borderWidth: `0 ${arrowSize}px ${arrowSize}px ${arrowSize}px`,
        borderColor: `transparent transparent ${arrowColor} transparent`,
      }
      break
    case 'bottom-end':
      arrowPlacementStyle = {
        top: -arrowSize,
        right: borderRadius,
        borderWidth: `0 ${arrowSize}px ${arrowSize}px ${arrowSize}px`,
        borderColor: `transparent transparent ${arrowColor} transparent`,
      }
      break
    case 'left-start':
      arrowPlacementStyle = {
        top: borderRadius,
        right: -arrowSize,
        borderWidth: `${arrowSize}px 0 ${arrowSize}px ${arrowSize}px`,
        borderColor: `transparent transparent transparent ${arrowColor}`,
      }
      break
    case 'left-end':
      arrowPlacementStyle = {
        bottom: borderRadius,
        right: -arrowSize,
        borderWidth: `${arrowSize}px 0 ${arrowSize}px ${arrowSize}px`,
        borderColor: `transparent transparent transparent ${arrowColor}`,
      }
      break
    case 'top-start':
      arrowPlacementStyle = {
        bottom: -arrowSize,
        left: borderRadius,
        borderWidth: `${arrowSize}px ${arrowSize}px 0 ${arrowSize}px`,
        borderColor: `${arrowColor} transparent transparent transparent`,
      }
      break
    case 'top-end':
      arrowPlacementStyle = {
        bottom: -arrowSize,
        right: borderRadius,
        borderWidth: `${arrowSize}px ${arrowSize}px 0 ${arrowSize}px`,
        borderColor: `${arrowColor} transparent transparent transparent`,
      }
      break
    case 'right-start':
      arrowPlacementStyle = {
        top: borderRadius,
        left: -arrowSize,
        borderWidth: `${arrowSize}px ${arrowSize}px ${arrowSize}px 0`,
        borderColor: `transparent ${arrowColor} transparent transparent`,
      }
      break
    case 'right-end':
      arrowPlacementStyle = {
        bottom: borderRadius,
        left: -arrowSize,
        borderWidth: `${arrowSize}px ${arrowSize}px ${arrowSize}px 0`,
        borderColor: `transparent ${arrowColor} transparent transparent`,
      }
      break
    default:
      break
  }

  return (
    <Box
      sx={{
        position: 'absolute',
        width: 0,
        height: 0,
        border: 'solid',
        ...arrowPlacementStyle,
      }}
    />
  )
}

export default TriangleArrow
