import Button, { ButtonProps } from '@mui/material/Button'
import React, { FC } from 'react'
import TextOnlyTooltip, {
  TextOnlyTooltipProps,
} from '@/components/TextOnlyTooltip'

interface ITooltipButton extends Omit<ButtonProps, 'title'> {
  title: React.ReactNode | string
  tooltipProps?: Omit<TextOnlyTooltipProps, 'children' | 'title'>
}
const TooltipButton: FC<ITooltipButton> = (props) => {
  const { title, tooltipProps, ...iconButtonProps } = props
  return (
    <TextOnlyTooltip
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
    </TextOnlyTooltip>
  )
}
export default TooltipButton
