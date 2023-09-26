import ThemeProvider from '@mui/material/styles/ThemeProvider'
import { FC } from 'react'
import { ISearchPageKey } from '../utils'
import AISearchContentCard from './AISearchContentCard'
// import useEffectOnce from '@/hooks/useEffectOnce'
// import initClientProxyWebsocket from '@/background/utils/clientProxyWebsocket/client'
import React from 'react'
import { useCustomTheme } from '@/hooks/useCustomTheme'
import useSearchWithAISettingsInit from '../hooks/useSearchWithAISettingsInit'
import userInitUserInfo from '@/features/auth/hooks/useInitUserInfo'
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
