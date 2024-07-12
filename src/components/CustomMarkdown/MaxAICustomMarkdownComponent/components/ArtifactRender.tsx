import jsYaml from 'js-yaml'
import isArray from 'lodash-es/isArray'
import React, { FC, useMemo } from 'react'

import { IMaxAICustomMarkdownComponentProps } from '@/components/CustomMarkdown/MaxAICustomMarkdownComponent/types'
import {
  ArtifactsButton,
  IArtifacts,
} from '@/features/chatgpt/components/artifacts'

const ArtifactRender: FC<IMaxAICustomMarkdownComponentProps> = (props) => {
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
  const artifacts = useMemo<IArtifacts | null>(() => {
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
          complete: isArtifactResponding,
        } as IArtifacts
      }
      return null
    } catch (e) {
      console.error(e)
      return null
    }
  }, [isArtifactResponding, content])
  if (!artifacts) {
    return null
  }
  return (
    <ArtifactsButton loading={isArtifactResponding} artifacts={artifacts} />
  )
}

export default ArtifactRender
