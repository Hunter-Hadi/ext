import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { BaseSelect } from '@/components/select'
import useThirdAIProviderModels from '@/features/chatgpt/hooks/useThirdAIProviderModels'
import EllipsisTextWithTooltip from '@/features/common/components/EllipsisTextWithTooltip'

const ThirdPartyAIProviderModelSelectorDetail: FC = () => {
  const { t } = useTranslation(['common', 'client'])
  const {
    currentThirdAIProviderDetail,
    showThirdPartyAIProviderConfirmDialog,
  } = useThirdAIProviderModels()
  return (
    <Stack
      sx={{
        p: 1,
        flex: 1,
      }}
    >
      <Stack gap={1}>
        <Stack direction={'row'} alignItems={'center'} gap={1}>
          <Typography fontSize={'16px'} fontWeight={500} color={'text.primary'}>
            {t(
              'client:sidebar__ai_provider__model_selector__third_party_ai_provider__title',
            )}
          </Typography>
        </Stack>
        <Stack textAlign={'left'} width={'100%'} spacing={1}>
          <EllipsisTextWithTooltip
            tooltipZIndex={2147483670}
            fontSize={'12px'}
            color={'text.primary'}
            textAlign={'left'}
            TooltipProps={{
              placement: 'top',
            }}
            lineClamp={10}
          >
            {t(
              'client:sidebar__ai_provider__model_selector__third_party_ai_provider__description',
            )}
          </EllipsisTextWithTooltip>
        </Stack>
      </Stack>
      <Stack mt={'auto'} mb={0}>
        <Stack
          width={'100%'}
          onMouseDownCapture={async (event) => {
            event.stopPropagation()
            event.preventDefault()
            showThirdPartyAIProviderConfirmDialog()
          }}
        >
          {currentThirdAIProviderDetail && (
            <BaseSelect
              sx={{
                width: '100%',
              }}
              options={[
                {
                  label: currentThirdAIProviderDetail.label,
                  value: currentThirdAIProviderDetail.value,
                },
              ]}
              value={currentThirdAIProviderDetail.value}
              label={t(
                'client:sidebar__ai_provider__model_selector__third_party_ai_provider__selector__title',
              )}
            />
          )}
        </Stack>
      </Stack>
    </Stack>
  )
}
export default ThirdPartyAIProviderModelSelectorDetail
