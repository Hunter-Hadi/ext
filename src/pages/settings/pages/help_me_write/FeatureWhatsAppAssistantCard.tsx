import React, { type FC, memo } from 'react'
import { useTranslation } from 'react-i18next'

import RadioCardGroup from '@/pages/settings/components/RadioCardGroup'
import { useUserSettings } from '@/pages/settings/hooks/useUserSettings'
import SettingsFeatureCardLayout from '@/pages/settings/layout/SettingsFeatureCardLayout'
import { getChromeExtensionAssetsURL } from '@/utils/imageHelper'

const FeatureWhatsAppAssistantCard: FC = () => {
  const { userSettings, setUserSettings } = useUserSettings()
  const { t } = useTranslation(['settings', 'common'])
  return (
    <SettingsFeatureCardLayout
      title={t(
        'settings:feature_card__help_me_write__field__whats_app_instant_reply_button__title',
      )}
      id={'whatsApp-assistant'}
    >
      <RadioCardGroup
        defaultValue={
          userSettings?.inputAssistantButton?.whatsApp ? 'enabled' : 'disabled'
        }
        options={[
          {
            label: t('common:enabled'),
            value: 'enabled',
            image: getChromeExtensionAssetsURL(
              '/images/settings/appearance/whatsapp-input-assistant-enabled.png',
            ),
          },
          {
            label: t('common:disabled'),
            value: 'disabled',
            image: getChromeExtensionAssetsURL(
              '/images/settings/appearance/whatsapp-input-assistant-disabled.png',
            ),
          },
        ]}
        onChange={async (value) => {
          await setUserSettings({
            ...userSettings,
            inputAssistantButton: {
              ...userSettings?.inputAssistantButton,
              whatsApp: value === 'enabled',
            },
          })
        }}
        maxWidth={372}
      />
    </SettingsFeatureCardLayout>
  )
}
export default memo(FeatureWhatsAppAssistantCard)
