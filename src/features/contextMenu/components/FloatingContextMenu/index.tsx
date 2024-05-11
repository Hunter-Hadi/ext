import {
  autoUpdate,
  FloatingPortal,
  Placement,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
} from '@floating-ui/react'
import SendIcon from '@mui/icons-material/Send'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import React, { FC, useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useRecoilState } from 'recoil'

import AutoHeightTextarea from '@/components/AutoHeightTextarea'
import DevContent from '@/components/DevContent'
import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import { CHROME_EXTENSION_FLOATING_CONTEXT_MENU_MIN_WIDTH } from '@/constants'
import AIProviderModelSelectorButton from '@/features/chatgpt/components/AIProviderModelSelectorButton'
import ChatIconFileUpload from '@/features/chatgpt/components/ChatIconFileUpload'
import useClientConversationListener from '@/features/chatgpt/hooks/useClientConversationListener'
import {
  MAXAI_FLOATING_CONTEXT_MENU_INPUT_ID,
  MAXAI_FLOATING_CONTEXT_MENU_REFERENCE_ELEMENT_ID,
} from '@/features/common/constants'
import {
  FloatingContextWindowChangesState,
  useFloatingContextMenu,
} from '@/features/contextMenu'
import {
  FloatingContextMenuPopupSettingButton,
  FloatingContextMenuShortcutButtonGroup,
} from '@/features/contextMenu/components/FloatingContextMenu/buttons'
import FloatingContextMenuChatHistoryButton from '@/features/contextMenu/components/FloatingContextMenu/buttons/FloatingContextMenuChatHistoryButton'
import DiscardChangesModal from '@/features/contextMenu/components/FloatingContextMenu/DiscardChangesModal'
import FloatingContextMenuList from '@/features/contextMenu/components/FloatingContextMenu/FloatingContextMenuList'
import WritingMessageBox from '@/features/contextMenu/components/FloatingContextMenu/WritingMessageBox'
import WritingMessageBoxPagination from '@/features/contextMenu/components/FloatingContextMenu/WritingMessageBoxPagination'
import { useFloatingContextMenuDraftHistoryChange } from '@/features/contextMenu/hooks/useFloatingContextMenuDraft'
import useInitContextWindow, {
  focusContextWindowInput,
} from '@/features/contextMenu/hooks/useInitContextWindow'
import {
  cloneRect,
  getContextMenuRenderPosition,
  getFloatingContextMenuMiddleware,
} from '@/features/contextMenu/utils'
import ActionSetVariablesModal from '@/features/shortcuts/components/ActionSetVariablesModal'
import DevConsole from '@/features/sidebar/components/SidebarTabs/DevConsole'
import {
  closeGlobalVideoPopup,
  isGlobalVideoPopupOpen,
} from '@/features/video_popup/utils'
import { getMaxAIFloatingContextMenuRootElement } from '@/utils'

const isProduction = String(process.env.NODE_ENV) === 'production'

