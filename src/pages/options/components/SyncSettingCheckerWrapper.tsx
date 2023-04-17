import useSyncSettingsChecker from '@/pages/options/hooks/useSyncSettingsChecker'
import React, { FC } from 'react'
import { Alert, Button, Stack } from '@mui/material'
import AppLoadingLayout from '@/components/AppLoadingLayout'
import useEffectOnce from '@/hooks/useEffectOnce'

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
  } = useSyncSettingsChecker()
  useEffectOnce(() => {
    console.log('SyncSettingCheckerWrapper')
    checkSync()
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
                const success = await syncLocalToServer()
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
