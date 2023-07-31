import React, { FC } from 'react'
import RadioCardGroup from '@/pages/settings/components/RadioCardGroup'
import { getChromeExtensionAssetsURL } from '@/utils/imageHelper'
import SettingsFeatureCardLayout from '@/pages/settings/layout/SettingsFeatureCardLayout'
import { useTranslation } from 'react-i18next'
import { PDFTooltip } from '@/pages/settings/components/tooltipCollection'
import { useUserSettings } from '@/pages/settings/hooks/useUserSettings'

const FeaturePDFViewerCard: FC = () => {
  const { userSettings, setUserSettings } = useUserSettings()
  const { t } = useTranslation(['settings', 'common'])
  return (
    <SettingsFeatureCardLayout
      tooltip={<PDFTooltip />}
      title={t('settings:feature_card__appearance__field_pdf_viewer__title')}
      id={'pdf-viewer'}
    >
      <RadioCardGroup
        defaultValue={userSettings?.pdf?.enabled ? 'enabled' : 'disabled'}
        options={[
          {
            label: t('common:enabled'),
            value: 'enabled',
            image: getChromeExtensionAssetsURL(
              '/images/settings/appearance/pdf-viewer-enabled.png',
            ),
          },
          {
            label: t('common:disabled'),
            value: 'disabled',
            image: getChromeExtensionAssetsURL(
              '/images/settings/appearance/pdf-viewer-disabled.png',
            ),
          },
        ]}
        onChange={async (value) => {
          await setUserSettings({
            ...userSettings,
            pdf: {
              enabled: value === 'enabled',
            },
          })
        }}
        maxWidth={372}
      />
    </SettingsFeatureCardLayout>
  )
}
export default FeaturePDFViewerCard
