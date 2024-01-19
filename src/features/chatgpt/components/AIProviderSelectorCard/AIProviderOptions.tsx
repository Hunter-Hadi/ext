import Link from '@mui/material/Link'
import { TFunction } from 'i18next'
import React from 'react'

import { IAIProviderType } from '@/background/provider/chat'
import { AI_PROVIDER_MAP } from '@/constants'
import { I18nextKeysType } from '@/i18next'

export type AIProviderOptionType = {
  beta: boolean
  label: string
  value: IAIProviderType
  shortDescription: (t: TFunction<['common', 'client']>) => React.ReactNode
  description: string
  authDescription: I18nextKeysType
  authButtonText: I18nextKeysType
  authOpenInNew: boolean
  isThirdParty: boolean
}
const AIProviderOptions: AIProviderOptionType[] = [
  // {
  //   beta: false,
  //   label: 'client:provider__poe__title',
  //   description: '',
  //   value: AI_PROVIDER_MAP.POE,
  //   authDescription: 'client:provider__poe__auth_description',
  //   shortDescription: `client:provider__poe__short_description`,
  //   authButtonText: 'client:provider__bing_web_app__auth_button_text',
  //   authOpenInNew: false,
  // },
  {
    beta: false,
    label: 'Bing web app',
    description: '',
    value: AI_PROVIDER_MAP.BING,
    authDescription: 'client:provider__bing_web_app__auth_description',
    shortDescription: (t) =>
      t(`client:provider__bing_web_app__short_description`),
    authButtonText: `client:provider__bing_web_app__auth_button_text`,
    authOpenInNew: false,
    isThirdParty: true,
  },
  {
    beta: false,
    label: 'Bard web app',
    description: '',
    value: AI_PROVIDER_MAP.BARD,
    authDescription: `client:provider__bard_web_app__auth_description`,
    shortDescription: (t) =>
      t(`client:provider__bard_web_app__short_description`),
    authButtonText: `client:provider__bard_web_app__auth_button_text`,
    authOpenInNew: false,
    isThirdParty: true,
  },
  {
    beta: false,
    label: 'Claude web app',
    value: AI_PROVIDER_MAP.CLAUDE,
    description: '',
    authDescription: `client:provider__claude_web_app__auth_description`,
    shortDescription: (t) =>
      t(`client:provider__claude_web_app__short_description`),
    authButtonText: `client:provider__claude_web_app__auth_button_text`,
    authOpenInNew: true,
    isThirdParty: true,
  },
  {
    beta: false,
    label: 'ChatGPT web app',
    description: '',
    value: AI_PROVIDER_MAP.OPENAI,
    authDescription: `client:provider__chatgpt_web_app__auth_description`,
    shortDescription: (t) =>
      t(`client:provider__chatgpt_web_app__short_description`),
    authButtonText: `client:provider__chatgpt_web_app__auth_button_text`,
    authOpenInNew: true,
    isThirdParty: true,
  },
  {
    beta: false,
    label: 'OpenAI API',
    description: '',
    value: AI_PROVIDER_MAP.OPENAI_API,
    authDescription: `client:provider__openai_api__auth_description`,
    // eslint-disable-next-line react/display-name
    shortDescription: (t) => (
      <span>
        {t(`client:provider__openai_api__short_description1`)}{' '}
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
          {t(`client:provider__openai_api__short_description2`)}
        </Link>
        {t(`client:provider__openai_api__short_description3`)}
      </span>
    ),
    authButtonText: `client:provider__openai_api__auth_button_text`,
    authOpenInNew: true,
    isThirdParty: true,
  },
  {
    beta: true,
    label: 'Gemini',
    value: AI_PROVIDER_MAP.MAXAI_GEMINI,
    description: '',
    authDescription: `client:provider__gemini__auth_description`,
    shortDescription: (t) => t(`client:provider__gemini__short_description`),
    authButtonText: `client:provider__gemini__auth_button_text`,
    authOpenInNew: false,
    isThirdParty: false,
  },
  {
    beta: false,
    label: 'Claude',
    value: AI_PROVIDER_MAP.MAXAI_CLAUDE,
    description: '',
    authDescription: `client:provider__claude__auth_description`,
    shortDescription: (t) => t(`client:provider__claude__short_description`),
    authButtonText: `client:provider__claude__auth_button_text`,
    authOpenInNew: false,
    isThirdParty: false,
  },
  {
    beta: false,
    description: '',
    label: 'ChatGPT',
    authDescription: `client:provider__chatgpt__auth_description`,
    value: AI_PROVIDER_MAP.USE_CHAT_GPT_PLUS,
    shortDescription: (t) => t(`client:provider__chatgpt__short_description`),
    authButtonText: `client:provider__chatgpt__auth_button_text`,
    authOpenInNew: false,
    isThirdParty: false,
  },
  {
    beta: false,
    description: '',
    label: 'Free',
    authDescription: `client:provider__chatgpt__auth_description`,
    value: AI_PROVIDER_MAP.MAXAI_FREE,
    shortDescription: (t) => t(`client:provider__chatgpt__short_description`),
    authButtonText: `client:provider__chatgpt__auth_button_text`,
    authOpenInNew: false,
    isThirdParty: false,
  },
]
export default AIProviderOptions
