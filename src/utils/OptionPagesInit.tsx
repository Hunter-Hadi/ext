import React, { useEffect } from 'react'
import { AppSettingsInit } from '@/components/AppInit'
import { useSetRecoilState } from 'recoil'
import { AppSettingsState } from '@/store'
import { getChromeExtensionSettings } from '@/background/utils'
import { useLazyLoadI18nResources } from '@/utils/i18n'

const OptionPagesInit = () => {
  const setAppSettings = useSetRecoilState(AppSettingsState)
  useLazyLoadI18nResources()
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
