import SettingsFeatureCardLayout from '@/pages/settings/layout/SettingsFeatureCardLayout'
import React, { FC, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Stack from '@mui/material/Stack'
import RadioCardGroup from '@/pages/settings/components/RadioCardGroup'
import { getChromeExtensionAssetsURL } from '@/utils/imageHelper'
import {
  getChromeExtensionButtonSettings,
  useChromeExtensionButtonSettings,
} from '@/background/utils/buttonSettings'
import VisibilitySettingCard from '@/components/VisibilitySettingCard'
import cloneDeep from 'lodash-es/cloneDeep'
import { useFocus } from '@/hooks/useFocus'
import { AppSettingsState } from '@/store'
import { useRecoilValue } from 'recoil'

const SettingsMiniMenuPage: FC = () => {
  const appSettings = useRecoilValue(AppSettingsState)
  const { toggleButtonSettings, updateButtonSettings } =
    useChromeExtensionButtonSettings()
  const [reRender, setReRender] = useState(true)
  const visible = useMemo(() => {
    return (
      appSettings.buttonSettings?.textSelectPopupButton?.visibility
        .isWhitelistMode === false
    )
  }, [appSettings.buttonSettings?.textSelectPopupButton.visibility])
  useFocus(() => {
    setReRender(false)
    setTimeout(() => {
      setReRender(true)
    }, 50)
  })
  const { t } = useTranslation(['settings'])
  return (
    <SettingsFeatureCardLayout
      title={t('feature_card__mini_menu__title')}
      id={'mini-menu'}
    >
      {appSettings.buttonSettings?.textSelectPopupButton?.visibility &&
        reRender && (
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
            {visible && (
              <VisibilitySettingCard
                mode={'black'}
                defaultValue={
                  appSettings.buttonSettings?.textSelectPopupButton.visibility
                }
                onChange={async (value) => {
                  const newVisibility = cloneDeep(value)
                  if (newVisibility.isWhitelistMode) {
                    newVisibility.whitelist = []
                  }
                  const latestButtonSettings =
                    await getChromeExtensionButtonSettings(
                      'textSelectPopupButton',
                    )
                  if (latestButtonSettings) {
                    console.log('mini menu', latestButtonSettings?.contextMenu)
                    await updateButtonSettings('textSelectPopupButton', {
                      ...latestButtonSettings,
                      visibility: value,
                    })
                  }
                }}
              ></VisibilitySettingCard>
            )}
          </Stack>
        )}
    </SettingsFeatureCardLayout>
  )
}
export default SettingsMiniMenuPage