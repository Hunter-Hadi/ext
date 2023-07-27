import Stack from '@mui/material/Stack'
import React, { FC } from 'react'
import SettingsFeatureCardLayout from '@/pages/settings/layout/SettingsFeatureCardLayout'
import { useTranslation } from 'react-i18next'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import { OpenInNewOutlined } from '@mui/icons-material'
import useCommands from '@/hooks/useCommands'
import Box from '@mui/material/Box'
import { chromeExtensionClientOpenPage } from '@/utils'
import List from '@mui/material/List'
import Button from '@mui/material/Button'
import { ListItem } from '@mui/material'
import Typography from '@mui/material/Typography'

const SettingsOpenaiApiKeyPage: FC = () => {
  const { t } = useTranslation(['settings'])
  const { chatBoxShortCutKey } = useCommands()
  return (
    <Stack>
      <SettingsFeatureCardLayout
        title={t('settings:feature_card__shortcut_hint__title')}
        id={'shortcuts'}
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
            '& > * + .MuiListItem-root': {
              borderTop: '1px solid',
              borderColor: 'customColor.borderColor',
            },
          }}
        >
          <ListItemButton
            onClick={() => {
              chromeExtensionClientOpenPage({ key: 'shortcuts' })
            }}
          >
            <ListItemText
              primary={t(
                'settings:feature_card__shortcut_hint__field_edit_shortcut__title',
              )}
              secondary={
                chatBoxShortCutKey ? (
                  <Box
                    sx={{
                      mt: 0.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '4px',
                      p: '0 4px',
                      color: 'text.secondary',
                      width: 'fit-content',
                      bgcolor: (t) =>
                        t.palette.mode === 'dark'
                          ? '#292929'
                          : 'rgb(235,235,235)',
                    }}
                  >
                    {chatBoxShortCutKey}
                  </Box>
                ) : (
                  <Button
                    sx={{ width: 160, mt: 1 }}
                    variant={'contained'}
                    color={'primary'}
                    endIcon={<OpenInNewOutlined />}
                  >
                    {t(
                      'settings:feature_card__shortcut_hint__field_edit_shortcut__set_up_shortcut',
                    )}
                  </Button>
                )
              }
            />
            <OpenInNewOutlined sx={{ fontSize: 20 }}></OpenInNewOutlined>
          </ListItemButton>
          {!chatBoxShortCutKey && (
            <ListItem>
              <ListItemText
                primary={
                  <Stack>
                    <Typography color={'text.secondary'} fontSize={14}>
                      {t(
                        'settings:feature_card__shortcut_hint__field_edit_shortcut__description',
                      )}
                    </Typography>
                    <Box
                      sx={{
                        position: 'relative',
                        width: '470px',
                        height: '162.5px',
                      }}
                    >
                      <video
                        width={'100%'}
                        height={'100%'}
                        muted
                        loop
                        autoPlay
                        src={`https://www.maxai.me/assets/installed/reconfigure.mp4`}
                      />
                    </Box>
                  </Stack>
                }
              ></ListItemText>
            </ListItem>
          )}
        </List>
      </SettingsFeatureCardLayout>
    </Stack>
  )
}
export default SettingsOpenaiApiKeyPage
