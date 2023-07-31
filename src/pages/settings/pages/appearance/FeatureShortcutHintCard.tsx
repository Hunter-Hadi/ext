import React, { FC } from 'react'
import RadioCardGroup from '@/pages/settings/components/RadioCardGroup'
import { getChromeExtensionAssetsURL } from '@/utils/imageHelper'
import SettingsFeatureCardLayout from '@/pages/settings/layout/SettingsFeatureCardLayout'
import { useTranslation } from 'react-i18next'
import { useUserSettings } from '@/pages/settings/hooks/useUserSettings'

const FeatureShortcutHintCard: FC = () => {
  const { userSettings, setUserSettings } = useUserSettings()
  const { t } = useTranslation(['settings', 'common'])
  return (
    <SettingsFeatureCardLayout
      title={t('settings:feature_card__appearance__field_shortcut_hint__title')}
      id={'shortcut-hint'}
    >
      <RadioCardGroup
        defaultValue={userSettings?.shortcutHintEnable ? 'visible' : 'hidden'}
        onChange={async (value) => {
          await setUserSettings({
            ...userSettings,
            shortcutHintEnable: value === 'visible',
          })
        }}
        options={[
          {
            label: t('common:visible'),
            value: 'visible',
            image: getChromeExtensionAssetsURL(
              '/images/settings/appearance/shortcut-hint-visible.png',
            ),
          },
          {
            label: t('common:hidden'),
            value: 'hidden',
            image: getChromeExtensionAssetsURL(
              '/images/settings/appearance/shortcut-hint-hidden.png',
            ),
          },
        ]}
        maxWidth={372}
      />
    </SettingsFeatureCardLayout>
  )
}
export default FeatureShortcutHintCard
