import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

import RadioCardGroup from '@/pages/settings/components/RadioCardGroup'
import { useUserSettings } from '@/pages/settings/hooks/useUserSettings'
import SettingsFeatureCardLayout from '@/pages/settings/layout/SettingsFeatureCardLayout'
import { getChromeExtensionAssetsURL } from '@/utils/imageHelper'

const FeatureAppearanceCard: FC = () => {
  const { userSettings, setUserSettings } = useUserSettings()
  const { t } = useTranslation(['settings', 'common'])
  return (
    <SettingsFeatureCardLayout
      title={t('settings:feature_card__appearance__field_appearance__title')}
      id={'appearance'}
    >
      <RadioCardGroup
        defaultValue={userSettings?.colorSchema || 'light'}
        onChange={async (value) => {
          await setUserSettings({
            ...userSettings,
            colorSchema: value as 'dark' | 'light' | 'auto',
          })
        }}
        options={[
          {
            label: t('common:auto'),
            value: 'auto',
            image: getChromeExtensionAssetsURL(
              '/images/settings/appearance/appearance-auto.png',
            ),
          },
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
