// https://github.com/mui/material-ui/issues/11723

import AddIcon from '@mui/icons-material/Add'
import Button from '@mui/material/Button'
// import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import Grow from '@mui/material/Grow'
import ListItemText from '@mui/material/ListItemText'
import MenuList from '@mui/material/MenuList'
import Paper from '@mui/material/Paper'
import Popper from '@mui/material/Popper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, {
  type FC,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import Browser from 'webextension-polyfill'

import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import { IPageSummaryType } from '@/features/chat-base/summary/types'
import { useContextMenuList } from '@/features/contextMenu'
// import useSmoothConversationLoading from '@/features/chatgpt/hooks/useSmoothConversationLoading'
import { type IContextMenuItemWithChildren } from '@/features/contextMenu/types'
import {
  IAIResponseMessage,
  IAIResponseOriginalMessageNavMetadata,
} from '@/features/indexed_db/conversations/models/Message'
import { chromeExtensionClientOpenPage } from '@/utils'

import RenderCustomPromptMenuList from './RenderCustomPromptMenuList'
import {
  CustomPromptMenuListIcon,
  CustomPromptMenuListItem,
} from './SidebarNavCustomPromptMenuItem'

interface ISidebarNavCustomPromptButtonProps {
  message: IAIResponseMessage
  summaryType: IPageSummaryType
  actionNavMetadata?: IAIResponseOriginalMessageNavMetadata
  loading?: boolean
  actived?: boolean
  onChange: (menuItem: IContextMenuItemWithChildren) => void
}

let isLoaded = false

const openSettingsPage = () => {
  chromeExtensionClientOpenPage({
    key: 'options',
    url: Browser.runtime.getURL(`/pages/settings/index.html`),
    query: `#/my-own-prompts?tab=summary`,
  })
}

