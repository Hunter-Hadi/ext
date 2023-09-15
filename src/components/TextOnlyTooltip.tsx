import React, { FC } from 'react'
import Tooltip, { TooltipProps } from '@mui/material/Tooltip'
import {
  getAppContextMenuRootElement,
  getAppMinimizeContainerElement,
  getAppRootElement,
} from '@/utils'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'

export interface TextOnlyTooltipProps extends TooltipProps {
  description?: React.ReactNode
  floatingMenuTooltip?: boolean
  minimumTooltip?: boolean
  paperCard?: boolean
  zIndex?: number
}

const TextOnlyTooltip: FC<TextOnlyTooltipProps> = ({
  title,
  description,
  minimumTooltip = false,
  floatingMenuTooltip = false,
  paperCard = false,
  zIndex = 2147483620,
  ...props
}) => {
  let container: any = document.body
  if (minimumTooltip) {
    container = getAppMinimizeContainerElement()
  } else {
    container = floatingMenuTooltip
      ? getAppContextMenuRootElement()
      : getAppRootElement()
  }
  if (props.PopperProps?.container) {
    container = props.PopperProps.container
  }
  if (!container) {
    container = document.body
  }
  return (
    <Tooltip
      {...props}
      PopperProps={{
        container,
        ...props.PopperProps,
        style: {
          ...props.style,
          zIndex,
        },
        sx: {
          '&[data-popper-placement*="bottom"] > div': {
            marginTop: props.arrow ? '12px!important' : '4px!important',
          },
          '&[data-popper-placement*="top"] > div': {
            marginBottom: props.arrow ? '12px!important' : '4px!important',
          },
          '&[data-popper-placement*="right"] > div': {
            marginLeft: props.arrow ? '12px!important' : '4px!important',
          },
          '&[data-popper-placement*="left"] > div': {
            marginRight: props.arrow ? '12px!important' : '4px!important',
          },
          '& > div': {
            fontWeight: 400,
            color: 'rgba(255,255,255,0.87)',
            fontSize: '14px',
            maxWidth: (props as any)?.sx?.maxWidth || '300px',
            ...(paperCard && {
              p: '4px 6px',
              borderRadius: '4px',
              bgcolor: (t) =>
                t.palette.mode === 'dark' ? '#fff' : 'rgba(0,0,0,0.87)',
              color: (t) =>
                t.palette.mode === 'dark'
                  ? 'rgba(0,0,0,0.87)'
                  : 'rgba(255,255,255,0.87)',
              boxShadow: (t) =>
                t.palette.mode === 'dark'
                  ? '0px 0px 0.5px 0px rgba(0, 0, 0, 0.40), 0px 1px 3px 0px rgba(0, 0, 0, 0.09), 0px 4px 8px 0px rgba(0, 0, 0, 0.09);'
                  : '0px 0px 0.5px 0px rgba(0, 0, 0, 0.40), 0px 1px 3px 0px rgba(0, 0, 0, 0.09), 0px 4px 8px 0px rgba(0, 0, 0, 0.09);',
            }),
          },
          ...props.PopperProps?.sx,
        },
      }}
      title={
        title ? (
          <Stack>
            <Typography fontSize={'14px'} textAlign={'left'} color="inherit">
              {title}
            </Typography>
            {description && (
              <Typography fontSize={'12px'} textAlign={'left'} color="inherit">
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
