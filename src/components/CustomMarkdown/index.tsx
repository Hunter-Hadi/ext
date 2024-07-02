import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import React, { FC, useMemo } from 'react'
import Highlight from 'react-highlight'
import ReactMarkdown from 'react-markdown'
import reactNodeToString from 'react-node-to-string'
import rehypeKatex from 'rehype-katex'
import remarkBreaks from 'remark-breaks'
import remarkGfm from 'remark-gfm'
// import rehypeHighlight from 'rehype-highlight'
import remarkMath from 'remark-math'
import supersub from 'remark-supersub'
import Browser from 'webextension-polyfill'

import AppSuspenseLoadingLayout from '@/components/AppSuspenseLoadingLayout'
import CitationTooltipContent from '@/components/CitationTooltipContent'
import LazyLoadImage from '@/components/LazyLoadImage'
import YoutubePlayerBox from '@/components/YoutubePlayerBox'
import { getPageSummaryType } from '@/features/chat-base/summary/utils/pageSummaryHelper'
import CitationTag from '@/features/citation/components/CitationTag'
import {
  IAIResponseMessage,
  IAIResponseOriginalMessage,
  IAIResponseOriginalMessageSourceLink,
} from '@/features/indexed_db/conversations/models/Message'
import { ICrawlingSearchResult } from '@/features/shortcuts/utils/searchEngineCrawling'
import { chromeExtensionClientOpenPage, CLIENT_OPEN_PAGE_KEYS } from '@/utils'

import CopyTooltipIconButton from '../CopyTooltipIconButton'
import TagLabelList, { isTagLabelListCheck } from './TagLabelList'

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

type IHeadingType = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

const OverrideHeading: FC<HTMLHeadingElement & { heading: IHeadingType }> = (
  props,
) => {
  // console.log('OverrideHeading props', props)
  return (
    <>
      {React.Children.map(props.children, (child) => {
        // console.log(child)
        const html: string = child as any
        if (isTagLabelListCheck(props.heading === 'h1' ? `#${html}` : html)) {
          const tags = html
            .split(' ')
            .map((item) => (item.startsWith('#') ? item : `#${item}`))
          return <TagLabelList tags={tags} />
        }
        return (
          <Typography
            component={props.heading}
            variant={props.heading}
            style={{
              color: 'text.primary',
            }}
          >
            {child as any}
          </Typography>
        )
      })}
    </>
  )
}

const OverrideCode: FC<{ children: React.ReactNode; className?: string }> = (
  props,
) => {
  const { children, className } = props
  const code = useMemo(
    () => reactNodeToString(props.children),
    [props.children],
  )
  const lang = props.className?.match(/language-(\w+)/)?.[1] || 'code'
  return (
    <Stack
      bgcolor='#000'
      sx={{
        borderRadius: '6px',
        mb: 2,
        overflow: 'hidden',
      }}
    >
      <Stack
        justifyContent='space-between'
        alignItems={'center'}
        direction='row'
        component='div'
        sx={{
          px: 2,
          py: 0.5,
          bgcolor: 'rgba(52,53,65,1)',
          color: 'rgb(217,217,227)',
        }}
      >
        <Typography component='span' fontSize={12}>
          {lang}
        </Typography>
        <CopyTooltipIconButton
          copyText={code}
          sx={{
            borderRadius: '6px',
            px: '8px !important',
          }}
        >
          <span style={{ marginLeft: '4px', fontSize: '12px' }}>Copy code</span>
        </CopyTooltipIconButton>
      </Stack>
      <Box fontSize={14} bgcolor='#000' color={'#fff'}>
        <AppSuspenseLoadingLayout>
          <Highlight className={lang + ' ' + className}>{children}</Highlight>
        </AppSuspenseLoadingLayout>
      </Box>
    </Stack>
  )
}
/**
 * 处理latex表达式
 * @param content
 * @link - https://github.com/remarkjs/react-markdown/issues/785
 */
const preprocessLaTeX = (content: string) => {
  const blockProcessedContent = content.replace(
    /\\\[(.*?)\\\]/gs,
    (_, equation) => `$$${equation}$$`,
  )
  // Replace inline LaTeX delimiters \( \) with $ $
  const inlineProcessedContent = blockProcessedContent.replace(
    /\\\((.*?)\\\)/gs,
    (_, equation) => `$${equation}$`,
  )
  return inlineProcessedContent
}

/**
 * 处理citation序号，按顺序标记
 * @param content
 */
export const preprocessCitation = (content: string) => {
  let count = 0
  // 目前这里有概率会出现[T1](xxx)，不是{}的内容，先做任意内容匹配
  // /\[T(\d+)\]\(\{\}\)/
  return content.replace(/\[T(\d+)\]\((.*?)\)/g, (match, p1) => {
    count += 1
    return `[T${p1}](${count})`
  })
}

/**
 * 处理citation
 * 目前这版后端值返回citations的信息，不会在内容里插入对应的引文，所以这里先处理一下，添加到最后
 * chat_with_document/v2接口新增返回
 * @param content
 */
// const formatCitation = (citations: IAIResponseSourceCitation[]) => {
//   if (!citations.length) return ''
//   let content = ''
//   citations.forEach((citation, index) => {
//     content += `[T${index}]({})`
//   })
//   return content
// }

