import React, { FC } from 'react'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import { useTranslation } from 'react-i18next'
import SettingsFeatureCardLayout from '@/pages/settings/layout/SettingsFeatureCardLayout'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import Avatar from '@mui/material/Avatar'
import { useUserInfo } from '@/features/auth/hooks/useUserInfo'
import ListItemText from '@mui/material/ListItemText'
import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined'
import Divider from '@mui/material/Divider'
import { APP_USE_CHAT_GPT_HOST } from '@/constants'
import ListItemButton from '@mui/material/ListItemButton'
const SettingsMePage: FC = () => {
  const { t } = useTranslation(['common', 'settings'])
  const { userInfo } = useUserInfo()
  return (
    <Stack>
      <SettingsFeatureCardLayout
        title={t('settings:feature_card__me__title')}
        id={'user-info'}
      >
        <List
          component={'nav'}
          sx={{
            bgcolor: (theme) =>
              theme.palette.mode === 'dark'
                ? 'rgb(32, 33, 36)'
                : 'rgb(255,255,255)',
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
              component={'a'}
              target={'_blank'}
              href={`${APP_USE_CHAT_GPT_HOST}/logout`}
              sx={{
                borderColor: 'customColor.borderColor',
                color: 'text.primary',
              }}
              variant={'outlined'}
            >
              {t('common:log_out')}
            </Button>
          </ListItem>
          <Divider />
          <ListItemButton
            component={'a'}
            target={'_blank'}
            href={`${APP_USE_CHAT_GPT_HOST}/my-plan`}
          >
            <ListItemText primary={t('settings:feature_card__me__my_plan')} />
            <ChevronRightOutlinedIcon
              sx={{
                fontSize: '24px',
              }}
            />
          </ListItemButton>
        </List>
      </SettingsFeatureCardLayout>
    </Stack>
  )
}
export default SettingsMePage
