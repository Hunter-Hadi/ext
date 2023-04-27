export interface IOpenAIApiChatMessage {
  role: 'system' | 'assistant' | 'user'
  content: string
}
export type IOpenAIApiSettingsType = {
  apiKey?: string
  apiHost?: string
  apiModel?: string
  temperature?: number
}
const currentDate = new Date().toISOString().split('T')[0]

export const CHATGPT_SYSTEM_MESSAGE = `You are ChatGPT, a large language model trained by OpenAI. Answer as concisely as possible.\nKnowledge cutoff: 2021-09-01\nCurrent date: ${currentDate}`
