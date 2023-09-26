import { getThirdProviderSettings } from '@/background/src/chat/util'
import { PermissionWrapperProps } from '@/features/auth/components/PermissionWrapper'
import { Button, Link, Stack, Typography } from '@mui/material'
import React from 'react'
import { ISearchWithAIProviderType, SEARCH_WITH_AI_PROVIDER_MAP } from './index'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { ContentScriptConnectionV2 } from '@/features/chatgpt'

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
    label: 'MaxAI chatgpt',
    value: SEARCH_WITH_AI_PROVIDER_MAP.USE_CHAT_GPT_PLUS,

    permission: {
      allowedRoles: ['pro'],
      sceneType: 'MAXAI_PAID_MODEL_CLAUDE_INSTANT_V1',
    },
  },

  {
    label: 'MaxAI claude',
    value: SEARCH_WITH_AI_PROVIDER_MAP.MAXAI_CLAUDE,

    permission: {
      allowedRoles: ['pro'],
      sceneType: 'MAXAI_PAID_MODEL_CLAUDE_INSTANT_V1',
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
            <Typography fontSize={'16px'} fontWeight={600} lineHeight={'24px'}>
              Use your own OpenAl API key to power the extension.
            </Typography>
            <Typography fontSize={'14px'} fontWeight={400} lineHeight={'20px'}>
              <span>
                Explore your active models on{' '}
                <Link
                  target={'_blank'}
                  href="https://platform.openai.com/playground?mode=chat"
                  rel="noreferrer noopener nofollow"
                  sx={{
                    color: 'inherit',
                    display: 'inline-flex',
                    textDecorationColor: 'rgba(255,255,255,0.4)',
                    '&:hover': {
                      textDecorationColor: 'rgba(255,255,255,0.6)',
                    },
                  }}
                >
                  OpenAI Playground
                </Link>
                .
              </span>
            </Typography>
            <Button
              variant="contained"
              sx={{
                fontSize: '14px',
                fontWeight: 400,
                width: '100%',
                px: '0',
                py: '6px',
                height: '40px',
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
    label: 'Bard',
    value: SEARCH_WITH_AI_PROVIDER_MAP.BARD,
  },
  {
    label: 'Bing chat',
    value: SEARCH_WITH_AI_PROVIDER_MAP.BING,
  },
]

export default SearchWithAIProviderOptions
