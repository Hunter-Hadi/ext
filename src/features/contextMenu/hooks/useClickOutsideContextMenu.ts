import { useEffect, useRef, useState } from 'react'

export const useClickOutsideContextMenu = () => {
  const [isClickOutside, setIsClickOutside] = useState(false)
  const ref = useRef<HTMLElement | null>(null)
  const handleClickOutside = (event: any) => {
    const rootEl = document.getElementById('EzMail_AI_ROOT_Context_Menu')
    if (
      rootEl &&
      rootEl.shadowRoot &&
      rootEl.shadowRoot.querySelector(
        '#EzMail_AI_ROOT_Context_Menu_Portal.visible',
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
