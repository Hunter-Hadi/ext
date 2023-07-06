import React, { FC, useRef } from 'react'
import { SxProps } from '@mui/material/styles'
import Popper, { PopperProps } from '@mui/material/Popper'
import Box from '@mui/material/Box'
import { v4 } from 'uuid'
import { getAppContextMenuElement } from '@/utils'

const PopperWrapper: FC<{
  children: React.ReactNode
  content: React.ReactNode
  boxSx?: SxProps
  onClick?: (event: React.MouseEvent<HTMLElement>) => void
  PopperProps?: Omit<PopperProps, 'open'>
  hoverOpen?: boolean
}> = (props) => {
  const container = getAppContextMenuElement() || document.body
  const { children, content, boxSx, onClick, PopperProps, hoverOpen } = props
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const idRef = useRef(v4())
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget)
    onClick?.(event)
  }
  const handleMouseEnter = (event: React.MouseEvent<HTMLElement>) => {
    if (hoverOpen) {
      setAnchorEl(event.currentTarget)
    }
  }
  const handleMouseLeave = (event: React.MouseEvent<HTMLElement>) => {
    if (hoverOpen) {
      setAnchorEl(null)
    }
  }
  const open = Boolean(anchorEl)
  const id = open ? idRef.current : undefined
  return (
    <>
      <Box
        component={'div'}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        sx={{
          ...boxSx,
        }}
      >
        {children}
      </Box>
      <Popper
        disablePortal
        id={id}
        open={open}
        anchorEl={anchorEl}
        container={container}
        style={{
          zIndex: 2147483630,
        }}
        className={'max-ai--popper-wrapper'}
        {...PopperProps}
      >
        {content}
      </Popper>
    </>
  )
}
export default PopperWrapper