import React, { FC } from 'react'
import RadioCardGroup from '@/pages/settings/components/RadioCardGroup'
import { getChromeExtensionAssetsURL } from '@/utils/imageHelper'
import SettingsFeatureCardLayout from '@/pages/settings/layout/SettingsFeatureCardLayout'
import { useTranslation } from 'react-i18next'
import { useUserSettings } from '@/pages/settings/hooks/useUserSettings'

const FeatureQuickAccessViewerCard: FC = () => {
  const { userSettings, setUserSettings } = useUserSettings()
  const { t } = useTranslation(['settings', 'common'])
  return (
    <SettingsFeatureCardLayout
      title={t('settings:feature_card__appearance__field_quick_access__title')}
      id={'quick-access'}
    >
      <RadioCardGroup
        defaultValue={
          userSettings?.quickAccess?.enabled ? 'enabled' : 'disabled'
        }
        options={[
          {
            label: t('common:enabled'),
            value: 'enabled',
            image: getChromeExtensionAssetsURL(
              '/images/settings/appearance/quick-access-enabled.png',
            ),
          },
          {
            label: t('common:disabled'),
            value: 'disabled',
            image: getChromeExtensionAssetsURL(
              '/images/settings/appearance/quick-access-disabled.png',
            ),
          },
        ]}
        onChange={async (value) => {
          await setUserSettings({
            ...userSettings,
            quickAccess: {
              enabled: value === 'enabled',
            },
          })
        }}
        maxWidth={372}
      />
    </SettingsFeatureCardLayout>
  )
}
export default FeatureQuickAccessViewerCard
