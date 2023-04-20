import React, { FC } from 'react'
import { Box, Stack, SxProps, Typography, TypographyProps } from '@mui/material'

const BulletList: FC<{
  textProps?: TypographyProps
  pointProps?: SxProps
  spacing?: number
  textList: string[]
}> = (props) => {
  const { textProps, pointProps, textList } = props
  return (
    <Stack spacing={1}>
      {textList.map((text, index) => {
        return (
          <Stack
            key={index}
            direction={'row'}
            spacing={1}
            alignItems={'baseline'}
          >
            <Box
              sx={{
                top: -2,
                position: 'relative',
                width: 4,
                height: 4,
                borderRadius: '50%',
                backgroundColor: 'text.primary',
                mr: 1,
                ...pointProps,
              }}
            />
            <Typography {...(textProps as any)}>{text}</Typography>
          </Stack>
        )
      })}
    </Stack>
  )
}

export default BulletList
