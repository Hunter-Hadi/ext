import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { IAIProviderType } from '@/background/provider/chat'
import { APP_USE_CHAT_GPT_HOST } from '@/constants'
import AIProviderIcon from '@/features/chatgpt/components/AIProviderSelectorCard/AIProviderIcon'
import { AIProviderOptionType } from '@/features/chatgpt/components/AIProviderSelectorCard/AIProviderOptions'

const AIProviderInfoCard: FC<{
  aiProviderOption: AIProviderOptionType
  authMode?: boolean
  children?: React.ReactNode
  sx?: SxProps
  boxSx?: SxProps
}> = (props) => {
  const { aiProviderOption, children, sx, boxSx, authMode } = props
  const { t } = useTranslation(['common', 'client'])
  const beautyQueryMap: {
    [key in IAIProviderType]: string
  } = {
    USE_CHAT_GPT_PLUS: 'chatgpt',
    OPENAI: 'chatgpt_web_app',
    OPENAI_API: 'openai_api',
    BARD: 'bard_web_app',
    BING: 'bing_web_app',
    POE: 'poe',
    CLAUDE: 'claude_web_app',
    MAXAI_CLAUDE: 'claude',
    MAXAI_GEMINI: 'gemini',
    MAXAI_DALLE: 'MAXAI_DALLE',
  }
  return (
    <Stack
      alignItems={'center'}
      justifyContent={'space-between'}
      sx={{
        height: '100%',
        ...sx,
      }}
    >
      <Stack
        p={1}
        spacing={1}
        width={'100%'}
        sx={{
          textAlign: 'left',
        }}
      >
        {/*logo*/}
        <Stack direction={'row'} spacing={1}>
          <AIProviderIcon aiProviderType={aiProviderOption.value} size={24} />
          <Typography fontSize={'16px'} fontWeight={600} color={'text.primary'}>
            {aiProviderOption.label}
          </Typography>
        </Stack>
        {authMode && (
          <Typography
            fontSize={'14px'}
            color={'text.secondary'}
            fontWeight={400}
          >
            {t(aiProviderOption.authDescription as any)}
          </Typography>
        )}
        <Typography fontSize={'14px'} color={'text.secondary'} fontWeight={400}>
          {aiProviderOption.shortDescription(t)}
        </Typography>
        <Box display={'flex'}>
          <Link
            href={`${APP_USE_CHAT_GPT_HOST}/get-started?provider=${
              beautyQueryMap[aiProviderOption.value]
            }#ai-provider`}
            target={'_blank'}
            underline={'always'}
            sx={{
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
            <Typography
              fontSize={'14px'}
              color={'text.secondary'}
              fontWeight={400}
              component={'span'}
            >
              {t('common:learn_more')}
            </Typography>
          </Link>
        </Box>
      </Stack>
      <Stack
        sx={{
          width: '100%',
          p: 1,
          ...boxSx,
        }}
      >
        {children}
      </Stack>
    </Stack>
  )
}
export default AIProviderInfoCard
