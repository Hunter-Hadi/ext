import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { AIChipIcon } from '@/components/CustomIcon'
import { BaseSelect } from '@/components/select'
import AIProviderOptions from '@/features/chatgpt/components/AIProviderSelectorCard/AIProviderOptions'
import useThirdAIProviderModels from '@/features/chatgpt/hooks/useThirdAIProviderModels'
import AppLoadingLayout from '@/features/common/components/AppLoadingLayout'

const ThirdPartyAIProvidersOptions = AIProviderOptions.filter(
  (AIProviderOption) => AIProviderOption.thirdParty,
)
const ThirdPartyAIProviderModelSelectorCard: FC<{
  sx?: SxProps
}> = (props) => {
  const { sx } = props
  const { t } = useTranslation(['client'])
  const {
    currentThirdAIProviderModelOptions,
    currentThirdAIProvider,
    currentThirdAIProviderModel,
  } = useThirdAIProviderModels()
  return (
    <Stack
      sx={{
        gap: 2,
        px: 2,
        py: 1.5,
        ...sx,
      }}
    >
      <Stack direction={'row'} spacing={1} alignItems="center">
        <AIChipIcon
          sx={{
            color: '#0FA47F',
            fontSize: '24px',
          }}
        />
        <Typography
          fontSize={16}
          fontWeight={500}
          color={'text.primary'}
          lineHeight={1.5}
        >
          {t(
            'client:provider__third_party_confirm_dialog__choose_third_party__title',
          )}
        </Typography>
      </Stack>
      <AppLoadingLayout loading={!currentThirdAIProviderModel}>
        <Stack direction={'row'} alignItems={'center'} gap={2}>
          <BaseSelect
            sx={{
              width: '100%',
            }}
            MenuProps={{
              style: {
                zIndex: 2147483640,
              },
            }}
            defaultValue={currentThirdAIProvider}
            options={ThirdPartyAIProvidersOptions}
            label={t(
              'client:provider__third_party_confirm_dialog__choose_third_party__selector__ai_provider__title',
            )}
          />
          <BaseSelect
            sx={{
              width: '100%',
            }}
            MenuProps={{
              style: {
                zIndex: 2147483640,
              },
            }}
            defaultValue={currentThirdAIProviderModel}
            options={currentThirdAIProviderModelOptions}
            label={t(
              'client:provider__third_party_confirm_dialog__choose_third_party__selector__ai_provider__title',
            )}
          />
        </Stack>
      </AppLoadingLayout>
    </Stack>
  )
}
export default ThirdPartyAIProviderModelSelectorCard
