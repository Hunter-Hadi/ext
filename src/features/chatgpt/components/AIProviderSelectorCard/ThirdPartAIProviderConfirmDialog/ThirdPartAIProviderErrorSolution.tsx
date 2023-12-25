import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React from 'react'
import { useTranslation } from 'react-i18next'

import useAIProviderModels from '@/features/chatgpt/hooks/useAIProviderModels'

import ThirdPartAIProviderForEnhancedStability from './ThirdPartAIProviderForEnhancedStability'

const ThirdPartAIProviderErrorSolution = () => {
  const { t } = useTranslation(['client'])

  const { currentAIProviderDetail } = useAIProviderModels()

  return (
    <Stack spacing={2}>
      <Divider />
      <Stack direction={'row'} spacing={1} alignItems="center">
        <WarningAmberOutlinedIcon
          sx={{
            color: 'rgba(219, 68, 55, 1)',
            fontSize: 24,
          }}
        />

        <Typography
          fontSize={16}
          fontWeight={500}
          color={'text.primary'}
          lineHeight={1.5}
        >
          {t('client:provider__confirm_dialog__integration_issue_detected')}
        </Typography>
      </Stack>

      <Typography
        fontSize={14}
        fontWeight={400}
        color={'text.secondary'}
        lineHeight={1.5}
        mt={'4px !important'}
      >
        {t(
          'client:provider__confirm_dialog__integration_issue_detected__desc',
          {
            label: t(currentAIProviderDetail?.label as any),
          },
        )}
      </Typography>
      <ThirdPartAIProviderForEnhancedStability />
    </Stack>
  )
}

export default ThirdPartAIProviderErrorSolution
