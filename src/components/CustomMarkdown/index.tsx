import Markdown, { Options } from 'markdown-to-jsx'
import React, { FC } from 'react'
import { Box, Link, Stack, Typography } from '@mui/material'
import { chromeExtensionClientOpenPage, CLIENT_OPEN_PAGE_KEYS } from '@/utils'
import CopyTooltipIconButton from '../CopyTooltipIconButton'

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
        justifyContent="flex-end"
        itemsAlign="center"
        direction="row"
        px={2}
        py={0.5}
        sx={{
          bgcolor: 'rgba(52,53,65,1)',
          color: 'rgb(217,217,227)',
        }}
      >
        <CopyTooltipIconButton
          copyText={props.children as any}
          sx={{
            borderRadius: '6px',
            px: '8px !important',
          }}
        >
          <span style={{ marginLeft: '4px', fontSize: '12px' }}>Copy code</span>
        </CopyTooltipIconButton>
      </Stack>
      <Box p={2} color="#FFFFFFDE">
        {props.children as any}
      </Box>
    </Stack>
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
          code: OverrideCode,
        },
      }}
    >
      {props.children}
    </Markdown>
  )
}
export default CustomMarkdown
