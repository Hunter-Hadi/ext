import useSyncSettingsChecker from '@/pages/options/hooks/useSyncSettingsChecker'
import React, { FC, useCallback, useContext, useRef, useState } from 'react'

import Alert from '@mui/material/Alert'
import Backdrop from '@mui/material/Backdrop'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import useEffectOnce from '@/hooks/useEffectOnce'
import { chromeExtensionClientOpenPage } from '@/utils'
import { useFocus } from '@/hooks/useFocus'
import AppLoadingLayout from '@/components/AppLoadingLayout'
import { OptionsPageRouteContext } from '@/pages/options/context'

const SyncSettingCheckerWrapper: FC<{
  children: React.ReactNode
  onLoad?: () => void
}> = ({ children, onLoad }) => {
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
  const routerContext = useContext(OptionsPageRouteContext)
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
      event.returnValue = `Be aware that you will lose your local browser settings permanently by keeping your online account settings and cannot be undone.`
      return `Be aware that you will lose your local browser settings permanently by keeping your online account settings and cannot be undone.`
    }
  }, [])

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
      .finally(() => {
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
          <Alert severity="error">
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
          <Alert severity="error">
            {`We found different settings (including your custom prompts if any) on your local browser and online account. Your online account settings have overridden your local browser settings. If you prefer to keep your local browser settings instead, click the "Keep local browser settings" button now.`}
          </Alert>
          <Stack alignItems={'center'} spacing={2}>
            <Button
              sx={{ width: 400, height: 56, fontSize: 20 }}
              disabled={isSyncing}
              variant={'contained'}
              color={'primary'}
              onClick={async () => {
                const isConfirmed = window.confirm(
                  `Be aware that you will lose your local browser settings permanently by keeping your online account settings and cannot be undone.`,
                )
                if (!isConfirmed) return
                await checkSync()
              }}
            >
              Continue to Settings
            </Button>
            <Button
              sx={{ width: 400, height: 56, fontSize: 20 }}
              disabled={isSyncing}
              variant={'outlined'}
              color={'primary'}
              onClick={async () => {
                const isConfirmed = window.confirm(
                  `Are you sure you want to replace your online account settings with your local browser settings (including your custom prompts if any)? Doing so will undo your online account settings permanently and cannot be undone.`,
                )
                if (!isConfirmed) return
                const success = await syncLocalToServer(
                  localSettingsCacheRef.current,
                )
                success && (await checkSync())
              }}
            >
              Keep local browser settings instead
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
          <CircularProgress size={16} color="inherit" />
          <Typography
            mt={1.5}
            variant="body2"
            fontWeight={400}
            fontSize={16}
            lineHeight={1.25}
          >
            Syncing...
          </Typography>
        </Stack>
      </Backdrop>
      {children}
    </AppLoadingLayout>
  )
}
export default SyncSettingCheckerWrapper
