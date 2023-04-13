import Markdown from 'markdown-to-jsx'
import React, { FC } from 'react'
import { Link } from '@mui/material'

const OverrideAnchor: FC<HTMLAnchorElement> = (props) => {
  return (
    <Link href={props.href} target={'_blank'}>
      {props.children as any}
    </Link>
  )
}

const CustomMarkdown: FC<{
  children: string
}> = (props) => {
  return (
    <Markdown
      options={{
        overrides: {
          a: OverrideAnchor,
        },
      }}
    >
      {props.children}
    </Markdown>
  )
}
export default CustomMarkdown
