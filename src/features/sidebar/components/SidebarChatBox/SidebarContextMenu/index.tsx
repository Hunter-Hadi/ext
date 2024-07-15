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
  const { askAIWIthShortcuts, askAIQuestion } = useClientChat()

  const handleEnter = async () => {
    if (inputValue.trim() && content) {
      const template = `${inputValue}:\n"""\n${content}\n"""`
      await askAIQuestion({
        type: 'user',
        text: template,
        meta: {
          includeHistory: true,
        },
      })
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
                onChange={(e) => setContent(e.target.value)}
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
                stopPropagation
                // autoFocus
                onKeydownCapture={(event) => {
                  if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
                    // 传递事件给referenceElement以响应快捷指令
                    referenceElementRef.current?.dispatchEvent(
                      new KeyboardEvent('keydown', {
                        code: event.code,
                        key: event.key,
                        bubbles: true,
                        cancelable: true,
                      }),
                    )
                    event.stopPropagation()
                    return true
                  }
                  return false
                }}
                onChange={(value) => {
                  setInputValue(value)
                }}
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
          }}
          ref={refs.setReference}
        ></Box>
      </Box>
      <FloatingPortal root={root}>
        <Box
          ref={refs.setFloating}
          width={'100%'}
          sx={{
            position: strategy,
            zIndex: 10000,
            top: y ?? 0,
            left: x ?? 0,
          }}
        >
          <ContextMenuList
            customOpen
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
            referenceElement={<Box ref={referenceElementRef} />}
          />
        </Box>
      </FloatingPortal>
    </>
  )
}

export default SidebarContextMenu
