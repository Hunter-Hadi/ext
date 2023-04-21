import { useRecoilState } from 'recoil'
import { AuthState } from '@/features/auth/store'
import { useEffect, useState } from 'react'
import useEffectOnce from '@/hooks/useEffectOnce'
import { getAccessToken } from '@/utils/request'
import { useFocus } from '@/hooks/useFocus'
import { AppState } from '@/store'

export const useAuthLogin = () => {
  const [appState] = useRecoilState(AppState)
  const [loaded, setLoaded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [authLogin, setAuthLogin] = useRecoilState(AuthState)
  useEffectOnce(() => {
    setLoading(true)
    getAccessToken()
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
    getAccessToken().then((accessToken) => {
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
      getAccessToken().then((accessToken) => {
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
