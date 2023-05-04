import IconButton, { IconButtonProps } from '@mui/material/IconButton'
import React, { FC } from 'react'
import Tooltip, { TooltipProps } from '@mui/material/Tooltip'
interface ITooltipIconButton extends IconButtonProps {
  title: string
  tooltipProps?: Omit<TooltipProps, 'children' | 'title'>
}
const TooltipIconButton: FC<ITooltipIconButton> = (props) => {
  const { title, tooltipProps, ...iconButtonProps } = props
  return (
    <Tooltip
      placement={'top'}
      title={title}
      PopperProps={{
        sx: {
          zIndex: 9999999,
          '& > div': {
            fontSize: '12px',
          },
        },
      }}
      {...tooltipProps}
    >
      <div>
        <IconButton {...iconButtonProps} />
      </div>
    </Tooltip>
  )
}
export default TooltipIconButton
