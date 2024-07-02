import { getAccessToken } from '@/background/api/backgroundFetch'
import { IAIProviderType } from '@/background/provider/chat'
import {
  IMaxAIChatMessageContent,
  IMaxAIRequestHistoryMessage,
} from '@/background/src/chat/UseChatGPTChat/types'
import { APP_USE_CHAT_GPT_API_HOST, APP_VERSION } from '@/constants'
import { ContentScriptConnectionV2 } from '@/features/chatgpt'
import { clientFetchAPI } from '@/features/shortcuts/utils'
import { getCurrentDomainHost } from '@/utils/dataHelper/websiteHelper'

const clientAskMaxAIChatProvider = async (
  aiProvider: IAIProviderType,
  model: string,
  data: {
    message_content: IMaxAIChatMessageContent[]
    prompt_name: string
    prompt_id: string
    prompt_type: string
    prompt_inputs?: Record<string, string>
    feature_name: string
    chat_history?: IMaxAIRequestHistoryMessage[]
    temperature?: number
    doc_id?: string
    // TODO youtube summary时间线总结新增，后续重构删掉
    api?: string
    summary_type?: string
  },
  taskId: string,
) => {
  const {
    chat_history = [],
    message_content,
    prompt_id,
    prompt_name,
    prompt_type,
    prompt_inputs,
    feature_name,
    temperature = 1,
    doc_id,
    api = '',
    summary_type,
  } = data
  const host = getCurrentDomainHost()
  const port = new ContentScriptConnectionV2({
    runtime: 'client',
  })
  port
    .postMessage({
      event: 'Client_logCallApiRequest',
      data: {
        name: prompt_name,
        id: prompt_id,
        type: prompt_type,
        featureName: feature_name,
        host,
        aiProvider,
        aiModel: model,
        url: location.href,
      },
    })
    .then()
    .catch()
  let maxAIApi = ''
  const bodyObject: Record<string, any> = {
    streaming: false,
    message_content,
    chat_history,
    chrome_extension_version: APP_VERSION,
    model_name: model,
    prompt_id,
    prompt_name,
    prompt_type,
    prompt_inputs,
    temperature: Math.min(temperature, 1.2),
    ...(doc_id ? { doc_id } : {}),
    ...(summary_type ? { summary_type } : {}),
  }
  if (aiProvider === 'MAXAI_CLAUDE') {
    maxAIApi = '/gpt/get_claude_response'
  } else if (aiProvider === 'USE_CHAT_GPT_PLUS') {
    maxAIApi = '/gpt/get_search_page_summary_response'
    // 请求 get_search_page_summary_response 接口时，不需要传 model_name，由后端控制
    bodyObject.model_name = undefined
  } else if (aiProvider === 'OPENAI_API') {
    maxAIApi = '/gpt/get_chatgpt_response'
  }
  if (api) {
    maxAIApi = api
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
      body: JSON.stringify(bodyObject),
    },
    taskId,
  )

  let returnData = null
  if (result.data?.text) {
    returnData = result.data?.text
  } else if (typeof result.data === 'object') {
    returnData = result.data
  } else if (result.data) {
    returnData = result.data.toString()
  } else {
    returnData = result.data || ''
  }

  return {
    success: true,
    error: '',
    data: returnData,
  }
}

export default clientAskMaxAIChatProvider
