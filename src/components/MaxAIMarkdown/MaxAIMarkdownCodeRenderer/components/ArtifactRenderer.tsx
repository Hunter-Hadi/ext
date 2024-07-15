import jsYaml from 'js-yaml'
import isArray from 'lodash-es/isArray'
import React, { FC, useMemo } from 'react'

import { IMaxAIMarkdownCodeRendererProps } from '@/components/MaxAIMarkdown/MaxAIMarkdownCodeRenderer/types'
import {
  ArtifactsButton,
  IArtifacts,
} from '@/features/chatgpt/components/artifacts'

const ArtifactRenderer: FC<IMaxAIMarkdownCodeRendererProps> = (props) => {
  const { content, messageIsComplete, isLastNode } = props
  const isArtifactResponding = useMemo(() => {
    console.log(
      `maxaiartifact ArtifactRender: ${messageIsComplete}, isLastNode: ${isLastNode}`,
    )
    if (messageIsComplete) {
      return false
    }
    return isLastNode
  }, [messageIsComplete, isLastNode])
  const artifacts = useMemo<IArtifacts>(() => {
    console.log(content, isArtifactResponding)
    /**
     * yaml
     * identifier: 'number-guessing-game-1to10'
     * type: 'text/html'
     * title: 'Number Guessing Game (1-10) with Score Tracker'
     * content:
     *
     */
    try {
      const needParseText = isArray(content)
        ? content.join('')
        : content.toString()
      const parsed: any = jsYaml.load(needParseText)
      if (parsed.identifier && parsed.type && parsed.title && parsed.content) {
        return {
          ...parsed,
          complete: !isArtifactResponding,
        } as IArtifacts
      }
    } catch (e) {
      // console.error(e)
    }
    return {
      identifier: '',
      content: '',
      type: '',
      title: 'Generating...',
      complete: !isArtifactResponding,
    }
  }, [isArtifactResponding, content])
  return (
    <ArtifactsButton loading={isArtifactResponding} artifacts={artifacts} />
  )
}

export default ArtifactRenderer
