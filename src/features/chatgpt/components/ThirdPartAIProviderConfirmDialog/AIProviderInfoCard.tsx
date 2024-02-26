import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { AIProviderOptionType } from '@/features/chatgpt/components/AIProviderModelSelectorCard/AIProviderOptions'

const AIProviderInfoCard: FC<{
  aiProviderOption: AIProviderOptionType
  authMode?: boolean
  children?: React.ReactNode
  sx?: SxProps
  boxSx?: SxProps
}> = (props) => {
  const { aiProviderOption, children, sx, boxSx, authMode } = props
  const { t } = useTranslation(['common', 'client'])
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
          {/*<AIProviderIcon aiProviderType={aiProviderOption.value} size={24} />*/}
          <Typography fontSize={'16px'} fontWeight={600} color={'text.primary'}>
            {aiProviderOption.label}
          </Typography>
        </Stack>
        {aiProviderOption?.disabled && (
          <Typography
            fontSize={'14px'}
            color={'text.primary'}
            textAlign={'left'}
            fontWeight={700}
          >
            {t(
              'client:sidebar__ai_provider__provider_selector__disabled__description',
            )}
          </Typography>
        )}
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
