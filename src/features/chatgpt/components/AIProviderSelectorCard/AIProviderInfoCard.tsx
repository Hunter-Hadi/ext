import React, { FC } from 'react'
import { AIProviderOptionType } from '@/features/chatgpt/components/AIProviderSelectorCard/AIProviderOptions'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import AIProviderIcon from '@/features/chatgpt/components/AIProviderSelectorCard/AIProviderIcon'
import Typography from '@mui/material/Typography'
import Link from '@mui/material/Link'
import { APP_USE_CHAT_GPT_HOST } from '@/constants'
import { IAIProviderType } from '@/background/provider/chat'
import Box from '@mui/material/Box'

const AIProviderInfoCard: FC<{
  aiProviderOption: AIProviderOptionType
  authMode?: boolean
  children?: React.ReactNode
  sx?: SxProps
  boxSx?: SxProps
}> = (props) => {
  const { aiProviderOption, children, sx, boxSx, authMode } = props
  const beautyQueryMap: {
    [key in IAIProviderType]: string
  } = {
    USE_CHAT_GPT_PLUS: 'chatgpt',
    OPENAI: 'chatgpt_web_app',
    OPENAI_API: 'chatgpt_api',
    BARD: 'bard',
    BING: 'bing',
    POE: 'poe',
    CLAUDE: 'claude',
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
            {aiProviderOption.authDescription}
          </Typography>
        )}
        <Typography fontSize={'14px'} color={'text.secondary'} fontWeight={400}>
          {aiProviderOption.shortDescription}
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
              Learn more
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
