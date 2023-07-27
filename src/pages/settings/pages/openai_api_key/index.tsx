import Stack from '@mui/material/Stack'
import React, { FC } from 'react'
import SettingsFeatureCardLayout from '@/pages/settings/layout/SettingsFeatureCardLayout'
import { useTranslation } from 'react-i18next'
import ChatGPTApiSettings from '@/pages/settings/pages/openai_api_key/ChatGPTApiSettings'

const SettingsOpenaiApiKeyPage: FC = () => {
  const { t } = useTranslation(['settings'])
  return (
    <Stack>
      <SettingsFeatureCardLayout
        title={t('settings:feature_card__openai_api_key__title')}
        id={'my-own-key'}
      >
        <ChatGPTApiSettings />
      </SettingsFeatureCardLayout>
    </Stack>
  )
}
export default SettingsOpenaiApiKeyPage
