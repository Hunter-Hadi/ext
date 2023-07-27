import React, { FC } from 'react'
import RadioCardGroup from '@/pages/settings/components/RadioCardGroup'
import { getChromeExtensionAssetsURL } from '@/utils/imageHelper'
import SettingsFeatureCardLayout from '@/pages/settings/layout/SettingsFeatureCardLayout'
import { useTranslation } from 'react-i18next'
import { useUserSettings } from '@/pages/settings/hooks/useUserSettings'

const FeatureAppearanceCard: FC = () => {
  const { userSettings, setUserSettings } = useUserSettings()
  const { t } = useTranslation(['settings', 'common'])
  return (
    <SettingsFeatureCardLayout
      title={t('settings:feature_card__appearance__field_appearance__title')}
      id={'appearance'}
    >
      <RadioCardGroup
        defaultValue={userSettings?.colorSchema === 'dark' ? 'dark' : 'light'}
        onChange={async (value) => {
          await setUserSettings({
            ...userSettings,
            colorSchema: value === 'dark' ? 'dark' : 'light',
          })
        }}
        options={[
          {
            label: t('common:light'),
            value: 'light',
            image: getChromeExtensionAssetsURL(
              '/images/settings/appearance/appearance-light.png',
            ),
          },
          {
            label: t('common:dark'),
            value: 'dark',
            image: getChromeExtensionAssetsURL(
              '/images/settings/appearance/appearance-dark.png',
            ),
          },
        ]}
        maxWidth={372}
      />
    </SettingsFeatureCardLayout>
  )
}
export default FeatureAppearanceCard
