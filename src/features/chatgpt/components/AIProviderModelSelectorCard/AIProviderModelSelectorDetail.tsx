import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { IAIProviderType } from '@/background/provider/chat'
import AIModelIcons from '@/features/chatgpt/components/icons/AIModelIcons'
import { useAIProviderModelsMap } from '@/features/chatgpt/hooks/useAIProviderModels'
import AppLoadingLayout from '@/features/common/components/AppLoadingLayout'
import EllipsisTextWithTooltip from '@/features/common/components/EllipsisTextWithTooltip'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import { numberWithCommas } from '@/utils/dataHelper/numberHelper'

const AIProviderModelSelectorDetail: FC<{
  AIProviderModel: string
  AIProvider: IAIProviderType
  hideAIProviderIcon?: boolean

}> = (props) => {
  const { AIProviderModel, AIProvider, hideAIProviderIcon = false } = props
  const { t } = useTranslation(['common', 'client'])
  const { getAIProviderModelDetail } = useAIProviderModelsMap()
  const { currentSidebarConversationType } = useSidebarSettings()
  const currentAIProviderModelDetail = useMemo(() => {
    return getAIProviderModelDetail(AIProvider, AIProviderModel)
  }, [getAIProviderModelDetail, AIProvider, AIProviderModel])

  const currentAIProviderModelTags = useMemo(() => {
    if (currentAIProviderModelDetail) {
      return typeof currentAIProviderModelDetail.tags === 'function' ? currentAIProviderModelDetail.tags(currentSidebarConversationType) : currentAIProviderModelDetail.tags
    }
    return []
  }, [currentAIProviderModelDetail, currentSidebarConversationType])

  return (
    <AppLoadingLayout loading={!currentAIProviderModelDetail}>
      <Stack
        sx={{
          p: 1,
          flex: 1,
        }}
      >
        <Stack gap={1}>
          <Stack direction={'row'} alignItems={'start'} gap={1}>
            {!hideAIProviderIcon && (
              <AIModelIcons
                aiModelValue={AIProviderModel}
                sx={{
                  fontSize: '24px',
                }}
              />
            )}

            <Typography
              fontSize={'16px'}
              lineHeight={'20px'}
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
            {currentAIProviderModelTags.length ? (
              <Stack direction={'row'} flexWrap={'wrap'} gap={'4px'}>
                {currentAIProviderModelTags.map((tag) => {
                  return (
                    <Typography
                      key={tag}
                      component={'span'}
                      fontSize={'12px'}
                      fontWeight={500}
                      textAlign={'left'}
                      px={0.5}
                      borderRadius={1}
                      bgcolor={(t) =>
                        t.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.08)'
                          : 'rgba(0, 0, 0, 0.08)'
                      }
                      whiteSpace={'nowrap'}
                      sx={{
                        borderRadius: '4px',
                        border: '1px solid',
                        borderColor: 'primary.main',
                        color: 'primary.main',
                      }}
                    >
                      {tag}
                    </Typography>
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
                lineClamp={6}
              >
                {currentAIProviderModelDetail?.poweredBy &&
                  t(`client:provider__model__tooltip_card__label__powered_by`, {
                    COMPANY: currentAIProviderModelDetail.poweredBy,
                  })}{' '}
                {currentAIProviderModelDetail.value !== 'dall-e-3' &&
                  currentAIProviderModelDetail?.maxTokens &&
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
