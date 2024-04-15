import IconButton, { IconButtonProps } from '@mui/material/IconButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import MenuItem, { MenuItemProps } from '@mui/material/MenuItem'
import React, { useEffect, useRef, useState } from 'react'

import TextOnlyTooltip from '@/components/TextOnlyTooltip'

interface DropdownIconButtonOption {
  icon?: React.ReactNode
  text: string
  onClick?: () => void
}

interface DropdownIconButtonProps {
  icon: React.ReactNode
  options: DropdownIconButtonOption[]
  placement?: 'bottom-end' | 'bottom-start' | 'top-end' | 'top-start'
  tooltipTitle?: string
  IconButtonProps?: IconButtonProps
  MenuItemProps?: MenuItemProps
}

const DropdownIconButton: React.FC<DropdownIconButtonProps> = (props) => {
  const {
    icon,
    options,
    placement = 'bottom-end',
    tooltipTitle,
    IconButtonProps,
    MenuItemProps,
  } = props
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    event.preventDefault()
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleMenuItemClick = (option: DropdownIconButtonOption) => {
    option.onClick?.()
    handleClose()
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        anchorEl &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        handleClose()
      }
    }

    document.addEventListener('click', handleClickOutside)

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [anchorEl])

  return (
    <>
      <TextOnlyTooltip placement={'top'} title={tooltipTitle}>
        <IconButton
          {...IconButtonProps}
          ref={buttonRef}
          onClick={handleClick}
          aria-label={tooltipTitle}
          aria-controls={anchorEl ? 'dropdown-menu' : undefined}
          aria-haspopup="true"
        >
          {icon}
        </IconButton>
      </TextOnlyTooltip>
      <Menu
        id="dropdown-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: placement.split('-')[1] as 'left' | 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: placement.split('-')[1] as 'left' | 'right',
        }}
      >
        {options.map((option, index) => (
          <MenuItem
            {...MenuItemProps}
            key={index}
            onClick={(event) => {
              event.stopPropagation()
              event.preventDefault()
              handleMenuItemClick(option)
            }}
          >
            {option.icon && <ListItemIcon>{option.icon}</ListItemIcon>}
            <ListItemText>{option.text}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}

export default DropdownIconButton
