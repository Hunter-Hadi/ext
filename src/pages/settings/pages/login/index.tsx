import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import { GoogleIcon } from '@/components/CustomIcon'
// import { UseChatGptIcon } from '@/components/CustomIcon'
import { APP_USE_CHAT_GPT_HOST } from '@/constants'
const SettingsLoginPage: FC = () => {
  const { t } = useTranslation(['settings', 'common'])
  return (
    <Stack
      sx={{
        mt: 4,
        width: 600,
        mx: 'auto!important',
        alignItems: 'center',
      }}
      spacing={2}
    >
      <Stack
        direction={'row'}
        alignItems={'center'}
        spacing={2}
        flexShrink={0}
        mb={4}
      >
        <Typography fontSize={24} fontWeight={700}>
          {t('settings:sign_in__description')}
        </Typography>
      </Stack>
      <Link
        href={APP_USE_CHAT_GPT_HOST + '/login?auto=true'}
        target={'_blank'}
        sx={{ width: '100%' }}
      >
        <Button
          fullWidth
          disableElevation
          variant={'contained'}
          sx={{
            height: 48,
            color: '#fff',
            border: 'none',
            bgcolor: '#4285F4',
            fontSize: 14,
            '&:hover': {
              bgcolor: '#366dc9',
            },
          }}
        >
          <Stack direction={'row'} spacing={2} alignItems={'center'}>
            <Stack
              sx={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                bgcolor: '#fff',
              }}
              justifyContent={'center'}
              alignItems={'center'}
            >
              <GoogleIcon sx={{ fontSize: '24px' }} />
            </Stack>
            <span>{t('settings:sign_in__google_button_text')}</span>
          </Stack>
        </Button>
      </Link>
      <Divider sx={{ width: '100%' }}>{t('common:or')}</Divider>
      <Link
        href={APP_USE_CHAT_GPT_HOST + '/login-email'}
        target={'_blank'}
        sx={{ width: '100%' }}
      >
        <Button
          fullWidth
          disableElevation
          variant={'outlined'}
          sx={{
            height: 48,
            textIndent: '16px',
            fontSize: 14,
          }}
        >
          <Stack
            direction={'row'}
            spacing={2}
            alignItems={'center'}
            sx={{
              color: 'primary.main',
            }}
          >
            <ContextMenuIcon icon={'Email'} sx={{ fontSize: '24px' }} />
            <span>{t('settings:sign_in__email_button_text')}</span>
          </Stack>
        </Button>
      </Link>
    </Stack>
  )
}
export default SettingsLoginPage
