import React, { FC } from 'react'
import Tooltip, { TooltipProps } from '@mui/material/Tooltip'
import { getAppContextMenuElement, getAppRootElement } from '@/utils'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'

export interface TextOnlyTooltipProps extends TooltipProps {
  description?: React.ReactNode
  floatingMenuTooltip?: boolean
}

const TextOnlyTooltip: FC<TextOnlyTooltipProps> = ({
  title,
  description,
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
            color: 'rgba(255,255,255,0.87)',
            fontSize: '14px',
          },
          ...props.PopperProps?.sx,
        },
      }}
      title={
        title ? (
          <Stack>
            <Typography
              fontSize={'14px'}
              textAlign={'left'}
              color="rgba(255,255,255,.87)"
            >
              {title}
            </Typography>
            {description && (
              <Typography
                fontSize={'12px'}
                textAlign={'left'}
                color="rgba(255,255,255,.6)"
              >
                {description}
              </Typography>
            )}
          </Stack>
        ) : (
          ''
        )
      }
    />
  )
}

export default TextOnlyTooltip
