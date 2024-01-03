import ThemeProvider from '@mui/material/styles/ThemeProvider'
import { FC } from 'react'
// import useEffectOnce from '@/hooks/useEffectOnce'
// import initClientProxyWebsocket from '@/background/utils/clientProxyWebsocket/client'
import React from 'react'

import userInitUserInfo from '@/features/auth/hooks/useInitUserInfo'
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

  console.log(`SearchWithAIContainer rootElement`, rootElement)

  userInitUserInfo()
  useInitI18n()

  useSearchWithAISettingsInit()

  // useEffectOnce(() => {
  //   initClientProxyWebsocket()
  // })

  return (
    <ThemeProvider theme={customTheme}>
      <AISearchContentCard
        question={question}
        isDarkMode={isDarkMode}
        siteName={siteName}
      />
    </ThemeProvider>
  )
}

export default SearchWithAIContainer
