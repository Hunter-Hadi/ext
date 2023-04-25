import React, { FC } from 'react'
import { Box, Stack, SxProps, Typography, TypographyProps } from '@mui/material'

const BulletList: FC<{
  textProps?: TypographyProps
  pointProps?: SxProps
  spacing?: number
  textList: React.ReactNode[]
}> = (props) => {
  const { textProps, pointProps, textList } = props
  return (
    <Stack spacing={1}>
      {textList.map((text, index) => {
        return (
          <Stack key={index} direction={'row'} alignItems={'baseline'}>
            <Box
              sx={{
                top: -2,
                position: 'relative',
                width: 4,
                height: 4,
                borderRadius: '50%',
                backgroundColor: 'text.primary',
                mx: 1,
                flexShrink: 0,
                ...pointProps,
              }}
            />
            {typeof text === 'string' ? (
              <Typography {...(textProps as any)}>{text}</Typography>
            ) : (
              text
            )}
          </Stack>
        )
      })}
    </Stack>
  )
}

export default BulletList
