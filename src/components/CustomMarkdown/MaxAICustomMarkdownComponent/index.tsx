import React, { FC } from 'react'

import ArtifactRender from '@/components/CustomMarkdown/MaxAICustomMarkdownComponent/components/ArtifactRender'
import { IMaxAICustomMarkdownComponentProps } from '@/components/CustomMarkdown/MaxAICustomMarkdownComponent/types'

const MaxAICustomMarkdownComponent: FC<
  IMaxAICustomMarkdownComponentProps & {
    maxAICustomMarkdownComponentName: string
  }
> = (props) => {
  const { maxAICustomMarkdownComponentName, ...componentProps } = props
  return (
    <>
      {maxAICustomMarkdownComponentName === 'artifact' && (
        <ArtifactRender {...componentProps} messageIsComplete={false}>
          MaxAIArtifact
        </ArtifactRender>
      )}
    </>
  )
}
export default MaxAICustomMarkdownComponent
