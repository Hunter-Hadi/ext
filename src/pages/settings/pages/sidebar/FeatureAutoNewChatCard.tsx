import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { BaseSelect } from '@/components/select'
import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import { useUserSettings } from '@/pages/settings/hooks/useUserSettings'
import SettingsFeatureCardLayout from '@/pages/settings/layout/SettingsFeatureCardLayout'
const FeatureAutoNewChatCard: FC = () => {
  const { t } = useTranslation(['settings', 'common'])
  const { userSettings, setUserSettings } = useUserSettings()
  return (
    <SettingsFeatureCardLayout
      title={t('settings:feature_card__sidebar__field__auto_archive__title')}
      id={'auto-new-chat'}
    >
      <List
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
        }}
      >
        <ListItemButton>
          <ListItemText
            primary={
              <Stack direction={'row'} alignItems={'center'} gap={1}>
                <Typography fontSize={'16px'} lineHeight={'24px'}>
                  {t(
                    'settings:feature_card__sidebar__field__auto_archive__button__title',
                  )}
                </Typography>
                <TextOnlyTooltip
                  arrow
                  placement='bottom'
                  title={t(
                    'settings:feature_card__sidebar__field__auto_archive__button__tooltip',
                  )}
                >
                  <Stack
                    alignItems={'center'}
                    justifyContent='center'
                    borderRadius={'50%'}
                    width={20}
                    height={20}
                  >
                    <HelpOutlineOutlinedIcon />
                  </Stack>
                </TextOnlyTooltip>
              </Stack>
            }
          />
          <BaseSelect
            defaultValue={
              userSettings?.sidebar?.autoArchive?.Chat || 10 * 60 * 1000
            }
            onChange={async (value, option) => {
              await setUserSettings({
                ...userSettings,
                sidebar: {
                  ...userSettings?.sidebar,
                  autoArchive: {
                    // TODO 先暂时这样写，这三个板块共享一个设置 - @huangsong - 2024-04-23
                    Chat: Number(value),
                    Art: Number(value),
                    Search: Number(value),
                  },
                },
              })
            }}
            options={[
              {
                label: '10 minutes (default)',
                value: 10 * 60 * 1000,
              },
              {
                label: '1 hour',
                value: 60 * 60 * 1000,
              },
              {
                label: '12 hours',
                value: 12 * 60 * 60 * 1000,
              },
              {
                label: '24 hours',
                value: 24 * 60 * 60 * 1000,
              },
            ]}
          ></BaseSelect>
        </ListItemButton>
      </List>
    </SettingsFeatureCardLayout>
  )
}

export default FeatureAutoNewChatCard
