import React, { FC } from 'react'
import { useChatMessageMarkdownExtraData } from 'src/components/MaxAIMarkdown'

import ArtifactRenderer from '@/components/MaxAIMarkdown/MaxAIMarkdownCodeRenderer/components/ArtifactRenderer'
import { IMaxAIMarkdownCodeRendererProps } from '@/components/MaxAIMarkdown/MaxAIMarkdownCodeRenderer/types'

const MaxAIMarkdownCodeRenderer: FC<
  Omit<IMaxAIMarkdownCodeRendererProps, 'messageIsComplete'> & {
    maxAICustomMarkdownComponentName: string
  }
> = (props) => {
  const { isComplete } = useChatMessageMarkdownExtraData()
  const { maxAICustomMarkdownComponentName, ...componentProps } = props
  return (
    <>
      {maxAICustomMarkdownComponentName === 'artifact' && (
        <ArtifactRenderer {...componentProps} messageIsComplete={isComplete} />
      )}
    </>
  )
}
export default MaxAIMarkdownCodeRenderer
