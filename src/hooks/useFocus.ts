import { useEffect } from 'react'

export const useFocus = (execFunction: () => void) => {
  useEffect(() => {
    const onFocus = () => {
      execFunction()
    }
    window.addEventListener('focus', onFocus)
    return () => {
      window.removeEventListener('focus', onFocus)
    }
  }, [])
}
