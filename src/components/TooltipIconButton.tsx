import IconButton, { IconButtonProps } from '@mui/material/IconButton'
import React, { FC } from 'react'
import TextOnlyTooltip, {
  TextOnlyTooltipProps,
} from '@/components/TextOnlyTooltip'
interface ITooltipIconButton extends Omit<IconButtonProps, 'title'> {
  title: React.ReactNode | string
  placement?: TextOnlyTooltipProps['placement']
  tooltipProps?: Omit<TextOnlyTooltipProps, 'children' | 'title'>
}
const TooltipIconButton: FC<ITooltipIconButton> = (props) => {
  const { title, placement, tooltipProps, ...iconButtonProps } = props
  return (
    <TextOnlyTooltip
      placement={placement || 'top'}
      title={title}
      PopperProps={{
        sx: {
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
    </TextOnlyTooltip>
  )
}
export default TooltipIconButton
