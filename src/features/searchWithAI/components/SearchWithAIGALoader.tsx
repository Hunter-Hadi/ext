import React, { FC } from 'react'
import { CHROME_EXTENSION_HOMEPAGE_URL } from '@/constants'

const SearchWithAIGALoader: FC = () => {
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
      src={`${CHROME_EXTENSION_HOMEPAGE_URL}/crx.html`}
    />
  )
}
export default SearchWithAIGALoader
