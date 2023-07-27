import { useTranslation } from 'react-i18next'
import SettingsFeatureCardLayout from '@/pages/settings/layout/SettingsFeatureCardLayout'
import React, { FC } from 'react'
import YoutubePlayerBox from '@/components/YoutubePlayerBox'
import Typography from '@mui/material/Typography'
import Link from '@mui/material/Link'
import { OpenInNewOutlined } from '@mui/icons-material'

const SettingsHelpPage: FC = () => {
  const { t } = useTranslation('settings')
  return (
    <SettingsFeatureCardLayout
      title={t('feature_card__set_up__title')}
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
          Contact us
        </Typography>
        <OpenInNewOutlined sx={{ fontSize: 20 }} />
      </Link>
    </SettingsFeatureCardLayout>
  )
}
export default SettingsHelpPage
