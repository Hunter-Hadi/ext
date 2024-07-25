import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React from 'react'
import { useTranslation } from 'react-i18next'

import {
  MAXAI_CHATGPT_MODEL_GPT_4_TURBO,
  MAXAI_CHATGPT_MODEL_GPT_4O,
} from '@/background/src/chat/UseChatGPTChat/types'
import LanguageSelect from '@/components/select/LanguageSelect'
import useAIProviderModels from '@/features/chatgpt/hooks/useAIProviderModels'
import APITemperatureSlider from '@/features/sidebar/components/SidebarChatBox/SidebarAIAdvanced/components/APITemperatureSlider'
import BingConversationStyleSelector from '@/features/sidebar/components/SidebarChatBox/SidebarAIAdvanced/components/BingConversationStyleSelector'
import { ChatGPTPluginsSelector } from '@/features/sidebar/components/SidebarChatBox/SidebarAIAdvanced/components/ChatGPTPluginsSelector'
import { useUserSettings } from '@/pages/settings/hooks/useUserSettings'

const RewriteAdvanced = () => {
  const { userSettings, setUserSettings } = useUserSettings()
  const { t } = useTranslation(['settings', 'client'])
  const { currentAIProviderModel, currentAIProvider } = useAIProviderModels()
  return (
    <Stack spacing={1}>
      <Stack direction={'row'} mb={1}>
        <Typography fontSize={'16px'} fontWeight={600} color={'text.primary'}>
          {t('client:sidebar__chat__advanced__title')}
        </Typography>
      </Stack>
      <Stack spacing={2} width={'100%'}>
        {userSettings && (
          <LanguageSelect
            sx={{ flexShrink: 0, width: '100%' }}
            boxSx={{ maxWidth: 'unset' }}
            label={t(
              'settings:feature_card__ai_response_language__field_ai_response_language__label',
            )}
            defaultValue={userSettings.language}
            onChange={async (newLanguage) => {
              await setUserSettings({
                ...userSettings,
                language: newLanguage,
              })
            }}
          />
        )}
        {currentAIProvider === 'USE_CHAT_GPT_PLUS' &&
          currentAIProviderModel !== MAXAI_CHATGPT_MODEL_GPT_4_TURBO &&
          currentAIProviderModel !== MAXAI_CHATGPT_MODEL_GPT_4O && (
            <APITemperatureSlider provider={'USE_CHAT_GPT_PLUS'} />
          )}
        {currentAIProvider === 'OPENAI_API' && (
          <APITemperatureSlider provider={'OPENAI_API'} />
        )}
        {currentAIProvider === 'OPENAI' && <ChatGPTPluginsSelector />}
        {currentAIProvider === 'BING' && <BingConversationStyleSelector />}
      </Stack>
    </Stack>
  )
}

export default RewriteAdvanced
