import { useTheme } from '@mui/material/styles'
import { useEffect, useMemo, useState } from 'react'

import { CHROME_EXTENSION_USER_SETTINGS_DEFAULT_CHAT_BOX_WIDTH } from '@/constants'
import { getMaxAISidebarRootElement } from '@/utils'
import { isMaxAIImmersiveChatPage } from '@/utils/dataHelper/websiteHelper'

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

const useCurrentBreakpoint = (
  sidebarDefaultWidth = CHROME_EXTENSION_USER_SETTINGS_DEFAULT_CHAT_BOX_WIDTH,
) => {
  const theme = useTheme()
  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>('xl')
  const [sidebarWidth, setSidebarWidth] = useState(sidebarDefaultWidth)
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
      const sidebarWidth =
        getMaxAISidebarRootElement()?.offsetWidth ||
        CHROME_EXTENSION_USER_SETTINGS_DEFAULT_CHAT_BOX_WIDTH
      setSidebarWidth(sidebarWidth)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [theme.breakpoints.values])
  const sidebarBreakpoints = useMemo<Breakpoint>(() => {
    if (sidebarWidth <= CHROME_EXTENSION_USER_SETTINGS_DEFAULT_CHAT_BOX_WIDTH) {
      return 'xs'
    } else if (sidebarWidth <= 600) {
      return 'sm'
    } else if (sidebarWidth <= 960) {
      return 'md'
    } else if (sidebarWidth <= 1280) {
      return 'lg'
    } else if (sidebarWidth <= 1920) {
      return 'xl'
    }
    return 'xs'
  }, [sidebarWidth, sidebarDefaultWidth])

  return isMaxAIImmersiveChatPage() ? currentBreakpoint : sidebarBreakpoints
}
export default useCurrentBreakpoint
