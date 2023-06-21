import {
  autoUpdate,
  FloatingPortal,
  Placement,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
} from '@floating-ui/react'
import React, { FC, useEffect, useMemo, useRef, useState } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import {
  FloatingContextMenuDraftState,
  FloatingDropdownMenuSelectedItemState,
  FloatingDropdownMenuState,
  FloatingDropdownMenuSystemItemsState,
} from '@/features/contextMenu/store'
import {
  checkIsDraftContextMenuId,
  cloneRect,
  findDraftContextMenuById,
  FloatingContextMenuMiddleware,
  getContextMenuRenderPosition,
  getDraftContextMenuTypeById,
} from '@/features/contextMenu/utils'
import AutoHeightTextarea from '@/components/AutoHeightTextarea'
import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import {
  CHROME_EXTENSION_USER_SETTINGS_DEFAULT_CHAT_BOX_WIDTH,
  ROOT_FLOATING_INPUT_ID,
  ROOT_FLOATING_REFERENCE_ELEMENT_ID,
} from '@/constants'
import {
  getAppContextMenuElement,
  getCurrentDomainHost,
  hideChatBox,
  isShowChatBox,
  showChatBox,
} from '@/utils'
import FloatingContextMenuList from '@/features/contextMenu/components/FloatingContextMenu/FloatingContextMenuList'
import { useShortCutsWithMessageChat } from '@/features/shortcuts/hooks/useShortCutsWithMessageChat'
import { useTheme } from '@mui/material/styles'
import {
  FloatingContextMenuCloseIconButton,
  FloatingContextMenuShortcutButtonGroup,
} from '@/features/contextMenu/components/FloatingContextMenu/buttons'
import { getMediator } from '@/store/mediator'
import { increaseChatGPTRequestCount } from '@/features/chatgpt/utils/chatRequestRecorder'
import WritingMessageBox from '@/features/chatgpt/components/chat/WritingMessageBox'
import {
  IContextMenuItem,
  IContextMenuItemWithChildren,
} from '@/features/contextMenu/types'
import {
  useRangy,
  useContextMenuList,
  useDraftContextMenuList,
} from '@/features/contextMenu/hooks'
import { useAuthLogin } from '@/features/auth'
import { ChatGPTClientState } from '@/features/chatgpt/store'
import { ISetActionsType } from '@/features/shortcuts/types/Action'
import Button from '@mui/material/Button'
import useCommands from '@/hooks/useCommands'
import { SidePanelIcon } from '@/components/CustomIcon'

const EMPTY_ARRAY: IContextMenuItemWithChildren[] = []
const isProduction = String(process.env.NODE_ENV) === 'production'

