import { getChromeExtensionLocalStorage } from '@/background/utils/chromeExtensionStorage/chromeExtensionLocalStorage'
import { IContextMenuIconKey } from '@/components/ContextMenuIcon'
import { DEFAULT_SUMMARY_ACTIONS_MAP } from '@/features/chat-base/summary/constants'
import {
  IPageSummaryNavItem,
  IPageSummaryNavType,
  IPageSummaryType,
} from '@/features/chat-base/summary/types'
import { getSummaryNavItemByType } from '@/features/chat-base/summary/utils/pageSummaryHelper'
import { IContextMenuItem } from '@/features/contextMenu/types'
import { clientGetContextMenuRunActions } from '@/features/contextMenu/utils/clientButtonSettings'
import { IAIResponseMessage } from '@/features/indexed_db/conversations/models/Message'
import { PRESET_VARIABLE_MAP } from '@/features/shortcuts/components/ShortcutsActionsEditor/hooks/useShortcutEditorActionsVariables'
import { IShortCutsParameter } from '@/features/shortcuts/hooks/useShortCutsParameters'
import { ISetActionsType } from '@/features/shortcuts/types/Action'

export const getSummaryNavActions = async (params: {
  type: IPageSummaryType
  navItem: IPageSummaryNavItem
  messageId?: string
}): Promise<ISetActionsType> => {
  const { type, navItem, messageId } = params
  try {
    const currentActions = navItem.actions(messageId)

    // 有messageId表示切换nav，需要去更新第一条消息而不是新增
    if (
      messageId &&
      currentActions[0].parameters?.ActionChatMessageOperationType === 'add'
    ) {
      // TODO 换成deepMerge
      const originalMessageConfig =
        currentActions[0].parameters.ActionChatMessageConfig
      currentActions[0].parameters.ActionChatMessageOperationType = 'update'
      currentActions[0].parameters.ActionChatMessageConfig = Object.assign(
        originalMessageConfig || {},
        {
          type: 'ai',
          messageId: messageId || '',
          text: '',
          originalMessage: {
            ...originalMessageConfig?.originalMessage,
            metadata: {
              ...originalMessageConfig?.originalMessage?.metadata,
              isComplete: false,
              deepDive:
                type === 'YOUTUBE_VIDEO_SUMMARY'
                  ? []
                  : {
                      title: {
                        title: '',
                        titleIcon: '',
                      },
                      type: '',
                      value: '',
                    },
              navMetadata: {
                key: navItem.key,
                title: navItem.title,
                icon: navItem.icon,
              },
            },
            content: {
              title: {
                title: 'noneShowContent', // 隐藏之前的summary 因为content无法被undefined重制为空
              },
              text: '',
              contentType: 'text',
            },
            includeHistory: false,
          },
        } as IAIResponseMessage,
      )
    }

    if (
      (
        currentActions[0].parameters
          ?.ActionChatMessageConfig as IAIResponseMessage
      )?.originalMessage?.metadata
    ) {
      // eslint-disable-next-line no-extra-semi
      ;(currentActions[0].parameters!
        .ActionChatMessageConfig as IAIResponseMessage)!.originalMessage!.metadata!.navMetadata =
        {
          key: navItem.key,
          title: navItem.title || 'Summarize',
          icon: navItem.icon,
        }
    }

    return currentActions
  } catch (e) {
    console.log(e)
  }
  return []
}

