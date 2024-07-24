import Button, { ButtonProps } from '@mui/material/Button'
import { styled, SxProps } from '@mui/material/styles'
import Tooltip, { tooltipClasses, TooltipProps } from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import React from 'react'

import TextOnlyTooltip from '@/components/TextOnlyTooltip'

export interface ISidebarTabItemProps extends ButtonProps {
  label: React.ReactNode
  icon: React.ReactNode
  tooltip?: React.ReactNode
  placement?: TooltipProps['placement']
  active?: boolean
  labelSx?: SxProps
  target?: string
  // 下面应该是给自动化测试用的
  buttonTestId?: string
  labelTestId?: string
}

const LightTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: `transparent`,
    color: 'rgba(0, 0, 0, 0.87)',
    fontSize: 12,
    padding: 0,
    boxShadow: `0px 12px 16px -4px rgba(0, 0, 0, 0.16), 0px 4px 8px -2px rgba(0, 0, 0, 0.08)`,
    maxWidth: 'none',
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.background.paper,
  },
}))

const SidebarTabItem: React.FC<ISidebarTabItemProps> = (props) => {
  const {
    label,
    icon,
    tooltip,
    placement = 'left',
    active,
    labelSx,
    buttonTestId,
    labelTestId,
    sx,
    ...buttonProps
  } = props

  const content = (
    <Button
      data-testid={buttonTestId}
      data-button-clicked-name={buttonTestId}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 0.5,
        minWidth: 'unset',
        width: '100%',
        position: 'relative',
        borderRadius: 2,
        color: active ? 'primary.main' : 'text.secondary',
        bgcolor: (t) =>
          active
            ? t.palette.mode === 'dark'
              ? 'rgba(44, 44, 44, 1)'
              : 'rgba(144, 101, 176, 0.16)'
            : 'transparent',
        '&:hover': {
          bgcolor: (t) =>
            t.palette.mode === 'dark'
              ? 'rgba(44, 44, 44, 1)'
              : 'rgba(144, 101, 176, 0.16)', // #9065b014
          color: 'primary.main',
        },
        ...sx,
      }}
      {...buttonProps}
    >
      {icon}
      <Typography
        fontSize={12}
        color={'inherit'}
        data-testid={labelTestId}
        lineHeight={1}
        sx={labelSx}
      >
        {label}
      </Typography>
    </Button>
  )

  // 纯文本tooltip
  if (typeof tooltip === 'string') {
    return (
      // <Box width={1} px={isInImmersiveChatPage ? 1 : 0.5}>
      <TextOnlyTooltip placement={placement} title={tooltip}>
        {content}
      </TextOnlyTooltip>
      // </Box>
    )
  }

  // 组件tooltip
  return (
    // <Box width={1} px={isInImmersiveChatPage ? 1 : 0.5}>
    <LightTooltip placement={placement} title={tooltip}>
      {content}
    </LightTooltip>
    // </Box>
  )
}

export default SidebarTabItem
