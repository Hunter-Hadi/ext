import Button, { ButtonProps } from '@mui/material/Button'
import React, { FC } from 'react'
import Tooltip, { TooltipProps } from '@mui/material/Tooltip'
interface ITooltipButton extends ButtonProps {
  title: string
  tooltipProps?: Omit<TooltipProps, 'children' | 'title'>
}
const TooltipButton: FC<ITooltipButton> = (props) => {
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
        <Button {...iconButtonProps} />
      </div>
    </Tooltip>
  )
}
export default TooltipButton
