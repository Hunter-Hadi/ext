import Button, { ButtonProps } from '@mui/material/Button'
import React, { FC } from 'react'
import TextOnlyTooltip, {
  TextOnlyTooltipProps,
} from '@/components/TextOnlyTooltip'

interface ITooltipButton extends Omit<ButtonProps, 'title'> {
  title: React.ReactNode | string
  TooltipProps?: Omit<TextOnlyTooltipProps, 'children' | 'title'>
}
const TooltipButton: FC<ITooltipButton> = (props) => {
  const { title, TooltipProps, ...iconButtonProps } = props
  return (
    <TextOnlyTooltip
      placement={'top'}
      title={title}
      PopperProps={{
        sx: {
          zIndex: 9999999,
        },
      }}
      {...TooltipProps}
    >
      <div>
        <Button {...iconButtonProps} />
      </div>
    </TextOnlyTooltip>
  )
}
export default TooltipButton
