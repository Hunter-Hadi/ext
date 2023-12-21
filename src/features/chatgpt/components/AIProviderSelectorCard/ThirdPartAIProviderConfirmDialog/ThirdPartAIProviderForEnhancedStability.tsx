import LoadingButton from '@mui/lab/LoadingButton'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { useSetRecoilState } from 'recoil'

import { AIChipIcon } from '@/components/CustomIcon'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import { ThirdPartAIProviderConfirmDialogState } from '@/features/chatgpt/store'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'

import AIProviderIcon from '../AIProviderIcon'
import AIProviderMainPartIcon from '../AIProviderMainPartIcon'
import AIProviderOptions, { AIProviderOptionType } from '../AIProviderOptions'

const ThirdPartAIProviderForEnhancedStability: FC = () => {
  const { t } = useTranslation(['client'])
  const [loading, setLoading] = React.useState(false)

  const setDialogState = useSetRecoilState(
    ThirdPartAIProviderConfirmDialogState,
  )

  const {
    updateSidebarSettings,
    currentSidebarConversationType,
  } = useSidebarSettings()
  const {
    cleanConversation,
    createConversation,
    switchBackgroundChatSystemAIProvider,
  } = useClientConversation()

  const mainPartProviders = AIProviderOptions.filter(
    (provider) => !provider.isThirdParty,
  )

  const handleClose = () => {
    setDialogState({
      open: false,
      confirmProviderValue: '',
    })
  }
  const handleConfirmProvider = async (
    providerOption: AIProviderOptionType,
  ) => {
    try {
      setLoading(true)

      await updateSidebarSettings({
        common: {
          currentAIProvider: providerOption.value,
        },
      })
      await switchBackgroundChatSystemAIProvider(providerOption.value)
      if (currentSidebarConversationType === 'Chat') {
        await cleanConversation(true)
        await createConversation('Chat')
      }

      handleClose()
    } catch (error) {
      console.error('handleConfirmProvider error', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Stack direction={'row'} spacing={1} alignItems="center">
        <AIChipIcon
          sx={{
            color: 'rgba(219, 68, 55, 1)',
          }}
        />

        <Typography
          fontSize={16}
          fontWeight={500}
          color={'text.primary'}
          lineHeight={1.5}
        >
          {t('client:provider__confirm_dialog__for_enhanced_stability')}
        </Typography>
      </Stack>
      <Typography
        fontSize={14}
        fontWeight={400}
        color={'text.secondary'}
        lineHeight={1.5}
        mt={'4px !important'}
      >
        {t('client:provider__confirm_dialog__for_enhanced_stability__desc')}
        <Box component={'span'} fontWeight={500} color="text.primary">
          {t(
            'client:provider__confirm_dialog__for_enhanced_stability__switch_to',
          )}
        </Box>
      </Typography>

      <Stack
        direction={'row'}
        alignItems="center"
        spacing={1}
        mt={'12px !important'}
      >
        {mainPartProviders.map((providerOption) => (
          <LoadingButton
            loading={loading}
            variant="contained"
            key={providerOption.value}
            startIcon={
              <AIProviderIcon aiProviderType={providerOption.value} size={24} />
            }
            endIcon={<AIProviderMainPartIcon color="white" />}
            sx={{
              borderRadius: 2,
              flex: 1,
            }}
            onClick={() => handleConfirmProvider(providerOption)}
          >
            {providerOption.label}
          </LoadingButton>
        ))}
      </Stack>
    </>
  )
}

export default ThirdPartAIProviderForEnhancedStability
