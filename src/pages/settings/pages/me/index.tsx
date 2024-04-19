import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import List from '@mui/material/List'
import ListItem, { listItemClasses } from '@mui/material/ListItem'
import { listItemButtonClasses } from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Stack from '@mui/material/Stack'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { APP_USE_CHAT_GPT_HOST } from '@/constants'
import UserQuotaUsageQueriesCard from '@/features/auth/components/UserQuotaUsageQueriesCard'
import { useUserInfo } from '@/features/auth/hooks/useUserInfo'
import SettingsFeatureCardLayout from '@/pages/settings/layout/SettingsFeatureCardLayout'
const SettingsMePage: FC = () => {
  const { t } = useTranslation(['common', 'settings'])
  const { userInfo } = useUserInfo()
  return (
    <Stack>
      <SettingsFeatureCardLayout
        title={t('settings:feature_card__me__title')}
        id={'user-info'}
      >
        <Stack spacing={2}>
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
              '& > * + .MuiListItem-root': {
                borderTop: '1px solid',
                borderColor: 'customColor.borderColor',
              },

              [`& .${listItemClasses.root}, & .${listItemButtonClasses.root}`]:
                {
                  px: 3,
                  py: 2,
                },
            }}
          >
            <ListItem>
              <ListItemIcon sx={{ minWidth: 48 }}>
                <Avatar
                  sx={{ width: 40, height: 40, textTransform: 'capitalize' }}
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
            {/* <Divider />
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
            </ListItemButton> */}
          </List>

          <UserQuotaUsageQueriesCard />
        </Stack>
      </SettingsFeatureCardLayout>
    </Stack>
  )
}
export default SettingsMePage
