import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import React, { FC, useEffect, useMemo, useRef } from 'react'
import Highlight from 'react-highlight'

import { IArtifacts } from '@/features/chatgpt/components/artifacts'

export interface IArtifactsCodeBlockProps {
  artifacts: IArtifacts
  className?: string
  sx?: SxProps
}

const ArtifactsCodeBlock: FC<IArtifactsCodeBlockProps> = (props) => {
  const boxRef = useRef<HTMLDivElement | null>(null)
  const { artifacts, className, sx } = props
  const memoSx = useMemo(() => {
    return {
      bgcolor: '#282c34',
      height: '100%',
      overflowY: 'auto',
      color: '#fff',
      textAlign: 'left',
      userSelect: 'text!important',
      '& > pre': {
        margin: 0,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      },
      ...sx,
    } as SxProps
  }, [sx])
  useEffect(() => {
    setTimeout(() => {
      if (boxRef.current) {
        boxRef.current.scrollTop = boxRef.current.scrollHeight
      }
    }, 0)
  }, [artifacts.content])
  return (
    <Stack
      component={'div'}
      ref={boxRef}
      className={'chat-message--text ' + className}
      sx={memoSx}
    >
      <MemoHighlight
        lang={artifacts.language || ''}
        content={artifacts.content}
      />
    </Stack>
  )
}
const MemoHighlight: FC<{ content: string; lang: string }> = (props) => {
  const { content, lang } = props
  const rerenderCountRef = useRef(0)
  return useMemo(() => {
    rerenderCountRef.current = rerenderCountRef.current + 1
    console.log(`MemoHighlight`, rerenderCountRef.current, content, lang)
    return <Highlight className={lang}>{content}</Highlight>
  }, [content, lang])
}
export default ArtifactsCodeBlock
