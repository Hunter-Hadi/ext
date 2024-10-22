import {
  autoUpdate,
  FloatingElement,
  FloatingPortal,
  Placement,
  ReferenceElement,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
} from '@floating-ui/react'
import SendIcon from '@mui/icons-material/Send'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { SxProps, Theme, useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import React, {
  CSSProperties,
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { useRecoilState } from 'recoil'

import AutoHeightTextarea from '@/components/AutoHeightTextarea'
import DevContent from '@/components/DevContent'
import MaxAIBetaFeatureWrapper from '@/components/MaxAIBetaFeatureWrapper'
import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import { CHROME_EXTENSION_FLOATING_CONTEXT_MENU_MIN_WIDTH } from '@/constants'
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
import { FloatingContextMenuShortcutButtonGroup } from '@/features/contextMenu/components/FloatingContextMenu/buttons'
import FloatingContextMenuContinueInSidebarButton from '@/features/contextMenu/components/FloatingContextMenu/buttons/FloatingContextMenuContinueInSidebarButton'
import DiscardChangesModal from '@/features/contextMenu/components/FloatingContextMenu/DiscardChangesModal'
import FloatingContextMenuList from '@/features/contextMenu/components/FloatingContextMenu/FloatingContextMenuList'
import FloatingContextMenuTitleBar from '@/features/contextMenu/components/FloatingContextMenu/FloatingContextMenuTitleBar'
import WritingMessageBox from '@/features/contextMenu/components/FloatingContextMenu/WritingMessageBox'
import WritingMessageBoxPagination from '@/features/contextMenu/components/FloatingContextMenu/WritingMessageBoxPagination'
import useContinueInSidebarListener from '@/features/contextMenu/hooks/useContinueInSidebarListener'
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
import SidebarChatVoiceInputButton from '@/features/sidebar/components/SidebarChatBox/SidebarChatVoiceInputButton'
import DevConsole from '@/features/sidebar/components/SidebarTabs/DevConsole'
import {
  closeGlobalVideoPopup,
  isGlobalVideoPopupOpen,
} from '@/features/video_popup/utils'
import { getBrowserZoom, getMaxAIFloatingContextMenuRootElement } from '@/utils'

import ContextText from './ContextText'
import ResizeAnchor, { IResizeDirType } from './ResizeAnchor'

const isProduction = String(process.env.NODE_ENV) === 'production'

const FloatingContextMenu: FC<{
  root?: HTMLElement
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
    activeMessageIndex,
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
   * 这里代表的是默认宽度
   */
  const defaultWidth = useMemo(() => {
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
    if (floatingDropdownMenu.rootRect && defaultWidth) {
      const position = getContextMenuRenderPosition(
        floatingDropdownMenu.rootRect,
        defaultWidth,
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
  }, [floatingDropdownMenu.rootRect, defaultWidth])

  const referenceElementRef = useRef<HTMLDivElement>(null)
  const referenceElementDragOffsetRef = useRef({
    x: 0,
    y: 0,
    dragged: false,
  })

  const [resizeDir, setResizeDir] = useState<IResizeDirType>()
  const floatingSizeOffsetRef = useRef({
    dx: 0,
    dy: 0,
    defaultWidth: 0,
    defaultMinWidth: 550,
    defaultMinHeight: 200,
    defaultMaxHeight: 620,
    resized: false,
    resizeDir: '',
    startWidth: 0,
    startHeight: 0,
    startLeft: 0,
    startRight: 0,
    startTop: 0,
    startBottom: 0,
  })

  floatingSizeOffsetRef.current.defaultWidth = defaultWidth

  const mountedAutoUpdate = useCallback(
    (
      reference: ReferenceElement,
      floating: FloatingElement,
      update: () => void,
    ) =>
      autoUpdate(reference, floating, update, {
        animationFrame: true,
      }),
    [],
  )

  // TODO 这样写有点问题，但是每次render调用可能会内存泄漏？后续要排查一下
  // const floatingMiddleware = useMemo(() => {
  //   return getFloatingContextMenuMiddleware(
  //     referenceElementDragOffsetRef,
  //     referenceElementRef,
  //     floatingSizeOffsetRef,
  //   )
  // }, [])

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
    whileElementsMounted: mountedAutoUpdate,
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
  const zoomRef = useRef(1)
  // const lastMousePostionRef = React.useRef<{
  //   x: number
  //   y: number
  // }>({
  //   x: 0,
  //   y: 0,
  // })
  // const dragStartRef = React.useRef(false)
  const handleDragStart = (event: React.MouseEvent) => {
    event.preventDefault()
    isDragRef.current = true
    zoomRef.current = getBrowserZoom()
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
      floatingSizeOffsetRef.current.resizeDir = ''
      update()
    }
  }, [floatingDropdownMenu.open])

  useEffect(() => {
    const handleDragEnd = (event: MouseEvent) => {
      if (isDragRef.current) {
        event.preventDefault()
        isDragRef.current = false
      }
    }

    const handleDragMove = (event: MouseEvent) => {
      if (!isDragRef.current) return

      const dx = event.movementX / zoomRef.current
      const dy = event.movementY / zoomRef.current

      referenceElementDragOffsetRef.current = {
        x: referenceElementDragOffsetRef.current.x + dx,
        y: referenceElementDragOffsetRef.current.y + dy,
        dragged: true,
      }
      /**
       * FloatingContextMenuList里的MenuList绑定的是referenceElement的DOM元素位置关系
       * 当前这里每次拖动的时候修改的是MAXAI_FLOATING_CONTEXT_MENU_REFERENCE_ELEMENT_ID这个DOM
       * 所以拖拽的时候MenuList没有变化，这里简单的做法是触发一次DropdownMenu的更新修改referenceElement元素
       *
       * floating-ui源码中只监听了resize、scroll以及这里要用到的IntersectionObserver，
       * 若想要更新后代元素，只能采用触发IntersectionObserver的margin change行为了
       * https://github.com/floating-ui/floating-ui/blob/81a7da464c713e3432d1015cafb7566675a22282/packages/dom/src/autoUpdate.ts#L139
       * IntersectionObserver MDN: https://developer.mozilla.org/zh-CN/docs/Web/API/IntersectionObserver
       */
      if (referenceElementRef.current) {
        if (referenceElementRef.current.style.marginLeft) {
          referenceElementRef.current.style.marginLeft = ''
        } else {
          referenceElementRef.current.style.marginLeft = '0.5px'
        }
      }
      // setTimeout(() => {
      update()
      // }, 10)
      event.preventDefault()
    }
    document.addEventListener('mousemove', handleDragMove)
    document.addEventListener('mouseup', handleDragEnd)
    return () => {
      document.removeEventListener('mousemove', handleDragMove)
      document.removeEventListener('mouseup', handleDragEnd)
    }
  }, [update, floatingDropdownMenu.open])
  useClientConversationListener(true)
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

  useEffect(() => {
    if (refs.floating.current) {
      refs.floating.current.style.width = `${defaultWidth}px`
    }
  }, [defaultWidth])

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

  useContinueInSidebarListener()

  const floatingPosition = useMemo(() => {
    switch (resizeDir) {
      case 'top-left':
      case 'left':
        return {
          right: floatingSizeOffsetRef.current.startRight,
          bottom: floatingSizeOffsetRef.current.startBottom,
        }
      case 'top-right':
      case 'top':
        return {
          left: floatingSizeOffsetRef.current.startLeft,
          bottom: floatingSizeOffsetRef.current.startBottom,
        }
      case 'bottom-left':
      case 'bottom':
        return {
          top: floatingSizeOffsetRef.current.startTop,
          right: floatingSizeOffsetRef.current.startRight,
        }
      case 'bottom-right':
      case 'right':
        return {
          top: floatingSizeOffsetRef.current.startTop,
          left: floatingSizeOffsetRef.current.startLeft,
        }
    }
    return {
      top: y ?? 0,
      left: x ?? 0,
    }
  }, [resizeDir, x, y])

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
          // top: y ?? 0,
          // left: x ?? 0,
          ...floatingPosition,
          width: defaultWidth,
        }}
        aria-hidden={floatingDropdownMenu.open ? 'false' : 'true'}
        {...getFloatingProps()}
      >
        {/* 当开始回答或有回答历史的时候可以调整大小 */}
        {(historyMessages.length !== 0 || loading) && (
          <ResizeAnchor
            onStart={(dir) => {
              // 记录下位置，让floating固定在四个角
              const startWidth = refs.floating.current?.clientWidth || 0
              const startHeight = refs.floating.current?.clientHeight || 0
              setResizeDir(dir)
              floatingSizeOffsetRef.current.startWidth = startWidth
              floatingSizeOffsetRef.current.startHeight = startHeight
              floatingSizeOffsetRef.current.startLeft = x
              floatingSizeOffsetRef.current.startRight =
                document.documentElement.clientWidth - (x + startWidth)
              floatingSizeOffsetRef.current.startTop = y
              floatingSizeOffsetRef.current.startBottom =
                document.documentElement.clientHeight - (y + startHeight)
            }}
            onResize={(dx, dy, dir) => {
              // 调整的时候只需要去改变宽高
              floatingSizeOffsetRef.current.dx = dx
              floatingSizeOffsetRef.current.dy = dy
              floatingSizeOffsetRef.current.resizeDir = dir
              floatingSizeOffsetRef.current.resized = true
              update()
            }}
            onStop={() => {
              // 调整完大小需要让floating ui的x, y重置成正确的内容
              // 这里通过设置dragRef让floating中间设置成正确的内容
              const endWidth = refs.floating.current?.clientWidth || 0
              const endHeight = refs.floating.current?.clientHeight || 0
              switch (resizeDir) {
                case 'top-left':
                case 'left': {
                  const newX =
                    document.documentElement.clientWidth -
                    (floatingSizeOffsetRef.current.startRight + endWidth)
                  const newY =
                    document.documentElement.clientHeight -
                    (floatingSizeOffsetRef.current.startBottom + endHeight)
                  referenceElementDragOffsetRef.current.x += newX - x
                  referenceElementDragOffsetRef.current.y += newY - y
                  break
                }
                case 'top-right':
                case 'top': {
                  const newY =
                    document.documentElement.clientHeight -
                    (floatingSizeOffsetRef.current.startBottom + endHeight)
                  referenceElementDragOffsetRef.current.y += newY - y
                  break
                }
                case 'bottom-left':
                case 'bottom': {
                  const newX =
                    document.documentElement.clientWidth -
                    (floatingSizeOffsetRef.current.startRight + endWidth)
                  referenceElementDragOffsetRef.current.x += newX - x
                  break
                }
                case 'bottom-right':
                case 'right':
                  break
              }
              referenceElementDragOffsetRef.current.dragged = true
              // floatingSizeOffsetRef.current.resized = false
              setResizeDir(undefined)
              update()
            }}
          />
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
            <Box
              ref={referenceElementRef}
              component='div'
              sx={{
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
              <FloatingContextMenuTitleBar
                showModelSelector={floatingDropdownMenu.showModelSelector}
              />

              {activeMessageIndex === -1 && !loading && <ContextText />}

              <WritingMessageBox />

              {floatingDropdownMenu.open && (
                <DevContent>
                  <DevConsole />
                </DevContent>
              )}

              {floatingDropdownMenu.open && (
                <ActionSetVariablesModal
                  showCloseButton={false}
                  showDiscardButton={false}
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

              {(!isSettingCustomVariables || loading) && (
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
                                    placement:
                                      safePlacement.contextMenuPlacement,
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

                    {!loading && (
                      <>
                        <FloatingContextMenuContinueInSidebarButton />
                        <MaxAIBetaFeatureWrapper
                          betaFeatureName={'voice_input'}
                        >
                          <Box>
                            <SidebarChatVoiceInputButton
                              sx={actionsBtnColorSxMemo}
                              inputMediator='floatingMenuInputMediator'
                            />
                          </Box>
                        </MaxAIBetaFeatureWrapper>

                        <TextOnlyTooltip
                          floatingMenuTooltip
                          title={t('client:floating_menu__button__send_to_ai')}
                          description={'⏎'}
                          placement={'bottom'}
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
                      </>
                    )}

                    <WritingMessageBoxPagination />
                  </Stack>
                </Stack>
              )}
            </Box>
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
