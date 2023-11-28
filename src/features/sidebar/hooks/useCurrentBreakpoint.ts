import { useTheme } from '@mui/material/styles'
import { useEffect, useMemo, useState } from 'react'
import { useRecoilState } from 'recoil'
import { AppLocalStorageState } from '@/store'
import { isMaxAIImmersiveChatPage } from '@/utils/dataHelper/websiteHelper'
import { CHROME_EXTENSION_USER_SETTINGS_DEFAULT_CHAT_BOX_WIDTH } from '@/constants'

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

const useCurrentBreakpoint = () => {
  const theme = useTheme()
  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>('xl')
  const [appLocalStorage] = useRecoilState(AppLocalStorageState)
  useEffect(() => {
    const handleResize = () => {
      const breakpoints = theme.breakpoints.values
      const width = window.innerWidth
      let breakpoint: Breakpoint = 'xl'
      if (width < breakpoints.sm) {
        breakpoint = 'xs'
      } else if (width < breakpoints.md) {
        breakpoint = 'sm'
      } else if (width < breakpoints.lg) {
        breakpoint = 'md'
      } else if (width < breakpoints.xl) {
        breakpoint = 'lg'
      }
      setCurrentBreakpoint(breakpoint)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [theme.breakpoints.values])
  const sidebarBreakpoints = useMemo<Breakpoint>(() => {
    const chatBoxWidth =
      appLocalStorage.sidebarSettings?.common?.chatBoxWidth ||
      CHROME_EXTENSION_USER_SETTINGS_DEFAULT_CHAT_BOX_WIDTH
    if (chatBoxWidth <= CHROME_EXTENSION_USER_SETTINGS_DEFAULT_CHAT_BOX_WIDTH) {
      return 'xs'
    } else if (chatBoxWidth <= 600) {
      return 'sm'
    } else if (chatBoxWidth <= 960) {
      return 'md'
    } else if (chatBoxWidth <= 1280) {
      return 'lg'
    } else if (chatBoxWidth <= 1920) {
      return 'xl'
    }
    return 'xs'
  }, [appLocalStorage.sidebarSettings?.common?.chatBoxWidth])

  return isMaxAIImmersiveChatPage() ? currentBreakpoint : sidebarBreakpoints
}
export default useCurrentBreakpoint
