import React, { FC } from 'react'

const isProd = process.env.NODE_ENV === 'production'

const DevContent: FC<{
  children?: React.ReactNode
}> = ({ children }) => {
  if (isProd) {
    return null
  }
  return <>{children}</>
}
export default DevContent
