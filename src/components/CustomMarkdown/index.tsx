import Markdown from 'markdown-to-jsx'
import React, { FC, createElement } from 'react'
import { Box, Link, Stack, Typography } from '@mui/material'
import { chromeExtensionClientOpenPage, CLIENT_OPEN_PAGE_KEYS } from '@/utils'
import CopyTooltipIconButton from '../CopyTooltipIconButton'
import Highlight from 'react-highlight'

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

const OverrideCode: FC<HTMLElement> = (props) => {
  console.log('OverrideCode props', props)
  const children = props.children as any
  if (typeof children === 'string' && children.includes('\n')) {
    const lang = props.className?.replace('lang-', '') || 'code'
    return (
      <Stack
        bgcolor="#000"
        sx={{
          borderRadius: '6px',
          mb: 2,
          overflow: 'hidden',
        }}
      >
        <Stack
          justifyContent="space-between"
          alignItems={'center'}
          direction="row"
          component="div"
          sx={{
            px: 2,
            py: 0.5,
            bgcolor: 'rgba(52,53,65,1)',
            color: 'rgb(217,217,227)',
          }}
        >
          <Typography component="span" fontSize={12}>
            {lang}
          </Typography>
          <CopyTooltipIconButton
            copyText={props.children as any}
            sx={{
              borderRadius: '6px',
              px: '8px !important',
            }}
          >
            <span style={{ marginLeft: '4px', fontSize: '12px' }}>
              Copy code
            </span>
          </CopyTooltipIconButton>
        </Stack>
        <Box fontSize={14}>
          <Highlight className={lang}>{children}</Highlight>
        </Box>
      </Stack>
    )
  }

  return createElement('code', {}, children)
}

const CustomMarkdown: FC<{
  children: string
}> = (props) => {
  return (
    <Markdown
      options={{
        overrides: {
          a: OverrideAnchor,
          code: OverrideCode,
        },
      }}
    >
      {props.children}
    </Markdown>
  )
}
export default CustomMarkdown