const CustomMarkdown: FC<{
  message?: IAIResponseMessage
  originalMessage?: IAIResponseOriginalMessage
  children: string
}> = (props) => {
  const { message, children } = props
  const conversationId = message?.conversationId
  const originalMessage =
    props.originalMessage || message?.originalMessage || {}
  const { metadata } = originalMessage
  const citationsContent = metadata?.sources?.links

  const isComplete = originalMessage ? metadata?.isComplete : true

  // 这里先处理一下，后端有可能返回的数据里在原文内匹配不上，缺少一些符号，目前只针对PDF显示
  // TODO youtube/email的citation需要额外逻辑处理，这一版先过滤
  const citations = useMemo(() => {
    const summaryType = getPageSummaryType()
    if (
      summaryType === 'YOUTUBE_VIDEO_SUMMARY' ||
      summaryType === 'DEFAULT_EMAIL_SUMMARY'
    ) {
      return []
    }
    return metadata?.sourceCitations?.filter((item) => {
      if (typeof item.start_index === 'number') {
        return item.start_index > -1
      }
      return true
    })
  }, [metadata?.sourceCitations])

  const formatMarkdownText = useMemo(() => {
    try {
      if (typeof children === 'string') {
        if (citations?.length) {
          return preprocessLaTeX(preprocessCitation(children))
        }
        return preprocessLaTeX(children)
      }
      return children
    } catch (e) {
      return children
    }
  }, [citations, isComplete, children])

  return useMemo(
    () => (
      <ReactMarkdown
        remarkPlugins={[
          supersub,
          remarkBreaks,
          remarkGfm,
          [
            remarkMath,
            {
              singleDollarTextMath: false,
            },
          ],
        ]}
        rehypePlugins={[rehypeKatex]}
        // disallowedElements={['br']}
        components={{
          // eslint-disable-next-line react/display-name
          h1: (props: any) => {
            return <OverrideHeading {...props} heading={'h1'} />
          },
          // eslint-disable-next-line react/display-name
          h2: (props: any) => {
            return <OverrideHeading {...props} heading={'h2'} />
          },
          // eslint-disable-next-line react/display-name
          h3: (props: any) => {
            return <OverrideHeading {...props} heading={'h3'} />
          },
          // eslint-disable-next-line react/display-name
          h4: (props: any) => {
            return <OverrideHeading {...props} heading={'h4'} />
          },
          // eslint-disable-next-line react/display-name
          h5: (props: any) => {
            return <OverrideHeading {...props} heading={'h5'} />
          },
          // eslint-disable-next-line react/display-name
          h6: (props: any) => {
            return <OverrideHeading {...props} heading={'h6'} />
          },
          // eslint-disable-next-line react/display-name
          a: ({ node, ...props }) => {
            if (citations && typeof props.children?.[0] === 'string') {
              const match = props.children[0].match(/T(\d+)/)
              const index = match ? Number(match[1]) : -1
              if (!citations[index]) {
                // 查不到citations
                return null
              }
              const number = Number(props.href)
              return (
                <CitationTag
                  conversationId={conversationId}
                  citations={citations}
                  index={index}
                  number={isNaN(number) ? undefined : number}
                  type={isNaN(number) ? 'icon' : 'number'}
                />
              )
            }
            // citation引用做hover 展示
            let linkSource
            if (citationsContent) {
              const _index = Number(props?.children[0])
              if (!isNaN(_index)) {
                linkSource = citationsContent[_index - 1]
              }
            }
            return (
              // eslint-disable-next-line react/prop-types
              <OverrideAnchor
                href={props.href}
                title={props.title}
                citationsContent={linkSource}
              >
                {props.children}
              </OverrideAnchor>
            )
          },
          // eslint-disable-next-line react/display-name
          code: ({ node, inline, className, children, ...props }) => {
            if (inline) {
              return (
                <Chip
                  component={'span'}
                  className={className}
                  label={children as string}
                  sx={{
                    padding: '.2em .4em',
                    fontSize: '85%',
                    lineHeight: '1.5',
                    borderRadius: '.25em',
                    whiteSpace: 'break-spaces',
                    height: 'auto',
                    '& > span': {
                      p: 0,
                    },
                  }}
                />
              )
            }
            return <OverrideCode className={className}>{children}</OverrideCode>
          },
          // eslint-disable-next-line react/display-name
          img: ({ node, src, alt, title, ...props }) => {
            let data: any = {}
            try {
              // 传输Markdown自定义数据
              data = JSON.parse(alt || '')
            } catch (e) {
              // nothing
            }
            if (src) {
              // check is YouTube embed url
              if (src.startsWith('https://www.youtube.com/embed')) {
                return (
                  <YoutubePlayerBox
                    youtubeLink={src}
                    borderRadius={4}
                    cover={data?.cover}
                  />
                )
              }
            }
            // 付费卡片图片
            // chrome-extension://ifpoijjcjepjemmhjankdocecgkpffde/assets/USE_CHAT_GPT_AI/images/upgrade/unlimited-ai-requests.png
            if (
              src?.includes(
                `${Browser.runtime.id}/assets/USE_CHAT_GPT_AI/images/upgrade`,
              )
            ) {
              return (
                <LazyLoadImage
                  src={src}
                  alt={data?.alt || alt || ''}
                  height={208}
                />
              )
            }
            return (
              <LazyLoadImage
                height={387}
                {...{ src: src || '', alt: data?.alt || alt || '', title }}
              />
            )
          },
        }}
      >
        {formatMarkdownText}
      </ReactMarkdown>
    ),
    [citations, formatMarkdownText],
  )
}
export default CustomMarkdown
