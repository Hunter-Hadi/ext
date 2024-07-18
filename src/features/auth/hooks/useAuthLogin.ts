import { useEffect, useState } from 'react'
import { useRecoilState } from 'recoil'

import { AuthState } from '@/features/auth/store'
import { getMaxAIChromeExtensionAccessToken } from '@/features/auth/utils'
import useEffectOnce from '@/features/common/hooks/useEffectOnce'
import { useFocus } from '@/features/common/hooks/useFocus'
import { AppState } from '@/store'

export const useAuthLogin = () => {
  const [appState] = useRecoilState(AppState)
  const [loaded, setLoaded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [authLogin, setAuthLogin] = useRecoilState(AuthState)
  useEffectOnce(() => {
    setLoading(true)
    getMaxAIChromeExtensionAccessToken()
      .then((accessToken) => {
        if (accessToken) {
          setAuthLogin((prev) => ({
            ...prev,
            isLogin: true,
          }))
        }
        setLoaded(true)
        setLoading(false)
      })
      .catch(() => {
        setLoaded(true)
        setLoading(false)
      })
  })
  useFocus(() => {
    getMaxAIChromeExtensionAccessToken().then((accessToken) => {
      if (accessToken) {
        setAuthLogin((prev) => ({
          ...prev,
          isLogin: true,
        }))
      } else {
        setAuthLogin((prev) => ({
          ...prev,
          isLogin: false,
        }))
      }
    })
  })
  useEffect(() => {
    if (appState.open) {
      getMaxAIChromeExtensionAccessToken().then((accessToken) => {
        if (accessToken) {
          setAuthLogin((prev) => ({
            ...prev,
            isLogin: true,
          }))
        } else {
          setAuthLogin((prev) => ({
            ...prev,
            isLogin: false,
          }))
        }
      })
    }
  }, [appState.open])
  return {
    isLogin: authLogin.isLogin,
    loaded,
    loading,
  }
}
