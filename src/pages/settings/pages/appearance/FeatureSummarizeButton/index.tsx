import React, { FC, useCallback } from 'react'
import SettingsFeatureCardLayout from '@/pages/settings/layout/SettingsFeatureCardLayout'
import { useTranslation } from 'react-i18next'
import { useUserSettings } from '@/pages/settings/hooks/useUserSettings'
import Stack from '@mui/material/Stack'
import RadioCardGroup from '@/pages/settings/components/RadioCardGroup'
import { getChromeExtensionAssetsURL } from '@/utils/imageHelper'
import Typography from '@mui/material/Typography'

const FeatureSummarizeButton: FC = () => {
  const { userSettings, setUserSettings } = useUserSettings()
  const { t } = useTranslation(['settings', 'common'])
  const summarizeButtonTitle = useCallback(
    (key: string) => {
      if (!userSettings?.summarizeButton) return ''
      const currentKey = key as keyof typeof userSettings.summarizeButton
      switch (currentKey) {
        case 'gmail':
          return 'Gmail'
        case 'outlook':
          return 'Outlook'
        case 'pdf':
          return 'PDF'
        case 'youtube':
          return 'YouTube'
        default:
          return ''
      }
    },
    [userSettings],
  )
  return (
    <SettingsFeatureCardLayout
      title={t(
        'settings:feature_card__appearance__field_summarize_button__title',
      )}
      id={'pdf-viewer'}
    >
      <Stack spacing={3}>
        {userSettings?.summarizeButton &&
          Object.keys(userSettings.summarizeButton).map(
            (summarizeButtonKey) => {
              const currentKey = summarizeButtonKey as keyof typeof userSettings.summarizeButton
              return (
                <Stack spacing={1} key={summarizeButtonKey}>
                  <Typography
                    fontSize={'16px'}
                    fontWeight={700}
                    lineHeight={'24px'}
                  >
                    {summarizeButtonTitle(currentKey)}
                  </Typography>
                  <RadioCardGroup
                    defaultValue={
                      userSettings.summarizeButton?.[currentKey]
                        ? 'enabled'
                        : 'disabled'
                    }
                    options={[
                      {
                        label: t('common:enabled'),
                        value: 'enabled',
                        image: getChromeExtensionAssetsURL(
                          `/images/settings/summarize-button/${currentKey}-enabled.png`,
                        ),
                      },
                      {
                        label: t('common:disabled'),
                        value: 'disabled',
                        image: getChromeExtensionAssetsURL(
                          `/images/settings/summarize-button/${currentKey}-disabled.png`,
                        ),
                      },
                    ]}
                    onChange={async (value) => {
                      await setUserSettings({
                        ...userSettings,
                        summarizeButton: {
                          ...userSettings.summarizeButton,
                          [currentKey]: value === 'enabled',
                        },
                      })
                    }}
                    maxWidth={372}
                  />
                </Stack>
              )
            },
          )}
      </Stack>
    </SettingsFeatureCardLayout>
  )
}
export default FeatureSummarizeButton
