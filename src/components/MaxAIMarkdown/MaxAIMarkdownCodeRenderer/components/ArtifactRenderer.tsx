import jsYaml from 'js-yaml'
import isArray from 'lodash-es/isArray'
import React, { FC, useMemo } from 'react'

import { IMaxAIMarkdownCodeRendererProps } from '@/components/MaxAIMarkdown/MaxAIMarkdownCodeRenderer/types'
import MaxAIMarkdownCopyWrapper from '@/components/MaxAIMarkdown/MaxAIMarkdownCopyWrapper'
import {
  ArtifactsButton,
  ArtifactsType,
  IArtifacts,
} from '@/features/chatgpt/components/artifacts'

const ArtifactRenderer: FC<IMaxAIMarkdownCodeRendererProps> = (props) => {
  const { content, messageIsComplete, isLastNode } = props
  const isArtifactComplete = useMemo(() => {
    if (messageIsComplete) {
      console.log(`maxaiartifact ArtifactRender`, true)
      return true
    }
    console.log(`maxaiartifact ArtifactRender`, !isLastNode)
    return !isLastNode
  }, [messageIsComplete, isLastNode])
  const artifacts = useMemo<IArtifacts>(() => {
    /**
     * yaml
     * identifier: 'number-guessing-game-1to10'
     * type: 'text/html'
     * title: 'Number Guessing Game (1-10) with Score Tracker'
     * content:
     *
     */
    try {
      console.log(`maxaiartifact ArtifactRender2`, isArtifactComplete)
      const needParseText = isArray(content)
        ? content.join('')
        : content.toString()
      const parsed: any = jsYaml.load(needParseText)
      if (parsed.identifier && parsed.type && parsed.title && parsed.content) {
        return {
          ...parsed,
          complete: isArtifactComplete,
        } as IArtifacts
      }
    } catch (e) {
      // console.error(e)
    }
    return {
      identifier: '',
      content: '',
      type: ArtifactsType.TEXT,
      title: isArtifactComplete ? 'Failed to load artifact' : 'Generating...',
      complete: isArtifactComplete,
    }
  }, [isArtifactComplete, content])
  const copyText = useMemo(() => {
    return `\`\`\`${artifacts.language || ''}\n${artifacts.content}\n\`\`\``
  }, [artifacts])
  return (
    <MaxAIMarkdownCopyWrapper copyText={copyText}>
      <ArtifactsButton artifacts={artifacts} />
    </MaxAIMarkdownCopyWrapper>
  )
}

/**
 * 复制的时候，将markdown中的artifact转换为对应的代码块
 * @param markdownText
 */
export const markdownArtifactsToCopyText = (markdownText: string) => {
  // ```maxai__artifact -> ```language
  const textOfSplit = markdownText.split('\n')
  const results: string[] = []
  let p1 = -1
  for (let i = 0; i < textOfSplit.length; i++) {
    if (textOfSplit[i].startsWith('```maxai__artifact')) {
      p1 = i
      continue
    }
    if (p1 > -1) {
      // 如果找到了结束符号或者到最后一行
      if (textOfSplit[i] === '```' || i === textOfSplit.length - 1) {
        let isYamlParseSuccess = false
        const artifactText = textOfSplit.slice(p1 + 1, i).join('\n')
        try {
          const yaml: any = jsYaml.load(artifactText)
          if (yaml && yaml.identifier && yaml.content) {
            isYamlParseSuccess = true
            results.push(`\`\`\`${yaml.language || ''}`)
            results.push(yaml.content)
            results.push(`\`\`\``)
          }
        } catch (e) {
          // do nothing
        }
        if (!isYamlParseSuccess) {
          results.push(...textOfSplit.slice(p1, i))
        }
        p1 = -1
      }
      continue
    }
    results.push(textOfSplit[i])
  }
  return results.join('\n')
}

export default ArtifactRenderer
