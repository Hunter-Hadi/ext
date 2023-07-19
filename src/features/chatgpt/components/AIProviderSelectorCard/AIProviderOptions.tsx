import { CHAT_GPT_PROVIDER } from '@/constants'
import { IChatGPTProviderType } from '@/background/provider/chat'
import Link from '@mui/material/Link'
import React from 'react'

export type AIProviderOptionType = {
  beta: boolean
  label: string
  value: IChatGPTProviderType
  shortDescription: React.ReactNode
  description: string
  authDescription: string
  authButtonText: string
  authOpenInNew: boolean
}
const AIProviderOptions: AIProviderOptionType[] = [
  {
    beta: false,
    label: 'Claude via Poe',
    description: '',
    value: CHAT_GPT_PROVIDER.POE,
    authDescription: 'Use your own Poe to power the extension.',
    shortDescription: `Access Claude beyond the US and UK.`,
    authButtonText: 'Log into your Poe account',
    authOpenInNew: true,
  },
  {
    beta: false,
    label: 'Bing',
    description: '',
    value: CHAT_GPT_PROVIDER.BING,
    authDescription: 'Use your own Bing AI to power the extension.',
    shortDescription: `Enhanced with Bing Search.`,
    authButtonText: 'Log into your Bing account',
    authOpenInNew: true,
  },
  {
    beta: false,
    label: 'Bard',
    description: '',
    value: CHAT_GPT_PROVIDER.BARD,
    authDescription: 'Use your own Google Bard to power the extension.',
    shortDescription: `Enhanced with Google Search.`,
    authButtonText: 'Log into your Bard account',
    authOpenInNew: true,
  },
  // TODO - claude还没开放
  // {
  //   beta: false,
  //   label: 'Claude',
  //   value: CHAT_GPT_PROVIDER.CLAUDE,
  //   authDescription: 'Use your own Claude to power the extension.',
  //   shortDescription: `100K context window. Chat with multiple documents.`,
  //   authButtonText: 'Log into your Claude account',
  //   authOpenInNew: true,
  // },
  {
    beta: false,
    label: 'ChatGPT web app',
    description: '',
    value: CHAT_GPT_PROVIDER.OPENAI,
    authDescription: 'Use your own ChatGPT to power the extension.',
    shortDescription: `GPT-4, Web Browsing, Code Interpreter, and Plugins via ChatGPT Plus.`,
    authButtonText: 'Log into ChatGPT web app',
    authOpenInNew: true,
  },
  {
    beta: false,
    label: 'OpenAI API',
    description: '',
    value: CHAT_GPT_PROVIDER.OPENAI_API,
    authDescription: 'Use your own OpenAl API key to power the extension.',
    shortDescription: (
      <span>
        Explore your active models on{' '}
        <Link
          target={'_blank'}
          href="https://platform.openai.com/playground?mode=chat"
          rel="noreferrer noopener nofollow"
          sx={{ color: 'inherit' }}
        >
          OpenAI Playground
        </Link>
        .
      </span>
    ),
    authButtonText: 'Add your OpenAI API key',
    authOpenInNew: true,
  },
  {
    beta: false,
    description: '',
    label: 'ChatGPT',
    authDescription: 'Use ChatGPT to power the extension.',
    value: CHAT_GPT_PROVIDER.USE_CHAT_GPT_PLUS,
    shortDescription: `As fast as ChatGPT Plus.`,
    authButtonText: 'Continue with ChatGPT',
    authOpenInNew: false,
  },
]
export default AIProviderOptions
