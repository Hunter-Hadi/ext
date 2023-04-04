import React, { useEffect } from 'react'
import { AppSettingsInit } from '@/utils/AppInit'
import { CHROME_EXTENSION_POST_MESSAGE_ID } from '@/types'
import { IChromeExtensionClientListenEvent } from '@/background'
import { useSetRecoilState } from 'recoil'
import { AppSettingsState } from '@/store'
import Browser from 'webextension-polyfill'

const OptionPagesInit = () => {
  const setAppSettings = useSetRecoilState(AppSettingsState)

  useEffect(() => {
    const listener = (msg: any) => {
      const { event, data } = msg
      if (msg?.id && msg.id !== CHROME_EXTENSION_POST_MESSAGE_ID) {
        return
      }

      switch (event as IChromeExtensionClientListenEvent) {
        case 'Client_updateAppSettings':
          {
            console.log('Client_updateAppSettings', data)
            setAppSettings(data)
          }
          break
        default:
          break
      }
    }

    Browser.runtime.onMessage.addListener(listener)

    return () => {
      Browser?.runtime?.onMessage?.removeListener(listener)
    }
  }, [])

  return (
    <>
      <AppSettingsInit />
    </>
  )
}

export default OptionPagesInit
