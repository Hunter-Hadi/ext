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
import React, { type FC, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Browser from 'webextension-polyfill'

import {
  ContextMenuIcon,
} from '@/components/ContextMenuIcon'
import { UseChatGptIcon } from '@/components/CustomIcon'
import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import { type IAIResponseMessage, type IAIResponseOriginalMessageNavMetadata } from '@/features/chatgpt/types';
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
  actionNavMetadata?: IAIResponseOriginalMessageNavMetadata
  loading?: boolean
  actived?: boolean
  onChange: (menuItem: IContextMenuItemWithChildren) => void
}

let isLoaded = false
const SidebarNavCustomPromptButton: FC<ISidebarNavCustomPromptButtonProps> = (props) => {
  const {
    summaryType,
    actionNavMetadata,
    loading = false,
    actived = false,
    onChange
  } = props

  const { t } = useTranslation(['client'])
  const { contextMenuList, flattenContextMenuList } = useContextMenuList('sidebarSummaryButton', '', false)

  // const { smoothConversationLoading } = useSmoothConversationLoading()

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const open = Boolean(anchorEl)

  const [summaryActionItem, setSummaryActionItem] = useState<IContextMenuItemWithChildren | null>(null)
  const isActived = actived || (summaryActionItem && actionNavMetadata?.key === summaryActionItem.id)

  const menuEnterRef = useRef(false)

  const displayTitle = useMemo(() => {
    let title = t('client:sidebar__summary__nav__summary__my_own_prompts__tooltip__default')
    if (summaryActionItem && summaryActionItem.text) {
      title = summaryActionItem.text
    } else if (isActived && actionNavMetadata && actionNavMetadata.title) {
      title = actionNavMetadata.title
    }

    return title
  }, [summaryActionItem, actionNavMetadata, isActived, t])

  const DisplayIcon = useCallback(() => {
    let icon = ''
    if (summaryActionItem && summaryActionItem.data.icon) {
      icon = summaryActionItem.data.icon
    } else if (isActived && actionNavMetadata && actionNavMetadata.icon) {
      icon = actionNavMetadata.icon
    }

    return icon ? <ContextMenuIcon
      size={18}
      icon={icon}
      sx={{
        color:
          isActived ? '#fff' : 'primary.main',
      }}
    />
      : <UseChatGptIcon
        sx={{
          color:
            isActived ? '#fff' : 'primary.main',
          fontSize: 18,
        }}
      />
  }, [summaryActionItem, actionNavMetadata, isActived])

  const handleClick = (menuItem: IContextMenuItemWithChildren) => {
    onChange(menuItem)
    setSummaryActionItem(menuItem)
    setAnchorEl(null)
  }

  // initialize loaded
  useEffect(() => {
    return () => {
      isLoaded = false
    }
  }, [])

  useEffect(() => {
    if (!isLoaded && actived && flattenContextMenuList.length > 0 && !summaryActionItem && actionNavMetadata?.key) {
      isLoaded = true
      setSummaryActionItem(flattenContextMenuList.find(item => item.id === actionNavMetadata.key) || null)
    }
  }, [actived, flattenContextMenuList, actionNavMetadata?.key])

  useEffect(() => {
    if (anchorEl && !isLoaded) {
      isLoaded = true
    }
  }, [anchorEl])

  return <>
    <TextOnlyTooltip
      title={displayTitle}
    // key={navItem.key}
    >
      <Button
        disabled={loading}
        variant={isActived ? 'contained' : 'outlined'}
        onMouseUp={(event) => {
          event.stopPropagation()
          if (!isActived && summaryActionItem) {
            handleClick(summaryActionItem)
          }
        }}
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
          <DisplayIcon />
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
                actionPromptId: actionNavMetadata?.key,
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