const FloatingContextMenu: FC<{
  root: any
}> = (props) => {
  const { root } = props
  const { t } = useTranslation(['common', 'client'])
  const { palette } = useTheme()
  const {
    loading,
    askAIWithContextWindow,
    inputValue,
    contextWindowList,
    isSettingCustomVariables,
    setIsSettingCustomVariables,
    setIsInputCustomVariables,
  } = useInitContextWindow()
  const {
    hideFloatingContextMenu,
    floatingDropdownMenu,
    setFloatingDropdownMenu,
  } = useFloatingContextMenu()
  const [contextWindowChanges, setContextWindowChanges] = useRecoilState(
    FloatingContextWindowChangesState,
  )
  const currentWidth = useMemo(() => {
    if (floatingDropdownMenu.rootRect) {
      const minWidth = Math.max(
        floatingDropdownMenu.rootRect?.width || 0,
        CHROME_EXTENSION_FLOATING_CONTEXT_MENU_MIN_WIDTH - 32,
      )
      if (minWidth > 1280) {
        return 1280
      }
      return minWidth
    }
    return CHROME_EXTENSION_FLOATING_CONTEXT_MENU_MIN_WIDTH - 32
  }, [floatingDropdownMenu.rootRect])
  const safePlacement = useMemo(() => {
    // 为了防止input+contextMenu出现遮挡了原本选中的字体，所以这里的方向其实要算input+contextMenu的高度
    // 1. 基于高亮块矩形计算出实际渲染input矩形的初始点xy位置
    // 2. 基于高亮块和input的y值判断input的渲染方向和contextMenu的渲染方向
    let inputPlacement: Placement = 'bottom-start'
    let contextMenuPlacement: Placement = 'bottom-start'
    if (floatingDropdownMenu.rootRect && currentWidth) {
      const position = getContextMenuRenderPosition(
        floatingDropdownMenu.rootRect,
        currentWidth,
        400,
      )
      console.log(
        '[ContextMenu Module]: [safePlacement]',
        position.x,
        floatingDropdownMenu.rootRect.left,
        '\n',
        position.y,
        floatingDropdownMenu.rootRect.y,
      )
      // 先看渲染在上方还是下方
      if (position.y > floatingDropdownMenu.rootRect.top) {
        // 说明渲染在下方
        inputPlacement = 'bottom-start'
        contextMenuPlacement = 'bottom-start'
      } else if (position.y < floatingDropdownMenu.rootRect.top) {
        inputPlacement = 'top-start'
        contextMenuPlacement = 'top-start'
      }
      // 再看渲染在左方还是右方
      if (position.x > floatingDropdownMenu.rootRect.left + 300) {
        // 说明渲染在右方 300是因为input宽度至少为450
        inputPlacement = 'right-start'
      } else if (position.x < floatingDropdownMenu.rootRect.left - 300) {
        // 说明渲染在左方 300是因为input宽度至少为450
        inputPlacement = 'left-start'
      }
    }
    return {
      inputPlacement,
      contextMenuPlacement,
    }
  }, [floatingDropdownMenu.rootRect, currentWidth])
  const referenceElementDragOffsetRef = useRef({
    prevX: 0,
    prevY: 0,
    x: 0,
    y: 0,
  })
  const { x, y, strategy, refs, context, update } = useFloating({
    open: floatingDropdownMenu.open,
    strategy: 'fixed',
    onOpenChange: (open, event, reason) => {
      if (reason === 'outside-press' || reason === 'escape-key') {
        if (isGlobalVideoPopupOpen()) {
          closeGlobalVideoPopup()
          return
        }
        if (reason === 'outside-press') {
          // 因为Floating ui会阻止事件冒泡，所以这里手动触发一次点击事件,让clickAwayListener生效
          const contextWindowRoot =
            getMaxAIFloatingContextMenuRootElement() as HTMLDivElement
          if (contextWindowRoot) {
            // mock click event
            const clickEvent = new MouseEvent('click', {
              view: window,
              bubbles: true,
              cancelable: true,
            })
            contextWindowRoot.dispatchEvent(clickEvent)
          }
        }
        console.log(
          `[ContextWindow] [FloatingContextMenu] [onOpenChange] [${reason}] [${contextWindowChanges.contextWindowMode}]`,
        )
        if (contextWindowChanges.contextWindowMode !== 'READ') {
          if (contextWindowChanges.contextWindowMode === 'LOADING') {
            // AI正在运行，不需要弹出确认框，不需要关闭
            return
          }
          // custom variables 的编辑模式下，需要特殊处理
          if (
            (contextWindowChanges.contextWindowMode === 'EDIT_VARIABLES' ||
              contextWindowChanges.contextWindowMode === 'EDITED_VARIABLES') &&
            reason === 'outside-press'
          ) {
            // 点击外部区域，不需要弹出确认框，因为这个时候用户可能是在复制内容
            return
          }
          if (
            contextWindowChanges.contextWindowMode === 'EDIT_VARIABLES' &&
            reason === 'escape-key'
          ) {
            // 按下esc键，不需要弹出确认框，直接关闭，因为用户没有做任何修改
            hideFloatingContextMenu()
            return
          }
          setContextWindowChanges((prev) => {
            return {
              ...prev,
              discardChangesModalVisible: true,
            }
          })
          return
        }
      }
      setFloatingDropdownMenu((prev) => {
        return {
          ...prev,
          open,
        }
      })
    },
    placement: safePlacement.inputPlacement,
    middleware: getFloatingContextMenuMiddleware(referenceElementDragOffsetRef),
    whileElementsMounted: autoUpdate,
  })
  const click = useClick(context)
  const dismiss = useDismiss(context, {
    capture: {
      escapeKey: true,
      outsidePress: true,
    },
  })
  const { getFloatingProps } = useInteractions([dismiss, click])
  /**
   * 拖拽移动实现
   */
  const isDragRef = React.useRef(false)
  const mouseStartRectRef = React.useRef<{
    x: number
    y: number
  } | null>(null)
  // const dragStartRef = React.useRef(false)
  const handleDragStart = (event: React.MouseEvent) => {
    event.preventDefault()
    isDragRef.current = true
    mouseStartRectRef.current = {
      x: event.clientX,
      y: event.clientY,
    }
  }
  const handleDragEnd = (event: MouseEvent) => {
    if (isDragRef.current) {
      event.preventDefault()
      isDragRef.current = false
      referenceElementDragOffsetRef.current = {
        x: 0,
        y: 0,
        prevX:
          referenceElementDragOffsetRef.current.x +
          referenceElementDragOffsetRef.current.prevX,
        prevY:
          referenceElementDragOffsetRef.current.y +
          referenceElementDragOffsetRef.current.prevY,
      }
    }
  }
  const handleDragMove = (event: MouseEvent) => {
    if (isDragRef.current) {
      event.preventDefault()
      const diffX = event.clientX - mouseStartRectRef.current!.x
      const diffY = event.clientY - mouseStartRectRef.current!.y
      referenceElementDragOffsetRef.current = {
        x: diffX,
        y: diffY,
        prevX: referenceElementDragOffsetRef.current.prevX,
        prevY: referenceElementDragOffsetRef.current.prevY,
      }
      update()
    }
  }
  useEffect(() => {
    if (!floatingDropdownMenu.open) {
      referenceElementDragOffsetRef.current = {
        x: 0,
        y: 0,
        prevX: 0,
        prevY: 0,
      }
    }
  }, [floatingDropdownMenu.open])
  useEffect(() => {
    document.addEventListener('mousemove', handleDragMove)
    document.addEventListener('mouseup', handleDragEnd)
    return () => {
      document.removeEventListener('mousemove', handleDragMove)
      document.removeEventListener('mouseup', handleDragEnd)
    }
  }, [])
  useClientConversationListener()
  useFloatingContextMenuDraftHistoryChange()
  // 选中区域高亮
  useEffect(() => {
    if (floatingDropdownMenu.rootRect) {
      const rect = cloneRect(floatingDropdownMenu.rootRect)
      console.log('[ContextMenu Module]: [useEffect]', rect)
      if (!isProduction) {
        // render rect
        document.querySelector('#rangeBorderBox')?.remove()
        const div = document.createElement('div')
        div.id = 'rangeBorderBox'
        div.style.position = 'absolute'
        div.style.left = rect.left + 'px'
        div.style.top = rect.top + window.scrollY + 'px'
        div.style.width = rect.width + 'px'
        div.style.height = rect.height + 'px'
        div.style.border = '1px solid green'
        div.style.zIndex = '9999'
        div.style.pointerEvents = 'none'
        document.body.appendChild(div)
      }
      refs.setPositionReference({
        getBoundingClientRect() {
          return rect
        },
      })
    }
  }, [floatingDropdownMenu.rootRect])
  return (
    <FloatingPortal root={root}>
      <div
        ref={refs.setFloating}
        {...getFloatingProps()}
        style={{
          position: strategy,
          zIndex: floatingDropdownMenu.open ? 2147483601 : -1,
          opacity: floatingDropdownMenu.open ? 1 : 0,
          top: y ?? 0,
          left: x ?? 0,
          width: currentWidth,
          maxWidth: '90vw',
        }}
        onKeyUp={(event) => {
          event.stopPropagation()
        }}
        onKeyDown={(event) => {
          if (event.key !== 'Escape') {
            event.stopPropagation()
          }
        }}
        id={MAXAI_FLOATING_CONTEXT_MENU_REFERENCE_ELEMENT_ID}
        aria-hidden={floatingDropdownMenu.open ? 'false' : 'true'}
      >
        {/*drag box*/}
        <Box
          sx={{
            position: 'absolute',
            width: '100%',
            // bgcolor: 'rgba(0,0,0,0.2)',
            zIndex: 10,
            cursor: 'grab',
            height: '20px',
          }}
          onMouseDown={handleDragStart}
        >
          <DevContent>
            <Typography fontSize={'14px'} color={'text.primary'}>
              {contextWindowChanges.contextWindowMode}(debug)
            </Typography>
          </DevContent>
        </Box>
        <FloatingContextMenuList
          customOpen
          defaultPlacement={safePlacement.contextMenuPlacement}
          needAutoUpdate
          hoverOpen={false}
          menuList={contextWindowList}
          referenceElementOpen={floatingDropdownMenu.open}
          referenceElement={
            <div
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
                padding: '7px 12px',
              }}
              onKeyPress={(event) => {
                event.stopPropagation()
              }}
            >
              {floatingDropdownMenu.open && (
                <DevContent>
                  <DevConsole />
                </DevContent>
              )}
              <WritingMessageBox />
              {floatingDropdownMenu.open && (
                <ActionSetVariablesModal
                  sx={{
                    mt: 2,
                  }}
                  onInputCustomVariable={() => {
                    setIsInputCustomVariables(true)
                  }}
                  onBeforeClose={() => {
                    if (
                      contextWindowChanges.contextWindowMode ===
                      'EDITED_VARIABLES'
                    ) {
                      setContextWindowChanges((prev) => {
                        return {
                          ...prev,
                          discardChangesModalVisible: true,
                        }
                      })
                      return false
                    }
                    return true
                  }}
                  onClose={(reason) => {
                    setIsSettingCustomVariables(false)
                    if (reason === 'close') {
                      hideFloatingContextMenu()
                    }
                  }}
                  onChange={(data, reason) => {
                    if (reason === 'runPromptStart') {
                      setIsInputCustomVariables(true)
                    } else if (reason === 'runPromptEnd') {
                      setIsInputCustomVariables(false)
                    }
                  }}
                  onShow={() => setIsSettingCustomVariables(true)}
                  modelKey={'FloatingContextMenu'}
                />
              )}
              <Stack width={'100%'} gap={0.5}>
                <Stack direction={'row'} alignItems={'end'} gap={1}>
                  <Stack
                    direction={'row'}
                    width={0}
                    flex={1}
                    alignItems={'center'}
                    spacing={1}
                    justifyContent={'left'}
                  >
                    {loading ? (
                      <>
                        <Typography fontSize={'16px'} color={'primary.main'}>
                          {t(
                            'client:floating_menu__input__running_placeholder',
                          )}
                        </Typography>
                        <CircularProgress size={'16px'} />
                      </>
                    ) : (
                      <>
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
                          expandNode={
                            floatingDropdownMenu.open && (
                              <ChatIconFileUpload
                                TooltipProps={{
                                  placement: safePlacement.contextMenuPlacement,
                                  floatingMenuTooltip: true,
                                }}
                                direction={'column'}
                                size={'tiny'}
                              />
                            )
                          }
                          placeholder={
                            floatingDropdownMenu.open
                              ? t('client:floating_menu__input__placeholder')
                              : ''
                          }
                          InputId={MAXAI_FLOATING_CONTEXT_MENU_INPUT_ID}
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
                            minHeight: isSettingCustomVariables ? 0 : '24px',
                            height: isSettingCustomVariables
                              ? '0!important'
                              : 'unset',
                            visibility: isSettingCustomVariables
                              ? 'hidden'
                              : 'visible',
                          }}
                          onEnter={askAIWithContextWindow}
                        />
                      </>
                    )}
                    {/*运行中的时候可用的快捷键 不放到loading里是因为effect需要持续运行*/}
                    <FloatingContextMenuShortcutButtonGroup />
                  </Stack>
                  <WritingMessageBoxPagination />
                </Stack>
                <Stack
                  direction={'row'}
                  justifyContent="space-between"
                  onClick={() => {
                    const textareaEl =
                      getMaxAIFloatingContextMenuRootElement()?.querySelector(
                        `#${MAXAI_FLOATING_CONTEXT_MENU_INPUT_ID}`,
                      ) as HTMLTextAreaElement
                    if (textareaEl) {
                      setTimeout(() => {
                        textareaEl?.focus()
                      }, 1)
                    }
                  }}
                >
                  {floatingDropdownMenu.open &&
                    floatingDropdownMenu.showModelSelector && (
                      <AIProviderModelSelectorButton
                        disabled={
                          !floatingDropdownMenu.open ||
                          !floatingDropdownMenu.showModelSelector
                        }
                        sidebarConversationType={'ContextMenu'}
                        size={'small'}
                      />
                    )}
                  {!loading && (
                    <Stack
                      direction={'row'}
                      alignItems="center"
                      gap={1}
                      ml={'auto'}
                      mr={0}
                    >
                      <FloatingContextMenuPopupSettingButton />
                      <Divider
                        orientation="vertical"
                        variant="middle"
                        flexItem
                        sx={{
                          my: 0.5,
                        }}
                      />
                      <FloatingContextMenuChatHistoryButton
                        TooltipProps={{
                          placement: safePlacement.contextMenuPlacement,
                          floatingMenuTooltip: true,
                        }}
                      />
                      <TextOnlyTooltip
                        floatingMenuTooltip
                        title={t('client:floating_menu__button__send_to_ai')}
                        description={'⏎'}
                        placement={safePlacement.contextMenuPlacement}
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
                            bgcolor: inputValue
                              ? 'primary.main'
                              : 'rgb(219,219,217)',
                            '&:hover': {
                              bgcolor: inputValue
                                ? 'primary.main'
                                : 'rgb(219,219,217)',
                            },
                          }}
                          onClick={askAIWithContextWindow}
                        >
                          <SendIcon sx={{ color: '#fff', fontSize: 16 }} />
                        </IconButton>
                      </TextOnlyTooltip>
                    </Stack>
                  )}
                </Stack>
              </Stack>
            </div>
          }
          root={root}
        />
      </div>
      <DiscardChangesModal
        type={
          contextWindowChanges.contextWindowMode === 'AI_RESPONSE'
            ? 'AI_RESPONSE'
            : 'USER_DRAFT'
        }
        open={contextWindowChanges.discardChangesModalVisible}
        onClose={(reason) => {
          if (reason === 'discard') {
            // discard changes
            hideFloatingContextMenu()
          } else if (reason === 'cancel') {
            focusContextWindowInput()
          }
          setContextWindowChanges((prev) => {
            return {
              ...prev,
              discardChangesModalVisible: false,
            }
          })
        }}
      />
    </FloatingPortal>
  )
}
export { FloatingContextMenu }
