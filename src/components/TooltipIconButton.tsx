import CircularProgress from '@mui/material/CircularProgress'
import IconButton, { type IconButtonProps } from '@mui/material/IconButton'
import { type PopperProps } from '@mui/material/Popper'
import React, { FC } from 'react'

import TextOnlyTooltip, {
  TextOnlyTooltipProps,
} from '@/components/TextOnlyTooltip'

export interface ITooltipIconButton extends Omit<IconButtonProps, 'title'> {
  title: React.ReactNode | string
  placement?: TextOnlyTooltipProps['placement']
  TooltipProps?: Omit<TextOnlyTooltipProps, 'children' | 'title'>
  PopperProps?: Omit<PopperProps, 'open'> & { open?: boolean } // fix type error
  loading?: boolean
}
const TooltipIconButton: FC<ITooltipIconButton> = (props) => {
  const {
    title,
    placement,
    TooltipProps,
    loading = false,
    children,
    PopperProps,
    ...iconButtonProps
  } = props
  return (
    <TextOnlyTooltip
      placement={placement || 'top'}
      title={title}
      PopperProps={{
        sx: {},
        ...PopperProps,
      }}
      {...TooltipProps}
    >
      <div>
        <IconButton {...iconButtonProps}>
          {loading ? (
            <CircularProgress size={16} sx={{ m: '0 auto' }} />
          ) : (
            children
          )}
        </IconButton>
      </div>
    </TextOnlyTooltip>
  )
}
export default TooltipIconButton
