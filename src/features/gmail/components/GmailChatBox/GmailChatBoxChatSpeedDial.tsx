import { SpeedDial } from '@mui/material'
import React, { FC, useState } from 'react'
import SpeedDialAction from '@mui/material/SpeedDialAction'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import { CleanChatBoxIcon } from '@/components/CustomIcon'
import Box from '@mui/material/Box'
import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TextOnlyTooltip from '@/components/TextOnlyTooltip'

type ChatSpeedDialType = 'new' | 'restart' | 'focus'
const GmailChatBoxChatSpeedDial: FC<{
  disabledMainButton?: boolean
  onClick?: (type: ChatSpeedDialType) => void
}> = (props) => {
  const { onClick, disabledMainButton } = props
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
          bottom: '4px',
          '& button': {
            width: 36,
            height: 36,
            minHeight: 36,
          },
          '& > button': {
            width: 40,
            height: 40,
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
            <TextOnlyTooltip placement={'left'} title={'New chat'}>
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
            <Box
              component={'div'}
              onClick={() => {
                console.log('restart dialog')
                setRestartAppDialogVisible(true)
              }}
            >
              <TextOnlyTooltip placement={'left'} title={'Restart extension'}>
                <Stack
                  p={1}
                  alignItems={'center'}
                  justifyContent={'center'}
                  component={'div'}
                >
                  <ContextMenuIcon icon={'Restart'} />
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
          {`Restart MaxAI.me extension`}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {`A quick extension restart can clear all existing glitches.`}
            <br />
            {`Don't forget to reload all pages to activate the extension afterwards.`}
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
            Cancel
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
            Restart
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
export default GmailChatBoxChatSpeedDial
