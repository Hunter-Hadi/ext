import Link from '@mui/material/Link'
import Tooltip from '@mui/material/Tooltip'
import React, { FC } from 'react'

import CitationTooltipContent from '@/components/CitationTooltipContent'
import MaxAIMarkdownCopyWrapper from '@/components/MaxAIMarkdown/MaxAIMarkdownCopyWrapper'
import { useMaxAIMarkdownExtraData } from '@/components/MaxAIMarkdown/useMaxAIMarkdownExtraData'
import CitationTag from '@/features/citation/components/CitationTag'
import { chromeExtensionClientOpenPage, CLIENT_OPEN_PAGE_KEYS } from '@/utils'

const getYouTubeUrlTime = (url: string) => {
  try {
    const parsedUrl = new URL(url)
    const params = new URLSearchParams(parsedUrl.search)
    const time = params.get('t')
    if (time) {
      const timeNum = parseInt(time.replace('s', ''), 10)
      return timeNum
    } else {
      return false
    }
  } catch (e) {
    return false
  }
}

export interface IMaxAIMarkdownAnchorProps {
  children?: React.ReactNode[]
  href?: string
  title?: string
}

const MaxAIMarkdownAnchor: FC<IMaxAIMarkdownAnchorProps> = (props) => {
  const { children, href, title } = props
  const { conversationId, citations, sourceLinks } = useMaxAIMarkdownExtraData()
  const childrenContent = String(children?.[0] || children)
  const sourceLink =
    !isNaN(Number(childrenContent)) && sourceLinks[Number(childrenContent)]
  const isYoutubeTimeUrl =
    href &&
    href.startsWith('https://www.youtube.com/watch') &&
    href.endsWith('s')
  const clickLinkUrl = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isYoutubeTimeUrl) {
      e.preventDefault()
      try {
        const video = document.querySelector(
          '#container video',
        ) as HTMLVideoElement
        if (video && href) {
          const timeStr = getYouTubeUrlTime(href)
          if (typeof timeStr === 'number') {
            video.currentTime = timeStr
          }
        }
      } catch (e) {
        console.log('clickLinkUrl error', e)
      }
    }
  }
  if (citations && typeof childrenContent === 'string') {
    const match = childrenContent.match(/T(\d+)/)
    if (match) {
      const index = match ? Number(match[1]) : -1
      const sourceCitation = citations.find(
        (item) => item.search_result_index === index,
      )
      if (!sourceCitation) {
        // 查不到citations
        return null
      }
      const number = Number(href)
      return (
        <MaxAIMarkdownCopyWrapper component='span' copyText=''>
          <CitationTag
            conversationId={conversationId}
            citation={sourceCitation}
            index={index}
            number={isNaN(number) ? undefined : number}
            type={isNaN(number) ? 'icon' : 'number'}
          />
        </MaxAIMarkdownCopyWrapper>
      )
    }
  }

  if (href?.startsWith('key=')) {
    const params = new URLSearchParams(href)
    const key: any = params.get('key') || ''
    if (CLIENT_OPEN_PAGE_KEYS.includes(key)) {
      const query = params.get('query') || ''
      return (
        <Link
          title={title}
          sx={{ cursor: 'pointer' }}
          onClick={async () => {
            await chromeExtensionClientOpenPage({
              key,
              query,
            })
          }}
        >
          {childrenContent}
        </Link>
      )
    }
  }
  if (isYoutubeTimeUrl) {
    return (
      <Link
        sx={{
          backgroundColor: '#9065B0!important',
          padding: '3px 5px!important',
          color: '#fff!important',
          textDecoration: 'none!important',
          borderRadius: '5px',
          cursor: 'pointer',
          marginRight: '5px!important',
        }}
        onClick={clickLinkUrl}
      >
        {childrenContent}
      </Link>
    )
  } else if (sourceLink) {
    // 引用（citation）hover 增强展示
    return (
      <Tooltip
        PopperProps={{
          className: 'certationTooltp',
          sx: {
            [`& > .use-chat-gpt-ai--MuiTooltip-tooltip`]: {
              p: 0,
              background: 'red',
            },
          },
        }}
        sx={{ p: 0 }}
        title={<CitationTooltipContent source={sourceLink} />}
        placement='top'
      >
        <Link
          sx={{ cursor: 'pointer' }}
          href={href}
          target={'_blank'}
          onClick={clickLinkUrl}
        >
          {childrenContent}
        </Link>
      </Tooltip>
    )
  } else {
    return (
      <Link
        sx={{ cursor: 'pointer' }}
        href={href}
        target={'_blank'}
        onClick={clickLinkUrl}
      >
        {childrenContent}
      </Link>
    )
  }
}
export default MaxAIMarkdownAnchor
