import { getAccessToken } from '@/background/api/backgroundFetch'
import { APP_USE_CHAT_GPT_API_HOST } from '@/constants'
import { ContentScriptConnectionV2 } from '@/features/chatgpt'
import { convertBase64ToBlob } from '@/utils/dataHelper/fileHelper'
import { getFingerPrint } from '@/utils/fingerPrint'

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

type ClientFetchAPIResponse<T> = {
  success: boolean
  data: T | null
  responseRaw: {
    ok: boolean
    status: number
    statusText: string
    url: string
    redirected: boolean
  } | null
  message: string
  error: string
}
export const clientFetchAPI = async <T = any>(
  url: string,
  options: any,
  abortTaskId?: string,
): Promise<ClientFetchAPIResponse<T>> => {
  try {
    if (!options.method) {
      options.method = 'GET'
    }
    const port = new ContentScriptConnectionV2()
    const response = await port.postMessage({
      event: 'Client_proxyFetchAPI',
      data: {
        url,
        options,
        abortTaskId,
      },
    })

    if (
      options.method === 'GET' &&
      response.data.redirected &&
      response?.data?.response?.url
    ) {
      const redirectResponse = await port.postMessage({
        event: 'Client_proxyFetchAPI',
        data: {
          url: response?.data?.response?.url,
          options,
          abortTaskId,
        },
      })
      response.data.data = redirectResponse?.data?.data
      response.data.response = redirectResponse?.data?.response
    }

    if (options?.parse === 'blob' && response?.data?.data?.base64) {
      response.data.data = convertBase64ToBlob(
        response.data.data.base64,
        options?.blobContentType || response.data.data.contentType,
      )
    }
    return {
      success: response.success,
      data: response?.data?.data,
      responseRaw: response?.data?.response,
      message: response.message,
      error: '',
    }
  } catch (error) {
    return {
      success: false,
      data: null,
      error: (error as any)?.message || error,
      responseRaw: null,
      message: '',
    }
  }
}

export const clientAbortFetchAPI = async (abortTaskId: string) => {
  try {
    const port = new ContentScriptConnectionV2()
    const response = await port.postMessage({
      event: 'Client_abortProxyFetchAPI',
      data: {
        abortTaskId,
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

export const clientFetchMaxAIAPI = async <T = any>(
  url: string,
  body: any,
  options: any = {},
): Promise<ClientFetchAPIResponse<T>> => {
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
      responseRaw: response?.data?.response,
      data: response?.data?.data,
      message: response.message,
      error: '',
    }
  } catch (error) {
    return {
      success: false,
      responseRaw: null,
      data: null,
      error: (error as any)?.message || error,
      message: '',
    }
  }
}
