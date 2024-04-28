import ThemeProvider from '@mui/material/styles/ThemeProvider'
import { FC, useEffect, useState } from 'react'
// import useEffectOnce from '@/hooks/useEffectOnce'
// import initClientProxyWebsocket from '@/background/utils/clientProxyWebsocket/client'
import React from 'react'

import useInitUserInfo from '@/features/auth/hooks/useInitUserInfo'
import { useUserInfo } from '@/features/auth/hooks/useUserInfo'
import { useCustomTheme } from '@/hooks/useCustomTheme'
import { useInitI18n } from '@/i18n/hooks'

import useSearchWithAISettingsInit from '../hooks/useSearchWithAISettingsInit'
import { ISearchPageKey } from '../utils'
import AISearchContentCard from './AISearchContentCard'

interface IProps {
  question: string
  siteName: ISearchPageKey
  rootElement: HTMLElement
  isDarkMode?: boolean
}

const SearchWithAIContainer: FC<IProps> = ({
  question,
  siteName,
  isDarkMode,
  rootElement,
}) => {
  const { customTheme } = useCustomTheme({
    colorSchema: isDarkMode ? 'dark' : 'light',
    shadowRootElement: rootElement,
  })
  const { loading } = useUserInfo()
  const [loaded, setLoaded] = useState(false)

  console.log(`SearchWithAIContainer rootElement`, rootElement, loading)
  useInitUserInfo()
  useInitI18n()

  useSearchWithAISettingsInit()

  // useEffectOnce(() => {
  //   initClientProxyWebsocket()
  // })
  // 因为loading的状态是false->true->false，所以需要一个ref来判断是否是第一次加载
  const isStartRef = React.useRef(false)
  useEffect(() => {
    if (loading) {
      isStartRef.current = true
    }
    if (!loading && isStartRef.current) {
      setLoaded(true)
    }
  }, [loading])

  return (
    <ThemeProvider theme={customTheme}>
      {loaded && (
        <AISearchContentCard
          question={question}
          isDarkMode={isDarkMode}
          siteName={siteName}
        />
      )}
    </ThemeProvider>
  )
}

export default SearchWithAIContainer
