import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { IAIProviderType } from '@/background/provider/chat'
import AIProviderIcon from '@/features/chatgpt/components/icons/AIProviderIcon'
import useAIProviderModels from '@/features/chatgpt/hooks/useAIProviderModels'
import AppLoadingLayout from '@/features/common/components/AppLoadingLayout'
import EllipsisTextWithTooltip from '@/features/common/components/EllipsisTextWithTooltip'
import { numberWithCommas } from '@/utils/dataHelper/numberHelper'

const AIProviderModelSelectorDetail: FC<{
  AIProviderModel: string
  AIProvider: IAIProviderType
  hideAIProviderIcon?: boolean
}> = (props) => {
  const { AIProviderModel, AIProvider, hideAIProviderIcon = false } = props
  const { t } = useTranslation(['common', 'client'])
  const { AI_PROVIDER_MODEL_MAP } = useAIProviderModels()
  const currentAIProviderModelDetail = useMemo(() => {
    return AI_PROVIDER_MODEL_MAP?.[AIProvider]?.find(
      (model) => model.value === AIProviderModel,
    )
  }, [AI_PROVIDER_MODEL_MAP, AIProvider, AIProviderModel])
  return (
    <AppLoadingLayout loading={!currentAIProviderModelDetail}>
      <Stack
        sx={{
          p: 1,
          flex: 1,
        }}
      >
        <Stack gap={1}>
          <Stack direction={'row'} alignItems={'center'} gap={1}>
            {!hideAIProviderIcon && (
              <AIProviderIcon
                aiProviderType={AIProvider}
                sx={{
                  fontSize: '24px',
                }}
              />
            )}

            <Typography
              fontSize={'16px'}
              fontWeight={500}
              color={'text.primary'}
            >
              {currentAIProviderModelDetail?.title}
            </Typography>
          </Stack>
          <Stack textAlign={'left'} width={'100%'} spacing={1}>
            {currentAIProviderModelDetail?.disabled && (
              <Typography
                fontSize={'14px'}
                color={'text.primary'}
                textAlign={'left'}
                fontWeight={700}
              >
                {t('client:provider__model__selector__disabled__description')}
              </Typography>
            )}
            {currentAIProviderModelDetail?.tags?.length ? (
              <Stack direction={'row'} flexWrap={'wrap'} gap={'4px'}>
                {currentAIProviderModelDetail.tags.map((tag) => {
                  return (
                    <Chip
                      sx={{
                        fontSize: '12px',
                        height: '18px',
                        textTransform: 'capitalize',
                        flexShrink: 0,
                        '& > span': {
                          px: '6px',
                        },
                      }}
                      key={tag}
                      label={tag}
                      color="primary"
                      size={'small'}
                      variant={'outlined'}
                    />
                  )
                })}
              </Stack>
            ) : null}
            {currentAIProviderModelDetail?.description && (
              <EllipsisTextWithTooltip
                tooltipZIndex={2147483670}
                fontSize={'12px'}
                color={'text.primary'}
                textAlign={'left'}
                TooltipProps={{
                  placement: 'top',
                }}
                lineClamp={4}
              >
                {currentAIProviderModelDetail?.poweredBy &&
                  t(`client:provider__model__tooltip_card__label__powered_by`, {
                    COMPANY: currentAIProviderModelDetail.poweredBy,
                  })}{' '}
                {currentAIProviderModelDetail?.maxTokens &&
                  t(`client:provider__model__tooltip_card__label__max_tokens`, {
                    MAX_TOKENS: numberWithCommas(
                      currentAIProviderModelDetail.maxTokens,
                      0,
                    ),
                  })}{' '}
                {currentAIProviderModelDetail?.description(t)}
              </EllipsisTextWithTooltip>
            )}
          </Stack>
        </Stack>
      </Stack>
    </AppLoadingLayout>
  )
}
export default AIProviderModelSelectorDetail
