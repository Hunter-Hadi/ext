import { useEffect, useRef } from 'react'

export const usePrevious = <T>(state: T) => {
  const ref = useRef<T>()
  useEffect(() => {
    ref.current = state
  }, [state])
  return ref.current
}
