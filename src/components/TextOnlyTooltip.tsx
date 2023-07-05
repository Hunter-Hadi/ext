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
        style: {
          ...(floatingMenuTooltip
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
              }),
          ...props.style,
          zIndex: 2147483620,
        },
        ...props.PopperProps,
      }}
    />
  )
}

export default TextOnlyTooltip
