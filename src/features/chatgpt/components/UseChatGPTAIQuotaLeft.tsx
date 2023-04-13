import React, { FC, useEffect } from 'react'
import { CircularProgress, Link, Stack, Typography } from '@mui/material'
import { APP_USE_CHAT_GPT_HOST } from '@/types'
import { GiftIcon } from '@/components/CustomIcon'
import { RefreshOutlined } from '@mui/icons-material'
import { useUseChatGPTUserInfo } from '@/features/chatgpt'

const UseChatGPTAIQuotaLeft: FC = () => {
  const { loading, quotaLeftText, syncUserInfo } = useUseChatGPTUserInfo()
  const onceTimes = React.useRef(0)
  useEffect(() => {
    if (onceTimes.current === 0) {
      syncUserInfo()
      onceTimes.current += 1
    }
  }, [])
  return (
    <Stack spacing={0.5}>
      <Stack direction={'row'} alignItems={'center'} spacing={1}>
        <Typography fontSize={'12px'} color={'text.primary'}>
          {`Quota left: ${quotaLeftText}`}
        </Typography>
        {loading ? (
          <CircularProgress size={12} sx={{ color: 'text.primary' }} />
        ) : (
          <RefreshOutlined
            onClick={syncUserInfo}
            sx={{ fontSize: 16, color: 'text.primary', cursor: 'pointer' }}
          />
        )}
      </Stack>
      <Link
        href={APP_USE_CHAT_GPT_HOST + '/account/referral'}
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
            Get free quota!
          </Typography>
        </Stack>
      </Link>
    </Stack>
  )
}

export default UseChatGPTAIQuotaLeft
