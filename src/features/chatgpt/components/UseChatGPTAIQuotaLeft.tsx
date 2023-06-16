import React, { FC } from 'react'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'

import { APP_USE_CHAT_GPT_HOST } from '@/constants'
import { GiftIcon } from '@/components/CustomIcon'
import RefreshOutlined from '@mui/icons-material/RefreshOutlined'
import { useUseChatGPTUserInfo } from '@/features/chatgpt/hooks'
import Tooltip from '@mui/material/Tooltip'
import useEffectOnce from '@/hooks/useEffectOnce'

const UseChatGPTAIQuotaLeft: FC = () => {
  const { loading, quotaLeftText, syncUserInfo } = useUseChatGPTUserInfo()
  useEffectOnce(() => {
    syncUserInfo()
  })
  return (
    <Stack spacing={0.5}>
      <Stack direction={'row'} alignItems={'center'} spacing={1}>
        <Typography fontSize={'12px'} color={'text.primary'}>
          {`Free AI left: ${quotaLeftText}`}
        </Typography>
        {loading ? (
          <CircularProgress size={12} sx={{ color: 'text.primary' }} />
        ) : (
          <Tooltip title={'Refresh Free AI status'} placement={'top'}>
            <RefreshOutlined
              onClick={syncUserInfo}
              sx={{ fontSize: 16, color: 'text.primary', cursor: 'pointer' }}
            />
          </Tooltip>
        )}
      </Stack>
      <Link
        href={APP_USE_CHAT_GPT_HOST + '/referral'}
        target={'_blank'}
        rel="noreferrer"
      >
        <Stack
          alignItems={'center'}
          spacing={'0.5'}
          direction={'row'}
          sx={{ cursor: 'pointer' }}
          height={'18px'}
        >
          <GiftIcon
            sx={{
              position: 'relative',
              top: 3,
              fontSize: 24,
              width: 24,
              height: 24,
              color: 'primary.main',
            }}
          />
          <Typography fontSize={'12px'} fontWeight={500} color={'primary.main'}>
            Get more Free AI!
          </Typography>
        </Stack>
      </Link>
    </Stack>
  )
}

export default UseChatGPTAIQuotaLeft
