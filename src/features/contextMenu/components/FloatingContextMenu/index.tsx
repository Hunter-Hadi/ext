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
import React, { CSSProperties, FC, useEffect, useMemo, useRef } from 'react'
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
import FloatingContextMenuContinueChatButton from '@/features/contextMenu/components/FloatingContextMenu/buttons/FloatingContextMenuContinueChatButton'
import DiscardChangesModal from '@/features/contextMenu/components/FloatingContextMenu/DiscardChangesModal'
import FloatingContextMenuList from '@/features/contextMenu/components/FloatingContextMenu/FloatingContextMenuList'
import FloatingContextMenuTitleBar from '@/features/contextMenu/components/FloatingContextMenu/FloatingContextMenuTitleBar'
import WritingMessageBox from '@/features/contextMenu/components/FloatingContextMenu/WritingMessageBox'
import WritingMessageBoxPagination from '@/features/contextMenu/components/FloatingContextMenu/WritingMessageBoxPagination'
import useFloatingContextMenuDraft, {
  useFloatingContextMenuDraftHistoryChange,
} from '@/features/contextMenu/hooks/useFloatingContextMenuDraft'
import useInitContextWindow, {
  focusContextWindowInput,
} from '@/features/contextMenu/hooks/useInitContextWindow'
import {
  cloneRect,
  getContextMenuRenderPosition,
  getFloatingContextMenuMiddleware,
} from '@/features/contextMenu/utils'
import useButtonClickedTracker from '@/features/mixpanel/hooks/useButtonClickedTracker'
import { OnboardingTooltipPortal } from '@/features/onboarding/components/OnboardingTooltip'
import ActionSetVariablesModal from '@/features/shortcuts/components/ActionSetVariablesModal'
import DevConsole from '@/features/sidebar/components/SidebarTabs/DevConsole'
import {
  closeGlobalVideoPopup,
  isGlobalVideoPopupOpen,
} from '@/features/video_popup/utils'
import { getMaxAIFloatingContextMenuRootElement } from '@/utils'

import ResizeAnchor from './ResizeAnchor'

const isProduction = String(process.env.NODE_ENV) === 'production'

