import React, { useEffect } from 'react'
import { AppSettingsInit } from '@/utils/AppInit'
import { useSetRecoilState } from 'recoil'
import { AppSettingsState } from '@/store'
import { getChromeExtensionSettings } from '@/background/utils'

const OptionPagesInit = () => {
  const setAppSettings = useSetRecoilState(AppSettingsState)

  useEffect(() => {
    const updateSettings = async () => {
      const settings = await getChromeExtensionSettings()
      setAppSettings(settings)
    }
    window.addEventListener('focus', updateSettings)
    updateSettings()
    return () => {
      window.removeEventListener('focus', updateSettings)
    }
  }, [])
  return (
    <>
      <AppSettingsInit />
    </>
  )
}

export default OptionPagesInit