// 24.04.29: support custom prompt feature for Summary
// get the actions of the custom prompt and mix with Summary actions, then return
export const getSummaryCustomPromptActions = async ({
  type,
  navItem,
  messageId = '',
}: {
  type: IPageSummaryType
  // 历史版本把自定义prompt的id存储为navMetadata.key
  navItem: Omit<IPageSummaryNavItem, 'key' | 'tooltip'> & { key: string }
  messageId?: string
}) => {
  try {
    const { key, icon, title } = navItem
    let customPromptActions = navItem.actions(messageId)

    // 默认actions
    const actions = DEFAULT_SUMMARY_ACTIONS_MAP[type](messageId)
    const askActionIndex = actions.findIndex(
      (action) => action.type === 'ASK_CHATGPT',
    )
    const askAction = actions[askActionIndex]

    // 获取actions
    const fetchAction = customPromptActions.find(
      (action) => action.type === 'FETCH_ACTIONS',
    )
    if (fetchAction) {
      customPromptActions = await clientGetContextMenuRunActions(
        fetchAction.parameters.template || '',
      )
    }

    // 处理数据，对历史的custom prompt做一下兼容
    customPromptActions = customPromptActions.map((action) => {
      if (action.type === 'SET_VARIABLE') {
        const Variable = action.parameters.Variable as IShortCutsParameter
        if (
          Variable?.key ===
          PRESET_VARIABLE_MAP.SUMMARY_PAGE_CONTENT_REPRESENTATION.VariableName
        ) {
          // TODO 这里需要原样发送给后端，summary prompt后移由后端填入内容
          // 实际上PAGE_CONTENT也由前端发送，后端去渲染只是为了减小发送的数据量，避免重复发送
          // { PAGE_CONTENT: '...', PROMPT_TEMPLATE: 'summary on ...' } -> { PAGE_CONTENT: '...', PROMPT_TEMPLATE: 'summary on {{PAGE_CONTENT}}' }
          // api相关内容的转换放在maxAIRequestBodyGenerator内，这里先不处理了
          // 目前如果更改为{{}}会被模板渲染替换掉，暂时设置成这样
          Variable.value = '<<SUMMARY_PAGE_CONTENT_REPRESENTATION>>'
        }
      }
      if (action.type === 'ASK_CHATGPT') {
        return {
          type: 'ASK_CHATGPT',
          parameters: {
            ...askAction.parameters,
            MaxAIPromptActionConfig: {
              ...askAction.parameters.MaxAIPromptActionConfig,
              promptId:
                action.parameters.AskChatGPTActionQuestion?.meta?.contextMenu
                  ?.id ||
                fetchAction?.parameters.template ||
                '',
              promptName:
                action.parameters.AskChatGPTActionQuestion?.meta?.contextMenu
                  ?.text || '',
              variables: [
                ...(askAction.parameters.MaxAIPromptActionConfig?.variables ||
                  []),
                {
                  VariableName: 'PROMPT_TEMPLATE',
                  label: 'PROMPT_TEMPLATE',
                  defaultValue: action.parameters.template,
                  valueType: 'Text',
                },
              ],
            },
            AskChatGPTActionQuestion: {
              ...action.parameters.AskChatGPTActionQuestion,
              text: '',
            },
          },
        } as ISetActionsType[number]
      }
      return action
    })

    if (askActionIndex !== -1) {
      actions.splice(askActionIndex, 1, ...customPromptActions)
    } else {
      actions.push(...customPromptActions)
    }

    if (actions[0].parameters?.ActionChatMessageOperationType === 'add') {
      if (messageId) {
        actions.splice(0, 1, {
          type: 'CHAT_MESSAGE',
          parameters: {
            ActionChatMessageOperationType: 'update',
            ActionChatMessageConfig: {
              type: 'ai',
              messageId,
              text: '',
              originalMessage: {
                metadata: {
                  isComplete: false,
                  copilot: {
                    steps: [
                      {
                        title,
                        status: 'loading',
                        icon,
                        value: '{{CURRENT_WEBPAGE_TITLE}}',
                      },
                    ],
                  },
                  title: {
                    title: title || 'Summarize Page',
                  },
                  deepDive:
                    type === 'YOUTUBE_VIDEO_SUMMARY'
                      ? []
                      : {
                          title: {
                            title: '',
                            titleIcon: '',
                          },
                          type: '',
                          value: '',
                        },
                },
                content: {
                  title: {
                    title: 'noneShowContent', //隐藏之前的summary 因为content无法被undefined重制为空
                  },
                  text: '',
                  contentType: 'text',
                },
                includeHistory: false,
              },
            } as IAIResponseMessage,
          },
        })
      } else if (
        title &&
        (actions[0].parameters?.ActionChatMessageConfig as IAIResponseMessage)
          ?.originalMessage?.metadata?.title
      ) {
        // eslint-disable-next-line no-extra-semi
        ;(
          actions[0].parameters!.ActionChatMessageConfig as IAIResponseMessage
        ).originalMessage!.metadata!.title!.title = title
      }
    }

    if (
      (actions[0].parameters?.ActionChatMessageConfig as IAIResponseMessage)
        ?.originalMessage?.metadata
    ) {
      // eslint-disable-next-line no-extra-semi
      ;(actions[0].parameters!
        .ActionChatMessageConfig as IAIResponseMessage)!.originalMessage!.metadata!.navMetadata =
        { key, title, icon }
    }

    if (type === 'YOUTUBE_VIDEO_SUMMARY') {
      const youTubeSummaryLogActionIndex = actions.findIndex(
        (action) => action.type === 'MAXAI_SUMMARY_LOG',
      )
      if (youTubeSummaryLogActionIndex !== -1) {
        actions.splice(youTubeSummaryLogActionIndex, 1)
      }
    }

    return actions
  } catch (err) {
    console.error(err)
  }
  return []
}

export const getContextMenuByNavMetadataKey = async (
  pageSummaryType: IPageSummaryType,
  summaryNavKey?: string,
  originContextMenuList: IContextMenuItem[] = [],
) => {
  try {
    if (!summaryNavKey) {
      const chromeExtensionData = await getChromeExtensionLocalStorage()
      //获取summary导航数据 逻辑
      summaryNavKey =
        chromeExtensionData.sidebarSettings?.summary?.currentNavType?.[
          pageSummaryType
        ] || 'all'
    }

    let actions: ISetActionsType = []
    const systemSummaryNavItem = getSummaryNavItemByType(
      pageSummaryType,
      summaryNavKey || '',
    )
    if (systemSummaryNavItem) {
      actions = await getSummaryNavActions({
        type: pageSummaryType,
        navItem: systemSummaryNavItem,
      })
    } else {
      const summaryActionContextMenuItem = originContextMenuList.find(
        (menuItem) => {
          return menuItem.id === summaryNavKey
        },
      )
      if (summaryActionContextMenuItem) {
        actions = await getSummaryCustomPromptActions({
          type: pageSummaryType,
          navItem: {
            // key: 'customize',
            key: summaryActionContextMenuItem.id,
            title: summaryActionContextMenuItem.text,
            icon: summaryActionContextMenuItem.data.icon as IContextMenuIconKey,
            actions: () => summaryActionContextMenuItem.data.actions!,
          },
          // title: summaryActionContextMenuItem.text,
          // icon: summaryActionContextMenuItem.data.icon as IContextMenuIconKey,
          // actions: summaryActionContextMenuItem.data.actions!,
          // key: summaryActionContextMenuItem.id,
        })
      } else {
        // 有可能用户在用了 custom prompt 之后，回到 Settings 把这个 custom prompt 删了，所以这里要处理一下
        const systemSummaryNavItem = getSummaryNavItemByType(
          pageSummaryType,
          'all',
        )
        actions = await getSummaryNavActions({
          type: pageSummaryType,
          navItem: systemSummaryNavItem!,
        })
      }
    }

    return {
      actions,
      messageId: actions[0].parameters.ActionChatMessageConfig?.messageId || '',
      summaryNavKey: summaryNavKey as IPageSummaryNavType,
    }
  } catch (e) {
    return undefined
  }
}
