import isEqual from 'lodash-es/isEqual'
import React, { FC, memo } from 'react'

import ArtifactRenderer from '@/components/MaxAIMarkdown/MaxAIMarkdownCodeRenderer/components/ArtifactRenderer'
import { IMaxAIMarkdownCodeRendererProps } from '@/components/MaxAIMarkdown/MaxAIMarkdownCodeRenderer/types'
import { useMaxAIMarkdownExtraData } from '@/components/MaxAIMarkdown/useMaxAIMarkdownExtraData'

const MaxAIMarkdownCodeRenderer: FC<
  Omit<IMaxAIMarkdownCodeRendererProps, 'messageIsComplete'> & {
    maxAICustomMarkdownComponentName: string
  }
> = (props) => {
  const { isComplete } = useMaxAIMarkdownExtraData()
  const { maxAICustomMarkdownComponentName, ...componentProps } = props
  return (
    <>
      {maxAICustomMarkdownComponentName === 'artifact' && (
        <ArtifactRenderer {...componentProps} messageIsComplete={isComplete} />
      )}
    </>
  )
}
export default memo(MaxAIMarkdownCodeRenderer, (prevProps, nextProps) => {
  return isEqual(prevProps, nextProps)
})
