import { CHAT_GPT_PROVIDER } from '@/constants'
import { IChatGPTProviderType } from '@/background/provider/chat'

export type AIProviderOptionType = {
  beta: boolean
  label: string
  value: IChatGPTProviderType
  shortDescription: string
  description: string
  authDescription: string
  authButtonText: string
  authOpenInNew: boolean
}
const AIProviderOptions: AIProviderOptionType[] = [
  {
    beta: false,
    label: 'Claude via Poe',
    value: CHAT_GPT_PROVIDER.POE,
    authDescription: 'Use your own Poe to power the extension.',
    shortDescription: `Access Claude beyond the US and UK.`,
    description: 'Access Claude beyond the US and UK.',
    authButtonText: 'Log into your Poe account',
    authOpenInNew: true,
  },
  {
    beta: false,
    label: 'Bing',
    value: CHAT_GPT_PROVIDER.BING,
    authDescription: 'Use your own Bing AI to power the extension.',
    shortDescription: `Use your own Bing AI to power the extension.`,
    description: `You need to log into your own Microsoft account that has access to the New Bing Chat. If your Microsoft account does not have access to the New Bing Chat, you can join the waitlist at bing.com/chat.`,
    authButtonText: 'Log into your own Bing account',
    authOpenInNew: true,
  },
  {
    beta: false,
    label: 'Bard',
    value: CHAT_GPT_PROVIDER.BARD,
    authDescription: 'Use your own Google Bard to power the extension.',
    shortDescription: `Use your own Bard to power the extension.`,
    description: `You need to log into your own Google account that has access to Bard. If your Google account does not have access to Bard, you can join the waitlist at bard.google.com.`,
    authButtonText: 'Log into your own Bard account',
    authOpenInNew: true,
  },
  {
    beta: false,
    label: 'Claude',
    value: CHAT_GPT_PROVIDER.CLAUDE,
    authDescription: 'Use your own Claude to power the extension.',
    shortDescription: `Use your own Claude (operated by Poe) to power the extension.`,
    description: `You need to log into your own Poe account that has access to Claude-instant, Claude-instant-100k, Claude+. If you don't have a Poe account yet, you can easily get one for free on poe.com.`,
    authButtonText: 'Log into your Claude account',
    authOpenInNew: true,
  },
  {
    beta: false,
    label: 'ChatGPT web app',
    value: CHAT_GPT_PROVIDER.OPENAI,
    authDescription: 'Use your own ChatGPT to power the extension.',
    shortDescription: `Use your own ChatGPT web app to power the extension.`,
    description: `You need to log into your own ChatGPT account, and keep the pinned ChatGPT website tab open to power the extension.`,
    authButtonText: 'Log into your ChatGPT account',
    authOpenInNew: true,
  },
  {
    beta: false,
    label: 'OpenAI API',
    value: CHAT_GPT_PROVIDER.OPENAI_API,
    authDescription: 'Use ChatGPT to power the extension.',
    shortDescription: `Use your own OpenAI API key to power the extension.`,
    description: `Most are unaware that all ChatGPT users can easily obtain their own API key for free trial usage from OpenAI. To create your OpenAI API key, refer to the instructions provided on our Settings page.`,
    authButtonText: 'Add your OpenAI API key',
    authOpenInNew: true,
  },
  {
    beta: false,
    label: 'ChatGPT',
    authDescription: 'Use ChatGPT to power the extension.',
    value: CHAT_GPT_PROVIDER.USE_CHAT_GPT_PLUS,
    shortDescription: `As fast as ChatGPT Plus.`,
    description: `As fast as ChatGPT Plus. No country restrictions. Powered by gpt-3.5-turbo.`,
    authButtonText: 'Continue with ChatGPT',
    authOpenInNew: false,
  },
]
export default AIProviderOptions
