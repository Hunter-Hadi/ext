import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { FC, useMemo } from 'react'
import Highlight from 'react-highlight'
import { Components } from 'react-markdown/lib/ast-to-react'
import reactNodeToString from 'react-node-to-string'
import Browser from 'webextension-polyfill'

import AppSuspenseLoadingLayout from '@/components/AppSuspenseLoadingLayout'
import CopyTooltipIconButton from '@/components/CopyTooltipIconButton'
import LazyLoadImage from '@/components/LazyLoadImage'
import MaxAIMarkdownAnchor from '@/components/MaxAIMarkdown/MaxAIMarkdownAnchor'
import MaxAIMarkdownCodeRenderer from '@/components/MaxAIMarkdown/MaxAIMarkdownCodeRenderer'
import TagLabelList, {
  isTagLabelListCheck,
} from '@/components/MaxAIMarkdown/TagLabelList'
import YoutubePlayerBox from '@/components/YoutubePlayerBox'

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

const MaxAIMarkdownComponents: Components = {
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
  a: (props) => {
    const { node } = props
    return <MaxAIMarkdownAnchor />
  },
  // eslint-disable-next-line react/display-name
  code: (props: any) => {
    const { node, inline, className, children, ...rest } = props
    if (rest.isMaxAICustomMarkdownComponent) {
      return (
        <MaxAIMarkdownCodeRenderer
          maxAICustomMarkdownComponentName={
            rest.maxAICustomMarkdownComponentName
          }
          isLastNode={rest.isLastNode}
          content={children}
        />
      )
    }
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
        <LazyLoadImage src={src} alt={data?.alt || alt || ''} height={208} />
      )
    }
    return (
      <LazyLoadImage
        height={387}
        {...{ src: src || '', alt: data?.alt || alt || '', title }}
      />
    )
  },
}

export default MaxAIMarkdownComponents
