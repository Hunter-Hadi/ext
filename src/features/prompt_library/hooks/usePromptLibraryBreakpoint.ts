import { useTheme } from '@mui/material/styles'
import { useContext, useEffect, useMemo, useState } from 'react'

import { CHROME_EXTENSION_USER_SETTINGS_DEFAULT_CHAT_BOX_WIDTH } from '@/constants'
import { PromptLibraryRuntimeContext } from '@/features/prompt_library/store'
import { getMaxAISidebarRootElement } from '@/utils'

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

const usePromptLibraryBreakpoint = (
  sidebarDefaultWidth = CHROME_EXTENSION_USER_SETTINGS_DEFAULT_CHAT_BOX_WIDTH,
) => {
  const theme = useTheme()
  const { promptLibraryRuntime } = useContext(PromptLibraryRuntimeContext)!

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
    } else if (sidebarWidth <= 1920 || sidebarWidth > 1920) {
      // 暂时没有 2xl 的设计，所以 大于 1920 的都算 xl
      return 'xl'
    }
    return 'xs'
  }, [sidebarWidth, sidebarDefaultWidth])

  return promptLibraryRuntime === 'CRXSidebar'
    ? sidebarBreakpoints
    : currentBreakpoint
}
export default usePromptLibraryBreakpoint
