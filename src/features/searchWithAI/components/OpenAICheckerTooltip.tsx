import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { ContentScriptConnectionV2 } from '@/features/chatgpt'

import SearchWIthAIProviderIcon from '../components/SearchWIthAIProviderIcon'
import { SEARCH_WITH_AI_PROVIDER_MAP } from '../constants'

const port = new ContentScriptConnectionV2()

const OpenAICheckerTooltip = () => {
  const { t } = useTranslation(['client'])

  return (
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
        {t(
          'client:permission__pricing_hook__search_with_ai_openai_api__checker_description',
        )}
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
        {t('client:provider__openai_api__auth_button_text')}
        <OpenInNewIcon sx={{ fontSize: '16px', ml: '4px' }} />
      </Button>
    </Stack>
  )
}

export default OpenAICheckerTooltip
