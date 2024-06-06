import cloneDeep from 'lodash-es/cloneDeep'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useRecoilState, useSetRecoilState } from 'recoil'

import { useAuthLogin } from '@/features/auth'
import useClientChat from '@/features/chatgpt/hooks/useClientChat'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import { isSystemMessageByType } from '@/features/chatgpt/utils/chatMessageUtils'
import { MAXAI_FLOATING_CONTEXT_MENU_INPUT_ID } from '@/features/common/constants'
import {
  ContextWindowDraftContextMenuState,
  FloatingContextWindowChangesState,
  FloatingDropdownMenuSelectedItemState,
  FloatingDropdownMenuState,
  useContextMenuList,
  useDraftContextMenuList,
  useFloatingContextMenu,
  useRangy,
} from '@/features/contextMenu'
import { CONTEXT_MENU_DRAFT_TYPES } from '@/features/contextMenu/constants'
import {
  contextMenuIsFavoriteContextMenu,
  contextMenuToFavoriteContextMenu,
  FAVORITE_CONTEXT_MENU_GROUP_ID,
} from '@/features/contextMenu/hooks/useFavoriteContextMenuList'
import useFloatingContextMenuDraft from '@/features/contextMenu/hooks/useFloatingContextMenuDraft'
import FavoriteMediatorFactory from '@/features/contextMenu/store/FavoriteMediator'
import {
  IContextMenuItem,
  IContextMenuItemWithChildren,
} from '@/features/contextMenu/types'
import {
  checkIsDraftContextMenuId,
  findDraftContextMenuById,
  getDraftContextMenuTypeById,
  isFloatingContextMenuVisible,
} from '@/features/contextMenu/utils'
import { ISetActionsType } from '@/features/shortcuts/types/Action'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import { showChatBox } from '@/features/sidebar/utils/sidebarChatBoxHelper'
import { AppDBStorageState } from '@/store'
import { getInputMediator } from '@/store/InputMediator'
import { getMaxAIFloatingContextMenuRootElement } from '@/utils'
import clientGetLiteChromeExtensionDBStorage from '@/utils/clientGetLiteChromeExtensionDBStorage'
const EMPTY_ARRAY: IContextMenuItemWithChildren[] = []

/**
 * 获取popup draft作为contexts
 */
