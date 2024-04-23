import { BARD_MODELS } from '@/background/src/chat/BardChat/types'
import { BING_MODELS } from '@/background/src/chat/BingChat/bing/types'
import { CLAUDE_MODELS } from '@/background/src/chat/ClaudeWebappChat/claude/types'
import { MAXAI_FREE_MODELS } from '@/background/src/chat/MaxAIFreeChat/types'
import { OPENAI_API_MODELS } from '@/background/src/chat/OpenAIApiChat/types'
import { USE_CHAT_GPT_PLUS_MODELS } from '@/background/src/chat/UseChatGPTChat/types'

import { CHATGPT_3_5_MODEL_NAME } from '../chatCore/chatgpt/constants'

type ISearchWithAIAppNameMap = 'maxai' | 'webchatgpt'
export const SEARCH_WITH_AI_APP_NAME: ISearchWithAIAppNameMap = 'maxai'

export const SEARCH_WITH_AI_ROOT_ID = 'MAXAI_SEARCH_WITH_AI_ROOT_ID'
export const SEARCH_WITH_AI_SHADOW_CONTAINER_ID =
  'MAXAI_SEARCH_WITH_AI_SHADOW_CONTAINER_ID'

// 用户渲染前判断 页面是否存在下面这些标记，如果存在，就不渲染
export const SEARCH_WITH_AI_CHECK_FLAG_BACKLIST = []

export const SEARCH_WITH_AI_LOGO_ID = 'SEARCH_WITH_AI_LOGO_ID'

export const SEARCH_WITH_AI_DEFAULT_CRAWLING_LIMIT = 6

export const SEARCH_WITH_AI_PROVIDER_MAP = {
  MAXAI_FREE: 'MAXAI_FREE',
  // 这个 chatgpt web app 是不需要打开新窗口作为保护进程的，与 AI_PROVIDER_MAP.OPENAI 不同
  OPENAI: 'OPENAI',
  USE_CHAT_GPT_PLUS: 'USE_CHAT_GPT_PLUS',
  MAXAI_CLAUDE: 'MAXAI_CLAUDE',
  OPENAI_API: 'OPENAI_API',
  CLAUDE: 'CLAUDE',
  BING: 'BING',
  BARD: 'BARD',
} as const

export type ISearchWithAIProviderType =
  (typeof SEARCH_WITH_AI_PROVIDER_MAP)[keyof typeof SEARCH_WITH_AI_PROVIDER_MAP]

// 由于 search with ai 不让选择 model 所以这里 map 出不同 provider 下使用的 默认 model
export const SEARCH_WITH_AI_DEFAULT_MODEL_BY_PROVIDER: Record<
  ISearchWithAIProviderType,
  string
> = {
  MAXAI_FREE: MAXAI_FREE_MODELS[0].value,
  OPENAI: CHATGPT_3_5_MODEL_NAME,
  USE_CHAT_GPT_PLUS: USE_CHAT_GPT_PLUS_MODELS[0].value,
  MAXAI_CLAUDE: 'claude-3-haiku',
  OPENAI_API: OPENAI_API_MODELS[0].value,
  CLAUDE: CLAUDE_MODELS[0].value,
  BING: BARD_MODELS[0].value,
  BARD: BING_MODELS[0].value,
}

export const TRIGGER_MODE_OPTIONS = [
  {
    name: 'feature__search_with_ai__trigger_mode__always__name',
    value: 'always',
    desc: 'feature__search_with_ai__trigger_mode__always__desc',
  },
  {
    name: 'feature__search_with_ai__trigger_mode__question-mask__name',
    value: 'question-mask',
    desc: 'feature__search_with_ai__trigger_mode__question-mask__desc',
  },
  {
    name: 'feature__search_with_ai__trigger_mode__manual__name',
    value: 'manual',
    desc: 'feature__search_with_ai__trigger_mode__manual__desc',
  },
] as const

export * from './searchWithAIPrompt'
