import { useEffect } from 'react'

const useBlur = (callback: () => void) => {
  useEffect(() => {
    const onBlur = () => {
      callback()
    }
    window.addEventListener('blur', onBlur)
    return () => {
      window.removeEventListener('blur', onBlur)
    }
  }, [])
}
export default useBlur
