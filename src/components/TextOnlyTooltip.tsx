import React, { FC } from 'react'
import Tooltip, { TooltipProps } from '@mui/material/Tooltip'
import { getAppContextMenuElement, getAppRootElement } from '@/utils'

export interface TextOnlyTooltipProps extends TooltipProps {
  floatingMenuTooltip?: boolean
}

const TextOnlyTooltip: FC<TextOnlyTooltipProps> = ({
  floatingMenuTooltip = false,
  ...props
}) => {
  const container =
    (floatingMenuTooltip ? getAppContextMenuElement() : getAppRootElement()) ||
    document.body
  return (
    <Tooltip
      {...props}
      PopperProps={{
        container,
        ...props.PopperProps,
        style: {
          ...props.style,
          zIndex: 2147483620,
        },
        sx: {
          '&[data-popper-placement*="bottom"] > div': {
            marginTop: props.arrow ? '8px!important' : '4px!important',
          },
          '&[data-popper-placement*="top"] > div': {
            marginBottom: props.arrow ? '8px!important' : '4px!important',
          },
          '&[data-popper-placement*="right"] > div': {
            marginLeft: props.arrow ? '8px!important' : '4px!important',
          },
          '&[data-popper-placement*="left"] > div': {
            marginRight: props.arrow ? '8px!important' : '4px!important',
          },
          '& > div': {
            fontWeight: 400,
            color: 'rgba(255,255,255,1)',
            fontSize: '12px',
          },
          ...props.PopperProps?.sx,
        },
      }}
    />
  )
}

export default TextOnlyTooltip
