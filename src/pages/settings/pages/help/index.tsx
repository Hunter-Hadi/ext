import { OpenInNewOutlined } from '@mui/icons-material'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

import YoutubePlayerBox from '@/components/YoutubePlayerBox'
import SettingsFeatureCardLayout from '@/pages/settings/layout/SettingsFeatureCardLayout'

const SettingsHelpPage: FC = () => {
  const { t } = useTranslation(['settings', 'common'])
  return (
    <SettingsFeatureCardLayout
      title={t('settings:feature_card__set_up__title')}
      id={'how-to-set-up'}
    >
      <YoutubePlayerBox
        borderRadius={8}
        youtubeLink={'https://www.youtube.com/embed/qiJPoBj8dnE'}
      />
      <Link
        href={'https://www.maxai.me/contact-us'}
        target={'_blank'}
        sx={{
          mt: 2,
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        <Typography component={'span'} fontSize={'16px'}>
          {t('common:contact_us')}
        </Typography>
        <OpenInNewOutlined sx={{ fontSize: 20 }} />
      </Link>
    </SettingsFeatureCardLayout>
  )
}

export default SettingsHelpPage
