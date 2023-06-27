import { getAppRootElement } from '@/utils'
import { v4 } from 'uuid'
import { CHROME_EXTENSION_POST_MESSAGE_ID } from '@/constants'
import { ISetActionsType } from '@/features/shortcuts/types/Action'
import { IChromeExtensionButtonSettingKey } from '@/background/types/Settings'

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
  settingsKey: IChromeExtensionButtonSettingKey,
  template: string,
  autoAskChatGPT: boolean,
) => {
  const actions: Record<IChromeExtensionButtonSettingKey, ISetActionsType> = {
    gmailButton: [
      {
        type: 'RENDER_CHATGPT_PROMPT',
        parameters: {
          template,
        },
      },
    ],
    textSelectPopupButton: [
      {
        type: 'RENDER_CHATGPT_PROMPT',
        parameters: {
          template,
        },
      },
    ],
  }

  const currentActions = actions[settingsKey]
  if (autoAskChatGPT) {
    currentActions.push({
      type: 'INSERT_USER_INPUT',
      parameters: {
        template: '{{LAST_ACTION_OUTPUT}}',
      },
    })
    currentActions.push({
      type: 'ASK_CHATGPT',
      parameters: {
        template: '{{LAST_ACTION_OUTPUT}}',
      },
    })
  } else {
    currentActions.push({
      type: 'INSERT_USER_INPUT',
      parameters: {
        template: '{{LAST_ACTION_OUTPUT}}',
      },
    })
  }
  return currentActions
}

export const templateStaticWords =
  String(process.env.APP_ENV) === 'EZ_MAIL_AI'
    ? [
        // gmail
        'GMAIL_EMAIL_CONTEXT',
        'GMAIL_DRAFT_CONTEXT',
        // system
        // 'LAST_ACTION_OUTPUT',
        // 'USER_INPUT',
        // 'SELECTED_TEXT',
      ]
    : [
        // system
        // 'USER_INPUT',
        // 'LAST_ACTION_OUTPUT',
        'SELECTED_TEXT',
        'AI_OUTPUT_LANGUAGE',
        'CURRENT_WEBSITE_DOMAIN',
        // 'LAST_AI_OUTPUT',
      ]

export const templateWordToExamples = (
  word: string,
): {
  description: string
  examples: string[]
} => {
  switch (word) {
    case 'LAST_ACTION_OUTPUT':
      return {
        description: 'The last action output',
        examples: [],
      }
    case 'USER_INPUT':
      return {
        description: 'The user input',
        examples: [],
      }
    case 'SELECTED_TEXT':
      return {
        description:
          'This ChatGPT prompt template variable will be replaced with the text you selected on the current page.',
        examples: [
          'write a better version of the follow text: {{SELECTED_TEXT}}',
          'translate the following text to English: {{SELECTED_TEXT}}',
        ],
      }
    case 'AI_OUTPUT_LANGUAGE':
      return {
        description: `This ChatGPT prompt template variable will be replaced with the "AI output language" selected on the Settings page.\nIf uncertain of the "Settings" page location, simply click the "Settings" icon found in the top bar within the side bar.`,
        examples: [
          `respond in {{AI_OUTPUT_LANGUAGE}}`,
          `you will reply with ideas in {{AI_OUTPUT_LANGUAGE}}`,
        ],
      }
    case 'GMAIL_EMAIL_CONTEXT':
      return {
        description:
          'When you use this variable in the prompt template for ChatGPT, it will display the incoming email that needs a response.',
        examples: [],
      }
    case 'GMAIL_DRAFT_CONTEXT':
      return {
        description:
          'When you use this variable in the prompt template for ChatGPT, it will display the current draft present in the Gmail text box.',
        examples: [],
      }
    case 'CURRENT_WEBSITE_DOMAIN':
      return {
        description: `This ChatGPT prompt template variable will be replaced with the current website's domain.`,
        examples: [
          `reply to the following text on {{CURRENT_WEBSITE_DOMAIN}}`,
          `note that the text is from {{CURRENT_WEBSITE_DOMAIN}}`,
        ],
      }
    default:
      return {
        description: '',
        examples: [],
      }
  }
}
export const limitedPromiseAll = <T>(
  promises: Promise<T>[],
  limit: number,
): Promise<T[]> => {
  const results: T[] = []
  let runningPromises = 0
  let currentIndex = 0

  return new Promise((resolve, reject) => {
    function runNextPromise() {
      if (currentIndex === promises.length) {
        resolve(results)
        return
      }

      const currentPromiseIndex = currentIndex
      currentIndex++

      const currentPromise = promises[currentPromiseIndex]
      runningPromises++

      currentPromise
        .then((result) => {
          results[currentPromiseIndex] = result
        })
        .catch((error) => {
          reject(error)
        })
        .finally(() => {
          runningPromises--
          runNextPromise()
        })

      if (runningPromises < limit) {
        runNextPromise()
      }
    }

    runNextPromise()
  })
}

// chatgpt 官方 接口报错 拦截器
export const chatGPTCommonErrorInterceptor = (errorMsg?: string) => {
  let newErrorMsg = errorMsg
  // chatgpt api timeout
  if (newErrorMsg?.includes('524')) {
    newErrorMsg = 'Network error: 524'
  }

  // chatgpt api bad away error
  if (newErrorMsg?.includes('502')) {
    newErrorMsg = 'Network error: 502'
  }

  return newErrorMsg
}
