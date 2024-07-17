import Alert from '@mui/material/Alert'
import Backdrop from '@mui/material/Backdrop'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { FC, useCallback, useContext, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSetRecoilState } from 'recoil'

import { getChromeExtensionDBStorage } from '@/background/utils/chromeExtensionStorage/chromeExtensionDBStorage'
import AppLoadingLayout from '@/features/common/components/AppLoadingLayout'
import useEffectOnce from '@/features/common/hooks/useEffectOnce'
import { useFocus } from '@/features/common/hooks/useFocus'
import { SettingsPageRouteContext } from '@/pages/settings/context'
import useSyncSettingsChecker from '@/pages/settings/hooks/useSyncSettingsChecker'
import { AppDBStorageState } from '@/store'
import { chromeExtensionClientOpenPage } from '@/utils'

const SyncSettingCheckerWrapper: FC<{
  children: React.ReactNode
  onLoad?: () => void
}> = ({ children, onLoad }) => {
  const setAppDBStorage = useSetRecoilState(AppDBStorageState)
  const { t } = useTranslation(['settings'])
  const {
    isSyncing,
    isChecking,
    showErrorAlert,
    showCheckAlert,
    checkSync,
    syncServerToLocal,
    syncLocalToServer,
    localSettingsCacheRef,
  } = useSyncSettingsChecker()
  const [loaded, setLoaded] = useState(false)
  const routerContext = useContext(SettingsPageRouteContext)
  const isSpecialCaseRef = useRef(true)
  const onlyOnceTimesSaveLocalSettings = useCallback(async () => {
    // 特殊情况处理:
    // 0. focus到这个页面
    // 1. 缓存用户当前的设置到ref
    // 2. 直接同步服务器数据到本地，
    // 3. 阻止页面关闭，弹出提示框，让用户选择是否同步本地数据到服务器
    await chromeExtensionClientOpenPage({
      key: 'current_page',
    })
    await syncServerToLocal()
    window.onbeforeunload = (event) => {
      event.preventDefault()
      event.returnValue = t(
        `settings:sync__different_settings__chose_local_or_server_description`,
      )
      return t(
        `settings:sync__different_settings__chose_local_or_server_description`,
      )
    }
  }, [t])

  useEffectOnce(() => {
    console.log('SyncSettingCheckerWrapper')
    checkSync()
      .then((result) => {
        if (result.status === 'needSync' && !result.success) {
          onlyOnceTimesSaveLocalSettings().then()
        } else {
          if (result.status === 'needLogin') {
            routerContext.setRoute('/login')
          }
          isSpecialCaseRef.current = false
        }
      })
      .catch()
      .finally(async () => {
        const latestSettings = await getChromeExtensionDBStorage()
        console.log('设置 sync latestSettings', latestSettings)
        setAppDBStorage(latestSettings)
        setLoaded(true)
        onLoad?.()
      })
  })
  useFocus(() => {
    if (isSpecialCaseRef.current) return
    checkSync().then()
  })
  if (!isChecking) {
    if (showErrorAlert) {
      return (
        <Stack
          spacing={2}
          sx={{
            width: 600,
            mx: 'auto!important',
          }}
        >
          <Alert severity='error'>
            Something went wrong when syncing your online account settings.
            Please try again by refreshing the page.
          </Alert>
          <Button
            variant={'contained'}
            color={'primary'}
            onClick={() => {
              window.location.reload()
            }}
          >
            Refresh page
          </Button>
        </Stack>
      )
    }
    if (showCheckAlert) {
      return (
        <Stack
          spacing={2}
          sx={{
            width: 600,
            mx: 'auto!important',
          }}
        >
          <Alert severity='error'>
            {t('settings:sync__different_settings__description')}
          </Alert>
          <Stack alignItems={'center'} spacing={2}>
            <Button
              sx={{ width: 400, height: 56, fontSize: 20 }}
              disabled={isSyncing}
              variant={'contained'}
              color={'primary'}
              onClick={async () => {
                const isConfirmed = window.confirm(
                  t(
                    `settings:sync__different_settings__chose_local_or_server_description`,
                  ),
                )
                if (!isConfirmed) return
                await checkSync()
              }}
            >
              {t('settings:sync__different_settings__keep_server_button')}
            </Button>
            <Button
              sx={{ width: 400, height: 56, fontSize: 20 }}
              disabled={isSyncing}
              variant={'outlined'}
              color={'primary'}
              onClick={async () => {
                const isConfirmed = window.confirm(
                  t(
                    'settings:sync__different_settings__keep_local_button__confirm',
                  ),
                )
                if (!isConfirmed) return
                const success = await syncLocalToServer(
                  localSettingsCacheRef.current,
                )
                success && (await checkSync())
              }}
            >
              {t('settings:sync__different_settings__keep_local_button')}
            </Button>
          </Stack>
        </Stack>
      )
    }
  }
  return (
    <AppLoadingLayout loading={!loaded}>
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: 9999999,
        }}
        open={isChecking}
      >
        <Stack alignItems={'center'} spacing={2}>
          <CircularProgress size={16} color='inherit' />
          <Typography
            mt={1.5}
            variant='body2'
            fontWeight={400}
            fontSize={16}
            lineHeight={1.25}
          >
            {t('settings:sync__save_syncing')}
          </Typography>
        </Stack>
      </Backdrop>
      {children}
    </AppLoadingLayout>
  )
}
export default SyncSettingCheckerWrapper
