import Box from '@mui/material/Box'
import { alpha, type SxProps } from '@mui/material/styles'
import React, { type FC, memo } from 'react'

import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import { UseChatGptIcon } from '@/components/CustomIcon'

const InputAssistantButtonExhibit: FC<{
  highlight?: boolean
  sx?: SxProps
}> = ({ highlight, sx = {} }) => {
  return (
    <Box
      sx={{
        width: '75px',
        height: '36px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: '999px',
        margin: 'auto',
        overflow: 'hidden',
        ...sx,
      }}
    >
      <Box
        sx={{
          width: '48px',
          height: 'inherit',
          fontSize: 18,
          color: '#FFFFFF',
          backgroundColor: (theme) =>
            alpha(theme.palette.customColor.main!, !highlight ? 1 : 0.4),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        component='div'
      >
        <UseChatGptIcon
          sx={{
            fontSize: `inherit`,
            color: 'inherit',
          }}
        />
      </Box>
      <Box
        sx={{
          flexGrow: 1,
          height: 'inherit',
          fontSize: 20,
          color: '#FFFFFF',
          backgroundColor: (theme) =>
            alpha(theme.palette.customColor.main!, highlight ? 1 : 0.4),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        component='div'
      >
        <ContextMenuIcon
          icon={'ArrowDropDown'}
          sx={{
            fontSize: `inherit`,
            color: 'inherit',
          }}
        />
      </Box>
    </Box>
  )
}

export default memo(InputAssistantButtonExhibit)
