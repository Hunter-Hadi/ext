import React, { FC } from 'react'
import RadioCardGroup from '@/pages/settings/components/RadioCardGroup'
import { getChromeExtensionAssetsURL } from '@/utils/imageHelper'
import SettingsFeatureCardLayout from '@/pages/settings/layout/SettingsFeatureCardLayout'
import { useTranslation } from 'react-i18next'
import { useChromeExtensionButtonSettings } from '@/background/utils/buttonSettings'

const FeatureGmailAssistantCard: FC = () => {
  // whitelist为空说明没有开启
  const { buttonSettings, updateButtonSettings } =
    useChromeExtensionButtonSettings()
  const { t } = useTranslation(['settings', 'common'])
  return (
    <SettingsFeatureCardLayout
      title={t(
        'settings:feature_card__appearance__field_gmail_assistant__title',
      )}
      id={'gmail-assistant'}
    >
      <RadioCardGroup
        defaultValue={
          buttonSettings?.gmailButton?.visibility?.whitelist?.length === 0
            ? 'disabled'
            : 'enabled'
        }
        options={[
          {
            label: t('common:enabled'),
            value: 'enabled',
            image: getChromeExtensionAssetsURL(
              '/images/settings/appearance/gmail-assistant-enabled.png',
            ),
          },
          {
            label: t('common:disabled'),
            value: 'disabled',
            image: getChromeExtensionAssetsURL(
              '/images/settings/appearance/gmail-assistant-disabled.png',
            ),
          },
        ]}
        onChange={async (value) => {
          if (buttonSettings?.gmailButton) {
            const isEnable = value === 'enabled'
            await updateButtonSettings('gmailButton', {
              visibility: {
                isWhitelistMode: true,
                whitelist: isEnable ? ['mail.google.com'] : [],
                blacklist: [],
              },
              contextMenu: buttonSettings.gmailButton.contextMenu,
              contextMenuPosition:
                buttonSettings.gmailButton.contextMenuPosition,
            })
          }
        }}
        maxWidth={372}
      />
    </SettingsFeatureCardLayout>
  )
}
export default FeatureGmailAssistantCard
