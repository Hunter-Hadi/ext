import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { authEmitPricingHooksLog } from '@/features/auth/utils/log'
import useEffectOnce from '@/features/common/hooks/useEffectOnce'

const DailyLimitUsageQueriesCard = () => {
  const { t } = useTranslation()

  useEffectOnce(() => {
    // 记录日志
    authEmitPricingHooksLog('show', 'TOTAL_CHAT_DAILY_LIMIT')
  })

  return (
    <Stack
      spacing={1.5}
      p={2.5}
      sx={{
        background: 'linear-gradient(315deg, #F5C8F5 0%, #DADDFA 83.85%)',
        borderRadius: 2,
      }}
    >
      <Stack
        direction={'row'}
        alignItems="center"
        spacing={0.5}
        fontSize={24}
        color="#B54708"
      >
        <Typography
          fontSize={'inherit'}
          lineHeight={1.4}
          fontWeight={700}
          color="inherit"
        >
          {t('common:unlimited')}
        </Typography>
        <AutoAwesomeIcon fontSize="inherit" color="inherit" />
      </Stack>
      <Box
        sx={{
          height: '1px',
          background:
            'linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.6) 50.19%, rgba(255, 255, 255, 0) 100%)',
        }}
      />
      {/* fast text */}
      <Stack direction={'row'} spacing={1.5}>
        <CheckOutlinedIcon
          sx={{
            color: '#34A853',
          }}
        />
        <Typography fontSize={16} lineHeight={1.5} color="#667085">
          {t(
            'client:permission__pricing_hook__daily_limit__queries_card__fast_text__label',
          )}
          {` `}
          <Typography fontSize={'inherit'} color="#000000DE" component={'span'}>
            GPT-3.5, Claude-3-haiku, Gemini-Pro
          </Typography>
        </Typography>
      </Stack>

      {/* advanced text */}
      <Stack direction={'row'} spacing={1.5}>
        <CheckOutlinedIcon
          sx={{
            color: '#34A853',
          }}
        />
        <Typography fontSize={16} lineHeight={1.5} color="#667085">
          {t(
            'client:permission__pricing_hook__daily_limit__queries_card__advanced_text__label',
          )}
          {` `}
          <Typography fontSize={'inherit'} color="#000000DE" component={'span'}>
            GPT-4-turbo, Claude-3-opus, Claude-3-sonnet, GPT-4, Gemini-1.5 Pro
          </Typography>
        </Typography>
      </Stack>

      {/* image generate */}
      <Stack direction={'row'} spacing={1.5}>
        <CheckOutlinedIcon
          sx={{
            color: '#34A853',
          }}
        />
        <Typography fontSize={16} lineHeight={1.5} color="#667085">
          {t(
            'client:permission__pricing_hook__daily_limit__queries_card__images_generate__label',
          )}
          {` `}
          <Typography fontSize={'inherit'} color="#000000DE" component={'span'}>
            DALL·E 3
          </Typography>
        </Typography>
      </Stack>
    </Stack>
  )
}

export default DailyLimitUsageQueriesCard
