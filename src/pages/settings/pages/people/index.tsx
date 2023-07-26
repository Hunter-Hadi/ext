import React, { FC } from 'react'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import { useTranslation } from 'react-i18next'

const SettingsPeoplePage: FC = () => {
  const { t, i18n } = useTranslation('settings')
  return (
    <Stack>
      <p>{t('left_menu.help')}</p>
      <p>{i18n.language}</p>
      <Button
        onClick={async () => {
          await i18n.changeLanguage('zh_CN')
        }}
      >
        change language
      </Button>
    </Stack>
  )
}
export default SettingsPeoplePage
