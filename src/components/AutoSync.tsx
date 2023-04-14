import React, { useEffect, useState } from 'react'
import { SnackbarProvider, VariantType, useSnackbar } from 'notistack'

const AutoSync = () => {
  // Syncing your settings...
  // Sync successful!
  const [saving, setSaving] = useState(false)
  const { enqueueSnackbar } = useSnackbar()
  useEffect(() => {
    enqueueSnackbar('Syncing your settings...', {
      variant: 'info' as VariantType,
      persist: true,
      anchorOrigin: {
        vertical: 'bottom',
        horizontal: 'left',
      },
    })
    setTimeout(() => {
      setSaving(false)
      enqueueSnackbar('Sync successful!', {
        variant: 'success' as VariantType,
        persist: false,
        anchorOrigin: {
          vertical: 'bottom',
          horizontal: 'left',
        },
      })
    }, 3000)
  }, [])
  return <SnackbarProvider maxSnack={1} />
}
export default AutoSync
