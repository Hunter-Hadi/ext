import React, { FC } from 'react'

const isProduction = String(process.env.NODE_ENV) === 'production'

const DevContent: FC<{
  children?: React.ReactNode
}> = ({ children }) => {
  if (isProduction) {
    return null
  }
  return <>{children}</>
}
export default DevContent
