import React, { FC, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import { PluggableList } from 'react-markdown/lib/react-markdown'
import rehypeKatex from 'rehype-katex'
import remarkBreaks from 'remark-breaks'
import remarkGfm from 'remark-gfm'
// import rehypeHighlight from 'rehype-highlight'
import remarkMath from 'remark-math'
import supersub from 'remark-supersub'

import AppSuspenseLoadingLayout from '@/components/AppSuspenseLoadingLayout'
import MaxAIMarkdownComponents from '@/components/MaxAIMarkdown/components'
import {
  IMaxAIMarkdownContext,
  MaxAIMarkdownContext,
} from '@/components/MaxAIMarkdown/context'
import rehypeMaxAIMarkdownCodeRendererPlugin from '@/components/MaxAIMarkdown/MaxAIMarkdownCodeRenderer/rehypeMaxAIMarkdownCodeRendererPlugin'
import { IChatMessage } from '@/features/indexed_db/conversations/models/Message'

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
  const tags: Record<string, number> = {}
  return content.replace(/\[T(\d+)\]\((.*?)\)/g, (match, p1) => {
    if (!tags[p1]) {
      count += 1
      tags[p1] = count
    }
    return `[T${p1}](${tags[p1]})`
  })
}

const remarkPlugins: PluggableList = [
  supersub,
  remarkBreaks,
  remarkGfm,
  [
    remarkMath,
    {
      singleDollarTextMath: false,
    },
  ],
]
const rehypePlugins = [rehypeMaxAIMarkdownCodeRendererPlugin, rehypeKatex]

const MaxAIMarkdown: FC<{
  message?: IChatMessage
  children: string
}> = (props) => {
  const { message, children } = props
  const formatMarkdownText = useMemo(() => {
    try {
      if (typeof children === 'string') {
        return preprocessLaTeX(preprocessCitation(children))
      }
      return children
    } catch (e) {
      return children
    }
  }, [children])

  const providerValue = useMemo<IMaxAIMarkdownContext>(() => {
    return {
      message,
    }
  }, [message])

  return (
    <MaxAIMarkdownContext.Provider value={providerValue}>
      <AppSuspenseLoadingLayout>
        <ReactMarkdown
          remarkPlugins={remarkPlugins}
          rehypePlugins={rehypePlugins}
          components={MaxAIMarkdownComponents}
        >
          {formatMarkdownText}
        </ReactMarkdown>
      </AppSuspenseLoadingLayout>
    </MaxAIMarkdownContext.Provider>
  )
}
export default MaxAIMarkdown
