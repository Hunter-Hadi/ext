import { AI_PROVIDER_MAP } from '@/constants'
import { IAIProviderType } from '@/background/provider/chat'
import Link from '@mui/material/Link'
import React from 'react'

export type AIProviderOptionType = {
  beta: boolean
  label: string
  value: IAIProviderType
  shortDescription: React.ReactNode
  description: string
  authDescription: string
  authButtonText: string
  authOpenInNew: boolean
}
const AIProviderOptions: AIProviderOptionType[] = [
  // {
  //   beta: false,
  //   label: 'Claude (Poe)',
  //   description: '',
  //   value: AI_PROVIDER_MAP.POE,
  //   authDescription: 'Use your own Poe to power the extension.',
  //   shortDescription: `Access Claude beyond the US and UK.`,
  //   authButtonText: 'Continue with Poe web app',
  //   authOpenInNew: false,
  // },
  {
    beta: false,
    label: 'Bing web app',
    description: '',
    value: AI_PROVIDER_MAP.BING,
    authDescription: 'Use your own Bing AI to power the extension.',
    shortDescription: `Enhanced with Bing Search.`,
    authButtonText: 'Continue with Bing web app',
    authOpenInNew: false,
  },
  {
    beta: false,
    label: 'Bard web app',
    description: '',
    value: AI_PROVIDER_MAP.BARD,
    authDescription: 'Use your own Google Bard to power the extension.',
    shortDescription: `Enhanced with Google Search.`,
    authButtonText: 'Continue with Bard web app',
    authOpenInNew: false,
  },
  {
    beta: false,
    label: 'Claude web app',
    value: AI_PROVIDER_MAP.CLAUDE,
    description: '',
    authDescription: 'Use your own Claude to power the extension.',
    shortDescription: '100K context window. Chat with multiple documents.',
    authButtonText: 'Log into Claude web app',
    authOpenInNew: true,
  },
  {
    beta: false,
    label: 'ChatGPT web app',
    description: '',
    value: AI_PROVIDER_MAP.OPENAI,
    authDescription: 'Use your own ChatGPT web app to power the extension.',
    shortDescription: `GPT-4, Web Browsing, Code Interpreter, and Plugins via ChatGPT Plus.`,
    authButtonText: 'Log into ChatGPT web app',
    authOpenInNew: true,
  },
  {
    beta: false,
    label: 'OpenAI API',
    description: '',
    value: AI_PROVIDER_MAP.OPENAI_API,
    authDescription: 'Use your own OpenAl API key to power the extension.',
    shortDescription: (
      <span>
        Explore your active models on{' '}
        <Link
          target={'_blank'}
          href="https://platform.openai.com/playground?mode=chat"
          rel="noreferrer noopener nofollow"
          sx={{
            color: 'inherit',
            display: 'inline-flex',
            textDecorationColor: (t) =>
              t.palette.mode === 'dark'
                ? 'rgba(255,255,255,0.4)'
                : 'rgba(0,0,0,0.4)',
            '&:hover': {
              textDecorationColor: (t) =>
                t.palette.mode === 'dark'
                  ? 'rgba(255,255,255,0.6)'
                  : 'rgba(0,0,0,0.6)',
            },
          }}
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
    value: AI_PROVIDER_MAP.USE_CHAT_GPT_PLUS,
    shortDescription: `As fast as ChatGPT Plus.`,
    authButtonText: 'Continue with ChatGPT',
    authOpenInNew: false,
  },
]
export default AIProviderOptions
