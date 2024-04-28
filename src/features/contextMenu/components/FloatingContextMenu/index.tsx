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
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import cloneDeep from 'lodash-es/cloneDeep'
import React, {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { useRecoilState, useSetRecoilState } from 'recoil'

import AutoHeightTextarea from '@/components/AutoHeightTextarea'
import DevContent from '@/components/DevContent'
import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import { CHROME_EXTENSION_FLOATING_CONTEXT_MENU_MIN_WIDTH } from '@/constants'
import { useAuthLogin } from '@/features/auth'
import AIProviderModelSelectorButton from '@/features/chatgpt/components/AIProviderModelSelectorButton'
import ChatIconFileUpload from '@/features/chatgpt/components/ChatIconFileUpload'
import useClientChat from '@/features/chatgpt/hooks/useClientChat'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import useClientConversationListener from '@/features/chatgpt/hooks/useClientConversationListener'
import {
  MAXAI_FLOATING_CONTEXT_MENU_INPUT_ID,
  MAXAI_FLOATING_CONTEXT_MENU_REFERENCE_ELEMENT_ID,
} from '@/features/common/constants'
import {
  FloatingContextMenuPopupSettingButton,
  FloatingContextMenuShortcutButtonGroup,
} from '@/features/contextMenu/components/FloatingContextMenu/buttons'
import FloatingContextMenuChatHistoryButton from '@/features/contextMenu/components/FloatingContextMenu/buttons/FloatingContextMenuChatHistoryButton'
import FloatingContextMenuList from '@/features/contextMenu/components/FloatingContextMenu/FloatingContextMenuList'
import WritingMessageBox from '@/features/contextMenu/components/FloatingContextMenu/WritingMessageBox'
import WritingMessageBoxPagination from '@/features/contextMenu/components/FloatingContextMenu/WritingMessageBoxPagination'
import { CONTEXT_MENU_DRAFT_TYPES } from '@/features/contextMenu/constants'
import {
  useContextMenuList,
  useDraftContextMenuList,
  useFloatingContextMenu,
  useRangy,
} from '@/features/contextMenu/hooks'
import {
  contextMenuIsFavoriteContextMenu,
  contextMenuToFavoriteContextMenu,
  FAVORITE_CONTEXT_MENU_GROUP_ID,
} from '@/features/contextMenu/hooks/useFavoriteContextMenuList'
import useFloatingContextMenuDraft, {
  useFloatingContextMenuDraftHistoryChange,
} from '@/features/contextMenu/hooks/useFloatingContextMenuDraft'
import {
  FloatingDropdownMenuSelectedItemState,
  FloatingDropdownMenuState,
  FloatingDropdownMenuSystemItemsState,
} from '@/features/contextMenu/store'
import FavoriteMediatorFactory from '@/features/contextMenu/store/FavoriteMediator'
import {
  IContextMenuItem,
  IContextMenuItemWithChildren,
} from '@/features/contextMenu/types'
import {
  checkIsDraftContextMenuId,
  cloneRect,
  findDraftContextMenuById,
  FloatingContextMenuMiddleware,
  getContextMenuRenderPosition,
  getDraftContextMenuTypeById,
  isFloatingContextMenuVisible,
} from '@/features/contextMenu/utils'
import ActionSetVariablesModal from '@/features/shortcuts/components/ActionSetVariablesModal'
import { ISetActionsType } from '@/features/shortcuts/types/Action'
import DevConsole from '@/features/sidebar/components/SidebarTabs/DevConsole'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import { showChatBox } from '@/features/sidebar/utils/sidebarChatBoxHelper'
import { AppDBStorageState } from '@/store'
import { getInputMediator } from '@/store/InputMediator'
import {
  getMaxAIFloatingContextMenuRootElement,
  getMaxAISidebarRootElement,
} from '@/utils'
import clientGetLiteChromeExtensionDBStorage from '@/utils/clientGetLiteChromeExtensionDBStorage'
import { getCurrentDomainHost } from '@/utils/dataHelper/websiteHelper'

const EMPTY_ARRAY: IContextMenuItemWithChildren[] = []
const isProduction = String(process.env.NODE_ENV) === 'production'

const detectHasContextWindowDraftActions: ISetActionsType = [
  {
    type: 'RENDER_TEMPLATE',
    parameters: {
      template: '{{POPUP_DRAFT}}',
    },
  },
  {
    type: 'SCRIPTS_CONDITIONAL',
    parameters: {
      WFCondition: 'Equals',
      WFFormValues: {
        Value: '',
        WFSerializationType: 'WFDictionaryFieldValue',
      },
      WFConditionalIfTrueActions: [],
      WFConditionalIfFalseActions: [
        // 说明有草稿, 加到variables中
        {
          type: 'SET_VARIABLE',
          parameters: {
            Variable: {
              value: '{{POPUP_DRAFT}}',
              label: 'Draft',
              key: 'POPUP_DRAFT',
              overwrite: true,
              isBuiltIn: false,
            },
          },
        },
      ],
    },
  },
]

const FloatingContextMenu: FC<{
  root: any
}> = (props) => {
  const { root } = props
  const { t } = useTranslation(['common', 'client'])
  const { palette } = useTheme()
  const { currentSelectionRef, hideRangy } = useRangy()
  const {
    askAIWIthShortcuts,
    askAIQuestion,
    regenerate,
    stopGenerate,
    checkAttachments,
  } = useClientChat()
  const {
    conversationStatus,
    currentConversationId,
    createConversation,
    currentConversationIdRef,
    getConversation,
    resetConversation,
  } = useClientConversation()
  const { continueConversationInSidebar } = useSidebarSettings()
  const currentHostRef = useRef(getCurrentDomainHost())
  const { clientWritingMessage } = useClientConversation()
  const setAppDBStorage = useSetRecoilState(AppDBStorageState)
  const { hideFloatingContextMenu } = useFloatingContextMenu()
  const [floatingDropdownMenu, setFloatingDropdownMenu] = useRecoilState(
    FloatingDropdownMenuState,
  )
  const {
    currentFloatingContextMenuDraft,
    floatingContextMenuDraftMessageIdRef,
  } = useFloatingContextMenuDraft()
  useFloatingContextMenuDraftHistoryChange()
  const { isLogin } = useAuthLogin()
  const [isSettingVariables, setIsSettingVariables] = useState(false)

  /**
   * 因为在设置完Variables之后，不会立刻loading,这样会导致ContextMenu闪烁
   * 所以要延迟一下等待loading变成true
   */
  const [isSettingVariablesMemo, setIsSettingVariablesMemo] = useState(false)
  useEffect(() => {
    let timer: null | ReturnType<typeof setTimeout> = null
    if (isSettingVariables) {
      setIsSettingVariablesMemo(true)
    } else {
      timer = setTimeout(() => {
        setIsSettingVariablesMemo(false)
      }, 200)
    }
    return () => {
      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [isSettingVariables])
  // ai输出后，系统系统的建议菜单状态
  const [floatingDropdownMenuSystemItems, setFloatingDropdownMenuSystemItems] =
    useRecoilState(FloatingDropdownMenuSystemItemsState)
  // 判断是不是从sidebar的use prompt的按钮点击触发的actions
  const isContextMenuFromSidebar = useCallback(() => {
    const activeElement =
      currentSelectionRef.current?.activeElement ||
      currentSelectionRef.current?.selectionElement?.target
    return (
      activeElement && getMaxAISidebarRootElement()?.contains(activeElement)
    )
  }, [])
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
  const { loading, shortCutsEngine } = useClientChat()
  const { contextMenuList, originContextMenuList } = useContextMenuList(
    'textSelectPopupButton',
    inputValue,
  )
  const draftContextMenuList = useDraftContextMenuList()
  // 渲染的菜单列表
  const memoMenuList = useMemo(() => {
    if (loading || isSettingVariablesMemo) {
      return EMPTY_ARRAY
    }
    if (haveContext) {
      return draftContextMenuList
    }
    return contextMenuList
  }, [
    isSettingVariablesMemo,
    loading,
    contextMenuList,
    haveContext,
    draftContextMenuList,
  ])
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
    if (floatingDropdownMenu.open && memoMenuList.length > 0) {
      let firstMenuItem: null | IContextMenuItemWithChildren = null
      memoMenuList.find((menuItem) => {
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
  }, [memoMenuList, floatingDropdownMenu.open])
  /** 打开/关闭floating dropdown menu
   * @version 1.0 - 打开 dropdown menu:
   *    1. 自动focus
   *    2. 清空最后一次的输出
   *    3. 更新contextMenuList
   * @version 2.0 - 关闭 dropdown menu
   *    1. 将用户输入的内容同步到sidebar chat box
   */
  const isCreatingConversationRef = useRef(false)
  const isAIRespondingRef = useRef(false)
  // 因为有可能是在floatingContextMenu输出中的时候不小心关了，并且结束了。
  // 所以创建时机应该是floatingContextMenu关闭且没有conversationId的时候
  useEffect(() => {
    isAIRespondingRef.current = clientWritingMessage.loading
  }, [clientWritingMessage.loading])
  useEffect(() => {
    if (floatingDropdownMenu.open) {
      getInputMediator('floatingMenuInputMediator').updateInputValue('')
      const textareaEl =
        getMaxAIFloatingContextMenuRootElement()?.querySelector(
          `#${MAXAI_FLOATING_CONTEXT_MENU_INPUT_ID}`,
        ) as HTMLTextAreaElement
      if (textareaEl) {
        setTimeout(() => {
          textareaEl?.focus()
        }, 1)
      }
      // 为了保证登陆后能直接用，需要先获取一次settings
      clientGetLiteChromeExtensionDBStorage().then((settings) => {
        setAppDBStorage(settings)
      })
    } else {
      setIsSettingVariables(false)
      const textareaEl =
        getMaxAIFloatingContextMenuRootElement()?.querySelector(
          `#${MAXAI_FLOATING_CONTEXT_MENU_INPUT_ID}`,
        ) as HTMLTextAreaElement
      const userInputDraft = textareaEl?.value
      if (userInputDraft) {
        getInputMediator('chatBoxInputMediator').updateInputValue(
          userInputDraft,
        )
      }
    }
    const createContextMenuConversation = async () => {
      if (currentConversationIdRef.current) {
        isCreatingConversationRef.current = true
        await resetConversation()
        const conversation = await getConversation(
          currentConversationIdRef.current,
        )
        if (conversation) {
          await createConversation(
            conversation?.type,
            conversation?.meta.AIProvider,
            conversation?.meta.AIModel,
          )
            .catch()
            .finally(() => {
              isCreatingConversationRef.current = false
            })
          return
        }
      }
      await createConversation('ContextMenu')
        .catch()
        .finally(() => {
          isCreatingConversationRef.current = false
        })
    }
    if (!isAIRespondingRef.current && !floatingDropdownMenu.open) {
      createContextMenuConversation().catch()
    }
    console.log('AIInput remove', floatingDropdownMenu.open)
  }, [floatingDropdownMenu.open])
  useEffect(() => {
    if (!clientWritingMessage.loading) {
      if (isFloatingContextMenuVisible()) {
        const textareaEl =
          getMaxAIFloatingContextMenuRootElement()?.querySelector(
            `#${MAXAI_FLOATING_CONTEXT_MENU_INPUT_ID}`,
          ) as HTMLTextAreaElement
        if (textareaEl) {
          setTimeout(() => {
            textareaEl?.focus()
          }, 1)
        }
      }
    }
  }, [clientWritingMessage.loading])
  const askChatGPT = async (inputValue: string) => {
    if (inputValue.trim()) {
      const draft = currentFloatingContextMenuDraft
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
          currentDraft = '{{SELECTED_TEXT}}\n{{POPUP_DRAFT}}'
        }
      }
      let template = `${inputValue}`
      if (currentDraft) {
        template += `:\n"""\n${currentDraft}\n"""`
      }
      await askAIQuestion(
        {
          type: 'user',
          text: template,
        },
        {
          beforeActions: detectHasContextWindowDraftActions,
        },
      )
    }
  }
  const regenerateRef = useRef(regenerate)
  const stopGenerateRef = useRef(stopGenerate)
  useEffect(() => {
    regenerateRef.current = regenerate
    stopGenerateRef.current = stopGenerate
  }, [regenerate, stopGenerate])
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
      if (!isLogin || conversationStatus !== 'success') {
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
        const runActions: ISetActionsType = cloneDeep(
          currentContextMenu.data.actions || [],
        )
        // 如果是[草稿-续写]菜单的动作, 需要加上当前focus的messageId, 配合CONTINUE_WRITING的Actions
        if (
          currentContextMenu.id === CONTEXT_MENU_DRAFT_TYPES.CONTINUE_WRITING
        ) {
          runActions.unshift({
            type: 'RENDER_TEMPLATE',
            parameters: {
              template: floatingContextMenuDraftMessageIdRef.current || '',
            },
          })
        }
        updateFloatingDropdownMenuSelectedItem(() => {
          return {
            selectedContextMenuId: null,
            hoverContextMenuIdMap: {},
            lastHoverContextMenuId: null,
          }
        })

        if (
          currentContextMenu.id === CONTEXT_MENU_DRAFT_TYPES.CONTINUE_IN_CHAT &&
          currentConversationIdRef.current
        ) {
          continueConversationInSidebar(
            currentConversationIdRef.current,
            {
              type: 'Chat',
            },
            true,
          )
            .then()
            .catch()
          return
        }

        if (runActions.length > 0) {
          setActions(runActions)
        } else {
          if (isDraftContextMenu) {
            if (needOpenChatBox) {
              showChatBox()
              hideFloatingContextMenu()
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
              stopGenerateRef.current().then(() => {
                regenerateRef.current()
              })
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
    conversationStatus,
    isLogin,
  ])
  const isRunningActionsRef = useRef(false)
  useEffect(() => {
    if (isRunningActionsRef.current) {
      return
    }
    if (!currentConversationId) {
      return
    }
    const runActions = cloneDeep(actions)
    // 如果有动作，并且sidebar是Chat或者是从Sidebar触发的prompt才运行
    console.log(`isContextMenuFromSidebar`, isContextMenuFromSidebar())
    if (actions.length > 0) {
      isRunningActionsRef.current = true
      setActions([])
      const lastRecordContextMenu = lastRecordContextMenuRef.current
      if (lastRecordContextMenu) {
        // 要在找到askChatGPT之后，才能清空，例如code或者enter prompt的场景
        lastRecordContextMenuRef.current = null
      }
      if (!lastRecordContextMenuRef.current) {
        // 如果没有lastRecordContextMenuRef， 说明本次运行了ask chatgpt，清空input
        getInputMediator('floatingMenuInputMediator').updateInputValue('')
      }
      // 判断是否可以运行
      let needOpenChatBox = false
      if (!isLogin || conversationStatus !== 'success') {
        needOpenChatBox = true
      }
      if (needOpenChatBox) {
        hideFloatingContextMenu()
        showChatBox()
      }
      setInputValue('')
      const selectionElement = currentSelectionRef.current?.selectionElement
      if (lastRecordContextMenu) {
        // 运行前需要检测文件
        checkAttachments()
          .then((status) => {
            if (!status) {
              return
            }
            return askAIWIthShortcuts(
              detectHasContextWindowDraftActions.concat(runActions),
              {
                overwriteParameters: selectionElement?.selectionText
                  ? [
                      {
                        key: 'SELECTED_TEXT',
                        value: selectionElement.selectionText,
                        label: 'Selected text',
                        isBuiltIn: true,
                        overwrite: true,
                      },
                    ]
                  : [],
              },
            ).then(() => {
              // done
              const error = shortCutsEngine?.getNextAction()?.error || ''
              if (error) {
                console.log('[ContextMenu Module] error', error)
                hideFloatingContextMenu()
                // 如果出错了，则打开聊天框
                showChatBox()
              }
            })
          })
          .catch()
          .finally(() => {
            isRunningActionsRef.current = false
            hideRangy(false)
          })
      }
    }
  }, [
    actions,
    isLogin,
    checkAttachments,
    askAIWIthShortcuts,
    currentConversationId,
  ])
  useEffect(() => {
    const updateInputValue = (value: string, data: any) => {
      console.log('[ContextMenu Module] updateInputValue', value)
      // gmail的action触发了insertUserInput携带的参数需要正确的记录
      if (data && data?.contextMenu) {
        lastRecordContextMenuRef.current = data.contextMenu
      }
      setInputValue(value)
    }
    getInputMediator('floatingMenuInputMediator').subscribe(updateInputValue)
    return () => {
      getInputMediator('floatingMenuInputMediator').unsubscribe(
        updateInputValue,
      )
    }
  }, [setInputValue])
  useClientConversationListener()

  /**
   * 由FloatingContextMenuShortcutButtonGroup触发的regenerate事件
   * regenerate时由于INSERT_USER_INPUT会异步找input并且updateInputValue
   * 这里暂时加入一个延迟，shortcut regenerate的时候把input id清空
   * 这样input组件就不会去监听消息，避免shortcut regenerate的时候input里显示了CHAT_GPT_PROMPT_PREFIX
   *
   * @since - 2024-04-25 现在没有用到INSERT_USER_INPUT这个action了，先注释掉
   */
  // const [shortcutLoading, setShortcutLoading] = useState(false)
  // const inputId = shortcutLoading ? '' : MAXAI_FLOATING_CONTEXT_MENU_INPUT_ID
  // useEffect(() => {
  //   if (!floatingDropdownMenu.open) {
  //     setShortcutLoading(false)
  //   } else if (shortcutLoading) {
  //     const timer = setTimeout(() => {
  //       setShortcutLoading(false)
  //     }, 3500)
  //     return () => {
  //       clearTimeout(timer)
  //     }
  //   }
  // }, [shortcutLoading, floatingDropdownMenu.open])

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
          // TODO: 先测试在notion上有没有什么影响
          if (
            currentHostRef.current === 'notion.so' &&
            event.key !== 'Escape'
          ) {
            event.stopPropagation()
          }
        }}
        id={MAXAI_FLOATING_CONTEXT_MENU_REFERENCE_ELEMENT_ID}
        aria-hidden={floatingDropdownMenu.open ? 'false' : 'true'}
      >
        <FloatingContextMenuList
          customOpen
          defaultPlacement={safePlacement.contextMenuPlacement}
          needAutoUpdate
          hoverOpen={false}
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
              {floatingDropdownMenu.open && (
                <DevContent>
                  <DevConsole />
                </DevContent>
              )}
              <WritingMessageBox />
              {floatingDropdownMenu.open && (
                <ActionSetVariablesModal
                  onClose={() => {
                    setIsSettingVariables(false)
                  }}
                  onShow={() => setIsSettingVariables(true)}
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
                              memoMenuList.length
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
                            minHeight: isSettingVariables ? 0 : '24px',
                            height: isSettingVariables
                              ? '0!important'
                              : 'unset',
                            visibility: isSettingVariables
                              ? 'hidden'
                              : 'visible',
                          }}
                          onEnter={(value) => {
                            if (!haveContext && contextMenuList.length > 0) {
                              return
                            }
                            askChatGPT(value)
                          }}
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
                              return
                            }
                            askChatGPT(inputValue)
                          }}
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
    </FloatingPortal>
  )
}
export { FloatingContextMenu }
