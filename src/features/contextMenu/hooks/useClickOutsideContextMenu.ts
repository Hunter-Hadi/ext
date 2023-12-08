import { useEffect, useRef, useState } from 'react'

import {
  MAXAI_CONTEXT_MENU_ID,
  MAXAI_CONTEXT_MENU_PORTAL_ID,
} from '@/features/common/constants'

export const useClickOutsideContextMenu = () => {
  const [isClickOutside, setIsClickOutside] = useState(false)
  const ref = useRef<HTMLElement | null>(null)
  const handleClickOutside = (event: any) => {
    const rootEl = document.getElementById(MAXAI_CONTEXT_MENU_ID)
    if (
      rootEl &&
      rootEl.shadowRoot &&
      rootEl.shadowRoot.querySelector(
        `#${MAXAI_CONTEXT_MENU_PORTAL_ID}.visible`,
      )
    ) {
      if (rootEl && rootEl.isEqualNode(event.target)) {
        setIsClickOutside(false)
      } else {
        setIsClickOutside(true)
      }
    }
  }
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])
  return {
    ref,
    isClickOutside,
    reset: () => {
      setIsClickOutside(false)
    },
  }
}
