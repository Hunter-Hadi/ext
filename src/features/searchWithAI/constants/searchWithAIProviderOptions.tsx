import React from 'react'

import { getAIProviderSettings } from '@/background/src/chat/util'
import { PermissionWrapperProps } from '@/features/auth/components/PermissionWrapper'

import OpenAICheckerTooltip from '../components/OpenAICheckerTooltip'
import { ISearchWithAIProviderType, SEARCH_WITH_AI_PROVIDER_MAP } from './index'

export interface ISearchWithAIProviderOptionsType {
  label: string
  value: ISearchWithAIProviderType
  isThirdParty: boolean

  // permission?: Partial<PermissionWrapperProps>
  permission?: {
    allowedRoles: PermissionWrapperProps['allowedRoles']
    sceneType: PermissionWrapperProps['sceneType']
  }
  preChangeChecker?: {
    checker?: () => Promise<boolean> | boolean
    tooltip?: {
      title?: React.ReactNode
    }
  }
}

const SearchWithAIProviderOptions: ISearchWithAIProviderOptionsType[] = [
  {
    label: 'Free AI',
    value: SEARCH_WITH_AI_PROVIDER_MAP.MAXAI_FREE,
    isThirdParty: false,
  },
  {
    label: 'ChatGPT',
    value: SEARCH_WITH_AI_PROVIDER_MAP.USE_CHAT_GPT_PLUS,
    isThirdParty: false,

    permission: {
      allowedRoles: ['pro', 'elite', 'basic'],
      sceneType: 'SEARCH_WITH_AI_CHATGPT',
    },
  },
  {
    label: 'Claude',
    value: SEARCH_WITH_AI_PROVIDER_MAP.MAXAI_CLAUDE,
    isThirdParty: false,

    permission: {
      allowedRoles: ['pro', 'elite', 'basic'],
      sceneType: 'SEARCH_WITH_AI_CLAUDE',
    },
  },

  {
    label: 'Bing web app',
    value: SEARCH_WITH_AI_PROVIDER_MAP.BING,
    isThirdParty: true,
  },
  {
    label: 'Gemini web app',
    value: SEARCH_WITH_AI_PROVIDER_MAP.BARD,
    isThirdParty: true,
  },
  {
    label: 'Claude web app',
    value: SEARCH_WITH_AI_PROVIDER_MAP.CLAUDE,
    isThirdParty: true,
  },
  {
    label: 'ChatGPT web app',
    value: SEARCH_WITH_AI_PROVIDER_MAP.OPENAI,
    isThirdParty: true,
  },
  {
    label: 'OpenAI API',
    value: SEARCH_WITH_AI_PROVIDER_MAP.OPENAI_API,
    isThirdParty: true,
    preChangeChecker: {
      checker: async () => {
        const settings = await getAIProviderSettings('OPENAI_API')
        return !!settings?.apiKey
      },
      tooltip: {
        title: <OpenAICheckerTooltip />,
      },
    },
  },
]

export default SearchWithAIProviderOptions