const FloatingContextMenu: FC<{
  root: any
}> = (props) => {
  useButtonClickedTracker('floatingMenu')

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
    currentFloatingContextMenuDraft,
    activeAIResponseMessage,
    historyMessages,
  } = useFloatingContextMenuDraft()

  const {
    hideFloatingContextMenu,
    floatingDropdownMenu,
    floatingDropdownMenuPin,
    setFloatingDropdownMenu,
  } = useFloatingContextMenu()
  const [contextWindowChanges, setContextWindowChanges] = useRecoilState(
    FloatingContextWindowChangesState,
  )

  /**
   * 浮动窗口的宽度，有最小和最大限制
   */
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

  /**
   * 为了防止input+contextMenu出现遮挡了原本选中的字体，所以这里的方向其实要算input+contextMenu的高度
   * 1. 基于高亮块矩形计算出实际渲染input矩形的初始点xy位置
   * 2. 基于高亮块和input的y值判断input的渲染方向和contextMenu的渲染方向
   */
  const safePlacement = useMemo(() => {
    let inputPlacement: Placement = 'bottom-start'
    let contextMenuPlacement: Placement = 'bottom-start'
    if (floatingDropdownMenu.rootRect && currentWidth) {
      const position = getContextMenuRenderPosition(
        floatingDropdownMenu.rootRect,
        currentWidth,
        400,
      )
      // console.log(
      //   '[ContextMenu Module]: [safePlacement]',
      //   position.x,
      //   floatingDropdownMenu.rootRect.left,
      //   '\n',
      //   position.y,
      //   floatingDropdownMenu.rootRect.y,
      // )
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

  const referenceElementRef = useRef<HTMLDivElement>(null)
  const referenceElementDragOffsetRef = useRef({
    x: 0,
    y: 0,
    dragged: false,
  })

  const floatingSizeOffsetRef = useRef({
    dx: 0,
    dy: 0,
    minWidth: 0,
    defaultMinHeight: 230,
    defaultMaxHeight: 620,
    resized: false,
  })

  floatingSizeOffsetRef.current.minWidth = currentWidth

  const { x, y, strategy, refs, context, update } = useFloating({
    open: floatingDropdownMenu.open,
    strategy: 'fixed',
    onOpenChange: (open, _, reason) => {
      // TOOD 临时逻辑
      if (
        document
          .querySelector('#MAXAI_GLOBAL_VIDEO_POPUP_CONTAINER_ID')
          ?.shadowRoot?.querySelector('#MAX_AI_PRICING_MODAL')
      ) {
        return
      }
      if (reason !== 'escape-key' && floatingDropdownMenuPin) {
        // pin状态下只允许按esc主动退出
        return
      }
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
            hideFloatingContextMenu(true)
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
    middleware: getFloatingContextMenuMiddleware(
      referenceElementDragOffsetRef,
      referenceElementRef,
      floatingSizeOffsetRef,
    ),
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
  const lastMousePostionRef = React.useRef<{
    x: number
    y: number
  }>({
    x: 0,
    y: 0,
  })
  // const dragStartRef = React.useRef(false)
  const handleDragStart = (event: React.MouseEvent) => {
    event.preventDefault()
    isDragRef.current = true
    lastMousePostionRef.current = {
      x: event.clientX,
      y: event.clientY,
    }
  }

  useEffect(() => {
    if (!floatingDropdownMenu.open) {
      referenceElementDragOffsetRef.current = {
        x: 0,
        y: 0,
        dragged: false,
      }
      floatingSizeOffsetRef.current.dx = 0
      floatingSizeOffsetRef.current.dy = 0
      floatingSizeOffsetRef.current.resized = false

      update()
    }
  }, [floatingDropdownMenu.open])

  useEffect(() => {
    const handleDragEnd = (event: MouseEvent) => {
      if (isDragRef.current) {
        event.preventDefault()
        isDragRef.current = false
        // referenceElementDragOffsetRef.current = {
        //   x: referenceElementDragOffsetRef.current.x,
        //   y: referenceElementDragOffsetRef.current.y,
        //   dragged: true,
        // }
      }
    }

    const handleDragMove = (event: MouseEvent) => {
      if (isDragRef.current) {
        event.preventDefault()
        const dx = event.clientX - lastMousePostionRef.current.x
        const dy = event.clientY - lastMousePostionRef.current.y
        lastMousePostionRef.current.x = event.clientX
        lastMousePostionRef.current.y = event.clientY

        referenceElementDragOffsetRef.current = {
          x: referenceElementDragOffsetRef.current.x + dx,
          y: referenceElementDragOffsetRef.current.y + dy,
          dragged: true,
        }
        /**
         * FloatingContextMenuList里的MenuList绑定的是referenceElement的DOM元素位置关系
         * 当前这里每次拖动的时候修改的是MAXAI_FLOATING_CONTEXT_MENU_REFERENCE_ELEMENT_ID这个DOM
         * 所以拖拽的时候MenuList没有变化，这里简单的做法是触发一次DropdownMenu的更新修改referenceElement元素
         */
        if (referenceElementRef.current) {
          if (referenceElementRef.current.style.marginLeft) {
            referenceElementRef.current.style.marginLeft = ''
          } else {
            referenceElementRef.current.style.marginLeft = '0.5px'
          }
        }
        update()
      }
    }
    document.addEventListener('mousemove', handleDragMove)
    document.addEventListener('mouseup', handleDragEnd)
    return () => {
      document.removeEventListener('mousemove', handleDragMove)
      document.removeEventListener('mouseup', handleDragEnd)
    }
  }, [update, floatingDropdownMenu.open])
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
        Object.assign(div.style, {
          position: 'absolute',
          left: rect.left + 'px',
          top: rect.top + window.scrollY + 'px',
          width: rect.width + 'px',
          height: rect.height + 'px',
          border: '1px solid green',
          zIndex: '9999',
          pointerEvents: 'none',
        } as CSSProperties)
        document.body.appendChild(div)
      }

      refs.setPositionReference({
        getBoundingClientRect() {
          return rect
        },
      })
    }
  }, [floatingDropdownMenu.rootRect])

  const textareaPlaceholder = useMemo(() => {
    if (!floatingDropdownMenu.open) return ''

    return activeAIResponseMessage
      ? t('client:floating_menu__input__placeholder__after_ai_response')
      : t('client:floating_menu__input__placeholder')
  }, [t, floatingDropdownMenu.open, activeAIResponseMessage])

  const markdownBodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (refs.floating.current) {
      refs.floating.current.style.width = `${currentWidth}px`
    }
  }, [currentWidth])

  const handleResize = (dx: number, dy: number) => {
    floatingSizeOffsetRef.current.dx += dx
    floatingSizeOffsetRef.current.dy += dy
    floatingSizeOffsetRef.current.resized = true

    update()
  }

  return (
    <FloatingPortal root={root}>
      <div
        ref={refs.setFloating}
        id={MAXAI_FLOATING_CONTEXT_MENU_REFERENCE_ELEMENT_ID}
        onKeyUp={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key !== 'Escape') e.stopPropagation()
        }}
        style={{
          position: strategy,
          zIndex: floatingDropdownMenu.open ? 2147483601 : -1,
          opacity: floatingDropdownMenu.open ? 1 : 0,
          top: y ?? 0,
          left: x ?? 0,
          width: currentWidth,
        }}
        aria-hidden={floatingDropdownMenu.open ? 'false' : 'true'}
        {...getFloatingProps()}
      >
        {/* 当开始回答或有回答历史的时候一个调整大小 */}
        {(historyMessages.length !== 0 || loading) && (
          <ResizeAnchor onResize={handleResize} />
        )}

        <FloatingContextMenuList
          customOpen
          defaultPlacement={safePlacement.contextMenuPlacement}
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
                padding: '8px 12px',
              }}
              onKeyDown={(event) => {
                event.stopPropagation()
              }}
            >
              {/* 由于 直接把 onboarding tooltip 挂在 textarea 会导致 tooltip 位置显示不可控制（具体表现：出现不正确的 placement） */}
              {/* 所以这里创建一个元素来绑定 onboarding tooltip  位置 */}
              {loading || isSettingCustomVariables ? null : (
                <Box
                  id='ONBOARDING_TOOLTIP__FLOATING_CONTEXT_MENU_INPUT_BOX__REFERENCE_ELEMENT'
                  sx={{
                    width: 10,
                    height: 10,
                    // background: 'red',
                    position: 'absolute',
                    bottom: 48,
                    left: 0,
                    pointerEvents: 'none',
                    zIndex: -1,
                  }}
                />
              )}

              {/*drag box*/}
              <Box
                sx={{
                  position: 'absolute',
                  width: '100%',
                  left: 0,
                  top: 0,
                  cursor: 'grab',
                  height: '28px',
                }}
                onMouseDown={handleDragStart}
              >
                <DevContent>
                  <Typography fontSize={'14px'} color={'text.primary'}>
                    {contextWindowChanges.contextWindowMode}(debug)
                  </Typography>
                </DevContent>
              </Box>
              <FloatingContextMenuTitleBar />
              <WritingMessageBox markdownBodyRef={markdownBodyRef} />
              {floatingDropdownMenu.open && (
                <DevContent>
                  <DevConsole />
                </DevContent>
              )}
              {floatingDropdownMenu.open && (
                <ActionSetVariablesModal
                  sx={{
                    mt: 2,
                  }}
                  showCloseButton={false}
                  showDiscardButton={true}
                  onInputCustomVariable={({ data, variables }) => {
                    // 判断是否有输入内容的输入框，过滤系统参数
                    const isInput = variables?.some((variable) =>
                      variable.systemVariable
                        ? false
                        : data[variable.VariableName],
                    )
                    setIsInputCustomVariables(!!isInput)
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
                  onChange={(_, reason) => {
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
                          placeholder={textareaPlaceholder}
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
                  justifyContent='space-between'
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
                      alignItems='center'
                      gap={1}
                      ml={'auto'}
                      mr={0}
                    >
                      <FloatingContextMenuContinueChatButton />
                      <FloatingContextMenuPopupSettingButton />
                      <Divider
                        orientation='vertical'
                        variant='middle'
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
            hideFloatingContextMenu(true)
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

      <OnboardingTooltipPortal
        showStateTrigger={
          floatingDropdownMenu.open && contextWindowList.length > 0
        }
        sceneType='FLOATING_CONTEXT_MENU_LIST_BOX'
      />

      <OnboardingTooltipPortal
        showStateTrigger={
          floatingDropdownMenu.open && contextWindowList.length > 0
        }
        sceneType='FLOATING_CONTEXT_MENU_REPLACE_SELECTION_MENUITEM'
      />
      {!loading && !isSettingCustomVariables ? (
        <OnboardingTooltipPortal
          showStateTrigger={() => {
            return (
              floatingDropdownMenu.open &&
              !activeAIResponseMessage &&
              !isSettingCustomVariables &&
              contextWindowList.length > 0 &&
              contextWindowList.some(
                (item) => item.id === '30f27496-1faf-4a00-87cf-b53926d35bfd',
              ) &&
              // contextWindowList
              (currentFloatingContextMenuDraft === '' || inputValue.length > 0)
            )
          }}
          sceneType='FLOATING_CONTEXT_MENU_INPUT_BOX'
        />
      ) : null}
      {!loading ? (
        <OnboardingTooltipPortal
          showStateTrigger={
            floatingDropdownMenu.open &&
            !!activeAIResponseMessage &&
            activeAIResponseMessage.type === 'ai'
          }
          sceneType='FLOATING_CONTEXT_MENU_INPUT_BOX_AFTER_AI_RESPONSE'
        />
      ) : null}
    </FloatingPortal>
  )
}

export { FloatingContextMenu }
