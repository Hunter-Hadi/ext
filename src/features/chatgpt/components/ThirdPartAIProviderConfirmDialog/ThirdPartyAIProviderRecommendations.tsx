import LoadingButton from '@mui/lab/LoadingButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { useSetRecoilState } from 'recoil'

import {
  AIProviderModelSelectorOption,
  ChatAIProviderModelSelectorOptions,
} from '@/features/chatgpt/components/AIProviderModelSelectorCard/AIProviderModelSelectorOptions'
import useAIProviderModels from '@/features/chatgpt/hooks/useAIProviderModels'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import { ThirdPartyAIProviderConfirmDialogState } from '@/features/chatgpt/store'

import AIProviderIcon from '../icons/AIProviderIcon'
import AIProviderMainPartIcon from '../icons/AIProviderMainPartIcon'

const ThirdPartyAIProviderRecommendations: FC = () => {
  const { t } = useTranslation(['client'])
  const [loading, setLoading] = React.useState(false)
  const setDialogState = useSetRecoilState(
    ThirdPartyAIProviderConfirmDialogState,
  )
  const { updateAIProviderModel } = useAIProviderModels()
  const { createConversation } = useClientConversation()

  const handleSelectRecommendationModel = async (
    AIProviderModelSelectorOption: AIProviderModelSelectorOption,
  ) => {
    try {
      setLoading(true)
      await updateAIProviderModel(
        AIProviderModelSelectorOption.AIProvider,
        AIProviderModelSelectorOption.value,
      )
      await createConversation('Chat')
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
      <Stack direction={'row'} spacing={1} alignItems="center">
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
        alignItems="center"
        mt={'12px !important'}
        flexWrap={'wrap'}
        gap={1}
      >
        {ChatAIProviderModelSelectorOptions.map(
          (AIProviderModelSelectorOption) => (
            <LoadingButton
              loading={loading}
              variant="outlined"
              key={AIProviderModelSelectorOption.value}
              startIcon={
                <AIProviderIcon
                  aiProviderType={AIProviderModelSelectorOption.AIProvider}
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
