import React, { FC } from 'react'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import { useTranslation } from 'react-i18next'
import SettingsCardLayout from '@/pages/settings/layout/SettingsCardLayout'
import List from '@mui/material/List'
import { ListItem } from '@mui/material'
import ListItemIcon from '@mui/material/ListItemIcon'
import Avatar from '@mui/material/Avatar'
import { useUserInfo } from '@/features/auth/hooks/useUserInfo'
import ListItemText from '@mui/material/ListItemText'
import IconButton from '@mui/material/IconButton'
import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined'
import Divider from '@mui/material/Divider'
const SettingsPeoplePage: FC = () => {
  const { t, i18n } = useTranslation(['common', 'settings'])
  const { userInfo } = useUserInfo()
  return (
    <Stack>
      <SettingsCardLayout
        title={t('settings:feature_card__me__title')}
        id={'user-info'}
      >
        <List
          component={'nav'}
          sx={{
            bgcolor: 'background.paper',
            p: '0 !important',
            borderRadius: '4px',
            border: (t) =>
              t.palette.mode === 'dark'
                ? '1px solid rgba(255, 255, 255, 0.12)'
                : '1px solid rgba(0, 0, 0, 0.12)',
          }}
        >
          <ListItem>
            <ListItemIcon sx={{ minWidth: 48 }}>
              <Avatar
                sx={{ width: 32, height: 32, textTransform: 'capitalize' }}
              >
                {userInfo?.email?.[0] || 'M'}
              </Avatar>
            </ListItemIcon>
            <ListItemText primary={userInfo?.email || ''} />
            <Button
              sx={{
                border: '1px solid #e0e0e0',
                '&:hover': {
                  border: '1px solid #e0e0e0',
                },
                color: 'text.primary',
              }}
              variant={'outlined'}
            >
              {t('common:log_out')}
            </Button>
          </ListItem>
          <Divider />
          <ListItem
            secondaryAction={
              <IconButton edge={'end'}>
                <ChevronRightOutlinedIcon
                  sx={{
                    fontSize: '24px',
                  }}
                />
              </IconButton>
            }
          >
            <ListItemText primary={t('settings:feature_card__me__my_plan')} />
          </ListItem>
        </List>
      </SettingsCardLayout>
      <p>{t('common:log_out')}</p>
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
