import Typography, { TypographyProps } from '@mui/material/Typography'
import React, { FC } from 'react'

interface IProps extends TypographyProps {
  tag: string
}

export const AIProviderModelTagIcon: FC<IProps> = (props) => {
  const { tag, ...rest } = props

  if (tag === 'New') {
    return (
      <Typography
        component={'span'}
        bgcolor={'rgba(52, 168, 83, 1)'}
        color={'#fff'}
        fontSize={'9px'}
        fontWeight={500}
        px={'4px'}
        py={'1px'}
        borderRadius={'4px'}
        lineHeight={1.5}
        ml={'4px !important'}
        whiteSpace={'nowrap'}
        {...rest}
      >
        {tag}
      </Typography>
    )
  }

  if (tag === 'Beta') {
    return (
      <Typography
        component={'span'}
        color={(t) =>
          t.palette.mode === 'dark'
            ? 'rgba(255, 255, 255, 0.6)'
            : 'rgba(0, 0, 0, 0.6)'
        }
        border={'1px solid'}
        borderColor={(t) =>
          t.palette.mode === 'dark'
            ? 'rgba(255, 255, 255, 0.16)'
            : 'rgba(0, 0, 0, 0.08)'
        }
        fontSize={'9px'}
        fontWeight={500}
        px={'4px'}
        py={'1px'}
        borderRadius={'4px'}
        lineHeight={1.5}
        ml={'4px !important'}
        whiteSpace={'nowrap'}
        {...rest}
      >
        {tag}
      </Typography>
    )
  }

  return (
    <Typography
      component={'span'}
      bgcolor={(t) =>
        t.palette.mode === 'dark'
          ? 'rgba(255, 255, 255, 0.12)'
          : 'rgba(0, 0, 0, 0.06)'
      }
      color={(t) =>
        t.palette.mode === 'dark'
          ? 'rgba(255, 255, 255, 0.6)'
          : 'rgba(0, 0, 0, 0.6)'
      }
      fontSize={'9px'}
      fontWeight={500}
      px={'4px'}
      py={'1px'}
      borderRadius={'4px'}
      lineHeight={1.5}
      ml={'4px !important'}
      whiteSpace={'nowrap'}
      {...rest}
    >
      {tag}
    </Typography>
  )
}

export default AIProviderModelTagIcon
