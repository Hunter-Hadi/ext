import Markdown from 'markdown-to-jsx'
import React, { FC, Suspense, createElement, useMemo } from 'react'
import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { chromeExtensionClientOpenPage, CLIENT_OPEN_PAGE_KEYS } from '@/utils'
import CopyTooltipIconButton from '../CopyTooltipIconButton'
import AppLoadingLayout from '../AppLoadingLayout'

const Highlight = React.lazy(() => import('react-highlight'))

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
// TODO: add more overrides
// const OverrideH1: FC<HTMLHeadingElement> = (props) => {
//   debugger
//   return (
//     <>
//       {React.Children.map(props.children, (child) => {
//         console.log(child)
//         const html: string = child as any
//         if (typeof child === 'string' && html[0] !== ' ') {
//           // twitter tag
//           // child: 'apple #apple #banana'
//           const tags = html
//             .split(' ')
//             .map((item) => (item.startsWith('#') ? item : `#${item}`))
//           return (
//             <p>
//               {tags.map((tag) => (
//                 <Typography
//                   key={tag}
//                   variant={'body1'}
//                   component={'span'}
//                   color={'text.primary'}
//                 >
//                   {tag}{' '}
//                 </Typography>
//               ))}
//             </p>
//           )
//         }
//         return (
//           <Typography
//             component={'h1'}
//             variant={'h1'}
//             style={{
//               color: 'text.primary',
//             }}
//           >
//             {child as any}
//           </Typography>
//         )
//       })}
//     </>
//   )
// }

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
          <Suspense fallback={<AppLoadingLayout loading={true} size={16} />}>
            <Highlight className={lang}>{children}</Highlight>
          </Suspense>
        </Box>
      </Stack>
    )
  }

  return createElement('code', {}, children)
}

const CustomMarkdown: FC<{
  children: string
}> = (props) => {
  return useMemo(
    () => (
      <Markdown
        options={{
          overrides: {
            a: OverrideAnchor,
            // h1: OverrideH1,
            code: OverrideCode,
          },
        }}
      >
        {props.children}
      </Markdown>
    ),
    [props.children],
  )
}
export default CustomMarkdown