const SidebarNavCustomPromptButton: FC<ISidebarNavCustomPromptButtonProps> = (
  props,
) => {
  const {
    // summaryType,
    actionNavMetadata,
    loading = false,
    actived = false,
    onChange,
  } = props

  const { t } = useTranslation(['client'])
  const { contextMenuList, originContextMenuList } = useContextMenuList(
    'sidebarSummaryButton',
    '',
    false,
  )

  // const { smoothConversationLoading } = useSmoothConversationLoading()

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const open = Boolean(anchorEl)

  const [summaryActionItem, setSummaryActionItem] =
    useState<IContextMenuItemWithChildren | null>(null)
  const isActived =
    actived ||
    (summaryActionItem && actionNavMetadata?.key === summaryActionItem.id)

  const menuEnterRef = useRef(false)

  const displayTitle = useMemo(() => {
    let title = t(
      'client:sidebar__summary__nav__summary__my_own_prompts__tooltip__default',
    )
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

    let initialLetter = String(actionNavMetadata?.title[0] || '').toUpperCase()

    if (icon) {
      return (
        <ContextMenuIcon
          size={18}
          icon={icon}
          sx={{
            color: isActived ? '#fff' : 'primary.main',
          }}
        />
      )
    } else if (isActived && initialLetter) {
      return (
        <Stack
          className={'max-ai__click-menu-button--box__text-icon'}
          alignItems={'center'}
          justifyContent={'center'}
          sx={{
            width: '22px',
            height: '22px',
            my: '-6px',
            boxSizing: 'border-box',
            borderRadius: '4px',
            bgcolor: (t) => (t.palette.mode === 'dark' ? '#4f4f4f' : '#F5F6F7'),
            color: (t) =>
              t.palette.mode === 'dark' && isActived ? '#FFF' : 'primary.main',
          }}
        >
          <Typography component={'span'} fontSize={'16px'} color={'inherit'}>
            {initialLetter}
          </Typography>
        </Stack>
      )
    } else if (contextMenuList.length > 0) {
      const firstShortCutItem =
        contextMenuList.find((item) => item.data.type === 'shortcuts') ||
        originContextMenuList.find((item) => item.data.type === 'shortcuts')
      if (firstShortCutItem) {
        initialLetter = String(firstShortCutItem.text[0] || '').toUpperCase()
        if (firstShortCutItem.data.icon) {
          return (
            <ContextMenuIcon
              size={18}
              icon={firstShortCutItem.data.icon}
              sx={{
                color: 'primary.main',
              }}
            />
          )
        } else if (initialLetter) {
          return (
            <Stack
              className={'max-ai__click-menu-button--box__text-icon'}
              alignItems={'center'}
              justifyContent={'center'}
              sx={{
                width: '22px',
                height: '22px',
                my: '-6px',
                boxSizing: 'border-box',
                borderRadius: '4px',
                bgcolor: (t) =>
                  t.palette.mode === 'dark' ? '#4f4f4f' : '#F5F6F7',
                color: (t) =>
                  t.palette.mode === 'dark' && isActived
                    ? '#FFF'
                    : 'primary.main',
              }}
            >
              <Typography
                component={'span'}
                fontSize={'16px'}
                color={'inherit'}
              >
                {initialLetter}
              </Typography>
            </Stack>
          )
        }
      }
    }

    return <AddIcon sx={{ fontSize: '18px', flexShrink: 0 }} />
  }, [summaryActionItem, actionNavMetadata, contextMenuList, isActived])

  const handleClick = useCallback(
    (menuItem: IContextMenuItemWithChildren) => {
      onChange(menuItem)
      setSummaryActionItem(menuItem)
      setAnchorEl(null)
    },
    [onChange],
  )

  const customPromptMenuList = useMemo(() => {
    const renderCustomPromptMenuList = RenderCustomPromptMenuList(
      contextMenuList,
      {
        level: 0,
        actionPromptId: actionNavMetadata?.key,
        onClick: handleClick,
      },
    )
    if (renderCustomPromptMenuList.length > 0) {
      renderCustomPromptMenuList.push(<Divider sx={{ my: '2px' }} />)
    }
    return renderCustomPromptMenuList
  }, [actionNavMetadata?.key, contextMenuList, handleClick])

  // initialize loaded
  useEffect(() => {
    return () => {
      isLoaded = false
    }
  }, [])

  useEffect(() => {
    if (originContextMenuList.length > 0 && !summaryActionItem) {
      let actionItem = null
      if (actionNavMetadata?.key) {
        actionItem =
          (originContextMenuList.find(
            (item) => item.id === actionNavMetadata.key,
          ) as IContextMenuItemWithChildren) || null
      }
      if (!actionItem) {
        actionItem =
          contextMenuList.find((item) => item.data.type === 'shortcuts') ||
          (originContextMenuList.find(
            (item) => item.data.type === 'shortcuts',
          ) as IContextMenuItemWithChildren) ||
          null
      }
      if (actionItem) {
        isLoaded = true
        setSummaryActionItem(actionItem)
      }
    }
  }, [actived, contextMenuList, originContextMenuList, actionNavMetadata?.key])

  useEffect(() => {
    if (anchorEl && !isLoaded) {
      isLoaded = true
    }
  }, [anchorEl])

  return (
    <>
      <TextOnlyTooltip
        title={displayTitle}
        // key={navItem.key}
      >
        <Button
          disabled={loading}
          variant={isActived ? 'contained' : 'outlined'}
          onMouseUp={(event) => {
            event.stopPropagation()
            if (!isActived) {
              if (summaryActionItem) {
                handleClick(summaryActionItem)
              } else {
                openSettingsPage()
              }
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
            px: '12px',
            bgcolor: (t) =>
              t.palette.mode === 'dark' || isActived
                ? undefined
                : 'background.paper',
            color: isActived ? undefined : 'primary.main',
            boxShadow: 'none',
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
                color: isActived ? '#fff' : 'primary.main',
              }}
            />
          </Stack>
        </Button>
      </TextOnlyTooltip>

      <Popper
        open={open}
        anchorEl={anchorEl}
        placement='bottom-start'
        transition
      >
        {({ TransitionProps }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin: 'left top',
            }}
          >
            <Paper
              square={false}
              elevation={0}
              sx={{
                width: '270px',
                maxHeight: '320px',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                p: '4px',
                mt: '3px',
                borderRadius: '8px',
                '& > ul': {
                  py: 0,
                },
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
                {...customPromptMenuList}
                <CustomPromptMenuListItem
                  onClick={(event) => {
                    event.stopPropagation()
                    openSettingsPage()
                  }}
                  sx={{
                    borderRadius: '6px',
                  }}
                >
                  <CustomPromptMenuListIcon>
                    <AddIcon sx={{ fontSize: 'inherit', flexShrink: 0 }} />
                  </CustomPromptMenuListIcon>

                  <ListItemText
                    sx={{
                      fontSize: '14px',
                      color: 'text.primary',
                      textAlign: 'left',
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: '14px',
                        color: 'text.primary',
                      }}
                      component={'span'}
                    >
                      {t(
                        'client:sidebar__summary__nav__summary__my_own_prompts__add_button_title___default',
                      )}
                    </Typography>
                  </ListItemText>
                </CustomPromptMenuListItem>
              </MenuList>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  )
}

export default memo(SidebarNavCustomPromptButton)
