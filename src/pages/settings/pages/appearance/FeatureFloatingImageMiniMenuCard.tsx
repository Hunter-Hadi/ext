import Stack from '@mui/material/Stack'
import React, { useState } from 'react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useRecoilState } from 'recoil'

import {
  getChromeExtensionDBStorage,
  setChromeExtensionDBStorage,
} from '@/background/utils/chromeExtensionStorage/chromeExtensionDBStorage'
import VisibilitySettingCard from '@/components/VisibilitySettingCard'
import { useFocus } from '@/features/common/hooks/useFocus'
import RadioCardGroup from '@/pages/settings/components/RadioCardGroup'
import useSyncSettingsChecker from '@/pages/settings/hooks/useSyncSettingsChecker'
import SettingsFeatureCardLayout from '@/pages/settings/layout/SettingsFeatureCardLayout'
import { AppDBStorageState } from '@/store'
import { getChromeExtensionAssetsURL } from '@/utils/imageHelper'

const FeatureFloatingImageMiniMenuCard = () => {
  const [appDBStorage, setAppDBStorage] = useRecoilState(AppDBStorageState)
  const { syncLocalToServer } = useSyncSettingsChecker()

  const [reRender, setReRender] = useState(true)
  const visible = useMemo(() => {
    console.log(
      'appDBStorage.floatingImageMiniMenu?.visibility',
      appDBStorage.floatingImageMiniMenu?.visibility.isWhitelistMode,
    )
    return (
      appDBStorage.floatingImageMiniMenu?.visibility.isWhitelistMode === false
    )
  }, [appDBStorage.floatingImageMiniMenu?.visibility])
  useFocus(() => {
    setReRender(false)
    setTimeout(() => {
      setReRender(true)
    }, 50)
  })
  const { t } = useTranslation(['settings', 'common'])

  return (
    <SettingsFeatureCardLayout
      title={t('feature_card__appearance__floating_image_mini_menu__title')}
      id={'floating-image-mini-menu'}
    >
      {appDBStorage.floatingImageMiniMenu?.visibility && reRender && (
        <Stack spacing={2}>
          {/* <div>
                        appDBStorage.floatingImageMiniMenu?.visibility:
                        {JSON.stringify(appDBStorage.floatingImageMiniMenu?.visibility)}
                    </div> */}
          <RadioCardGroup
            defaultValue={visible ? 'visible' : 'hidden'}
            options={[
              {
                label: t('common:enabled'),
                value: 'visible',
                image: getChromeExtensionAssetsURL(
                  '/images/settings/appearance/floating-image-mini-menu-enabled.png',
                ),
              },
              {
                label: t('common:disabled'),
                value: 'hidden',
                image: getChromeExtensionAssetsURL(
                  '/images/settings/appearance/floating-image-mini-menu-disabled.png',
                ),
              },
            ]}
            onChange={async (value) => {
              const setting = await getChromeExtensionDBStorage()

              if (value === 'visible') {
                // 从白名单模式切换到黑名单模式
                await setChromeExtensionDBStorage({
                  floatingImageMiniMenu: {
                    visibility: {
                      ...setting.floatingImageMiniMenu!.visibility,
                      isWhitelistMode: false,
                    },
                  },
                })
              } else {
                await setChromeExtensionDBStorage({
                  floatingImageMiniMenu: {
                    visibility: {
                      ...setting.floatingImageMiniMenu!.visibility,
                      isWhitelistMode: true,
                    },
                  },
                })
              }
              setAppDBStorage(await getChromeExtensionDBStorage())

              syncLocalToServer()
            }}
            maxWidth={372}
          />
          {visible && (
            <VisibilitySettingCard
              mode={'black'}
              defaultValue={appDBStorage.floatingImageMiniMenu?.visibility}
              textTitle={t(
                'feature_card__appearance__floating_image_mini_menu__black_list_title',
              )}
              textDescription={t(
                'feature_card__appearance__floating_image_mini_menu__black_list_description',
              )}
              onChange={async (value) => {
                console.log('设置修改了11', value)
                const settings = await getChromeExtensionDBStorage()
                if (settings.floatingImageMiniMenu?.visibility) {
                  await setChromeExtensionDBStorage({
                    floatingImageMiniMenu: {
                      ...settings.floatingImageMiniMenu,
                      visibility: value,
                    },
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

export default FeatureFloatingImageMiniMenuCard
