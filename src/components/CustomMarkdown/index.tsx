import Markdown from 'markdown-to-jsx'
import React, { FC } from 'react'
import { Link } from '@mui/material'
import { chromeExtensionClientOpenPage, CLIENT_OPEN_PAGE_KEYS } from '@/utils'

const OverrideAnchor: FC<HTMLAnchorElement> = (props) => {
  if (props.href?.startsWith('key=')) {
    const params = new URLSearchParams(props.href)
    const key: any = params.get('key') || ''
    if (CLIENT_OPEN_PAGE_KEYS.includes(key)) {
      const query = params.get('query') || ''
      return (
        <Link
          sx={{ cursor: 'pointer' }}
          onClick={async () => {
            await chromeExtensionClientOpenPage({
              key,
              query,
            })
          }}
        >
          {props.children as any}
        </Link>
      )
    }
  }
  return (
    <Link sx={{ cursor: 'pointer' }} href={props.href} target={'_blank'}>
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
