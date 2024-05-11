
import Grow from '@mui/material/Grow';
import ListItemIcon, { type ListItemIconProps } from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import MenuItem from '@mui/material/MenuItem'
import MenuList from '@mui/material/MenuList';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography'
import React, { type ComponentProps, type FC, useState } from 'react'

import {
  ContextMenuIcon,
} from '@/components/ContextMenuIcon'
import { type IContextMenuItemWithChildren } from '@/features/contextMenu/types'

import RenderCustomPromptMenuList from './RenderCustomPromptMenuList';

export const CustomPromptMenuListIcon = styled(({ children, ...props }: ListItemIconProps) => (
  <ListItemIcon {...props}>
    {children}
  </ListItemIcon>
))(({ theme }) => ({
  minWidth: '20px!important',
  color: theme.palette.primary.main,
  fontSize: '16px',
  marginRight: '8px'
}))

export const CustomPromptMenuListItem = styled(({ children, ...props }: ComponentProps<typeof MenuItem>) => (
  <MenuItem {...props}>
    {children}
  </MenuItem>
))(() => ({
  padding: '5px 8px',
  borderRadius: '6px',
}))

interface ISidebarNavCustomPromptMenuItemType {
  menuItem: IContextMenuItemWithChildren
  level?: number
  actionPromptId?: string
  onClick: (menuItem: IContextMenuItemWithChildren) => void
}

const SidebarNavCustomPromptMenuItem: FC<ISidebarNavCustomPromptMenuItemType> = (props) => {
  const { menuItem, level = 0, actionPromptId, onClick: handleClick } = props
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const open = Boolean(anchorEl)
  const isGroup = menuItem.data.type === 'group'

  // should not render when group has no children
  if (isGroup && menuItem.children.length === 0) {
    return null
  }

  return <CustomPromptMenuListItem
    selected={menuItem.id === actionPromptId}
    onClick={(event) => {
      event.stopPropagation()
      if (!isGroup && menuItem.id !== actionPromptId) {
        handleClick(menuItem)
      }
    }}
    // onKeyDown={(event) => {}}
    {...(isGroup && {
      onMouseEnter: (event) => {
        setAnchorEl(event.currentTarget)
      },
      onMouseLeave: () => {
        setAnchorEl(null)
      }
    })}
  >
    {menuItem?.data?.icon && (
      <CustomPromptMenuListIcon>
        <ContextMenuIcon
          size={16}
          icon={menuItem.data.icon}
          sx={{ flexShrink: 0 }}
        />
      </CustomPromptMenuListIcon>
    )}

    <ListItemText sx={{
      fontSize: '14px',
      color: 'text.primary',
      textAlign: 'left',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      overflow: 'hidden'
    }}>
      <Typography
        sx={{
          fontSize: '14px',
          color: 'text.primary',

        }}
        component={'span'}
      >
        {menuItem.text}
      </Typography>
    </ListItemText>

    {
      isGroup && <>
        <ContextMenuIcon
          icon={'ExpandMore'}
          sx={{
            fontSize: 18,
            transition: 'all 0.2s ease-in-out',
            transform: 'rotate(-90deg)',
          }}
        />

        <Popper
          open={open}
          anchorEl={anchorEl}
          placement="left-start"
          transition
          disablePortal
        >
          {({ TransitionProps }) => (
            <Grow
              {...TransitionProps}
              style={{
                transformOrigin: 'left top',
              }}
            >
              <Paper square={false} elevation={0}
                sx={{
                  width: '270px',
                  maxHeight: '320px',
                  filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                  p: '4px',
                  mt: '3px',
                  borderRadius: '8px',
                  '& > ul': {
                    py: 0,
                  }
                }}
              >
                <MenuList
                // onKeyDown={handleListKeyDown}
                >
                  {...RenderCustomPromptMenuList(menuItem.children, {
                    level,
                    actionPromptId,
                    onClick: handleClick,
                  })}
                </MenuList>
              </Paper>
            </Grow>
          )}
        </Popper>
      </>
    }
  </CustomPromptMenuListItem>
}

export default SidebarNavCustomPromptMenuItem