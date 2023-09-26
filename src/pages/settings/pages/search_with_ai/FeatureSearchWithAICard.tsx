import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { getChromeExtensionAssetsURL } from '@/utils/imageHelper'
import useSearchWithAISettings from '@/features/searchWithAI/hooks/useSearchWithAISettings'
import SettingsFeatureCardLayout from '@/pages/settings/layout/SettingsFeatureCardLayout'
import RadioCardGroup from '@/pages/settings/components/RadioCardGroup'

const FeatureSearchWithAICard: FC = () => {
  const { t } = useTranslation(['settings', 'common'])

  const { searchWithAISettings, setSearchWithAISettings } =
    useSearchWithAISettings()

  if (!searchWithAISettings.loaded) {
    return null
  }

  return (
    <SettingsFeatureCardLayout
      title={t('settings:feature__search_with_ai__title')}
      id={'search-with-ai'}
    >
      <RadioCardGroup
        defaultValue={searchWithAISettings.enable ? 'enabled' : 'disabled'}
        onChange={async (value) => {
          const isEnable = value === 'enabled'
          setSearchWithAISettings({
            enable: isEnable,
          })
        }}
        options={[
          {
            label: t('common:enabled'),
            value: 'enabled',
            image: getChromeExtensionAssetsURL(
              '/images/settings/search-with-ai/search-with-ai-enabled.png',
            ),
          },
          {
            label: t('common:disabled'),
            value: 'disabled',
            image: getChromeExtensionAssetsURL(
              '/images/settings/search-with-ai/search-with-ai-disabled.png',
            ),
          },
        ]}
        maxWidth={372}
      />
    </SettingsFeatureCardLayout>
  )
}
export default FeatureSearchWithAICard
