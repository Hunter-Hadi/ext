import React, { FC } from 'react'
import SettingsFeatureCardLayout from '@/pages/settings/layout/SettingsFeatureCardLayout'
import { useTranslation } from 'react-i18next'
import PerkCard from '@/pages/settings/pages/perks/PerkCard'
import { CHROME_EXTENSION_HOMEPAGE_URL } from '@/constants'
import { getChromeExtensionAssetsURL } from '@/utils/imageHelper'

const FeatureOneClickPromptsCard: FC = () => {
  const { t } = useTranslation(['settings', 'common'])
  return (
    <SettingsFeatureCardLayout
      title={t('settings:feature_card__perks__one_click_prompts__title')}
      id={'one-click-prompts'}
    >
      <PerkCard
        title={t('settings:feature_card__perks__one_click_prompts__card_title')}
        description={t(
          'settings:feature_card__perks__one_click_prompts__card_description',
        )}
        buttonText={t(
          'settings:feature_card__perks__one_click_prompts__card_button_text',
        )}
        imageLink={getChromeExtensionAssetsURL(
          '/images/settings/perks/one-click-prompts.png',
        )}
        buttonLink={`${CHROME_EXTENSION_HOMEPAGE_URL}/prompts`}
      />
    </SettingsFeatureCardLayout>
  )
}
export default FeatureOneClickPromptsCard
