import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider';
import ListItemIcon, { type ListItemIconProps } from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography'
import React, { type ComponentProps, type FC, memo, type ReactNode, useCallback, useRef, useState } from 'react'

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

const CustomPromptMenuListIcon = styled(({ children, ...props }: ListItemIconProps) => (
  <ListItemIcon {...props}>
    {children}
  </ListItemIcon>
))(({ theme }) => ({
  minWidth: '20px!important',
  color: theme.palette.primary.main,
  fontSize: '16px',
  marginRight: '8px'
}))

const CustomPromptMenuListItem = styled(({ children, ...props }: ComponentProps<typeof MenuItem>) => (
  <MenuItem {...props}>
    {children}
  </MenuItem>
))(({ theme }) => ({
  padding: '12px 8px',
  borderRadius: '6px',
}))

const SidebarNavCustomPromptButton: FC<ISidebarNavCustomPromptButtonProps> = (props) => {
  const {
    menuList
  } = props

  const { smoothConversationLoading } = useSmoothConversationLoading()

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const menuEnterRef = useRef(false)

  const SidebarNavCustomPromptMenuItem = useCallback(({ menuItem }: { menuItem: IContextMenuItemWithChildren }) => {
    return <CustomPromptMenuListItem
      onClick={(event) => {
        event.stopPropagation()
        // onRename?.()
        // handleClose(event)
      }}
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
    </CustomPromptMenuListItem>
  }, [])

  const RenderCustomPromptMenuList = useCallback((menuList: IContextMenuItemWithChildren[]) => {
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

        nodeList.push(...RenderCustomPromptMenuList(menuItem.children))
      } else {
        nodeList.push(<SidebarNavCustomPromptMenuItem menuItem={menuItem} />)
      }
    })

    return nodeList
  }, [])


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
          zIndex: 1201
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
        zIndex: 1200,
      }}
      anchorEl={anchorEl}
      // id={`${conversationId}_MORE_ACTIONS_MENU`}
      open={open}
      slotProps={{
        paper: {
          square: false,
          elevation: 0,
          sx: {
            width: '270px',
            maxHeight: '320px',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            p: '4px',
            mt: '3px',
            borderRadius: '8px',
            '& > ul': {
              py: 0,
            }
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
      {...RenderCustomPromptMenuList(menuList)}
      {menuList.length > 0 && <Divider sx={{ my: '2px' }} />}
      <CustomPromptMenuListItem
        onClick={(event) => {
          event.stopPropagation()
          // onRename?.()
          // handleClose(event)
        }}
        sx={{
          borderRadius: '6px',
        }}
      >
        <CustomPromptMenuListIcon>
          <AddOutlinedIcon sx={{ fontSize: 'inherit', flexShrink: 0 }} />
        </CustomPromptMenuListIcon>

        <ListItemText sx={{ fontSize: '14px', color: 'text.primary', textAlign: 'left' }}>
          <Typography
            sx={{
              fontSize: '14px',
              color: 'text.primary',
            }}
            component={'span'}
          >
            Add my own prompt
          </Typography>
        </ListItemText>
      </CustomPromptMenuListItem>
    </Menu>
  </>
}

export default memo(SidebarNavCustomPromptButton)