import { IAIProviderType } from '@/background/provider/chat'
import {
  IMaxAIChatMessage,
  IMaxAIChatMessageContent,
} from '@/background/src/chat/UseChatGPTChat/types'
import { APP_USE_CHAT_GPT_API_HOST, APP_VERSION } from '@/constants'
import { ContentScriptConnectionV2 } from '@/features/chatgpt'
import { clientFetchAPI } from '@/features/shortcuts/utils'
import { getCurrentDomainHost } from '@/utils/dataHelper/websiteHelper'
import { getAccessToken } from '@/utils/request'

const clientAskMaxAIChatProvider = async (
  aiProvider: IAIProviderType,
  model: string,
  data: {
    message_content: IMaxAIChatMessageContent[]
    prompt_name: string
    prompt_id: string
    chat_history?: IMaxAIChatMessage[]
    temperature?: number
    doc_id?: string
  },
  waitAuth = false,
) => {
  const {
    chat_history = [],
    message_content,
    prompt_id,
    prompt_name,
    temperature = 1,
    doc_id,
  } = data
  const host = getCurrentDomainHost()
  const port = new ContentScriptConnectionV2({
    runtime: 'client',
  })
  if (waitAuth) {
    // log backend log
    const { data: isDailyUsageLimit } = await port.postMessage({
      event: 'Client_logCallApiRequest',
      data: {
        name: prompt_name,
        id: prompt_id,
        host,
      },
    })
    if (isDailyUsageLimit) {
      return {
        success: false,
        error: 'daily usage limit',
        data: '',
      }
    }
  } else {
    port
      .postMessage({
        event: 'Client_logCallApiRequest',
        data: {
          name: prompt_name,
          id: prompt_id,
          host,
        },
      })
      .then()
      .catch()
  }

  let maxAIApi = ''
  if (aiProvider === 'MAXAI_CLAUDE') {
    maxAIApi = '/gpt/get_claude_response'
  } else if (aiProvider === 'USE_CHAT_GPT_PLUS') {
    maxAIApi = '/gpt/get_chatgpt_response'
  }
  if (!maxAIApi) {
    return {
      success: false,
      error: 'no ai provider',
      data: '',
    }
  }
  const result = await clientFetchAPI(
    `${APP_USE_CHAT_GPT_API_HOST}${maxAIApi}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${await getAccessToken()}`,
      },
      body: JSON.stringify({
        streaming: false,
        message_content,
        chat_history,
        chrome_extension_version: APP_VERSION,
        model_name: model,
        prompt_id,
        prompt_name,
        temperature: Math.min(temperature, 1.2),
        ...(doc_id ? { doc_id } : {}),
      }),
    },
  )
  return {
    success: true,
    error: '',
    data: result.data?.text || result.data?.toString() || result.data || '',
  }
}
export default clientAskMaxAIChatProvider
