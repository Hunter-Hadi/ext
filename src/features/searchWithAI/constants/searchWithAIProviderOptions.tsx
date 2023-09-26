import { getThirdProviderSettings } from '@/background/src/chat/util'
import { PermissionWrapperProps } from '@/features/auth/components/PermissionWrapper'
import { Button, Stack, Typography } from '@mui/material'
import React from 'react'
import { ISearchWithAIProviderType, SEARCH_WITH_AI_PROVIDER_MAP } from './index'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { ContentScriptConnectionV2 } from '@/features/chatgpt'
import SearchWIthAIProviderIcon from '../components/SearchWIthAIProviderIcon'

const port = new ContentScriptConnectionV2()

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
        title: (
          <Stack spacing={1} py={0.5}>
            <Stack direction="row" spacing={1} alignItems="center">
              <SearchWIthAIProviderIcon
                aiProviderType="OPENAI_API"
                isActive
                size={20}
                sx={{
                  verticalAlign: 'middle',
                }}
              />
              <Typography
                fontSize={'16px'}
                fontWeight={600}
                lineHeight={'24px'}
                sx={{
                  color: (t) =>
                    t.palette.mode === 'dark' ? '#fff' : 'rgba(0, 0, 0, 0.87)',
                }}
              >
                OpenAI API
              </Typography>
            </Stack>
            <Typography
              fontSize={'14px'}
              fontWeight={400}
              lineHeight={'20px'}
              sx={{
                color: (t) =>
                  t.palette.mode === 'dark' ? '#fff' : 'rgba(0, 0, 0, 0.87)',
              }}
            >
              {`Use your own OpenAI API key to power 'Search with AI'.`}
            </Typography>
            <Button
              variant="contained"
              sx={{
                fontSize: '14px',
                fontWeight: 400,
                width: '100%',
                px: '0',
                py: '6px',
                height: '48px',
                mt: '16px !important',
              }}
              onClick={async () => {
                await port.postMessage({
                  event: 'Client_authChatGPTProvider',
                  data: {
                    provider: SEARCH_WITH_AI_PROVIDER_MAP.OPENAI_API,
                  },
                })
              }}
            >
              Add you OpenAI API key
              <OpenInNewIcon sx={{ fontSize: '16px', ml: '4px' }} />
            </Button>
          </Stack>
        ),
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