const FloatingContextMenu: FC<{
  root: any
}> = (props) => {
  const { root } = props
  const { palette } = useTheme()
  const { currentSelectionRef } = useRangy()
  const { shortCutKey } = useCommands()
  const [floatingDropdownMenu, setFloatingDropdownMenu] = useRecoilState(
    FloatingDropdownMenuState,
  )
  const [floatingContextMenuDraft, setFloatingContextMenuDraft] =
    useRecoilState(FloatingContextMenuDraftState)
  const { isLogin } = useAuthLogin()
  const chatGPTClient = useRecoilValue(ChatGPTClientState)
  // ai输出后，系统系统的建议菜单状态
  const [floatingDropdownMenuSystemItems, setFloatingDropdownMenuSystemItems] =
    useRecoilState(FloatingDropdownMenuSystemItemsState)
  // 是否有上下文，决定contextMenu展示的内容
  const haveContext = useMemo(
    () => floatingDropdownMenuSystemItems.lastOutput,
    [floatingDropdownMenuSystemItems.lastOutput],
  )
  const [
    floatingDropdownMenuSelectedItem,
    updateFloatingDropdownMenuSelectedItem,
  ] = useRecoilState(FloatingDropdownMenuSelectedItemState)
  const [actions, setActions] = useState<ISetActionsType>([])
  const prefActions = useRef<ISetActionsType>([])
  const currentWidth = useMemo(() => {
    if (floatingDropdownMenu.rootRect) {
      const minWidth = Math.max(
        floatingDropdownMenu.rootRect?.width || 0,
        CHROME_EXTENSION_USER_SETTINGS_DEFAULT_CHAT_BOX_WIDTH - 32,
      )
      if (minWidth > 1280) {
        return 1280
      }
      return minWidth
    }
    return CHROME_EXTENSION_USER_SETTINGS_DEFAULT_CHAT_BOX_WIDTH - 32
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
  const { x, y, strategy, refs, context } = useFloating({
    open: floatingDropdownMenu.open,
    onOpenChange: (open) => {
      setFloatingDropdownMenu((prev) => {
        return {
          ...prev,
          open,
        }
      })
    },
    placement: safePlacement.inputPlacement,
    middleware: FloatingContextMenuMiddleware,
    whileElementsMounted: autoUpdate,
  })
  const click = useClick(context)
  const dismiss = useDismiss(context, {})
  const { getFloatingProps } = useInteractions([dismiss, click])
  const [inputValue, setInputValue] = useState('')
  const {
    setShortCuts,
    runShortCuts,
    loading,
    reGenerate,
    shortCutsEngineRef,
  } = useShortCutsWithMessageChat('')
  const { contextMenuList, originContextMenuList } = useContextMenuList(
    'textSelectPopupButton',
    inputValue,
  )
  const draftContextMenuList = useDraftContextMenuList()
  // 渲染的菜单列表
  const memoMenuList = useMemo(() => {
    if (loading) {
      return EMPTY_ARRAY
    }
    if (haveContext) {
      return draftContextMenuList
    }
    return contextMenuList
  }, [loading, contextMenuList, haveContext, draftContextMenuList])
  useEffect(() => {
    console.log('Context Menu List', memoMenuList)
  }, [memoMenuList])
  const haveDraft = inputValue.length > 0
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
  // 更新最后hover的contextMenuId
  useEffect(() => {
    if (contextMenuList.length > 0) {
      let firstMenuItem: null | IContextMenuItemWithChildren = null
      contextMenuList.find((menuItem) => {
        if (menuItem.data.type === 'group') {
          if (menuItem.children.length > 0) {
            firstMenuItem =
              menuItem.children.find(
                (child: IContextMenuItemWithChildren) =>
                  child.data.type === 'shortcuts',
              ) || null
            return firstMenuItem !== null
          }
        } else if (menuItem.data.type === 'shortcuts') {
          firstMenuItem = menuItem
          return true
        }
        return false
      })
      if (firstMenuItem) {
        updateFloatingDropdownMenuSelectedItem((prev) => {
          return {
            ...prev,
            lastHoverContextMenuId: firstMenuItem?.id || '',
          }
        })
      }
    }
  }, [contextMenuList])
  /**
   * @description - 打开/关闭floating dropdown menu:
   * 1. 自动focus
   * 2. 清空最后一次的输出
   */
  useEffect(() => {
    if (floatingDropdownMenu.open) {
      getMediator('floatingMenuInputMediator').updateInputValue('')
      const textareaEl = getAppContextMenuElement()?.querySelector(
        `#${ROOT_FLOATING_INPUT_ID}`,
      ) as HTMLTextAreaElement
      if (textareaEl) {
        setTimeout(() => {
          textareaEl?.focus()
        }, 1)
      }
    }
    console.log('AIInput remove', floatingDropdownMenu.open)
  }, [floatingDropdownMenu.open])
  const focusInput = (event: KeyboardEvent) => {
    if (floatingDropdownMenu.open) {
      const textareaEl = getAppContextMenuElement()?.querySelector(
        `#${ROOT_FLOATING_INPUT_ID}`,
      ) as HTMLTextAreaElement
      if (textareaEl) {
        textareaEl?.focus()
        setTimeout(() => {
          textareaEl?.focus()
        }, 1)
      }
    }
  }
  const askChatGPT = (inputValue: string) => {
    if (inputValue.trim()) {
      let draft = floatingContextMenuDraft.draft
      const selectionElement = currentSelectionRef.current?.selectionElement
      if (selectionElement) {
        // 如果选中元素是可编辑元素，且没有选中文本，则清空草稿
        if (
          selectionElement.isEditableElement &&
          !selectionElement.editableElementSelectionText
        ) {
          draft = ''
        } else if (selectionElement.selectionText) {
          // 如果选中元素不是可编辑元素，且有选中文本，则使用选中文本作为草稿
          draft = '{{SELECTED_TEXT}}'
        }
      }
      setFloatingContextMenuDraft({
        draft: '',
        draftList: [],
      })
      let template = `${inputValue}`
      if (draft) {
        template += `:\n"""\n${draft}\n"""`
      }
      setActions([
        {
          type: 'RENDER_CHATGPT_PROMPT',
          parameters: {
            template,
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {},
        },
      ])
      // await increaseChatGPTRequestCount('prompt', )
    }
  }
  useEffect(() => {
    /**
     * @description - 运行快捷指令
     * 1. 必须有选中的id
     * 2. 必须有菜单列表
     * 3. contextMenu必须是打开状态
     * 4. 必须不是loading
     */
    if (
      floatingDropdownMenuSelectedItem.selectedContextMenuId &&
      originContextMenuList.length > 0 &&
      floatingDropdownMenu.open &&
      !loading
    ) {
      // 判断是否可以运行
      let needOpenChatBox = false
      // 是否为[草稿]菜单的动作
      const isDraftContextMenu = checkIsDraftContextMenuId(
        floatingDropdownMenuSelectedItem.selectedContextMenuId,
      )
      let currentContextMenu: IContextMenuItem | null = null
      if (!isLogin || chatGPTClient.status !== 'success') {
        needOpenChatBox = true
      }
      // 先从[草稿]菜单中查找
      if (isDraftContextMenu) {
        const draftContextMenu = findDraftContextMenuById(
          floatingDropdownMenuSelectedItem.selectedContextMenuId,
        )
        if (draftContextMenu) {
          currentContextMenu = draftContextMenu
        }
      } else {
        // 如果不是[草稿]菜单的动作，则从原始菜单中查找
        currentContextMenu =
          originContextMenuList.find(
            (contextMenu) =>
              contextMenu.id ===
              floatingDropdownMenuSelectedItem.selectedContextMenuId,
          ) || null
      }
      if (currentContextMenu && currentContextMenu.id) {
        const currentContextMenuId = currentContextMenu.id
        updateFloatingDropdownMenuSelectedItem(() => {
          return {
            selectedContextMenuId: null,
            hoverContextMenuIdMap: {},
            lastHoverContextMenuId: null,
          }
        })
        const runActions = currentContextMenu.data.actions || []
        if (runActions.length > 0) {
          increaseChatGPTRequestCount('prompt', {
            id: currentContextMenuId,
            name: currentContextMenu.text,
            host: getCurrentDomainHost(),
          }).then(() => {
            setActions(runActions)
          })
        } else {
          if (isDraftContextMenu) {
            if (needOpenChatBox) {
              showChatBox()
              setFloatingDropdownMenu({
                open: false,
                rootRect: null,
              })
              return
            }
            setFloatingDropdownMenuSystemItems((prev) => {
              return {
                ...prev,
                selectContextMenuId: currentContextMenu?.id || null,
              }
            })
            if (
              getDraftContextMenuTypeById(currentContextMenuId) === 'TRY_AGAIN'
            ) {
              reGenerate()
            }
            setTimeout(() => {
              setFloatingDropdownMenuSystemItems((prev) => {
                return {
                  ...prev,
                  selectContextMenuId: null,
                }
              })
            }, 100)
          }
        }
      }
    }
  }, [
    floatingDropdownMenuSelectedItem.selectedContextMenuId,
    originContextMenuList,
    floatingDropdownMenu.open,
    loading,
    chatGPTClient,
    isLogin,
    reGenerate,
  ])
  useEffect(() => {
    if (!loading && actions.length > 0) {
      setShortCuts(actions)
      setActions([])
      prefActions.current = actions
      // 是否为可编辑的元素
      const isEditableElement =
        currentSelectionRef.current?.selectionElement?.isEditableElement
      // 判断是否可以运行
      let needOpenChatBox = false
      if (!isLogin || chatGPTClient.status !== 'success') {
        needOpenChatBox = true
      }
      if (!isEditableElement || needOpenChatBox) {
        setFloatingDropdownMenu({
          open: false,
          rootRect: null,
        })
        showChatBox()
      }
      runShortCuts().then(() => {
        // done
        const error = shortCutsEngineRef.current?.getNextAction()?.error || ''
        if (error) {
          console.log('[ContextMenu Module] error', error)
          setFloatingDropdownMenu({
            open: false,
            rootRect: null,
          })
          // 如果出错了，则打开聊天框
          showChatBox()
        }
      })
    }
  }, [actions, loading, isLogin])
  useEffect(() => {
    getMediator('floatingMenuInputMediator').subscribe(setInputValue)
    return () => {
      getMediator('floatingMenuInputMediator').unsubscribe(setInputValue)
    }
  }, [])
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
        onKeyDown={(event) => {
          event.stopPropagation()
          // event.preventDefault()
          if (event.key.indexOf('Arrow') === -1) {
            focusInput(event as any)
          }
          if (event.key === 'Escape') {
            setFloatingDropdownMenu({
              open: false,
              rootRect: null,
            })
          }
          console.log(event.key)
        }}
        id={ROOT_FLOATING_REFERENCE_ELEMENT_ID}
        aria-hidden={floatingDropdownMenu.open ? 'false' : 'true'}
      >
        <FloatingContextMenuList
          defaultPlacement={safePlacement.contextMenuPlacement}
          needAutoUpdate
          menuList={memoMenuList}
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
              <WritingMessageBox />
              <Stack
                width={'100%'}
                direction={'row'}
                alignItems={'center'}
                gap={1}
              >
                <ContextMenuIcon
                  icon={'AutoAwesome'}
                  sx={{
                    flexShrink: 0,
                    color: 'primary.main',
                    height: '24px',
                    alignSelf: 'start',
                  }}
                />
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
                        AI is writing...
                      </Typography>
                      <CircularProgress size={'16px'} />
                    </>
                  ) : (
                    <AutoHeightTextarea
                      placeholder={'Ask AI to edit or generate...'}
                      stopPropagation={false}
                      InputId={ROOT_FLOATING_INPUT_ID}
                      sx={{
                        border: 'none',
                        '& textarea': { p: 0 },
                        borderRadius: 0,
                        minHeight: '24px',
                      }}
                      onEnter={(value) => {
                        if (contextMenuList.length > 0) {
                          updateFloatingDropdownMenuSelectedItem((preState) => {
                            return {
                              ...preState,
                              selectedContextMenuId:
                                preState.lastHoverContextMenuId,
                            }
                          })
                          return
                        }
                        askChatGPT(value)
                      }}
                    />
                  )}
                  {!loading && (
                    <>
                      <IconButton
                        sx={{
                          height: '20px',
                          width: '20px',
                          position: 'relative',
                          top: '-1px',
                          flexShrink: 0,
                          alignSelf: 'end',
                          alignItems: 'center',
                          p: 0,
                          m: '4px',
                          cursor: haveDraft ? 'pointer' : 'default',
                          bgcolor: haveDraft
                            ? 'primary.main'
                            : 'rgb(219,219,217)',
                          '&:hover': {
                            bgcolor: haveDraft
                              ? 'primary.main'
                              : 'rgb(219,219,217)',
                          },
                        }}
                        onClick={() => {
                          if (haveContext) {
                            askChatGPT(inputValue)
                          } else {
                            if (contextMenuList.length > 0) {
                              updateFloatingDropdownMenuSelectedItem(
                                (preState) => {
                                  return {
                                    ...preState,
                                    selectedContextMenuId:
                                      preState.lastHoverContextMenuId,
                                  }
                                },
                              )
                              return
                            }
                          }
                        }}
                      >
                        <ArrowUpwardIcon
                          sx={{
                            color: '#fff',
                            fontSize: 16,
                          }}
                        />
                      </IconButton>
                      <FloatingContextMenuCloseIconButton
                        useInButton={false}
                        sx={{ width: 24, height: 24, alignSelf: 'end' }}
                      />
                      <Button
                        sx={{
                          ml: '0px!important',
                          height: '24px',
                          flexShrink: 0,
                          alignSelf: 'end',
                          minWidth: 'unset',
                          padding: '6px 5px',
                        }}
                        variant="text"
                        onClick={() => {
                          if (isShowChatBox()) {
                            hideChatBox()
                          } else {
                            showChatBox()
                          }
                        }}
                      >
                        <SidePanelIcon
                          sx={{
                            fontSize: '16px',
                            color: 'text.primary',
                          }}
                        />
                        <Typography
                          component={'span'}
                          fontSize={'14px'}
                          color={'text.primary'}
                        >
                          <span
                            style={{
                              color: 'inherit',
                              fontSize: '12px',
                              marginLeft: '4px',
                            }}
                          >
                            {shortCutKey}
                          </span>
                        </Typography>
                      </Button>
                    </>
                  )}
                  {/*运行中的时候可用的快捷键 不放到loading里是因为effect需要持续运行*/}
                  <FloatingContextMenuShortcutButtonGroup />
                </Stack>
              </Stack>
            </div>
          }
          customOpen
          root={root}
        />
      </div>
    </FloatingPortal>
  )
}
export { FloatingContextMenu }
