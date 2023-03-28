import {
  getAppRootElement,
  IChromeExtensionSettingsContextMenuKey,
} from '@/utils'
import { v4 } from 'uuid'
import { CHROME_EXTENSION_POST_MESSAGE_ID } from '@/types'
import { ISetActionsType } from '@/features/shortcuts/types'

export const compileTemplate = (template: string, variables: any) => {
  return new Promise<{
    success: boolean
    error: string
    data: string
  }>((resolve) => {
    const taskId = 'compile_task_' + v4()
    const timeout = setTimeout(() => {
      resolve({
        success: false,
        error: 'timeout',
        data: '',
      })
      window.removeEventListener('message', handleChildMessage)
    }, 10000)
    // 定义回调函数
    const handleChildMessage = (originalEvent: any) => {
      const { event, taskId, data, success, error } = originalEvent.data
      if (
        event === 'renderTemplateResponse' &&
        taskId === taskId &&
        originalEvent.origin === 'https://www.ezmail.ai'
      ) {
        resolve({
          success,
          error,
          data,
        })
        clearTimeout(timeout)
        window.removeEventListener('message', handleChildMessage)
      }
    }
    window.addEventListener('message', handleChildMessage)
    getAppRootElement()
      ?.querySelector<HTMLIFrameElement>('#EzMail_AI_TEMPLATE_COMPILE')
      ?.contentWindow?.postMessage(
        {
          id: CHROME_EXTENSION_POST_MESSAGE_ID,
          event: 'renderTemplate',
          data: {
            taskId,
            template,
            variables,
          },
        },
        '*',
      )
  })
}

export const getDefaultActionWithTemplate = (
  settingsKey: IChromeExtensionSettingsContextMenuKey,
  template: string,
  autoAskChatGPT: boolean,
) => {
  const actions: Record<
    IChromeExtensionSettingsContextMenuKey,
    ISetActionsType
  > = {
    gmailToolBarContextMenu: [
      {
        type: 'RENDER_CHATGPT_PROMPT',
        parameters: {
          template,
        },
      },
      {
        type: 'INSERT_USER_INPUT',
        parameters: {
          template: '{{LAST_ACTION_OUTPUT}}',
        },
      },
    ],
    contextMenus: [
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
    ],
  }

  const currentActions = actions[settingsKey]
  if (settingsKey === 'gmailToolBarContextMenu' && autoAskChatGPT) {
    currentActions.push({
      type: 'ASK_CHATGPT',
      parameters: {
        template: '{{LAST_ACTION_OUTPUT}}',
      },
    })
  }
  return currentActions
}

export const templateStaticWords =
  process.env.APP_ENV === 'EZ_MAIL_AI'
    ? [
        // gmail
        'GMAIL_MESSAGE_CONTEXT',
        'GMAIL_DRAFT_CONTEXT',
        // system
        'LAST_ACTION_OUTPUT',
        'USER_INPUT',
        // 'HIGHLIGHTED_TEXT',
      ]
    : [
        // system
        'LAST_ACTION_OUTPUT',
        'USER_INPUT',
        'HIGHLIGHTED_TEXT',
      ]

export const templateWordToDescription = (word: string) => {
  switch (word) {
    case 'LAST_ACTION_OUTPUT':
      return 'The last action output'
    case 'USER_INPUT':
      return 'The user input'
    case 'HIGHLIGHTED_TEXT':
      return 'The highlighted text'
    case 'GMAIL_MESSAGE_CONTEXT':
      return 'When you use this variable in the prompt template for ChatGPT, it will display the incoming email that needs a response.'
    case 'GMAIL_DRAFT_CONTEXT':
      return 'When you use this variable in the prompt template for ChatGPT, it will display the current draft present in the Gmail text box.'
    default:
      return ''
  }
}
