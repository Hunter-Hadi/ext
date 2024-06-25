import cloneDeep from 'lodash-es/cloneDeep'

import { getChromeExtensionLocalStorage } from '@/background/utils/chromeExtensionStorage/chromeExtensionLocalStorage'
import { IContextMenuIconKey } from '@/components/ContextMenuIcon'
import {
  PAGE_SUMMARY_CONTEXT_MENU_MAP,
  PAGE_SUMMARY_NAV_CONTEXT_MENU_MAP,
} from '@/features/chat-base/summary/constants'
import {
  IPageSummaryNavItem,
  IPageSummaryNavType,
  IPageSummaryType,
} from '@/features/chat-base/summary/types'
import { getSummaryNavItemByType } from '@/features/chat-base/summary/utils/pageSummaryHelper'
import { IContextMenuItem } from '@/features/contextMenu/types'
import { IAIResponseMessage } from '@/features/indexed_db/conversations/models/Message'
import { IAction, ISetActionsType } from '@/features/shortcuts/types/Action'

export const getSummaryActionCopilotStepTitle = (type: IPageSummaryType) => {
  switch (type) {
    case 'PAGE_SUMMARY':
      return 'Summarize page'
    case 'YOUTUBE_VIDEO_SUMMARY':
      return 'Summarize video'
    case 'PDF_CRX_SUMMARY':
      return 'Summarize PDF'
    case 'DEFAULT_EMAIL_SUMMARY':
      return 'Summarize email'
  }
}

export const getSummaryNavActions = async (params: {
  type: IPageSummaryType
  navItem: IPageSummaryNavItem
  messageId?: string
}): Promise<ISetActionsType> => {
  const { type, navItem, messageId } = params
  try {
    const contextMenu = cloneDeep(PAGE_SUMMARY_CONTEXT_MENU_MAP[type])
    let currentActions = cloneDeep(contextMenu.data.actions || [])
    // 减少message的大小
    contextMenu.data.actions = []

    if (type === 'YOUTUBE_VIDEO_SUMMARY') {
      // currentActions = await youTubeSummaryChangeTool(params, currentActions) //进行actions增改
    }

    // 有messageId表示切换nav，需要去更新第一条消息而不是新增
    if (
      messageId &&
      currentActions[0].parameters?.ActionChatMessageOperationType === 'add'
    ) {
      currentActions.splice(0, 1, {
        type: 'CHAT_MESSAGE',
        parameters: {
          ActionChatMessageOperationType: 'update',
          ActionChatMessageConfig: {
            type: 'ai',
            messageId: messageId || '',
            text: '',
            originalMessage: {
              metadata: {
                isComplete: false,
                copilot: {
                  steps: [
                    {
                      title: getSummaryActionCopilotStepTitle(type),
                      status: 'loading',
                      icon: 'SmartToy',
                      value: '{{CURRENT_WEBPAGE_TITLE}}',
                    },
                  ],
                },
                title: {
                  title: navItem.title || 'Summary',
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
        },
      })
    }

    // 下面代码等youTubeSummaryChangeTool actions完善可以去除
    currentActions = currentActions.map((action) => {
      if (
        action.parameters.ActionChatMessageOperationType === 'add' &&
        navItem
      ) {
        const actionTitle = (
          action.parameters?.ActionChatMessageConfig as IAIResponseMessage
        )?.originalMessage?.metadata?.title
        if (actionTitle) {
          actionTitle.title = navItem.title
        }
      }
      if (messageId && action?.parameters?.ActionChatMessageConfig?.messageId) {
        action.parameters.ActionChatMessageConfig.messageId = messageId
      }
      if (
        messageId &&
        action?.parameters?.AskChatGPTActionQuestion?.meta?.outputMessageId
      ) {
        action.parameters.AskChatGPTActionQuestion.meta.outputMessageId =
          messageId
      }
      // TODO 临时的处理，需要重构
      const processAskChatGPTAction = (action: IAction) => {
        if (
          action.type === 'ASK_CHATGPT' &&
          action.parameters.AskChatGPTActionQuestion
        ) {
          if (!action.parameters.AskChatGPTActionQuestion.meta) {
            action.parameters.AskChatGPTActionQuestion.meta = {}
          }

          const contextMenuOverwriteData =
            PAGE_SUMMARY_NAV_CONTEXT_MENU_MAP?.[type]?.[navItem.key]
          if (contextMenuOverwriteData) {
            contextMenu.id = contextMenuOverwriteData.id
            contextMenu.text = contextMenuOverwriteData.text
          }
          console.log(
            `contextMenu show Text: [${contextMenu.text}]-[${contextMenu.id}]`,
          )
          action.parameters.AskChatGPTActionQuestion.meta.contextMenu =
            contextMenu
        }
        return action
      }
      if (action.type === 'SCRIPTS_CONDITIONAL') {
        if (action.parameters.WFConditionalIfTrueActions) {
          action.parameters.WFConditionalIfTrueActions =
            action.parameters.WFConditionalIfTrueActions.map((action) =>
              processAskChatGPTAction(action as IAction),
            )
        }
        if (action.parameters.WFConditionalIfFalseActions) {
          action.parameters.WFConditionalIfFalseActions =
            action.parameters.WFConditionalIfFalseActions.map((action) =>
              processAskChatGPTAction(action as IAction),
            )
        }
      }
      return action
    })

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
  messageId = '',
  title,
  icon,
  key,
  actions: customPromptActions = [],
}: {
  type: IPageSummaryType
  messageId?: string
  title: string
  key: string
  icon?: IContextMenuIconKey
  actions: ISetActionsType
}) => {
  try {
    const currentCustomPromptActions = cloneDeep(customPromptActions)

    const actions = cloneDeep(PAGE_SUMMARY_CONTEXT_MENU_MAP[type].data.actions!)
    const askActionIndex = actions.findIndex(
      (action) => action.type === 'ASK_CHATGPT',
    )

    if (askActionIndex !== -1) {
      actions.splice(askActionIndex, 1, ...currentCustomPromptActions)
    } else {
      actions.push(...currentCustomPromptActions)
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
          title: summaryActionContextMenuItem.text,
          icon: summaryActionContextMenuItem.data.icon as IContextMenuIconKey,
          actions: summaryActionContextMenuItem.data.actions!,
          key: summaryActionContextMenuItem.id,
        })
      }
      // 有可能用户在用了 custom prompt 之后，回到 Settings 把这个 custom prompt 删了，所以这里要处理一下
      else {
        const systemSummaryNavItem = getSummaryNavItemByType(
          pageSummaryType,
          'all',
        )
        actions = await getSummaryNavActions({
          type: pageSummaryType,
          navItem: systemSummaryNavItem,
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
