import { autoUpdate, FloatingPortal, useFloating } from '@floating-ui/react'
import SendIcon from '@mui/icons-material/Send'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import React, { FC, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import AutoHeightTextarea from '@/components/AutoHeightTextarea'
import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import useClientChat from '@/features/chatgpt/hooks/useClientChat'
import { useContextMenuList } from '@/features/contextMenu'
import { getMaxAISidebarRootElement } from '@/utils'

import ContextMenuList from './MenuList'
import SidebarContextMenuTitlebar from './SidebarContextMenuTitlebar'

const SidebarContextMenu: FC = () => {
  const { t } = useTranslation(['common', 'client'])
  const { palette } = useTheme()

  const [content, setContent] = useState('')
  const contentRef = useRef('')
  contentRef.current = content
  const [inputValue, setInputValue] = useState('')
  const { contextMenuList: contextWindowList } = useContextMenuList(
    'textSelectPopupButton',
    inputValue,
  )
  const { askAIWIthShortcuts, loading } = useClientChat()

  /**
   * ✅
   * 通过context window的输入框来询问AI
   */
  const askAIWithContextWindow = async () => {
    if (inputValue.trim()) {
      // const template = `${inputValue}:\n"""\n${content}\n"""`
      // const conversationId = await createConversation('ContextMenu')
      // if (!conversationId) {
      //   throw Error('not conversationId')
      // }
      // const runActions: ISetActionsType = [
      //   {
      //     type: 'ASK_CHATGPT',
      //     parameters: {
      //       AskChatGPTActionQuestion: question as IUserChatMessage,
      //       isEnabledDetectAIResponseLanguage: false,
      //     },
      //   },
      // ]
    }
  }

  const referenceElementRef = useRef<HTMLDivElement>(null)

  const { x, y, refs, strategy } = useFloating({
    strategy: 'absolute',
    open: true,
    placement: 'bottom-start',
    whileElementsMounted: autoUpdate,
  })
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const root = useMemo(() => getMaxAISidebarRootElement(), [])

  return (
    <>
      <Box ref={refs.setReference} width={'100%'} maxWidth={'40vw'}></Box>
      <FloatingPortal root={root}>
        <Box
          ref={refs.setFloating}
          onKeyUp={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            if (e.key !== 'Escape') e.stopPropagation()
          }}
          width={'100%'}
          padding={'10px'}
          display={'flex'}
          justifyContent={'center'}
          sx={{
            position: strategy,
            zIndex: 10000,
            top: y ?? 0,
            left: x ?? 0,
            maxWidth: refs.reference.current?.getBoundingClientRect().width,
            boxSizing: 'border-box',
          }}
        >
          <ContextMenuList
            customOpen={!loading}
            defaultPlacement={'bottom-start'}
            needAutoUpdate
            hoverOpen={false}
            menuList={contextWindowList}
            referenceElementOpen
            referenceElementRef={referenceElementRef}
            onTextareaFocus={() => {
              textareaRef.current?.focus()
            }}
            onRunActions={(actions) => {
              return askAIWIthShortcuts(actions, {
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
            }}
            referenceElement={
              <Box
                ref={referenceElementRef}
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

                      '& > textarea': {
                        border: 'none',
                        outline: 'none',
                        background: 'transparent',
                        width: '100%',
                        height: '100%',
                        resize: 'none',
                        color: 'primary',
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
                      onChange={(e) => setContent(e.target.value)}
                      placeholder={t(
                        'client:floating_menu__textarea__placeholder',
                      )}
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
                      stopPropagation
                      // 在PDF页面下，AI返回内容loading由true变为false，input组件重新生成
                      // 输入内容menuList为空数组后会出现input失去焦点的问题
                      // 问题应该AutoHeightTextarea组件重新mount和DropdownMenu组件FloatingFocusManager unmount有关
                      // 没排查出具体的原因，但是加入以下autoFocus就解决了
                      autoFocus
                      onKeydownCapture={(event) => {
                        if (
                          event.key === 'ArrowUp' ||
                          event.key === 'ArrowDown'
                        ) {
                          // drop menu关闭，上下按键禁止冒泡处理，具体原因在DropdownMenu.tsx文件useInteractions方法注释
                          event.stopPropagation()
                          return true
                        }
                        return false
                      }}
                      onChange={(value) => {
                        setInputValue(value)
                      }}
                      placeholder={t(
                        'client:floating_menu__input__placeholder',
                      )}
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
                      onEnter={askAIWithContextWindow}
                    />
                  </Stack>

                  <TextOnlyTooltip
                    floatingMenuTooltip
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
                        cursor: inputValue ? 'pointer' : 'default',
                        bgcolor: (t) =>
                          inputValue
                            ? 'primary.main'
                            : t.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.2)'
                            : 'rgb(219,219,217)',
                      }}
                      onClick={askAIWithContextWindow}
                    >
                      <SendIcon sx={{ color: '#fff', fontSize: 16 }} />
                    </IconButton>
                  </TextOnlyTooltip>
                </Stack>
              </Box>
            }
          />
        </Box>
      </FloatingPortal>
    </>
  )
}

export default SidebarContextMenu
