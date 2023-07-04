import React, { FC, useMemo, useRef, useState } from 'react'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import { getAppRootElement } from '@/utils'

const IconDropdown: FC<{
  children: React.ReactNode
  icon: React.ReactNode
  iconSx?: SxProps
  dropdownSx?: SxProps
  dropdownWidth?: number
}> = (props) => {
  const { icon, children, iconSx = {}, dropdownSx = {}, dropdownWidth } = props
  const [isHover, setIsHover] = useState(false)
  const iconRef = useRef<HTMLElement>(null)
  const DropdownWidth = useMemo(() => {
    const defaultWidth = getAppRootElement()?.offsetWidth
    return dropdownWidth || defaultWidth || 440
  }, [dropdownWidth, isHover])
  const dropDownPosition = useMemo(() => {
    const top = `calc(100% - 4px)`
    let left = 0
    // 计算基于icon位置的dropdown位置的中心点
    const iconEl = iconRef.current
    if (!iconEl) return
    const rootElementX = getAppRootElement()?.getBoundingClientRect()?.x
    const iconElementX = iconEl?.getBoundingClientRect()?.x
    if (rootElementX && iconElementX) {
      left = -(iconElementX - rootElementX)
    }
    return {
      top,
      left,
    }
  }, [isHover])
  return (
    <Stack
      ref={iconRef}
      component={'div'}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      sx={{
        p: 1.5,
        borderRadius: 1,
        width: 44,
        height: 44,
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        bgcolor: isHover
          ? (t) => (t.palette.mode === 'dark' ? '#454545' : '#f5f5f5')
          : 'transparent',
        '&:before': {
          display: 'none',
          // 三角形
          content: '""',
          position: 'absolute',
          width: 0,
          height: 0,
          top: 0,
          left: '-100%',
          borderLeft: '44px solid transparent',
          borderBottom: '44px solid transparent',
          borderRight: '0 solid transparent',
          borderTop: '0 solid transparent',
        },
        '&:after': {
          // 三角形
          display: 'none',
          content: '""',
          position: 'absolute',
          width: 0,
          height: 0,
          left: '100%',
          top: 0,
          borderRight: '44px solid transparent',
          borderBottom: '44px solid transparent',
          borderLeft: '0 solid transparent',
          borderTop: '0 solid transparent',
        },
        '&:hover': {
          '&:before': {
            display: 'block',
          },
          '&:after': {
            display: 'block',
          },
        },
        ...iconSx,
      }}
    >
      {icon}
      {isHover && (
        <Stack
          component={'div'}
          sx={{
            justifyContent: 'center',
            alignItems: 'center',
            width: DropdownWidth,
            top: `calc(100% - 4px)`,
            position: 'absolute',
            bgcolor: (t) => (t.palette.mode === 'dark' ? '#454545' : '#f5f5f5'),
            borderBottom: '1px solid #9393933d',
            zIndex: 1001,
            p: 1,
            ...dropDownPosition,
            ...dropdownSx,
          }}
        >
          {children}
        </Stack>
      )}
    </Stack>
  )
}
export default IconDropdown
