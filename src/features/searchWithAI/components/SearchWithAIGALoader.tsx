import React, { FC } from 'react'
import { SEARCH_WITH_AI_APP_NAME } from '../constants'

const SearchWithAIGALoader: FC = () => {
  if (SEARCH_WITH_AI_APP_NAME === 'maxai') {
    return (
      <iframe
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: -1,
          border: 0,
          opacity: 0,
        }}
        width={1}
        height={1}
        id={'EzMail_AI_TEMPLATE_COMPILE'}
        src={`https://www.maxai.me/crx.html`}
      />
    )
  }

  return null
}
export default SearchWithAIGALoader
