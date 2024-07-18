import jsYaml from 'js-yaml'
import isArray from 'lodash-es/isArray'
import React, { FC, useMemo } from 'react'

import { IMaxAIMarkdownCodeRendererProps } from '@/components/MaxAIMarkdown/MaxAIMarkdownCodeRenderer/types'
import {
  ArtifactsButton,
  ArtifactsType,
  IArtifacts,
} from '@/features/chatgpt/components/artifacts'

const ArtifactRenderer: FC<IMaxAIMarkdownCodeRendererProps> = (props) => {
  const { content, messageIsComplete, isLastNode } = props
  const isArtifactResponding = useMemo(() => {
    if (messageIsComplete) {
      return false
    }
    return isLastNode
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
      const needParseText = isArray(content)
        ? content.join('')
        : content.toString()
      const parsed: any = jsYaml.load(needParseText)
      if (parsed.identifier && parsed.type && parsed.title && parsed.content) {
        console.log(
          `maxaiartifact ArtifactRender`,
          parsed,
          isArtifactResponding,
        )
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
      type: ArtifactsType.TEXT,
      title: isArtifactResponding ? 'Generating...' : 'Failed to load artifact',
      complete: !isArtifactResponding,
    }
  }, [isArtifactResponding, content])
  return <ArtifactsButton artifacts={artifacts} />
}

export default ArtifactRenderer
