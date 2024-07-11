import SendIcon from '@mui/icons-material/Send'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import React, { FC, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import AutoHeightTextarea from '@/components/AutoHeightTextarea'
import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import useClientConversationListener from '@/features/chatgpt/hooks/useClientConversationListener'
import {
  useContextMenuList,
  useFloatingContextMenu,
} from '@/features/contextMenu'
import FloatingContextMenuList from '@/features/contextMenu/components/FloatingContextMenu/FloatingContextMenuList'
import {
  useFloatingContextMenuDraftHistoryChange,
} from '@/features/contextMenu/hooks/useFloatingContextMenuDraft'

import SidebarContextMenuTitlebar from './SidebarContextMenuTitlebar'

const SidebarContextMenu: FC = () => {
  const { t } = useTranslation(['common', 'client'])
  const { palette } = useTheme()

  const [inputValue, setInputValue] = useState('')
  const { contextMenuList: contextWindowList } = useContextMenuList(
    'textSelectPopupButton',
    inputValue,
  )

  const { floatingDropdownMenu } = useFloatingContextMenu()

  const askAIWithContextWindow = () => {}

  const referenceElementRef = useRef<HTMLDivElement>(null)

  useClientConversationListener()
  useFloatingContextMenuDraftHistoryChange()

  return (
    <>
      <Box
        onKeyUp={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key !== 'Escape') e.stopPropagation()
        }}
        width={'100%'}
        padding={'10px'}
        display={'flex'}
        justifyContent={'center'}
      >
        <FloatingContextMenuList
          customOpen
          defaultPlacement={'bottom-start'}
          needAutoUpdate
          hoverOpen={false}
          menuList={contextWindowList}
          referenceElementOpen={floatingDropdownMenu.open}
          referenceElementRef={referenceElementRef}
          referenceElement={
            <div
              ref={referenceElementRef}
              style={{
                boxSizing: 'border-box',
                border: '1px solid',
                borderColor: palette.customColor.borderColor,
                background: palette.customColor.paperBackground,
                borderRadius: '6px',
                boxShadow:
                  'rgb(15 15 15 / 5%) 0px 0px 0px 1px, rgb(15 15 15 / 10%) 0px 3px 6px, rgb(15 15 15 / 20%) 0px 9px 24px',
                overflow: 'hidden',
                isolation: 'isolate',
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                maxWidth: '40vw',
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

                    '& > textarea': {
                      border: 'none',
                      outline: 'none',
                      background: 'transparent',
                      width: '100%',
                      height: '100%',
                      resize: 'none',
                      // color: (t) => (t.palette.mode === 'dark' ? '#fff' : '#000'),
                      color: (t) =>
                        t.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.87)'
                          : 'rgba(0, 0, 0, 0.87)',
                      lineHeight: '24px',
                      // ? 'rgba(255, 255, 255, 0.60)'

                      fontSize: '16px',
                    },
                  }}
                >
                  <textarea
                    rows={10}
                    onClick={(event) => {
                      event.stopPropagation()
                    }}
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
                    autoFocus={floatingDropdownMenu.open}
                    onKeydownCapture={(event) => {
                      if (
                        floatingDropdownMenu.open &&
                        contextWindowList.length
                      ) {
                        // drop menu打开，不劫持组件内的onKeyDown行为
                        return false
                      }
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
                    placeholder={t('client:floating_menu__input__placeholder')}
                    // InputId={MAXAI_FLOATING_CONTEXT_MENU_INPUT_ID}
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
            </div>
          }
        />
      </Box>
      {/* <OnboardingTooltipPortal */}
      {/*   showStateTrigger={ */}
      {/*     floatingDropdownMenu.open && contextWindowList.length > 0 */}
      {/*   } */}
      {/*   sceneType='FLOATING_CONTEXT_MENU_LIST_BOX' */}
      {/* /> */}
      {/* {!loading && !isSettingCustomVariables ? ( */}
      {/*   <OnboardingTooltipPortal */}
      {/*     showStateTrigger={() => { */}
      {/*       return ( */}
      {/*         floatingDropdownMenu.open && */}
      {/*         !activeAIResponseMessage && */}
      {/*         !isSettingCustomVariables && */}
      {/*         contextWindowList.length > 0 && */}
      {/*         contextWindowList.some( */}
      {/*           (item) => item.id === '30f27496-1faf-4a00-87cf-b53926d35bfd', */}
      {/*         ) && */}
      {/*         // contextWindowList */}
      {/*         (currentFloatingContextMenuDraft === '' || inputValue.length > 0) */}
      {/*       ) */}
      {/*     }} */}
      {/*     sceneType='FLOATING_CONTEXT_MENU_INPUT_BOX' */}
      {/*   /> */}
      {/* ) : null} */}
      {/**/}
      {/* {!loading ? ( */}
      {/*   <OnboardingTooltipPortal */}
      {/*     showStateTrigger={ */}
      {/*       floatingDropdownMenu.open && */}
      {/*       !!activeAIResponseMessage && */}
      {/*       activeAIResponseMessage.type === 'ai' */}
      {/*     } */}
      {/*     sceneType='FLOATING_CONTEXT_MENU_INPUT_BOX_AFTER_AI_RESPONSE' */}
      {/*   /> */}
      {/* ) : null} */}
    </>
  )
}

export default SidebarContextMenu
