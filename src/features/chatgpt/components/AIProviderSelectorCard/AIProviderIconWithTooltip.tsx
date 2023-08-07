import React, { FC, useMemo } from 'react'
import AIProviderIcon, {
  AIProviderIconProps,
} from '@/features/chatgpt/components/AIProviderSelectorCard/AIProviderIcon'
import TextOnlyTooltip, {
  TextOnlyTooltipProps,
} from '@/components/TextOnlyTooltip'
import useAIProviderModels from '@/features/chatgpt/hooks/useAIProviderModels'
import { UseChatGptIcon } from '@/components/CustomIcon'
import Box from '@mui/material/Box'
import { useTranslation } from 'react-i18next'

interface AIProviderIconWithTooltipProps
  extends Omit<AIProviderIconProps, 'aiProviderType'> {
  TooltipProps?: Omit<TextOnlyTooltipProps, 'title' | 'children'>
}
const AIProviderIconWithTooltip: FC<AIProviderIconWithTooltipProps> = ({
  TooltipProps,
  ...props
}) => {
  const { currentAIProviderDetail, currentAIProviderModelDetail } =
    useAIProviderModels()
  const { t } = useTranslation(['common', 'client'])
  const title = useMemo(() => {
    if (currentAIProviderDetail && currentAIProviderModelDetail) {
      const providerLabel =
        t(currentAIProviderDetail.label as any) !==
        currentAIProviderDetail.label
          ? t(currentAIProviderDetail.label as any)
          : currentAIProviderDetail.label
      const modelLabel =
        t(currentAIProviderModelDetail.title as any) !==
        currentAIProviderModelDetail.title
          ? t(currentAIProviderModelDetail.title as any)
          : currentAIProviderModelDetail.title
      return `${providerLabel} (${modelLabel})`
    }
    return ''
  }, [currentAIProviderDetail, currentAIProviderModelDetail, t])
  return (
    <TextOnlyTooltip {...TooltipProps} title={title}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          alignSelf: 'end',
        }}
      >
        {currentAIProviderDetail?.value ? (
          <AIProviderIcon
            aiProviderType={currentAIProviderDetail.value}
            {...props}
          />
        ) : (
          <UseChatGptIcon
            sx={{
              fontSize: props.size,
              ...props.sx,
            }}
          />
        )}
      </Box>
    </TextOnlyTooltip>
  )
}
export default AIProviderIconWithTooltip
