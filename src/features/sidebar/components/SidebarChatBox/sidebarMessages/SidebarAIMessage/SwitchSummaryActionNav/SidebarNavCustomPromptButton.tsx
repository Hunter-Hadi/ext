import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { type FC, memo, type ReactNode, useCallback, useMemo, useRef, useState } from 'react'

import {
  ContextMenuIcon,
} from '@/components/ContextMenuIcon'
import { UseChatGptIcon } from '@/components/CustomIcon'
import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import useSmoothConversationLoading from '@/features/chatgpt/hooks/useSmoothConversationLoading'
import { type IContextMenuItemWithChildren } from '@/features/contextMenu/types'

interface ISidebarNavCustomPromptButtonProps {
  menuList: IContextMenuItemWithChildren[]
}

const SidebarNavCustomPromptButton: FC<ISidebarNavCustomPromptButtonProps> = (props) => {
  const {
    menuList
  } = props

  const { smoothConversationLoading } = useSmoothConversationLoading()

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const menuEnterRef = useRef(false)

  const SidebarNavCustomPromptMenuItem = useCallback(({ menuItem }: { menuItem: IContextMenuItemWithChildren }) => {
    return <MenuItem
      onClick={(event) => {
        event.stopPropagation()
        // onRename?.()
        // handleClose(event)
      }}
      sx={{
        borderRadius: '6px',
      }}
    >
      {menuItem?.data?.icon && (
        <ListItemIcon>
          <ContextMenuIcon
            size={16}
            icon={menuItem.data.icon}
            sx={{ color: 'primary.main', flexShrink: 0 }}
          />
        </ListItemIcon>
      )}

      <ListItemText sx={{ fontSize: '14px', color: 'text.primary', textAlign: 'left' }}>
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
    </MenuItem>
  }, [])

  const RenderCustomPromptMenuList = useMemo(() => {
    const nodeList: ReactNode[] = []
    menuList.forEach((menuItem) => {
      if (menuItem.data.type === 'group') {
        nodeList.push(
          <Divider textAlign="left" sx={{ my: '1px!important' }}>
            <Typography
              textAlign={'left'}
              fontSize={12}
              color={'text.secondary'}
            >
              {menuItem.text}
            </Typography>
          </Divider>
        )

        menuItem.children.forEach((childMenuItem) => {
          nodeList.push(<SidebarNavCustomPromptMenuItem menuItem={childMenuItem} />)
        })
      } else {
        nodeList.push(<SidebarNavCustomPromptMenuItem menuItem={menuItem} />)
      }
    })

    return nodeList
  }, [menuList])


  return <>
    <TextOnlyTooltip
      title="test summary custom prompt menu"
    // key={navItem.key} title={t(navItem.tooltip as any)}
    >
      <Button
        // disabled={loading}
        variant={
          'outlined'
        }
        onMouseEnter={(event) => {
          event.preventDefault()
          event.stopPropagation()
          setAnchorEl(event.currentTarget)
        }}
        onMouseLeave={() => {
          setTimeout(() => {
            if (!menuEnterRef.current) {
              setAnchorEl(null)
            }
          }, 100)
        }}
        sx={{
          px: '12px',
          zIndex: 2147483620
        }}
      >
        <Stack direction={'row'} alignItems={'center'}>
          {smoothConversationLoading ? (
            <CircularProgress
              sx={{
                color:
                  'primary.main',
                fontSize: 18,
              }}
            />
          ) : (
            <UseChatGptIcon
              sx={{
                color:
                  'primary.main',
                fontSize: 18,
              }}
            />
          )}
          <ContextMenuIcon
            icon={'ExpandMore'}
            sx={{
              fontSize: 18,
              transition: 'all 0.2s ease-in-out',
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          />
        </Stack>
      </Button>
    </TextOnlyTooltip >

    <Menu
      sx={{
        zIndex: 2147483619,
      }}
      anchorEl={anchorEl}
      // id={`${conversationId}_MORE_ACTIONS_MENU`}
      open={open}
      slotProps={{
        paper: {
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            px: '6px',
            py: '4px',
          },
          onMouseEnter: (event) => {
            event.stopPropagation()
            menuEnterRef.current = true
          },
          onMouseLeave: () => {
            menuEnterRef.current = false
            setAnchorEl(null)
          }
        },
      }}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
    >
      {RenderCustomPromptMenuList}
    </Menu>
  </>
}

export default memo(SidebarNavCustomPromptButton)