import Button from '@mui/material/Button'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'
import Browser from 'webextension-polyfill'

import { useUserSettings } from '@/pages/settings/hooks/useUserSettings'

interface IProps {
  tabId?: number
}

const EnablePDFButton: FC<IProps> = (props) => {
  const { tabId } = props
  const { userSettings, setUserSettings } = useUserSettings()
  const { t } = useTranslation(['client'])

  return (
    <Button
      fullWidth
      color={'primary'}
      variant={'contained'}
      sx={{ borderRadius: '8px', p: 1, fontSize: 16, fontWeight: 600 }}
      onClick={async () => {
        await setUserSettings({
          ...userSettings,
          pdf: {
            enabled: true,
          },
        })
        await Browser.tabs.reload(tabId)
        window.close()
      }}
    >
      {t('client:popup__pdf_page__button')}
    </Button>
  )
}

export default EnablePDFButton
