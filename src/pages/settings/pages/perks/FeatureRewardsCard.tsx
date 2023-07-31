import React, { FC } from 'react'
import SettingsFeatureCardLayout from '@/pages/settings/layout/SettingsFeatureCardLayout'
import { useTranslation } from 'react-i18next'
import PerkCard from '@/pages/settings/pages/perks/PerkCard'
import { APP_USE_CHAT_GPT_HOST } from '@/constants'
import { getChromeExtensionAssetsURL } from '@/utils/imageHelper'
import Link from '@mui/material/Link'

const FeatureRewardsCard: FC = () => {
  const { t } = useTranslation(['settings', 'common'])
  return (
    <SettingsFeatureCardLayout
      title={t('settings:feature_card__perks__rewards__title')}
      id={'rewards'}
    >
      <PerkCard
        title={t('settings:feature_card__perks__rewards__card_title')}
        description={
          <>
            {t('settings:feature_card__perks__rewards__card_description_1')}
            <Link href={`${APP_USE_CHAT_GPT_HOST}/pricing`} target={'_blank'}>
              {t('settings:feature_card__perks__rewards__card_description_2')}
            </Link>
            {t('settings:feature_card__perks__rewards__card_description_3')}
          </>
        }
        buttonText={t(
          'settings:feature_card__perks__rewards__card_button_text',
        )}
        imageLink={getChromeExtensionAssetsURL(
          '/images/settings/perks/rewards.png',
        )}
        buttonLink={`${APP_USE_CHAT_GPT_HOST}/referral`}
      />
    </SettingsFeatureCardLayout>
  )
}
export default FeatureRewardsCard
