import { getThirdProviderSettings } from '@/background/src/chat/util'
import { PermissionWrapperProps } from '@/features/auth/components/PermissionWrapper'
import React from 'react'
import OpenAICheckerTooltip from '../components/OpenAICheckerTooltip'
import { ISearchWithAIProviderType, SEARCH_WITH_AI_PROVIDER_MAP } from './index'

export interface ISearchWithAIProviderOptionsType {
  label: string
  value: ISearchWithAIProviderType

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
    label: 'ChatGPT',
    value: SEARCH_WITH_AI_PROVIDER_MAP.USE_CHAT_GPT_PLUS,

    permission: {
      allowedRoles: ['pro'],
      sceneType: 'SEARCH_WITH_AI_CHATGPT',
    },
  },
  {
    label: 'Claude',
    value: SEARCH_WITH_AI_PROVIDER_MAP.MAXAI_CLAUDE,

    permission: {
      allowedRoles: ['pro'],
      sceneType: 'SEARCH_WITH_AI_CLAUDE',
    },
  },

  {
    label: 'OpenAI API',
    value: SEARCH_WITH_AI_PROVIDER_MAP.OPENAI_API,
    preChangeChecker: {
      checker: async () => {
        const settings = await getThirdProviderSettings('OPENAI_API')
        return !!settings?.apiKey
      },
      tooltip: {
        title: <OpenAICheckerTooltip />,
      },
    },
  },
  {
    label: 'ChatGPT web app',
    value: SEARCH_WITH_AI_PROVIDER_MAP.OPENAI,
  },
  {
    label: 'Claude web app',
    value: SEARCH_WITH_AI_PROVIDER_MAP.CLAUDE,
  },
  {
    label: 'Bard web app',
    value: SEARCH_WITH_AI_PROVIDER_MAP.BARD,
  },
  {
    label: 'Bing web app',
    value: SEARCH_WITH_AI_PROVIDER_MAP.BING,
  },
]

export default SearchWithAIProviderOptions
