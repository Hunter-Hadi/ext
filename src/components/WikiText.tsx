import { styled } from '@mui/material/styles'
import Tooltip, { tooltipClasses, TooltipProps } from '@mui/material/Tooltip'
import Typography, { TypographyProps } from '@mui/material/Typography'
import React, { FC } from 'react'

const LightTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.background.paper,
    color: 'rgba(0, 0, 0, 0.87)',
    fontSize: 12,
    padding: '16px',
    boxShadow: theme.shadows[5],
    maxWidth: 'none',
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.background.paper,
  },
}))

export interface IWikiTextProps {
  text: string
  wiki: TooltipProps['title'] | string
  textProps?: TypographyProps<'span'>
  onClick?: () => void
}

const WikiText: FC<IWikiTextProps> = (props) => {
  const { textProps, wiki, text } = props
  return (
    <LightTooltip
      sx={{ zIndex: '9999!important' }}
      placement={'top'}
      title={
        typeof wiki === 'string' ? (
          <Typography variant={'body1'} fontSize={14}>
            {wiki}
          </Typography>
        ) : (
          wiki
        )
      }
      arrow
    >
      <Typography
        component={'span'}
        color={'inherit'}
        fontSize={'inherit'}
        fontWeight={'inherit'}
        {...textProps}
        sx={{
          ...textProps?.sx,
          cursor: 'pointer',
          borderImageSlice: 1,
          borderWidth: 0,
          borderBottom: '1px solid',
          borderImageSource: (t) =>
            t.palette.mode === 'dark'
              ? 'repeating-linear-gradient(90deg,rgba(255,255,255,.6),rgba(255,255,255,.6) 1px,transparent 0,transparent 3px);'
              : 'repeating-linear-gradient(90deg,rgba(31,35,41,.6),rgba(31,35,41,.6) 1px,transparent 0,transparent 3px);',
          '&:hover': {
            color: 'primary.main',
            borderImageSource: (t) =>
              `repeating-linear-gradient(90deg,${t.palette.primary.main},${t.palette.primary.main} 1px,transparent 0,transparent 3px);`,
          },
        }}
      >
        {text}
      </Typography>
    </LightTooltip>
  )
}
export default WikiText
