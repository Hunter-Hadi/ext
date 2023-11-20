import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import React, { FC } from 'react'

export const SeeIconButton: FC<{ detailLink: string }> = ({ detailLink }) => (
  <Tooltip title="View prompt details">
    <IconButton
      size="small"
      onClick={(event) => {
        event.stopPropagation()
        window.open(detailLink)
      }}
    >
      <RemoveRedEyeIcon
        sx={{
          fontSize: 16,
        }}
      />
    </IconButton>
  </Tooltip>
)
