import SendIcon from '@mui/icons-material/Send'
import { CircularProgress, Typography } from '@mui/material'
import Box from '@mui/material/Box'
import { red } from '@mui/material/colors'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { SxProps, Theme, useTheme } from '@mui/material/styles'
import { cloneDeep } from 'lodash-es'
import React, { FC, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import AutoHeightTextarea from '@/components/AutoHeightTextarea'
import MaxAIBetaFeatureWrapper from '@/components/MaxAIBetaFeatureWrapper'
import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import ChatIconFileUpload from '@/features/chatgpt/components/ChatIconFileUpload'
import useMaxAIModelUploadFile from '@/features/chatgpt/hooks/upload/useMaxAIModelUploadFile'
import useClientChat from '@/features/chatgpt/hooks/useClientChat'
import { MAXAI_SIDEBAR_CONTEXTMENU_INPUT_ID } from '@/features/common/constants'
import useUpdate from '@/features/common/hooks/useUpdate'
import { useContextMenuList } from '@/features/contextMenu'
import {
  contextMenuIsFavoriteContextMenu,
  FAVORITE_CONTEXT_MENU_GROUP_ID,
} from '@/features/contextMenu/hooks/useFavoriteContextMenuList'
import FavoriteMediatorFactory from '@/features/contextMenu/store/FavoriteMediator'
import { IContextMenuItem } from '@/features/contextMenu/types'
import {
  checkIsDraftContextMenuId,
  findDraftContextMenuById,
} from '@/features/contextMenu/utils'
import ActionSetVariablesModal, {
  ActionSetVariablesModalRef,
} from '@/features/shortcuts/components/ActionSetVariablesModal'
import TreeNavigatorMatcher from '@/features/sidebar/utils/treeNavigatorMatcher'
import { getMaxAISidebarRootElement } from '@/utils'

import SidebarChatVoiceInputButton from '../SidebarChatVoiceInputButton'
import ContextMenuList from './MenuList'
import SidebarContextMenuTitlebar from './SidebarContextMenuTitlebar'

const CONTEXT_MENU_MIN_HEIGHT = 200

const SidebarContextMenu: FC<{
  contentHeight: number
}> = ({ contentHeight }) => {
  const { t } = useTranslation(['common', 'client'])
  const { palette } = useTheme()
  const [loading, setLoading] = useState(false)

  const [content, setContent] = useState('')
  const contentRef = useRef('')
  contentRef.current = content
  const [inputValue, setInputValue] = useState('')
  const [isContentEmptyError, setIsContentEmptyError] = useState(false)
  const update = useUpdate()
  const matcher = useMemo(() => new TreeNavigatorMatcher(), [])
  matcher.onUpdate = update
  const [isSettingCustomVariables, setIsSettingCustomVariables] =
    useState(false)

  const { contextMenuList } = useContextMenuList(
    'textSelectPopupButton',
    inputValue,
  )
  const contextWindowList = useMemo(
    () => (isSettingCustomVariables ? [] : contextMenuList),
    [contextMenuList, isSettingCustomVariables],
  )

  const { uploadFilesToMaxAIModel, isContainMaxAIModelUploadFile } =
    useMaxAIModelUploadFile()

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
    const content = contentRef.current
    if (!content) {
      setIsContentEmptyError(true)
      return
    }

    if (matcher.path.length) {
      const menuItem = matcher.path[matcher.path.length - 1].item
      handleContextMenuClick(menuItem)
    } else if (inputValue.trim()) {
      const template = `${inputValue}:\n"""\n{{SELECTED_TEXT}}\n"""`

      await askAIQuestion(
        {
          type: 'user',
          text: template,
          meta: {
            includeHistory: true,
          },
        },
        {
          beforeActions: [
            {
              type: 'RENDER_TEMPLATE',
              parameters: {
                template: '{{POPUP_DRAFT}}',
              },
            },
            {
              type: 'SET_VARIABLE',
              parameters: {
                Variable: {
                  key: 'SELECTED_TEXT',
                  overwrite: true,
                  value: content,
                },
              },
            },
          ],
        },
      ).catch((err) => {
        console.log('handleEnter error: ', err)
      })
    }
  }

  const referenceElementRef = useRef<HTMLDivElement>(null)

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleContextMenuClick = async (menuItem: IContextMenuItem) => {
    // 没有内容的时候不能执行action
    const content = contentRef.current
    if (!content) {
      setIsContentEmptyError(true)
      return
    }
    if (!menuItem || !menuItem.id || menuItem.data.type === 'group') return

    // 去除suggest前缀
    const id = contextMenuIsFavoriteContextMenu(menuItem.id)
      ? menuItem.id.replace(FAVORITE_CONTEXT_MENU_GROUP_ID, '')
      : menuItem.id

    // 计入推荐favorite计数次数
    FavoriteMediatorFactory.getMediator('textSelectPopupButton')
      .favoriteContextMenu(menuItem)
      .catch()

    // NOTE: 后续用不到草稿的功能获取可以删除
    if (checkIsDraftContextMenuId(id)) {
      menuItem = findDraftContextMenuById(id) || menuItem
    }

    const runActions = cloneDeep(menuItem.data.actions || [])

    runActions.unshift({
      type: 'SET_VARIABLE',
      parameters: {
        Variable: {
          key: 'VARIABLE_MODAL_KEY',
          value: 'SidebarRewrite',
          overwrite: true,
          isBuiltIn: true,
        },
      },
    })

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

  const root = useMemo(() => getMaxAISidebarRootElement() || document.body, [])

  const [rows, setRows] = useState(10)

  // 10 行的高度为380，textarea的高度为240
  // 当高度不足的时候才会触发这个effect
  useEffect(() => {
    const newRows = Math.floor(
      (contentHeight - CONTEXT_MENU_MIN_HEIGHT - 140) / 24,
    )
    if (newRows <= 0) return

    setRows(Math.min(newRows, 10))
  }, [contentHeight])

  const contextMenuListHeight = useMemo(() => {
    return Math.min(contentHeight - 140 - rows * 24, 300)
  }, [contentHeight, rows])

  const actionModalRef = useRef<ActionSetVariablesModalRef>(null)

  return (
    <>
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
        <SidebarContextMenuTitlebar
          isSettingCustomVariable={isSettingCustomVariables}
          onClose={() => actionModalRef.current?.discard()}
        />

        {!isSettingCustomVariables && (
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
                rows={rows}
                onClick={(event) => {
                  event.stopPropagation()
                }}
                value={content}
                onChange={(e) => {
                  setIsContentEmptyError(false)
                  setContent(e.target.value)
                }}
                onKeyDown={(event) => {
                  // 直接跳转到AutoHeightTextarea而不是uploadFile
                  if (event.key.toLowerCase() === 'tab') {
                    const element = getMaxAISidebarRootElement()?.querySelector(
                      `#${MAXAI_SIDEBAR_CONTEXTMENU_INPUT_ID}`,
                    ) as HTMLTextAreaElement | undefined

                    element?.focus()
                    event.preventDefault()
                    event.stopPropagation()
                  }
                }}
                onPaste={async (ev) => {
                  ev.stopPropagation()
                  const clipboardFiles = Array.from(
                    ev.clipboardData?.items || [],
                  )
                    .map((dataItem) => dataItem.getAsFile?.())
                    .filter((file): file is File => file !== null)

                  if (isContainMaxAIModelUploadFile(clipboardFiles)) {
                    // 移除剪贴板的文本
                    ev.preventDefault()
                    // 粘贴处理
                    await uploadFilesToMaxAIModel(clipboardFiles).catch(
                      (err) => {
                        console.log('onPaste upload error', err)
                      },
                    )
                  }
                }}
                placeholder={t('client:floating_menu__textarea__placeholder')}
                autoFocus
              />
            </Box>
          </Box>
        )}

        <ActionSetVariablesModal
          ref={actionModalRef}
          showCloseButton={false}
          showDiscardButton={false}
          onChange={() => {
            setLoading(true)
          }}
          onClose={() => {
            setIsSettingCustomVariables(false)
          }}
          onShow={() => {
            setIsSettingCustomVariables(true)
          }}
          modelKey={'SidebarRewrite'}
        />
        {!isSettingCustomVariables && (
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
                InputId={MAXAI_SIDEBAR_CONTEXTMENU_INPUT_ID}
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
                    event.preventDefault()
                    event.stopPropagation()
                    return true
                  } else if (
                    event.shiftKey &&
                    event.key.toLowerCase() === 'tab'
                  ) {
                    textareaRef.current?.focus()
                    event.preventDefault()
                    event.stopPropagation()
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
                    onFilesChange={() => {
                      setTimeout(() => {
                        if (!referenceElementRef.current) return

                        referenceElementRef.current.style.marginLeft =
                          referenceElementRef.current.style.marginLeft
                            ? ''
                            : '1px'
                      }, 100)
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
        )}
        {loading && (
          <>
            <Typography fontSize={'16px'} color={'primary.main'}>
              {t('client:floating_menu__input__running_placeholder')}
            </Typography>
            <CircularProgress size={'16px'} />
          </>
        )}
      </Box>
      <Box
        sx={{
          maxWidth: '768px',
          width: '100%',
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
          maxHeight={`${contextMenuListHeight}px`}
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

/**
 * A auto resize warpper fro SidebarContextMenu
 */
const SidebarContextMenuWrapper = () => {
  const ref = useRef<HTMLDivElement>()
  const [height, setHeight] = useState(0)

  useEffect(() => {
    // ref.current.
    if (!ref.current) return

    setHeight(ref.current.clientHeight)
  }, [])

  useEffect(() => {
    const resizeHandler = () => {
      if (!ref.current) return

      setHeight(ref.current.clientHeight)
    }
    window.addEventListener('resize', resizeHandler)

    return () => window.removeEventListener('resize', resizeHandler)
  }, [])

  return (
    <Box
      ref={ref}
      component={'div'}
      width={'100%'}
      padding={'10px'}
      paddingBottom={0}
      flexGrow={1}
      display={'flex'}
      flexDirection={'column'}
      alignItems={'center'}
      sx={{
        boxSizing: 'border-box',
      }}
    >
      {!!height && <SidebarContextMenu contentHeight={height} />}
    </Box>
  )
}
export default SidebarContextMenuWrapper
