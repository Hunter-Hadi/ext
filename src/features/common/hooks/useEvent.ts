import * as React from 'react'

/**
 * useEvent
 * @description 这个函数是一个自定义的 React Hook，名为 useEvent。它的作用是将一个回调函数包装成一个 memoized（记忆化）的函数，并返回该函数。
 * @param callback
 */

// eslint-disable-next-line @typescript-eslint/ban-types
export default function useEvent<T extends Function>(callback: T): T {
  const fnRef = React.useRef<any>()
  fnRef.current = callback

  const memoFn = React.useCallback<T>(
    ((...args: any) => fnRef.current?.(...args)) as any,
    [],
  )

  return memoFn
}
