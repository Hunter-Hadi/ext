import Link from '@mui/material/Link'
import Tooltip from '@mui/material/Tooltip'
import React, { FC } from 'react'

import CitationTooltipContent from '@/components/CitationTooltipContent'
import { useMaxAIMarkdownExtraData } from '@/components/MaxAIMarkdown/useMaxAIMarkdownExtraData'
import { IAIResponseOriginalMessageSourceLink } from '@/features/indexed_db/conversations/models/Message'
import { ICrawlingSearchResult } from '@/features/shortcuts/utils/searchEngineCrawling'
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

const OverrideAnchor: FC<{
  children: React.ReactNode
  href?: string
  title?: string
  citationsContent?:
    | IAIResponseOriginalMessageSourceLink
    | ICrawlingSearchResult
}> = (props) => {
  const isYoutubeTimeUrl =
    props.href &&
    props.href.startsWith('https://www.youtube.com/watch') &&
    props.href.endsWith('s')
  if (props.href?.startsWith('key=')) {
    const params = new URLSearchParams(props.href)
    const key: any = params.get('key') || ''
    if (CLIENT_OPEN_PAGE_KEYS.includes(key)) {
      const query = params.get('query') || ''
      return (
        <Link
          title={props.title}
          sx={{ cursor: 'pointer' }}
          onClick={async () => {
            await chromeExtensionClientOpenPage({
              key,
              query,
            })
          }}
        >
          {props.children}
        </Link>
      )
    }
  }
  const clickLinkUrl = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isYoutubeTimeUrl) {
      e.preventDefault()
      try {
        const video = document.querySelector(
          '#container video',
        ) as HTMLVideoElement
        if (video && props.href) {
          const timeStr = getYouTubeUrlTime(props.href)
          if (typeof timeStr === 'number') {
            video.currentTime = timeStr
          }
        }
      } catch (e) {
        console.log('clickLinkUrl error', e)
      }
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
        {props.children}
      </Link>
    )
  } else if (props?.citationsContent) {
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
        title={
          <CitationTooltipContent
            source={props?.citationsContent}
          ></CitationTooltipContent>
        }
        placement='top'
      >
        <Link
          sx={{ cursor: 'pointer' }}
          href={props.href}
          target={'_blank'}
          onClick={clickLinkUrl}
        >
          {props.children}
        </Link>
      </Tooltip>
    )
  } else {
    return (
      <Link
        sx={{ cursor: 'pointer' }}
        href={props.href}
        target={'_blank'}
        onClick={clickLinkUrl}
      >
        {props.children}
      </Link>
    )
  }
}

export interface IMaxAIMarkdownAnchorProps {
  children?: React.ReactNode[]
}

const MaxAIMarkdownAnchor: FC<IMaxAIMarkdownAnchorProps> = (props) => {
  const { children } = props
  const { conversationId, citations, sourceLinks } = useMaxAIMarkdownExtraData()
  const childrenContent = children?.[0]
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
      const number = Number(props.href)
      return (
        <CitationTag
          conversationId={conversationId}
          citation={sourceCitation}
          index={index}
          number={isNaN(number) ? undefined : number}
          type={isNaN(number) ? 'icon' : 'number'}
        />
      )
    }
  }
}
export default MaxAIMarkdownAnchor
