import React, { FC } from 'react'
import Tooltip, { TooltipProps } from '@mui/material/Tooltip'
import { getAppContextMenuElement } from '@/utils'

export interface TextOnlyTooltipProps extends TooltipProps {
  floatingMenuTooltip?: boolean
}

const TextOnlyTooltip: FC<TextOnlyTooltipProps> = ({
  floatingMenuTooltip = false,
  ...props
}) => {
  const container = getAppContextMenuElement() || document.body
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
          '& > div': floatingMenuTooltip
            ? {}
            : {
                backgroundColor: 'rgba(97, 97, 97, 0.92)',
                borderRadius: '4px',
                color: '#fff',
                padding: '4px 8px',
                fontSize: '12px',
                margin: '2px',
                fontWeight: 500,
                wordWrap: 'break-word',
              },
          ...props.PopperProps?.sx,
        },
      }}
    />
  )
}

export default TextOnlyTooltip
