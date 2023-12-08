import { useTheme } from '@mui/material/styles'
import { useContext, useEffect, useMemo, useState } from 'react'

import { getMaxAISidebarRootElement } from '@/features/common/utils'
import { PromptLibraryRuntimeContext } from '@/features/prompt_library/store'

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

const usePromptLibraryBreakpoint = (sidebarDefaultWidth = 450) => {
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
      const sidebarWidth = getMaxAISidebarRootElement()?.offsetWidth || 450
      setSidebarWidth(sidebarWidth)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [theme.breakpoints.values])
  const sidebarBreakpoints = useMemo<Breakpoint>(() => {
    if (sidebarWidth <= 450) {
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

  return promptLibraryRuntime === 'CRXPage'
    ? currentBreakpoint
    : sidebarBreakpoints
}
export default usePromptLibraryBreakpoint
