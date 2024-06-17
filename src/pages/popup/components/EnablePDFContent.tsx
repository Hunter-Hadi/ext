import Alert from '@mui/material/Alert'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'
import Browser from 'webextension-polyfill'

import YoutubePlayerBox from '@/components/YoutubePlayerBox'
import { useUserSettings } from '@/pages/settings/hooks/useUserSettings'

interface IProps {
  tabId?: number
}

const EnablePDFContent: FC<IProps> = (props) => {
  const { tabId } = props
  const { userSettings, setUserSettings } = useUserSettings()
  const { t } = useTranslation(['client'])

  return (
    <>
      <Typography fontSize={16} fontWeight={600}>
        {t('client:popup__pdf_page__title')}
      </Typography>
      <Stack spacing={1}>
        <Typography>
          {t('client:popup__pdf_page__step1__description1')}
          <Link
            href={'#'}
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
            {t('client:popup__pdf_page__step1__description2')}
          </Link>
          {t('client:popup__pdf_page__step1__description3')}
        </Typography>
        <Typography>
          {t('client:popup__pdf_page__step2__description1')}
          <Link
            href={'#'}
            onClick={() => {
              Browser.tabs.create({
                url: `chrome://extensions/?id=${Browser.runtime.id}`,
                active: true,
              })
            }}
          >
            {t('client:popup__pdf_page__step2__description2')}
          </Link>
          {t('client:popup__pdf_page__step2__description3')}
        </Typography>
        <Typography>
          {t('client:popup__pdf_page__step3__description')}
        </Typography>
      </Stack>

      <Alert severity={'info'} sx={{ borderRadius: '8px' }}>
        <Typography fontSize={14} color={'text.primary'}>
          {t('client:popup__pdf_page__tip')}
        </Typography>
      </Alert>

      <YoutubePlayerBox
        borderRadius={8}
        youtubeLink={'https://www.youtube.com/embed/Gvp3chuxzCk'}
      />
    </>
  )
}

export default EnablePDFContent
