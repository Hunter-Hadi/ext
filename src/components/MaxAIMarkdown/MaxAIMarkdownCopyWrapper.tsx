import React, { FC } from 'react'

const MaxAIMarkdownCopyWrapper: FC<{
  children: React.ReactNode
  copyText: string
}> = (props) => {
  const { children, copyText } = props
  return (
    <div data-maxai-markdown-custom-component={'true'}>
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
    </div>
  )
}
export default MaxAIMarkdownCopyWrapper
