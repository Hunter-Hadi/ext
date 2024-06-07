import Box from '@mui/material/Box'
import { SxProps } from '@mui/material/styles'
import React, { FC, useEffect, useMemo, useState } from 'react'

import CustomMarkdown from '@/components/CustomMarkdown'

interface IProps {
  message: string
  sx?: SxProps
  isDarkMode?: boolean
}

const AIResponseMessage: FC<IProps> = (props) => {
  const { sx, message, isDarkMode } = props
  const [defaultText, setDefaultText] = useState(message || '')

  const sxCache = useMemo<SxProps>(() => {
    return {
      wordBreak: 'break-word',
      whiteSpace: 'pre-wrap',
      '& .markdown-body': {
        // maxHeight: 'min(40vh, 320px)',
        // overflowY: 'auto',
        '*': {
          fontFamily: '"Roboto","Helvetica","Arial",sans-serif!important',
        },
        '& p:last-child': {
          mb: '1em',
        },

        '& .markdown-body > p:first-child': {
          mt: 0,
        },
      },
      ...sx,
    }
  }, [sx])

  useEffect(() => {
    setDefaultText(message || '')
  }, [message])

  return (
    <Box className="search-with-ai--text" sx={sxCache}>
      <Box
        className={`markdown-body ${isDarkMode ? 'markdown-body-dark' : ''}`}
      >
        <CustomMarkdown>{defaultText.replace(/^\s+/, '')}</CustomMarkdown>
      </Box>
    </Box>
  )
}

export default AIResponseMessage
