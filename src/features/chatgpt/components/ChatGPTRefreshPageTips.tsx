import React, { FC } from 'react'
import Stack from '@mui/material/Stack'
import { APP_USE_CHAT_GPT_HOST } from '@/constants'
import { UseChatGptIcon } from '@/components/CustomIcon'
import Typography from '@mui/material/Typography'
import Link from '@mui/material/Link'
import Button from '@mui/material/Button'
import RefreshIcon from '@mui/icons-material/Refresh'
import Alert from '@mui/material/Alert'
import { useTranslation } from 'react-i18next'
// import { backgroundSendClientMessage } from '@/background/utils'

const ChatGPTRefreshPageTips: FC = () => {
  const { t } = useTranslation(['common', 'client'])
  return (
    <Stack minWidth={400} spacing={2} p={1}>
      <Stack
        boxSizing={'border-box'}
        direction={'row'}
        width={'100%'}
        alignItems={'center'}
        justifyContent={'space-between'}
      >
        <Link
          sx={{
            flexShrink: 0,
            textDecoration: 'none!important',
          }}
          href={APP_USE_CHAT_GPT_HOST}
          target={'_blank'}
        >
          <Stack direction={'row'} alignItems={'center'} gap={1}>
            <UseChatGptIcon
              sx={{
                fontSize: 28,
                color: 'inherit',
              }}
            />
            <Typography
              color="text.primary"
              component="h1"
              fontSize={20}
              fontWeight={800}
            >
              {t('client:sidebar__refresh_page__title')}
            </Typography>
          </Stack>
        </Link>
      </Stack>
      <Alert severity={'info'}>
        <Typography fontSize={14} color={'text.primary'} textAlign={'left'}>
          {t('client:sidebar__refresh_page__description')}
        </Typography>
      </Alert>
      <Button
        fullWidth
        color={'primary'}
        variant={'contained'}
        startIcon={<RefreshIcon sx={{ fontSize: 16, color: 'inherit' }} />}
        onClick={async () => {
          window.location.reload()
        }}
      >
        {t('client:sidebar__refresh_page__button')}
      </Button>
    </Stack>
  )
}

export default ChatGPTRefreshPageTips
