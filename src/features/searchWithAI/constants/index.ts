type ISearchWithAIAppNameMap = 'maxai' | 'webchatgpt'
export const SEARCH_WITH_AI_APP_NAME: ISearchWithAIAppNameMap = 'maxai'

export const SEARCH_WITH_AI_ROOT_ID = 'MAXAI_SEARCH_WITH_AI_ROOT_ID'
export const SEARCH_WITH_AI_SHADOW_CONTAINER_ID =
  'MAXAI_SEARCH_WITH_AI_SHADOW_CONTAINER_ID'

export const SEARCH_WITH_AI_LOGO_ID = 'SEARCH_WITH_AI_LOGO_ID'

export const SEARCH_WITH_AI_DEFAULT_CRAWLING_LIMIT = 6

export const SEARCH_WITH_AI_PROVIDER_MAP = {
  // 这个 chatgpt web app 是不需要打开新窗口作为保护进程的，与 AI_PROVIDER_MAP.OPENAI 不同
  OPENAI: 'OPENAI',
  USE_CHAT_GPT_PLUS: 'USE_CHAT_GPT_PLUS',
  MAXAI_CLAUDE: 'MAXAI_CLAUDE',
  OPENAI_API: 'OPENAI_API',
  CLAUDE: 'CLAUDE',
  BING: 'BING',
  BARD: 'BARD',
} as const

export type ISearchWithAIProviderType = typeof SEARCH_WITH_AI_PROVIDER_MAP[keyof typeof SEARCH_WITH_AI_PROVIDER_MAP]

export * from './searchWithAIPrompt'
