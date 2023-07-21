import React, { FC } from 'react'
import AIProviderIcon, {
  AIProviderIconProps,
} from '@/features/chatgpt/components/AIProviderSelectorCard/AIProviderIcon'
import TextOnlyTooltip, {
  TextOnlyTooltipProps,
} from '@/components/TextOnlyTooltip'
import useAIProviderModels from '@/features/chatgpt/hooks/useAIProviderModels'
import { UseChatGptIcon } from '@/components/CustomIcon'
import Box from '@mui/material/Box'

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
  return (
    <TextOnlyTooltip
      {...TooltipProps}
      title={`${currentAIProviderDetail?.label} (${currentAIProviderModelDetail?.title})`}
    >
      <Box>
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