const getDetectHasContextWindowDraftActions: () => ISetActionsType = () => {
  const actions: ISetActionsType = [
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
  return actions
}
export const focusContextWindowInput = () => {
  // 先尝试focus custom variables modal
  const modelElement = getMaxAIFloatingContextMenuRootElement()?.querySelector(
    '.max-ai__action__set_variables_modal',
  ) as HTMLDivElement
  if (modelElement) {
    const textareaElements = (
      Array.from(
        modelElement.querySelectorAll('textarea'),
      ) as HTMLTextAreaElement[]
    ).filter((input) => {
      // aria-hidden="true"
      return !input.hasAttribute('aria-hidden')
    })
    const emptyTextarea =
      textareaElements.find((textarea) => {
        return textarea.value === ''
      }) || textareaElements[textareaElements.length - 1]
    if (emptyTextarea) {
      emptyTextarea.focus()
      setTimeout(() => {
        emptyTextarea?.focus()
      }, 1)
      return
    }
  }
  const textareaEl = getMaxAIFloatingContextMenuRootElement()?.querySelector(
    `#${MAXAI_FLOATING_CONTEXT_MENU_INPUT_ID}`,
  ) as HTMLTextAreaElement
  if (textareaEl) {
    // NOTE: !!!下方千万不能直接focus，否则会导致floating ui初始化的时候直接滚动到顶部
    // https://github.com/floating-ui/floating-ui/issues/2752
    // textareaEl.focus()
    setTimeout(() => {
      textareaEl?.focus()
    }, 1)
  }
}

/**
 * 获取当前的context window 的menu list
 */
const useInitContextWindow = () => {
  const [inputValue, setInputValue] = useState('')
  const [isSettingCustomVariables, setIsSettingCustomVariables] =
    useState(false)
  // 是否编辑过custom variables
  const [isInputCustomVariables, setIsInputCustomVariables] = useState(false)

  const [isSettingCustomVariablesMemo, setIsSettingCustomVariablesMemo] =
    useState(false)
  const [floatingDropdownMenu] = useRecoilState(FloatingDropdownMenuState)
  const setAppDBStorage = useSetRecoilState(AppDBStorageState)
  const { hideFloatingContextMenu, isFloatingMenuVisible } =
    useFloatingContextMenu()
  const [actions, setActions] = useState<ISetActionsType>([])
  const { isLogin } = useAuthLogin()
  const { currentSelectionRef, currentSelection, hideRangy } = useRangy()
  const {
    loading,
    askAIQuestion,
    regenerate,
    stopGenerate,
    checkAttachments,
    askAIWIthShortcuts,
    shortCutsEngine,
  } = useClientChat()
  // ai输出后，系统系统的建议菜单状态
  const [, setContextWindowDraftContextMenu] = useRecoilState(
    ContextWindowDraftContextMenuState,
  )
  const {
    createConversation,
    getConversation,
    currentConversationId,
    conversationStatus,
    currentConversationIdRef,
    clientWritingMessage,
  } = useClientConversation()
  const {
    activeAIResponseMessage,
    currentFloatingContextMenuDraft,
    floatingContextMenuDraftMessageIdRef,
  } = useFloatingContextMenuDraft()
  const { continueConversationInSidebar } = useSidebarSettings()
  const draftContextMenuList = useDraftContextMenuList()
  const { contextMenuList, originContextMenuList } = useContextMenuList(
    'textSelectPopupButton',
    inputValue,
  )
  const [
    floatingDropdownMenuSelectedItem,
    updateFloatingDropdownMenuSelectedItem,
  ] = useRecoilState(FloatingDropdownMenuSelectedItemState)
  /**
   * ✅
   * 是否有context window的context
   */
  const isHaveContextWindowContext = useMemo(() => {
    return currentFloatingContextMenuDraft !== ''
  }, [currentFloatingContextMenuDraft])
  /**
   * ✅
   * 渲染的菜单列表
   */
  const contextWindowList = useMemo(() => {
    if (
      loading ||
      isSettingCustomVariablesMemo ||
      (activeAIResponseMessage &&
        isSystemMessageByType(activeAIResponseMessage, 'needUpgrade'))
    ) {
      return EMPTY_ARRAY
    }
    if (currentFloatingContextMenuDraft) {
      return draftContextMenuList
    }
    return contextMenuList
  }, [
    isSettingCustomVariablesMemo,
    loading,
    contextMenuList,
    currentFloatingContextMenuDraft,
    draftContextMenuList,
    activeAIResponseMessage,
  ])
  /**
   * ✅
   * 获取当前的context window的mode:
   * 1. READ: 只读模式
   * 2. EDITED_VARIABLES: 编辑过variables的modal
   * 3. EDIT_VARIABLES: 编辑variables的modal
   * 4. AI_RESPONSE: AI的回复
   * 5. CUSTOM_INPUT: 自定义的输入
   * 6. LOADING: 加载中
   */
  const [, setContextWindowChanges] = useRecoilState(
    FloatingContextWindowChangesState,
  )
  useEffect(() => {
    const getCurrentState = () => {
      if (loading) {
        return 'LOADING'
      }
      /**
       * 是否是InstantReply的按钮
       */
      const isInstantReplyButton =
        currentSelection?.activeElement?.hasAttribute(
          'maxai-input-assistant-button-id',
        ) || false
      console.log(
        `[ContextWindow] currentSelection`,
        currentSelection,
        isInstantReplyButton,
        currentFloatingContextMenuDraft,
        inputValue,
      )
      if (currentSelection?.selectionInputAble || isInstantReplyButton) {
        if (inputValue && contextWindowList.length === 0) {
          return 'CUSTOM_INPUT'
        }
        if (currentFloatingContextMenuDraft) {
          return 'AI_RESPONSE'
        }
      }
      if (isSettingCustomVariablesMemo) {
        if (isInputCustomVariables) {
          return 'EDITED_VARIABLES'
        }
        return 'EDIT_VARIABLES'
      }
      return 'READ'
    }
    setContextWindowChanges((prev) => {
      return {
        ...prev,
        contextWindowMode: getCurrentState(),
      }
    })
  }, [
    currentSelection,
    inputValue,
    contextWindowList,
    isSettingCustomVariablesMemo,
    isInputCustomVariables,
    currentFloatingContextMenuDraft,
    loading,
  ])
  /**
   * ✅
   * 通过context window的输入框来询问AI
   */
  const askAIWithContextWindow = async () => {
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
          meta: {
            includeHistory: true,
          },
        },
        {
          beforeActions: getDetectHasContextWindowDraftActions(),
        },
      )
    }
  }

  /**
   * ✅
   * 因为在设置完Variables之后，不会立刻loading,这样会导致ContextMenu闪烁
   * 所以要延迟一下等待loading变成true
   */
  useEffect(() => {
    let timer: null | ReturnType<typeof setTimeout> = null
    if (isSettingCustomVariables) {
      setIsSettingCustomVariablesMemo(true)
    } else {
      timer = setTimeout(() => {
        setIsSettingCustomVariablesMemo(false)
      }, 200)
    }
    return () => {
      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [isSettingCustomVariables])

  /**
   * ✅
   * 更新最后hover的contextMenuId
   */
  useEffect(() => {
    if (floatingDropdownMenu.open && contextWindowList.length > 0) {
      let firstMenuItem: null | IContextMenuItemWithChildren = null
      contextWindowList.find((menuItem) => {
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
  }, [contextWindowList, floatingDropdownMenu.open])

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
      contextWindowList.length > 0 &&
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
      if (needOpenChatBox) {
        hideFloatingContextMenu()
        showChatBox()
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
        // 如果不是[草稿]菜单的action, 计入favorite的次数
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
          continueConversationInSidebar(currentConversationIdRef.current, {
            type: 'Chat',
          })
            .then()
            .catch()
          return
        }

        if (runActions.length > 0) {
          setActions(runActions)
        } else {
          if (isDraftContextMenu) {
            if (
              getDraftContextMenuTypeById(currentContextMenuId) === 'TRY_AGAIN'
            ) {
              setContextWindowDraftContextMenu((prev) => {
                return {
                  ...prev,
                  selectedDraftContextMenuId: null,
                }
              })
              stopGenerateRef.current().then(() => {
                regenerateRef.current()
              })
            } else {
              setContextWindowDraftContextMenu((prev) => {
                return {
                  ...prev,
                  selectedDraftContextMenuId: currentContextMenu?.id || null,
                }
              })
            }
          }
        }
      }
    }
  }, [
    floatingDropdownMenuSelectedItem.selectedContextMenuId,
    contextWindowList,
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
    if (actions.length <= 0) {
      return
    }
    isRunningActionsRef.current = true
    setActions([])
    setInputValue('')
    const selectionElement = currentSelectionRef.current?.selectionElement
    // 运行前需要检测文件
    checkAttachments()
      .then((status) => {
        if (!status) {
          return
        }
        return askAIWIthShortcuts(
          getDetectHasContextWindowDraftActions().concat(runActions),
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
            // 2024-04-30 现在出错会在当前context window展示消息
            // 如果出错了，则打开聊天框
            // hideFloatingContextMenu()
            // showChatBox()
          }
        })
      })
      .catch()
      .finally(() => {
        isRunningActionsRef.current = false
        hideRangy(false)
      })
  }, [actions, checkAttachments, askAIWIthShortcuts, currentConversationId])

  useEffect(() => {
    if (!clientWritingMessage.loading) {
      if (isFloatingContextMenuVisible()) {
        focusContextWindowInput()
      }
    }
  }, [clientWritingMessage.loading])

  useEffect(() => {
    const updateInputValue = (value: string) => {
      console.log('[ContextMenu Module] updateInputValue', value)
      setInputValue(value)
    }
    getInputMediator('floatingMenuInputMediator').subscribe(updateInputValue)
    return () => {
      getInputMediator('floatingMenuInputMediator').unsubscribe(
        updateInputValue,
      )
    }
  }, [setInputValue])

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
      focusContextWindowInput()
      // 为了保证登陆后能直接用，需要先获取一次settings
      clientGetLiteChromeExtensionDBStorage().then((settings) => {
        setAppDBStorage(settings)
      })
    } else {
      setIsInputCustomVariables(false)
      setIsSettingCustomVariables(false)
      setInputValue('')
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
  return {
    loading,
    isFloatingMenuVisible,
    inputValue,
    setInputValue,
    contextWindowList,
    setIsSettingCustomVariables,
    setIsInputCustomVariables,
    isSettingCustomVariablesRef: isSettingCustomVariables,
    isSettingCustomVariables: isSettingCustomVariablesMemo,
    askAIWithContextWindow,
    isHaveContextWindowContext,
  }
}
export default useInitContextWindow
