import { getAppRootElement } from '@/utils'
import { v4 } from 'uuid'
import {
  APP_USE_CHAT_GPT_API_HOST,
  CHROME_EXTENSION_POST_MESSAGE_ID,
} from '@/constants'
import { ISetActionsType } from '@/features/shortcuts/types/Action'
import { ContentScriptConnectionV2 } from '@/features/chatgpt'
import { getAccessToken } from '@/utils/request'
import { getFingerPrint } from '@/utils/fingerPrint'
import { IChromeExtensionButtonSettingKey } from '@/background/utils'

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
    textSelectPopupButton: [
      {
        type: 'RENDER_TEMPLATE',
        parameters: {
          template,
        },
      },
    ],
    inputAssistantComposeReplyButton: [
      {
        type: 'RENDER_TEMPLATE',
        parameters: {
          template,
        },
      },
    ],
    inputAssistantComposeNewButton: [
      {
        type: 'RENDER_TEMPLATE',
        parameters: {
          template,
        },
      },
    ],
    inputAssistantRefineDraftButton: [
      {
        type: 'RENDER_TEMPLATE',
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
        'AI_RESPONSE_LANGUAGE',
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
        description:
          'feature_card__prompts__prompt_template__variable_last_action_output__description',
        examples: [],
      }
    case 'USER_INPUT':
      return {
        description:
          'feature_card__prompts__prompt_template__variable_user_input__description',
        examples: [],
      }
    case 'SELECTED_TEXT':
      return {
        description:
          'feature_card__prompts__prompt_template__variable_selected_text__description',
        examples: [
          'feature_card__prompts__prompt_template__variable_selected_text__example1',
          'feature_card__prompts__prompt_template__variable_selected_text__example2',
        ],
      }
    case 'AI_RESPONSE_LANGUAGE':
      return {
        description:
          'feature_card__prompts__prompt_template__variable_ai_response_language__description',
        examples: [
          `feature_card__prompts__prompt_template__variable_ai_response_language__example1`,
          `feature_card__prompts__prompt_template__variable_ai_response_language__example2`,
        ],
      }
    case 'GMAIL_EMAIL_CONTEXT':
      return {
        description:
          'feature_card__prompts__prompt_template__variable_gmail_email_context__description',
        examples: [],
      }
    case 'GMAIL_DRAFT_CONTEXT':
      return {
        description:
          'feature_card__prompts__prompt_template__variable_gmail_draft_context__description',
        examples: [],
      }
    case 'CURRENT_WEBSITE_DOMAIN':
      return {
        description:
          'feature_card__prompts__prompt_template__variable_current_website_domain__description',
        examples: [
          'feature_card__prompts__prompt_template__variable_current_website_domain__example1',
          'feature_card__prompts__prompt_template__variable_current_website_domain__example2',
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

export const actionContainsAskChatGPT = (actions: ISetActionsType) => {
  return actions.some((action) => {
    return action.type === 'ASK_CHATGPT' || action.type === 'WEBGPT_ASK_CHATGPT'
  })
}

export const clientFetchAPI = async (url: string, options: any) => {
  try {
    const port = new ContentScriptConnectionV2()
    const response = await port.postMessage({
      event: 'Client_proxyFetchAPI',
      data: {
        url,
        options,
      },
    })
    return {
      success: response.success,
      data: response.data,
      error: response.message,
    }
  } catch (error) {
    return {
      success: false,
      data: null,
      error: (error as any)?.message || error,
    }
  }
}

export const clientFetchMaxAIAPI = async (
  url: string,
  body: any,
  options: any = {},
) => {
  try {
    const port = new ContentScriptConnectionV2()
    const fingerprint = await getFingerPrint()
    const accessToken = await getAccessToken()
    options.body = JSON.stringify(body)
    if (!options.headers) {
      options.headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        fp: `${fingerprint}`,
      }
    }
    if (!options.method) {
      options.method = 'POST'
    }
    if (
      APP_USE_CHAT_GPT_API_HOST &&
      !url.startsWith(APP_USE_CHAT_GPT_API_HOST)
    ) {
      url = APP_USE_CHAT_GPT_API_HOST + url
    }
    const response = await port.postMessage({
      event: 'Client_proxyFetchAPI',
      data: {
        url,
        options,
      },
    })
    return {
      success: response.success,
      data: response.data,
      error: response.message,
    }
  } catch (error) {
    return {
      success: false,
      data: null,
      error: (error as any)?.message || error,
    }
  }
}
