import React, { FC } from 'react'
import RadioCardGroup from '@/pages/settings/components/RadioCardGroup'
import { getChromeExtensionAssetsURL } from '@/utils/imageHelper'
import SettingsFeatureCardLayout from '@/pages/settings/layout/SettingsFeatureCardLayout'
import { useTranslation } from 'react-i18next'
import { useUserSettings } from '@/pages/settings/hooks/useUserSettings'

const FeatureInstagramAssistantCard: FC = () => {
  const { userSettings, setUserSettings } = useUserSettings()
  const { t } = useTranslation(['settings', 'common'])
  return (
    <SettingsFeatureCardLayout
      title={t(
        'settings:feature_card__help_me_write__field__instagram_input_assistant_button__title',
      )}
      id={'instagram-assistant'}
    >
      <RadioCardGroup
        defaultValue={
          userSettings?.inputAssistantButton?.instagram ? 'enabled' : 'disabled'
        }
        options={[
          {
            label: t('common:enabled'),
            value: 'enabled',
            image: getChromeExtensionAssetsURL(
              '/images/settings/appearance/instagram-input-assistant-enabled.png',
            ),
          },
          {
            label: t('common:disabled'),
            value: 'disabled',
            image: getChromeExtensionAssetsURL(
              '/images/settings/appearance/instagram-input-assistant-disabled.png',
            ),
          },
        ]}
        onChange={async (value) => {
          await setUserSettings({
            ...userSettings,
            inputAssistantButton: {
              ...userSettings?.inputAssistantButton,
              instagram: value === 'enabled',
            },
          })
        }}
        maxWidth={372}
      />
    </SettingsFeatureCardLayout>
  )
}
export default FeatureInstagramAssistantCard
