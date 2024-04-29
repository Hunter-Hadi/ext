// https://github.com/mui/material-ui/issues/11723

import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import Button from '@mui/material/Button'
// import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider';
import Grow from '@mui/material/Grow';
import ListItemText from '@mui/material/ListItemText'
import MenuList from '@mui/material/MenuList';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { type FC, memo, useRef, useState } from 'react'
import Browser from 'webextension-polyfill'

import {
  ContextMenuIcon,
} from '@/components/ContextMenuIcon'
import { UseChatGptIcon } from '@/components/CustomIcon'
import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import { type IAIResponseMessage } from '@/features/chatgpt/types';
import { useContextMenuList } from '@/features/contextMenu'
// import useSmoothConversationLoading from '@/features/chatgpt/hooks/useSmoothConversationLoading'
import { type IContextMenuItemWithChildren } from '@/features/contextMenu/types'
import { type IPageSummaryType } from '@/features/sidebar/utils/pageSummaryHelper';
import { chromeExtensionClientOpenPage } from '@/utils'

import RenderCustomPromptMenuList from './RenderCustomPromptMenuList'
import { CustomPromptMenuListIcon, CustomPromptMenuListItem } from './SidebarNavCustomPromptMenuItem'


interface ISidebarNavCustomPromptButtonProps {
  message: IAIResponseMessage
  summaryType: IPageSummaryType
  actionPromptId?: string
  loading?: boolean
  onChange: (menuItem: IContextMenuItemWithChildren) => void
}

const SidebarNavCustomPromptButton: FC<ISidebarNavCustomPromptButtonProps> = (props) => {
  const {
    summaryType,
    actionPromptId,
    loading = false,
    onChange
  } = props

  const { contextMenuList } = useContextMenuList('sidebarSummaryButton', '', false)

  // const { smoothConversationLoading } = useSmoothConversationLoading()

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const open = Boolean(anchorEl)

  const [summaryActionItem, setSummaryActionItem] = useState<IContextMenuItemWithChildren | null>(null)
  const isActived = summaryActionItem && actionPromptId === summaryActionItem.id

  const menuEnterRef = useRef(false)

  const handleClick = (menuItem: IContextMenuItemWithChildren) => {
    onChange(menuItem)
    setSummaryActionItem(menuItem)
    setAnchorEl(null)
  }

  return <>
    <TextOnlyTooltip
      title="test summary custom prompt menu"
    // key={navItem.key} title={t(navItem.tooltip as any)}
    >
      <Button
        disabled={loading}
        variant={isActived ? 'contained' : 'outlined'}
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
          px: '12px'
        }}
      >
        <Stack direction={'row'} alignItems={'center'}>
          {/* {smoothConversationLoading ? (
            <CircularProgress
              size={18}
              sx={{
                color:
                  'primary.main',
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
          )} */}
          {
            summaryActionItem && summaryActionItem.data.icon
              ? <ContextMenuIcon
                size={18}
                icon={summaryActionItem.data.icon}
                sx={{
                  color:
                    isActived ? '#fff' : 'primary.main',
                }}
              />
              : <UseChatGptIcon
                sx={{
                  color:
                    'primary.main',
                  fontSize: 18,
                }}
              />
          }
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
    </TextOnlyTooltip>

    <Popper
      open={open}
      anchorEl={anchorEl}
      placement="bottom-start"
      transition
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
            onMouseEnter={(event) => {
              event.stopPropagation()
              menuEnterRef.current = true
            }}
            onMouseLeave={() => {
              menuEnterRef.current = false
              setAnchorEl(null)
            }}
          >
            <MenuList
              autoFocusItem
            // onKeyDown={(event) => {}}
            >
              {...RenderCustomPromptMenuList(contextMenuList, {
                level: 0,
                actionPromptId,
                onClick: handleClick,
              })}
              {contextMenuList.length > 0 && <Divider sx={{ my: '2px' }} />}
              <CustomPromptMenuListItem
                onClick={(event) => {
                  event.stopPropagation()
                  chromeExtensionClientOpenPage({
                    key: 'options',
                    url: Browser.runtime.getURL(`/pages/settings/index.html`),
                    query: `#/my-own-prompts?tab=summary`,
                  })
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
            </MenuList>
          </Paper>
        </Grow>
      )}
    </Popper>
  </>
}

export default memo(SidebarNavCustomPromptButton)