import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import SpeedDial from '@mui/material/SpeedDial'
import SpeedDialAction from '@mui/material/SpeedDialAction'
import Stack from '@mui/material/Stack'
import React, { FC, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import { CleanChatBoxIcon } from '@/components/CustomIcon'
import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'

type ChatSpeedDialType = 'new' | 'restart' | 'focus'
const SidebarChatBoxChatSpeedDial: FC<{
  disabledMainButton?: boolean
  onClick?: (type: ChatSpeedDialType) => void
}> = (props) => {
  const { onClick, disabledMainButton } = props
  const { currentSidebarConversationType } = useSidebarSettings()
  const { t } = useTranslation(['common', 'client'])
  const [restartAppDialogVisible, setRestartAppDialogVisible] = useState(false)

  const cleanBtnTooltipTitle = useMemo(() => {
    if (currentSidebarConversationType === 'ContextMenu') {
      return t('client:sidebar__tabs__rewrite__action_btn__title')
    }
    if (currentSidebarConversationType === 'Summary') {
      return t('client:sidebar__tabs__summary__action_btn__title')
    }

    if (currentSidebarConversationType === 'Search') {
      return t('client:sidebar__tabs__search__action_btn__title')
    }

    if (currentSidebarConversationType === 'Art') {
      return t('client:sidebar__tabs__art__action_btn__title')
    }

    return t('client:sidebar__tabs__chat__action_btn__title')
  }, [currentSidebarConversationType, t])

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
        left: -8,
        bottom: 0,
        width: 40,
        height: 40,
      }}
    >
      <SpeedDial
        ariaLabel='SpeedDial controlled open'
        sx={{
          position: 'absolute',
          left: 0,
          bottom: '0',
          '& > button': {
            width: 40,
            height: 40,
            borderRadius: 2,
          },
        }}
        FabProps={{
          sx: {
            '& + div': {
              marginBottom: '-40px!important',
              paddingBottom: '48px!important',
            },

            '& + div > button': {
              width: 40,
              height: 40,
              borderRadius: 2,
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
              title={cleanBtnTooltipTitle}
              data-testid='maxai_speed_dial__new_chat_button'
              data-button-clicked-name='maxai-speed-dial--new-chat-button'
            >
              <Stack
                p={1}
                alignItems={'center'}
                justifyContent={'center'}
                component={'div'}
              >
                {currentSidebarConversationType === 'Summary' ? (
                  <CleanChatBoxIcon sx={{ color: '#fff', fontSize: '24px' }} />
                ) : (
                  <ContextMenuIcon
                    icon={'NewChat'}
                    sx={{ color: '#fff', fontSize: '24px' }}
                  />
                )}
              </Stack>
            </TextOnlyTooltip>
          </Box>
        }
      >
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
                data-testid='maxai_speed_dial__restart_extension_button'
                data-button-clicked-name='maxai-speed-dial--restart-extension-button'
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
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
      >
        <DialogTitle id='alert-dialog-title'>
          {t('client:sidebar__speed_dial__restart_extension__tooltip__title')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id='alert-dialog-description'>
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
