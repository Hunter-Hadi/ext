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
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import {
  FloatingContextMenuDraftState,
  FloatingDropdownMenuLastFocusRangeState,
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
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import {
  CHROME_EXTENSION_USER_SETTINGS_DEFAULT_CHAT_BOX_WIDTH,
  ROOT_FLOATING_INPUT_ID,
  ROOT_FLOATING_REFERENCE_ELEMENT_ID,
} from '@/constants'
import { getAppContextMenuRootElement, showChatBox } from '@/utils'
import FloatingContextMenuList from '@/features/contextMenu/components/FloatingContextMenu/FloatingContextMenuList'
import { useShortCutsWithMessageChat } from '@/features/shortcuts/hooks/useShortCutsWithMessageChat'
import { useTheme } from '@mui/material/styles'
import {
  FloatingContextMenuOpenSidebarButton,
  FloatingContextMenuPopupSettingButton,
  FloatingContextMenuShortcutButtonGroup,
} from '@/features/contextMenu/components/FloatingContextMenu/buttons'
import { getMediator } from '@/store/InputMediator'
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
import cloneDeep from 'lodash-es/cloneDeep'
import FavoriteMediatorFactory from '@/features/contextMenu/store/FavoriteMediator'
import {
  contextMenuIsFavoriteContextMenu,
  contextMenuToFavoriteContextMenu,
  FAVORITE_CONTEXT_MENU_GROUP_ID,
} from '@/features/contextMenu/hooks/useFavoriteContextMenuList'
import ChatIconFileUpload from '@/features/chatgpt/components/ChatIconFileUpload'
import SendIcon from '@mui/icons-material/Send'
import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import AIProviderIconWithTooltip from '@/features/chatgpt/components/AIProviderSelectorCard/AIProviderIconWithTooltip'
import { getChromeExtensionSettings } from '@/background/utils'
import { AppSettingsState } from '@/store'
import { useTranslation } from 'react-i18next'

const EMPTY_ARRAY: IContextMenuItemWithChildren[] = []
const isProduction = String(process.env.NODE_ENV) === 'production'

const FloatingContextMenu: FC<{
  root: any
}> = (props) => {
  const { root } = props
  const { t } = useTranslation(['common', 'client'])
  const { palette } = useTheme()
  const { currentSelectionRef } = useRangy()
  const setAppSettings = useSetRecoilState(AppSettingsState)
  const [floatingDropdownMenu, setFloatingDropdownMenu] = useRecoilState(
    FloatingDropdownMenuState,
  )
  // 打开floatingMenu前最后的选区
  const setFloatingDropdownMenuLastFocusRange = useSetRecoilState(
    FloatingDropdownMenuLastFocusRangeState,
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
  // 记录最后选择的contextMenu并发送log
  const lastRecordContextMenuRef = useRef<IContextMenuItem | null>(null)
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
  const haveDraft = useMemo(() => {
    return inputValue.length > 0
  }, [inputValue])
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
    if (floatingDropdownMenu.open && contextMenuList.length > 0) {
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
  }, [contextMenuList, floatingDropdownMenu.open])
  useEffect(() => {
    if (
      floatingDropdownMenu.open &&
      floatingDropdownMenuSelectedItem.lastHoverContextMenuId
    ) {
      // 说明focus element在context menu
      console.log('测试 修改foucs')
      const textareaEl = getAppContextMenuRootElement()?.querySelector(
        `#${ROOT_FLOATING_INPUT_ID}`,
      ) as HTMLTextAreaElement
      if (textareaEl) {
        setTimeout(() => {
          textareaEl?.focus()
          setTimeout(() => {
            textareaEl?.focus()
          }, 4)
        }, 4)
      }
    }
  }, [
    floatingDropdownMenuSelectedItem.lastHoverContextMenuId,
    floatingDropdownMenu.open,
  ])
  /** 打开/关闭floating dropdown menu
   * @version 1.0 - 打开 dropdown menu:
   *    1. 自动focus
   *    2. 清空最后一次的输出
   *    3. 更新contextMenuList
   * @version 2.0 - 关闭 dropdown menu
   *    1. 将用户输入的内容同步到sidebar chat box
   */
  useEffect(() => {
    if (floatingDropdownMenu.open) {
      getMediator('floatingMenuInputMediator').updateInputValue('')
      const textareaEl = getAppContextMenuRootElement()?.querySelector(
        `#${ROOT_FLOATING_INPUT_ID}`,
      ) as HTMLTextAreaElement
      if (textareaEl) {
        setTimeout(() => {
          textareaEl?.focus()
        }, 1)
      }
      // 为了保证登陆后能直接用，需要先获取一次settings
      getChromeExtensionSettings().then((settings) => {
        setAppSettings(settings)
      })
    } else {
      const textareaEl = getAppContextMenuRootElement()?.querySelector(
        `#${ROOT_FLOATING_INPUT_ID}`,
      ) as HTMLTextAreaElement
      const userInputDraft = textareaEl?.value
      if (userInputDraft) {
        getMediator('chatBoxInputMediator').updateInputValue(userInputDraft)
      }
    }
    console.log('AIInput remove', floatingDropdownMenu.open)
  }, [floatingDropdownMenu.open])
  const focusInput = (event: KeyboardEvent) => {
    if (floatingDropdownMenu.open) {
      const textareaEl = getAppContextMenuRootElement()?.querySelector(
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
      const draft = floatingContextMenuDraft.draft
      let currentDraft = ''
      const selectionElement = currentSelectionRef.current?.selectionElement
      // 如果是可编辑元素
      // 1. 如果有可编辑元素, 有选中文本，且没有草稿, 则使用{{SELECTED_TEXT}}作为上下文
      // 2. 如果有可编辑元素, 有选中文本，且有草稿, 则使用草稿作为上下文
      // 3. 如果有可编辑元素, 没有选中文本，且没有草稿, 则使用空作为上下文
      // 4. 如果有可编辑元素, 没有选中文本，且有草稿, 则使用草稿作为上下文
      // 5. 如果不是可编辑元素，则不会有草稿，直接使用{{SELECTED_TEXT}}作为上下文
      if (selectionElement) {
        if (selectionElement.isEditableElement) {
          if (selectionElement.editableElementSelectionText) {
            if (!draft) {
              // 1.
              currentDraft = '{{SELECTED_TEXT}}'
            } else {
              // 2.
              currentDraft = draft
            }
          } else {
            if (!draft) {
              // 3.
              currentDraft = ''
            } else {
              // 4.
              currentDraft = draft
            }
          }
        } else {
          // 5.
          currentDraft = '{{SELECTED_TEXT}}'
        }
      }
      setFloatingContextMenuDraft((prev) => {
        return {
          draft: '',
          draftList: [],
        }
      })
      let template = `${inputValue}`
      if (currentDraft) {
        template += `:\n"""\n${currentDraft}\n"""`
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
      let currentSelectedId =
        floatingDropdownMenuSelectedItem.selectedContextMenuId
      // 是否为[推荐]菜单的动作
      let isSuggestedContextMenu = false
      // 判断是否可以运行
      let needOpenChatBox = false
      // 是否为[草稿]菜单的动作
      let isDraftContextMenu = false
      // 当前选中的contextMenu
      let currentContextMenu: IContextMenuItem | null = null
      // 如果是[推荐]菜单的动作，则需要去掉前缀
      if (contextMenuIsFavoriteContextMenu(currentSelectedId)) {
        currentSelectedId = currentSelectedId.replace(
          FAVORITE_CONTEXT_MENU_GROUP_ID,
          '',
        )
        isSuggestedContextMenu = true
      }
      // 如果没登录，或者chatGPTClient没有成功初始化，则需要打开chatbox
      if (!isLogin || chatGPTClient.status !== 'success') {
        needOpenChatBox = true
      }
      isDraftContextMenu = checkIsDraftContextMenuId(currentSelectedId)
      // 先从[草稿]菜单中查找
      if (isDraftContextMenu) {
        const draftContextMenu = findDraftContextMenuById(currentSelectedId)
        if (draftContextMenu) {
          currentContextMenu = draftContextMenu
        }
      } else {
        // 如果不是[草稿]菜单的动作，则从原始菜单中查找
        currentContextMenu =
          originContextMenuList.find(
            (contextMenu) => contextMenu.id === currentSelectedId,
          ) || null
      }
      if (currentContextMenu && currentContextMenu.id) {
        if (currentContextMenu.data.type === 'group') {
          // 如果是group菜单，则不运行
          return
        }
        // [草稿]菜单的action不计入favorite
        if (!isDraftContextMenu) {
          FavoriteMediatorFactory.getMediator('textSelectPopupButton')
            .favoriteContextMenu(currentContextMenu)
            .then()
            .catch()
        }
        // 如果是[推荐]菜单的动作，则需要转换为[草稿]菜单的动作
        if (isSuggestedContextMenu) {
          currentContextMenu =
            contextMenuToFavoriteContextMenu(currentContextMenu)
        }
        lastRecordContextMenuRef.current = currentContextMenu
        const currentContextMenuId = currentContextMenu.id
        const runActions = currentContextMenu.data.actions || []
        updateFloatingDropdownMenuSelectedItem(() => {
          return {
            selectedContextMenuId: null,
            hoverContextMenuIdMap: {},
            lastHoverContextMenuId: null,
          }
        })
        if (runActions.length > 0) {
          setActions(runActions)
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
    let runActions = cloneDeep(actions)
    if (actions.length > 0) {
      const lastRecordContextMenu = lastRecordContextMenuRef.current
      if (lastRecordContextMenu) {
        // 更新action的askChatGPT的参数
        runActions = runActions.map((action) => {
          // HACK: 这里的写法特别蠢，但是得记录正确的api和prompt，只能这么写
          if (action.type === 'INSERT_USER_INPUT') {
            if (!action.parameters.AskChatGPTActionMeta) {
              action.parameters.AskChatGPTActionMeta = {}
            }
            action.parameters.AskChatGPTActionMeta.contextMenu =
              lastRecordContextMenu
          }
          if (
            action.type === 'ASK_CHATGPT' ||
            action.type === 'WEBGPT_ASK_CHATGPT'
          ) {
            if (!action.parameters.AskChatGPTActionMeta) {
              action.parameters.AskChatGPTActionMeta = {}
            }
            action.parameters.AskChatGPTActionMeta.contextMenu =
              lastRecordContextMenu
            // 要在找到askChatGPT之后，才能清空，例如code或者enter prompt的场景
            lastRecordContextMenuRef.current = null
          }
          return action
        })
      }
      setShortCuts(runActions)
      setActions([])
      if (!lastRecordContextMenuRef.current) {
        // 如果没有lastRecordContextMenuRef， 说明本次运行了ask chatgpt，清空input
        getMediator('floatingMenuInputMediator').updateInputValue('')
      }
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
      setInputValue('')
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
  }, [actions, isLogin])
  useEffect(() => {
    const updateInputValue = (value: string, data: any) => {
      console.log('[ContextMenu Module] updateInputValue', value)
      // gmail的action触发了insertUserInput携带的参数需要正确的记录
      if (data && data?.contextMenu) {
        lastRecordContextMenuRef.current = data.contextMenu
      }
      setInputValue(value)
    }
    getMediator('floatingMenuInputMediator').subscribe(updateInputValue)
    return () => {
      getMediator('floatingMenuInputMediator').unsubscribe(updateInputValue)
    }
  }, [setInputValue])

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
          // console.log('测试div', event.key)
          // event.stopPropagation()
          // // event.preventDefault()
          // if (event.key.indexOf('Arrow') === -1) {
          //   focusInput(event as any)
          // }
          // if (event.key === 'Escape') {
          //   setFloatingDropdownMenu({
          //     open: false,
          //     rootRect: null,
          //   })
          //   setFloatingDropdownMenuLastFocusRange((prevState) => {
          //     if (prevState.range) {
          //       setTimeout(() => {
          //         window.getSelection()?.removeAllRanges()
          //         window.getSelection()?.addRange(prevState.range!)
          //       }, 100)
          //     }
          //     return {
          //       range: null,
          //     }
          //   })
          // }
          // console.log(event.key)
        }}
        onKeyUp={(event) => {
          event.stopPropagation()
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
                <AIProviderIconWithTooltip
                  TooltipProps={{
                    placement: safePlacement.contextMenuPlacement,
                    floatingMenuTooltip: true,
                  }}
                  size={16}
                  sx={{
                    flexShrink: 0,
                    p: '4px',
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
                        {t('client:floating_menu__input__running_placeholder')}
                      </Typography>
                      <CircularProgress size={'16px'} />
                    </>
                  ) : (
                    <AutoHeightTextarea
                      expandNode={
                        floatingDropdownMenu.open && (
                          <ChatIconFileUpload
                            TooltipProps={{
                              placement: safePlacement.contextMenuPlacement,
                              floatingMenuTooltip: true,
                            }}
                            sx={{
                              alignSelf: 'end',
                            }}
                            direction={'column'}
                            size={'tiny'}
                          />
                        )
                      }
                      placeholder={t(
                        'client:floating_menu__input__placeholder',
                      )}
                      InputId={ROOT_FLOATING_INPUT_ID}
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
                      onEnter={(value) => {
                        if (!haveContext && contextMenuList.length > 0) {
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
                      <TextOnlyTooltip
                        floatingMenuTooltip
                        title={t('client:floating_menu__button__send_to_ai')}
                        description={'⏎'}
                        placement={safePlacement.contextMenuPlacement}
                      >
                        <IconButton
                          sx={{
                            height: '24px',
                            width: '24px',
                            borderRadius: '4px',
                            flexShrink: 0,
                            alignSelf: 'end',
                            alignItems: 'center',
                            p: 0,
                            m: 0,
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
                            if (!haveContext && contextMenuList.length > 0) {
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
                            askChatGPT(inputValue)
                          }}
                        >
                          <SendIcon sx={{ color: '#fff', fontSize: 16 }} />
                        </IconButton>
                      </TextOnlyTooltip>
                      <FloatingContextMenuPopupSettingButton
                        sx={{ width: 24, height: 24, alignSelf: 'end' }}
                      />
                      <FloatingContextMenuOpenSidebarButton
                        TooltipProps={{
                          placement: safePlacement.contextMenuPlacement,
                          floatingMenuTooltip: true,
                        }}
                      />
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
