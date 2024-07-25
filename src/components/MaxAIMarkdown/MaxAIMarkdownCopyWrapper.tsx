import Box, { BoxProps } from '@mui/material/Box'
import React, { FC } from 'react'

export interface IMaxAIMarkdownCopyWrapperProps extends BoxProps {
  copyText: string
}

const MaxAIMarkdownCopyWrapper: FC<IMaxAIMarkdownCopyWrapperProps> = (
  props,
) => {
  const { children, copyText, ...rest } = props

  return (
    <Box {...rest} data-maxai-markdown-custom-component={'true'}>
      {children}
      <span
        data-maxai-markdown-copy-element={'true'}
        hidden
        style={{
          display: 'none!important',
          userSelect: 'none',
        }}
      >
        {copyText}
      </span>
    </Box>
  )
}
export default MaxAIMarkdownCopyWrapper
