import { atom, useRecoilState } from 'recoil'

import { useAuthLogin } from '@/features/auth'
import { MAXAI_APP_ROOT_ID } from '@/features/common/constants'

const PromptLibraryHandlerState = atom<{
  authHandler: () => Promise<void>
  maxAIChromeExtensionInstallHandler: () => Promise<boolean>
}>({
  key: 'PromptLibraryAuthHandlerState',
  default: {
    authHandler: () => Promise.resolve(),
    maxAIChromeExtensionInstallHandler: () => {
      // 检测逻辑
      const chromeExtensionInstalled = document.getElementById(
        MAXAI_APP_ROOT_ID,
      )
      if (chromeExtensionInstalled) {
        return Promise.resolve(true)
      }
      return Promise.resolve(false)
    },
  },
})

/**
 * @description: 用于处理 prompt library 的鉴权
 */
const usePromptLibraryAuth = () => {
  const [
    promptLibraryAuthHandler,
    setPromptLibraryAuthHandler,
  ] = useRecoilState(PromptLibraryHandlerState)
  const authState = useAuthLogin()
  const isLogin = authState.isLogin
  const checkAuthAsync = async () => {
    if (!isLogin) {
      await promptLibraryAuthHandler.authHandler()
    }
    return isLogin
  }
  const checkAuthSync = () => {
    if (!isLogin) {
      promptLibraryAuthHandler.authHandler().then().catch()
    }
    return isLogin
  }
  const setAuthHandler = (handler: () => Promise<void>) => {
    setPromptLibraryAuthHandler((prev) => {
      return {
        ...prev,
        authHandler: handler,
      }
    })
  }
  const setMaxAIChromeExtensionInstallHandler = (
    handler: () => Promise<boolean>,
  ) => {
    setPromptLibraryAuthHandler((prev) => {
      return {
        ...prev,
        maxAIChromeExtensionInstallHandler: handler,
      }
    })
  }
  const checkMaxAIChromeExtensionInstall = async () => {
    return await promptLibraryAuthHandler.maxAIChromeExtensionInstallHandler()
  }
  return {
    setMaxAIChromeExtensionInstallHandler,
    checkMaxAIChromeExtensionInstall,
    checkAuthAsync,
    checkAuthSync,
    setAuthHandler,
    isLogin,
  }
}
export default usePromptLibraryAuth
