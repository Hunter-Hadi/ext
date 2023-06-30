import { SpeedDial } from '@mui/material'
import React, { FC } from 'react'
import SpeedDialAction from '@mui/material/SpeedDialAction'
import { CleanChatBoxIcon } from '@/components/CustomIcon'
import Box from '@mui/material/Box'
import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import TooltipIconButton from '@/components/TooltipIconButton'

type ChatSpeedDialType = 'new' | 'restart' | 'focus'
const GmailChatBoxChatSpeedDial: FC<{
  disabledMainButton?: boolean
  onClick?: (type: ChatSpeedDialType) => void
}> = (props) => {
  const { onClick, disabledMainButton } = props
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
          <TooltipIconButton
            onClick={() => {
              if (disabledMainButton) {
                console.log('focus')
                onClick && onClick('focus')
                return
              }
              console.log('new')
              onClick && onClick('new')
            }}
            placement={'left'}
            title={'New Chat'}
            sx={{}}
          >
            <CleanChatBoxIcon sx={{ color: '#fff' }} />
          </TooltipIconButton>
        }
      >
        <SpeedDialAction
          icon={<ContextMenuIcon icon={'Restart'} />}
          tooltipTitle={'Restart app'}
          onClick={() => {
            console.log('restart')
            onClick && onClick('restart')
          }}
        />
      </SpeedDial>
    </Box>
  )
}
export default GmailChatBoxChatSpeedDial
