import useSyncSettingsChecker from '@/pages/options/hooks/useSyncSettingsChecker'
import React, { FC, useCallback, useRef } from 'react'
import { Alert, Button, Stack } from '@mui/material'
import AppLoadingLayout from '@/components/AppLoadingLayout'
import useEffectOnce from '@/hooks/useEffectOnce'
import { chromeExtensionClientOpenPage } from '@/utils'
import { useFocus } from '@/hooks/useFocus'

const SyncSettingCheckerWrapper: FC<{
  children: React.ReactNode
}> = ({ children }) => {
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
  const isSpecialCaseRef = useRef(true)
  const onlyOnceTimesSaveLocalSettings = useCallback(async () => {
    // 特殊情况处理:
    // 0. focus到这个页面
    // 1. 缓存用户当前的设置到ref
    // 2. 直接同步服务器数据到本地，
    // 3. 阻止页面关闭，弹出提示框，让用户选择是否同步本地数据到服务器
    alert('special case')
    await chromeExtensionClientOpenPage({
      key: 'current_page',
    })
    await syncServerToLocal()
    window.onbeforeunload = (event) => {
      event.returnValue = `Be aware that after selecting, the other can't be recovered.`
      return `Be aware that after selecting, the other can't be recovered.`
    }
  }, [])

  useEffectOnce(() => {
    console.log('SyncSettingCheckerWrapper')
    checkSync().then((result) => {
      if (result.status === 'needSync' && !result.success) {
        onlyOnceTimesSaveLocalSettings().then()
      } else {
        isSpecialCaseRef.current = false
      }
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
          <Alert severity="error">
            Something went wrong when getting your latest settings. Please try
            again by refreshing the page.
          </Alert>
          <Button variant={'contained'} color={'primary'}>
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
          <Alert severity="error">
            {`We found different settings (including your custom prompts if any)
            on your local browser and online account. Please choose one to keep.
            Be aware that after selecting, the other can't be recovered.`}
          </Alert>
          <Stack
            direction={'row'}
            justifyContent={'center'}
            alignItems={'center'}
            spacing={2}
          >
            <Button
              disabled={isSyncing}
              variant={'outlined'}
              color={'primary'}
              onClick={async () => {
                const isConfirmed = window.confirm(
                  `Be aware that after selecting, the other can't be recovered.`,
                )
                if (!isConfirmed) return
                const success = await syncLocalToServer(
                  localSettingsCacheRef.current,
                )
                success && (await checkSync())
              }}
            >
              Keep my local browser settings
            </Button>

            <Button
              disabled={isSyncing}
              variant={'contained'}
              color={'primary'}
              onClick={async () => {
                const isConfirmed = window.confirm(
                  `Be aware that after selecting, the other can't be recovered.`,
                )
                if (!isConfirmed) return
                const success = await syncServerToLocal()
                success && (await checkSync())
              }}
            >
              Keep my online account settings
            </Button>
          </Stack>
        </Stack>
      )
    }
  }
  return <AppLoadingLayout loading={isChecking}>{children}</AppLoadingLayout>
}
export default SyncSettingCheckerWrapper
