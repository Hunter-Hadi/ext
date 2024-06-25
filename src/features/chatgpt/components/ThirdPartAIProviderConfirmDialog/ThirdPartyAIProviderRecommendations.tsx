import LoadingButton from '@mui/lab/LoadingButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSetRecoilState } from 'recoil'

import {
  AIProviderModelSelectorOption,
  ChatAIProviderModelSelectorOptions,
} from '@/features/chatgpt/components/AIProviderModelSelectorCard/AIProviderModelSelectorOptions'
import AIModelIcons from '@/features/chatgpt/components/icons/AIModelIcons'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import useRemoteAIProviderConfig from '@/features/chatgpt/hooks/useRemoteAIProviderConfig'
import { ThirdPartyAIProviderConfirmDialogState } from '@/features/chatgpt/store'

import AIProviderMainPartIcon from '../icons/AIProviderMainPartIcon'

const ThirdPartyAIProviderRecommendations: FC = () => {
  const { t } = useTranslation(['client'])
  const [loading, setLoading] = React.useState(false)
  const setDialogState = useSetRecoilState(
    ThirdPartyAIProviderConfirmDialogState,
  )
  const { createConversation } = useClientConversation()
  const { remoteAIProviderConfig } = useRemoteAIProviderConfig()
  const currentSidebarConversationTypeModels = useMemo(() => {
    return ChatAIProviderModelSelectorOptions.filter((model) => {
      // 过滤掉被隐藏的AI模型
      return !remoteAIProviderConfig.hiddenAIProviders.includes(
        model.AIProvider,
      )
    })
      .filter((model) => !model.hidden)
      .map((model) => {
        if (model.disabled !== true) {
          model.disabled = remoteAIProviderConfig.disabledAIProviders.includes(
            model.AIProvider,
          )
        }
        return model
      })
  }, [remoteAIProviderConfig.hiddenAIProviders])
  const handleSelectRecommendationModel = async (
    AIProviderModelSelectorOption: AIProviderModelSelectorOption,
  ) => {
    try {
      setLoading(true)
      await createConversation(
        'Chat',
        AIProviderModelSelectorOption.AIProvider,
        AIProviderModelSelectorOption.value,
      )
      setDialogState({
        open: false,
      })
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Stack direction={'row'} spacing={1} alignItems='center'>
        <AIProviderMainPartIcon iconSize={24} />
        <Typography
          fontSize={16}
          fontWeight={500}
          color={'text.primary'}
          lineHeight={1.5}
        >
          {t(
            'client:provider__third_party_confirm_dialog__our_recommendations__title',
          )}
        </Typography>
      </Stack>
      <Typography
        fontSize={14}
        fontWeight={400}
        color={'text.secondary'}
        lineHeight={1.5}
        mt={'4px !important'}
        textAlign={'left'}
      >
        {t(
          'client:provider__third_party_confirm_dialog__our_recommendations__description',
        )}
      </Typography>
      <Stack
        direction={'row'}
        alignItems='center'
        mt={'12px !important'}
        flexWrap={'wrap'}
        gap={1}
      >
        {currentSidebarConversationTypeModels.map(
          (AIProviderModelSelectorOption) => (
            <LoadingButton
              disabled={AIProviderModelSelectorOption.disabled}
              loading={loading}
              variant='outlined'
              key={AIProviderModelSelectorOption.value}
              startIcon={
                <AIModelIcons
                  aiModelValue={AIProviderModelSelectorOption.value}
                  size={24}
                />
              }
              endIcon={<AIProviderMainPartIcon />}
              sx={{
                flexShrink: 0,
                borderRadius: 2,
              }}
              onClick={async () => {
                await handleSelectRecommendationModel(
                  AIProviderModelSelectorOption,
                )
              }}
            >
              {AIProviderModelSelectorOption.label}
            </LoadingButton>
          ),
        )}
      </Stack>
    </>
  )
}

export default ThirdPartyAIProviderRecommendations
