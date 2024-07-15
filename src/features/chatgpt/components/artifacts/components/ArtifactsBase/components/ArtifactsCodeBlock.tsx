import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import React, { FC } from 'react'
import Highlight from 'react-highlight'

export interface IArtifactsCodeBlockProps {
  code: string
  lang: string
  className?: string
  sx?: SxProps
}

const ArtifactsCodeBlock: FC<IArtifactsCodeBlockProps> = (props) => {
  const { code, lang, className = '', sx } = props
  return (
    <Stack
      className={'chat-message--text'}
      sx={{
        bgcolor: '#282c34',
        borderRadius: '6px',
        height: '100%',
        overflowY: 'auto',
        color: '#fff',
        textAlign: 'left',
        userSelect: 'auto',
        '& > pre': {
          margin: 0,
        },
        ...sx,
      }}
    >
      <Highlight className={lang + ' ' + className}>{code}</Highlight>
    </Stack>
  )
}
export { ArtifactsCodeBlock }
