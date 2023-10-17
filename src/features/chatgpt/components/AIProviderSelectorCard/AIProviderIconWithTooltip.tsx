import React, { FC, useEffect, useState } from 'react'
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
import { IAIProviderType } from '@/background/provider/chat'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'

interface AIProviderIconWithTooltipProps
  extends Omit<AIProviderIconProps, 'aiProviderType'> {
  TooltipProps?: Omit<TextOnlyTooltipProps, 'title' | 'children'>
}
const AIProviderIconWithTooltip: FC<AIProviderIconWithTooltipProps> = ({
  TooltipProps,
  ...props
}) => {
  const { currentSidebarConversationType } = useSidebarSettings()
  const {
    currentAIProviderDetail,
    currentAIProviderModelDetail,
  } = useAIProviderModels()
  const { t } = useTranslation(['common', 'client'])
  const [providerSettings, setProviderSettings] = useState<
    | {
        provider: IAIProviderType
        model: string
        title: string
      }
    | undefined
  >(undefined)
  useEffect(() => {
    if (
      currentSidebarConversationType === 'Chat' &&
      currentAIProviderDetail &&
      currentAIProviderModelDetail
    ) {
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
      setProviderSettings({
        title: `${providerLabel} (${modelLabel})`,
        provider: currentAIProviderDetail.value,
        model: currentAIProviderModelDetail.value,
      })
    }
  }, [
    currentAIProviderDetail,
    currentAIProviderModelDetail,
    t,
    currentSidebarConversationType,
  ])
  return (
    <>
      {providerSettings ? (
        <TextOnlyTooltip {...TooltipProps} title={providerSettings.title}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              alignSelf: 'end',
            }}
          >
            {providerSettings.provider ? (
              <AIProviderIcon
                aiProviderType={providerSettings.provider}
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
      ) : (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            alignSelf: 'end',
          }}
        >
          <UseChatGptIcon
            sx={{
              fontSize: props.size,
              ...props.sx,
            }}
          />
        </Box>
      )}
    </>
  )
}
export default AIProviderIconWithTooltip
