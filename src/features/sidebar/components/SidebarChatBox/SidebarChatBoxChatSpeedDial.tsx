import SpeedDial from '@mui/material/SpeedDial'
import React, { FC, useState } from 'react'
import SpeedDialAction from '@mui/material/SpeedDialAction'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import { CleanChatBoxIcon, MagicBookIcon } from '@/components/CustomIcon'
import Box from '@mui/material/Box'
import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import Link from '@mui/material/Link'
import { CHROME_EXTENSION_HOMEPAGE_URL } from '@/constants'
import { useTranslation } from 'react-i18next'
import { useRecoilValue } from 'recoil'
import { SidebarSettingsState } from '@/features/sidebar'

type ChatSpeedDialType = 'new' | 'restart' | 'focus'
const SidebarChatBoxChatSpeedDial: FC<{
  disabledMainButton?: boolean
  onClick?: (type: ChatSpeedDialType) => void
}> = (props) => {
  const { onClick, disabledMainButton } = props
  const { t } = useTranslation(['common', 'client'])
  const sidebarSettings = useRecoilValue(SidebarSettingsState)
  const [restartAppDialogVisible, setRestartAppDialogVisible] = useState(false)
  const handleCloseRestartAppDialog = () => {
    setRestartAppDialogVisible(false)
    setTimeout(() => {
      onClick && onClick('focus')
    }, 100)
  }
  return (
    <Box
      sx={{
        position: 'absolute',
        left: 0,
        bottom: 0,
        width: 40,
        height: 40,
      }}
    >
      <SpeedDial
        ariaLabel="SpeedDial controlled open"
        sx={{
          position: 'absolute',
          left: 0,
          bottom: '0',
          '& > button': {
            width: 40,
            height: 40,
          },
        }}
        FabProps={{
          sx: {
            '& + div': {
              marginBottom: '-40px!important',
              paddingBottom: '48px!important',
            },
          },
        }}
        icon={
          <Box
            component={'div'}
            onClick={() => {
              if (disabledMainButton) {
                console.log('focus')
                onClick && onClick('focus')
                return
              }
              console.log('new')
              onClick && onClick('new')
            }}
          >
            <TextOnlyTooltip
              placement={'left'}
              title={
                sidebarSettings.type === 'Chat'
                  ? t('client:sidebar__tabs__chat__action_btn__title')
                  : t('client:sidebar__tabs__summary__action_btn__title')
              }
            >
              <Stack
                p={1}
                alignItems={'center'}
                justifyContent={'center'}
                component={'div'}
              >
                <CleanChatBoxIcon sx={{ color: '#fff', fontSize: '24px' }} />
              </Stack>
            </TextOnlyTooltip>
          </Box>
        }
      >
        <SpeedDialAction
          icon={
            <Link
              href={CHROME_EXTENSION_HOMEPAGE_URL + '/prompts'}
              target={'_blank'}
              color={'text.secondary'}
            >
              <Box
                component={'div'}
                onClick={(event) => {
                  event.stopPropagation()
                }}
              >
                <TextOnlyTooltip
                  placement={'left'}
                  title={t(
                    'client:sidebar__speed_dial__one_click_prompts__button',
                  )}
                >
                  <Stack
                    p={1}
                    alignItems={'center'}
                    justifyContent={'center'}
                    component={'div'}
                  >
                    <MagicBookIcon
                      sx={{ fontSize: '24px', color: 'primary.main' }}
                    />
                  </Stack>
                </TextOnlyTooltip>
              </Box>
            </Link>
          }
          tooltipTitle={''}
        />
        <SpeedDialAction
          icon={
            <Box
              component={'div'}
              onClick={() => {
                console.log('restart dialog')
                setRestartAppDialogVisible(true)
              }}
            >
              <TextOnlyTooltip
                placement={'left'}
                title={t(
                  'client:sidebar__speed_dial__restart_extension__button',
                )}
              >
                <Stack
                  p={1}
                  alignItems={'center'}
                  justifyContent={'center'}
                  component={'div'}
                >
                  <ContextMenuIcon icon={'Restart'} sx={{ fontSize: '24px' }} />
                </Stack>
              </TextOnlyTooltip>
            </Box>
          }
          tooltipTitle={''}
        />
      </SpeedDial>
      {/*restart app dialog*/}
      <Dialog
        open={restartAppDialogVisible}
        onClose={() => {
          handleCloseRestartAppDialog()
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {t('client:sidebar__speed_dial__restart_extension__tooltip__title')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {t(
              'client:sidebar__speed_dial__restart_extension__tooltip__description1',
            )}
            <br />
            {t(
              'client:sidebar__speed_dial__restart_extension__tooltip__description2',
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            sx={{}}
            variant={'outlined'}
            onClick={() => {
              handleCloseRestartAppDialog()
            }}
          >
            {t('common:cancel')}
          </Button>
          <Button
            color={'primary'}
            variant={'contained'}
            onClick={() => {
              onClick && onClick('restart')
              handleCloseRestartAppDialog()
            }}
            autoFocus
          >
            {t(
              'client:sidebar__speed_dial__restart_extension__tooltip__confirm',
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
export default SidebarChatBoxChatSpeedDial
