import SendIcon from '@mui/icons-material/Send'
import Box from '@mui/material/Box'
import { red } from '@mui/material/colors'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { SxProps, Theme, useTheme } from '@mui/material/styles'
import { cloneDeep } from 'lodash-es'
import React, { FC, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import AutoHeightTextarea from '@/components/AutoHeightTextarea'
import MaxAIBetaFeatureWrapper from '@/components/MaxAIBetaFeatureWrapper'
import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import ChatIconFileUpload from '@/features/chatgpt/components/ChatIconFileUpload'
import useClientChat from '@/features/chatgpt/hooks/useClientChat'
import { useContextMenuList } from '@/features/contextMenu'
import {
  contextMenuIsFavoriteContextMenu,
  FAVORITE_CONTEXT_MENU_GROUP_ID,
} from '@/features/contextMenu/hooks/useFavoriteContextMenuList'
import { IContextMenuItem } from '@/features/contextMenu/types'
import {
  checkIsDraftContextMenuId,
  findDraftContextMenuById,
} from '@/features/contextMenu/utils'
import TreeNavigatorMatcher from '@/features/sidebar/utils/treeNavigatorMatcher'
import { getMaxAISidebarRootElement } from '@/utils'

import SidebarChatVoiceInputButton from '../SidebarChatVoiceInputButton'
import ContextMenuList from './MenuList'
import SidebarContextMenuTitlebar from './SidebarContextMenuTitlebar'

const SidebarContextMenu: FC = () => {
  const { t } = useTranslation(['common', 'client'])
  const { palette } = useTheme()

  const [content, setContent] = useState('')
  const contentRef = useRef('')
  contentRef.current = content
  const [inputValue, setInputValue] = useState('')
  const [isContentEmptyError, setIsContentEmptyError] = useState(false)
  const update = useUpdate()
  const matcher = useMemo(() => new TreeNavigatorMatcher(), [])
  matcher.onUpdate = update

  const { contextMenuList: contextWindowList } = useContextMenuList(
    'textSelectPopupButton',
    inputValue,
  )

  // 这里第一层需要flat一下才能得到
  const topLevelMenuList = useMemo(
    () =>
      contextWindowList
        .map((item) => {
          if (item.data.type === 'group') return item.children
          return item
        })
        .flat(),
    [contextWindowList],
  )

  matcher.menuList = topLevelMenuList

  const { askAIWIthShortcuts, askAIQuestion } = useClientChat()
  const { checkAttachments } = useClientChat()

  const handleEnter = async () => {
    if (!content) {
      setIsContentEmptyError(true)
      return
    }

    if (matcher.path.length) {
      const menuItem = matcher.path[matcher.path.length - 1].item
      handleContextMenuClick(menuItem)
    } else if (inputValue.trim()) {
      const template = `${inputValue}:\n"""\n${content}\n"""`
      await askAIQuestion({
        type: 'user',
        text: template,
        meta: {
          includeHistory: true,
        },
      }).catch((err) => {
        console.log('handleEnter error: ', err)
      })
    }
  }

  const referenceElementRef = useRef<HTMLDivElement>(null)

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleContextMenuClick = (menuItem: IContextMenuItem) => {
    if (!content) {
      setIsContentEmptyError(true)
      return
    }

    let id = menuItem.id
    if (contextMenuIsFavoriteContextMenu(id)) {
      id = id.replace(FAVORITE_CONTEXT_MENU_GROUP_ID, '')
    }

    if (checkIsDraftContextMenuId(id)) {
      menuItem = findDraftContextMenuById(id) || menuItem
    }

    if (!menuItem || !menuItem.id) return

    const runActions = cloneDeep(menuItem.data.actions || [])

    if (runActions.length > 0) {
      checkAttachments()
        .then((status) => {
          if (!status) return

          return askAIWIthShortcuts(runActions, {
            overwriteParameters: [
              {
                key: 'SELECTED_TEXT',
                value: contentRef.current,
                label: 'Selected text',
                isBuiltIn: true,
                overwrite: true,
              },
            ],
          })
        })
        .catch((err) => {
          console.error('askAIWIthShortcuts cause some error', err)
        })
    }
  }

  const actionsBtnColorSxMemo = useMemo<SxProps<Theme>>(() => {
    return {
      color: 'text.secondary',
      borderColor: (t) => {
        return t.palette.mode === 'dark'
          ? 'rgba(255, 255, 255, 0.08)'
          : 'rgba(0, 0, 0, 0.16)'
      },
      '&:hover': {
        color: 'primary.main',
        borderColor: 'primary.main',
      },
    }
  }, [])
  const boxRef = useRef<HTMLDivElement>(null)

  const root = useMemo(() => getMaxAISidebarRootElement() || document.body, [])

  return (
    <>
      <Box
        width={'100%'}
        padding={'10px'}
        paddingBottom={0}
        display={'flex'}
        flexDirection={'column'}
        alignItems={'center'}
        sx={{
          boxSizing: 'border-box',
        }}
      >
        <Box
          sx={{
            boxSizing: 'border-box',
            border: '1px solid',
            borderColor: palette.customColor.borderColor,
            bgcolor: palette.customColor.paperBackground,
            borderRadius: '6px',
            boxShadow:
              'rgb(15 15 15 / 5%) 0px 0px 0px 1px, rgb(15 15 15 / 10%) 0px 3px 6px, rgb(15 15 15 / 20%) 0px 9px 24px',
            overflow: 'hidden',
            isolation: 'isolate',
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            padding: '8px 12px',
            maxWidth: '768px',
          }}
          onKeyDown={(event) => {
            event.stopPropagation()
          }}
        >
          <SidebarContextMenuTitlebar />

          <Box
            sx={{
              width: '100%',
              padding: '10px 0',
            }}
          >
            <Box
              sx={{
                width: '100%',
                padding: '8px',
                bgcolor: (t) =>
                  t.palette.mode === 'dark' ? '#3B3D3E' : '#F4F4F4',
                boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05)',
                borderRadius: '8px',
                boxSizing: 'border-box',
                borderWidth: '1px',
                borderColor: isContentEmptyError ? red[800] : 'transparent',
                borderStyle: 'solid',

                '& > textarea': {
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  width: '100%',
                  height: '100%',
                  resize: 'none',
                  color: 'text.primary',
                  lineHeight: '24px',
                  fontFamily: 'Roboto',
                  fontSize: '16px',
                },
              }}
            >
              <textarea
                ref={textareaRef}
                rows={10}
                onClick={(event) => {
                  event.stopPropagation()
                }}
                value={content}
                onChange={(e) => {
                  setIsContentEmptyError(false)
                  setContent(e.target.value)
                }}
                placeholder={t('client:floating_menu__textarea__placeholder')}
                autoFocus
              />
            </Box>
          </Box>
          <Stack direction={'row'} alignItems={'end'} gap={1}>
            <Stack
              direction={'row'}
              width={0}
              flex={1}
              alignItems={'center'}
              spacing={1}
              justifyContent={'left'}
            >
              <AutoHeightTextarea
                minLine={1}
                InputId=''
                stopPropagation
                autoFocus
                onKeydownCapture={(event) => {
                  if (
                    event.key === 'ArrowUp' ||
                    event.key === 'ArrowDown' ||
                    event.key === 'ArrowLeft' ||
                    event.key === 'ArrowRight'
                  ) {
                    matcher.onNavigate(event.key.slice(5) as any)
                    event.stopPropagation()
                    return true
                  }
                  return false
                }}
                onChange={(value) => {
                  setInputValue(value)
                }}
                expandNode={
                  <ChatIconFileUpload
                    TooltipProps={{
                      placement: 'bottom',
                      floatingMenuTooltip: false,
                    }}
                    direction={'column'}
                    size={'tiny'}
                    onChange={() => {
                      // TODO:
                      // if (!referenceElementRef.current) return
                      //
                      // referenceElementRef.current.style.marginLeft =
                      //   referenceElementRef.current.style.marginLeft
                      //     ? ''
                      //     : '1px'
                    }}
                  />
                }
                placeholder={t('client:floating_menu__input__placeholder')}
                sx={{
                  border: 'none',
                  '& > div': {
                    '& > div': { p: 0 },
                    '& > textarea': { p: 0 },
                    '& > .max-ai-user-input__expand': {
                      '&:has(> div)': {
                        pr: 1,
                      },
                    },
                  },
                  borderRadius: 0,
                  minHeight: '24px',
                }}
                onEnter={handleEnter}
              />
            </Stack>

            <MaxAIBetaFeatureWrapper betaFeatureName={'voice_input'}>
              <Box>
                <SidebarChatVoiceInputButton
                  sx={actionsBtnColorSxMemo}
                  onSpeechToText={(text) => {
                    setInputValue((prev) => prev + text)
                  }}
                />
              </Box>
            </MaxAIBetaFeatureWrapper>

            <TextOnlyTooltip
              floatingMenuTooltip={false}
              title={t('client:floating_menu__button__send_to_ai')}
              description={'⏎'}
              placement={'bottom-end'}
            >
              <IconButton
                sx={{
                  height: '28px',
                  width: '28px',
                  borderRadius: '8px',
                  flexShrink: 0,
                  alignSelf: 'end',
                  alignItems: 'center',
                  p: 0,
                  m: 0,
                  cursor: inputValue && content ? 'pointer' : 'default',
                  bgcolor: (t) =>
                    inputValue && content
                      ? 'primary.main'
                      : t.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.2)'
                      : 'rgb(219,219,217)',
                }}
                onClick={handleEnter}
              >
                <SendIcon sx={{ color: '#fff', fontSize: 16 }} />
              </IconButton>
            </TextOnlyTooltip>
          </Stack>
        </Box>
        <Box
          sx={{
            maxWidth: '768px',
            width: '100%',
            padding: '0 10px',
            boxSizing: 'border-box',
            height: '1px',
          }}
          id='SidebarContextMenu-reference-container'
          component={'div'}
          ref={boxRef}
        ></Box>
      </Box>
      <Box
        sx={{
          padding: '0 10px',
        }}
      >
        <ContextMenuList
          inputValue={inputValue}
          open
          defaultPlacement={'bottom-start'}
          needAutoUpdate
          root={root}
          menuList={contextWindowList}
          referenceElementRef={referenceElementRef}
          onClickContextMenu={handleContextMenuClick}
          referenceElement={
            <Box
              component={'div'}
              ref={referenceElementRef}
              data-test-id={'ContextMenuList-referenceElementRef'}
            />
          }
          matcher={matcher}
        />
      </Box>
    </>
  )
}

const useUpdate = () => {
  const [, update] = useState([])

  return () => {
    update([])
  }
}

export default SidebarContextMenu
