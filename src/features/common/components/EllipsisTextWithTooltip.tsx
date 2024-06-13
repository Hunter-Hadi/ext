import { SxProps } from '@mui/material/styles'
import Tooltip, { TooltipProps } from '@mui/material/Tooltip'
import Typography, { TypographyProps } from '@mui/material/Typography'
import React, {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

interface IProps extends TypographyProps {
  children: React.ReactNode
  tip?: string
  sx?: SxProps
  lineClamp?: number
  // 是否开启对元素大小的监听, 当元素大小发生变化时, 重新计算是否需要渲染 Tooltip
  resizeListener?: boolean
  tooltipZIndex?: number
  TooltipProps?: Omit<TooltipProps, 'title' | 'children'>
}

const EllipsisTextWithTooltip: FC<IProps> = ({
  tip,
  sx,
  children,
  lineClamp = 3,
  resizeListener = false,
  tooltipZIndex,
  TooltipProps,
  ...restProps
}) => {
  const resizeObserver = useRef<ResizeObserver | null>(null)
  const textRef = useRef<HTMLElement | null>(null)
  const [rendered, setRendered] = useState(false)
  const [disableTooltip, setDisableTooltip] = useState(true)
  const tooltip = useMemo(() => tip ?? children, [children, tip])

  const updateTooltipStatus = useCallback(() => {
    if (textRef.current) {
      const textEl = textRef.current
      // scrollHeight > offsetHeight 说明有溢出, 渲染 Tooltip
      setDisableTooltip(textEl.offsetHeight >= textEl.scrollHeight)
    }
  }, [])

  useEffect(() => {
    if (rendered) {
      updateTooltipStatus()
    }
  }, [rendered, updateTooltipStatus])

  useEffect(() => {
    if (children && !rendered) {
      setRendered(true)
    }
  }, [children, rendered])

  useEffect(() => {
    if (rendered && resizeListener) {
      const resizeHandler = () => updateTooltipStatus()
      resizeObserver.current = new ResizeObserver(resizeHandler)
      if (textRef.current) {
        resizeObserver.current.observe(textRef.current)
      }
    }
    return () => {
      resizeObserver.current?.disconnect()
    }
  }, [rendered, resizeListener, updateTooltipStatus, textRef])

  return (
    <Tooltip
      title={
        disableTooltip ? '' : <Typography fontSize={12}>{tooltip}</Typography>
      }
      PopperProps={{
        style: {
          zIndex: tooltipZIndex || 2147483620,
          maxWidth: 180,
        },
      }}
      {...TooltipProps}
    >
      <Typography
        ref={textRef}
        sx={{
          MozBoxOrient: 'vertical',
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: `${lineClamp}`,
          lineClamp: `${lineClamp}`,
          boxOrient: 'vertical',
          display: '-webkit-box',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          ...sx,
        }}
        {...restProps}
      >
        {children}
      </Typography>
    </Tooltip>
  )
}

export default EllipsisTextWithTooltip
