import { useEffect, useState } from 'react'
import { useRecoilState } from 'recoil'

import { AuthState } from '@/features/auth/store'
import useEffectOnce from '@/features/common/hooks/useEffectOnce'
import { useFocus } from '@/features/common/hooks/useFocus'
import { AppState } from '@/store'
import { getAccessToken } from '@/utils/request'

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
