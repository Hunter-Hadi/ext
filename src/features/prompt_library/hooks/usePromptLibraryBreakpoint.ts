import { useTheme } from '@mui/material/styles'
import { useEffect, useMemo, useState } from 'react'

import { MAXAI_PROMPT_LIBRARY_ROOT_ID } from '@/features/common/constants'
import { getMaxAISidebarRootElement } from '@/features/common/utils'

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

const usePromptLibraryBreakpoint = (sidebarDefaultWidth = 450) => {
  const theme = useTheme()
  const [promptLibraryRuntime, setPromptLibraryRuntime] = useState<
    'page' | 'sidebar'
  >('page')
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
  useEffect(() => {
    if (
      getMaxAISidebarRootElement()?.querySelector(
        `#${MAXAI_PROMPT_LIBRARY_ROOT_ID}`,
      )
    ) {
      setPromptLibraryRuntime('sidebar')
    } else if (document.querySelector(`#${MAXAI_PROMPT_LIBRARY_ROOT_ID}`)) {
      setPromptLibraryRuntime('page')
    }
    setPromptLibraryRuntime('page')
  }, [])

  return promptLibraryRuntime === 'page'
    ? currentBreakpoint
    : sidebarBreakpoints
}
export default usePromptLibraryBreakpoint
