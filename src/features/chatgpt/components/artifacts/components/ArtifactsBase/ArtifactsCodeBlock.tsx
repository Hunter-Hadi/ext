import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import React, { FC } from 'react'
import Highlight from 'react-highlight'

import { IArtifacts } from '@/features/chatgpt/components/artifacts'

export interface IArtifactsCodeBlockProps {
  artifacts: IArtifacts
  className?: string
  sx?: SxProps
}

const ArtifactsCodeBlock: FC<IArtifactsCodeBlockProps> = (props) => {
  const { artifacts, className, sx } = props
  const memoizedCode = React.useMemo(() => {
    const lang = 'html'
    const content = artifacts.content
    return {
      lang,
      content,
    }
  }, [artifacts])
  return (
    <Stack
      className={'chat-message--text'}
      sx={{
        bgcolor: '#282c34',
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
      <Highlight className={memoizedCode.lang + ' ' + className}>
        {memoizedCode.content}
      </Highlight>
    </Stack>
  )
}
export default ArtifactsCodeBlock
