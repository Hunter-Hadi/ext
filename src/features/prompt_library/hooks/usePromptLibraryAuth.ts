import { atom, useRecoilState } from 'recoil'
import { useAuthLogin } from '@/features/auth'

const PromptLibraryAuthHandlerState = atom<() => Promise<void>>({
  key: 'PromptLibraryAuthHandlerState',
  default: () => Promise.resolve(),
})

/**
 * @description: 用于处理 prompt library 的鉴权
 */
const usePromptLibraryAuth = () => {
  const [
    promptLibraryAuthHandler,
    setPromptLibraryAuthHandler,
  ] = useRecoilState(PromptLibraryAuthHandlerState)
  const authState = useAuthLogin()
  const isLogin = authState.isLogin
  const checkAuthAsync = async () => {
    if (!isLogin) {
      await promptLibraryAuthHandler()
    }
    return isLogin
  }
  const checkAuthSync = () => {
    if (!isLogin) {
      promptLibraryAuthHandler().then().catch()
    }
    return isLogin
  }
  const setAuthHandler = (handler: () => Promise<void>) => {
    setPromptLibraryAuthHandler(() => handler)
  }
  return {
    checkAuthAsync,
    checkAuthSync,
    setAuthHandler,
    isLogin,
  }
}
export default usePromptLibraryAuth
