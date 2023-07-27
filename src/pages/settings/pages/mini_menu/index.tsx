import SettingsFeatureCardLayout from '@/pages/settings/layout/SettingsFeatureCardLayout'
import React, { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import Stack from '@mui/material/Stack'
import RadioCardGroup from '@/pages/settings/components/RadioCardGroup'
import { getChromeExtensionAssetsURL } from '@/utils/imageHelper'
import {
  useChromeExtensionButtonSettings,
  useComputedChromeExtensionButtonSettings,
} from '@/background/utils/buttonSettings'
import VisibilitySettingCard from '@/components/VisibilitySettingCard'

const SettingsMiniMenuPage: FC = () => {
  const { toggleButtonSettings, updateButtonSettings } =
    useChromeExtensionButtonSettings()
  const buttonSettings = useComputedChromeExtensionButtonSettings(
    'textSelectPopupButton',
  )
  const visible = useMemo(() => {
    return buttonSettings?.visibility.isWhitelistMode !== true
  }, [buttonSettings?.visibility])
  const { t } = useTranslation(['settings'])
  return (
    <SettingsFeatureCardLayout
      title={t('feature_card__mini_menu__title')}
      id={'mini-menu'}
    >
      <Stack spacing={2}>
        <RadioCardGroup
          defaultValue={visible ? 'visible' : 'hidden'}
          options={[
            {
              label: t(
                'settings:feature_card__mini_menu__field_mini_menu__visible',
              ),
              value: 'visible',
              image: getChromeExtensionAssetsURL(
                '/images/settings/appearance/mini-menu-visible.png',
              ),
            },
            {
              label: t(
                'settings:feature_card__mini_menu__field_mini_menu__hidden',
              ),
              value: 'hidden',
              image: getChromeExtensionAssetsURL(
                '/images/settings/appearance/mini-menu-hidden.png',
              ),
            },
          ]}
          onChange={async (value) => {
            if (value === 'visible') {
              // 从白名单模式切换到黑名单模式
              await toggleButtonSettings('textSelectPopupButton', true)
            } else {
              // 从黑名单模式切换到白名单模式
              await toggleButtonSettings('textSelectPopupButton', false)
            }
          }}
          maxWidth={372}
        />
        {visible && buttonSettings?.visibility && (
          <VisibilitySettingCard
            defaultValue={buttonSettings.visibility}
            onChange={async (value) => {
              await updateButtonSettings('textSelectPopupButton', {
                ...buttonSettings,
                visibility: value,
              })
            }}
          ></VisibilitySettingCard>
        )}
      </Stack>
    </SettingsFeatureCardLayout>
  )
}
export default SettingsMiniMenuPage
