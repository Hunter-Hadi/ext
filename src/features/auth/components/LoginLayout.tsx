import React, { FC } from 'react'
import { useAuthLogin } from '@/features/auth'

const LoginLayout: FC<{
  children: React.ReactNode
}> = (props) => {
  const { isLogin } = useAuthLogin()
  if (!isLogin) {
    return null
  }
  return <>{props.children}</>
}
export default LoginLayout
