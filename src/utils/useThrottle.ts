import { EffectCallback, useEffect, useRef, useState } from 'react'

const useEffectOnce = (effect: EffectCallback) => {
  useEffect(effect, [])
}
const useUnmount = (fn: () => any): void => {
  const fnRef = useRef(fn)
  // update the ref each render so if it change the newest callback will be invoked
  fnRef.current = fn
  useEffectOnce(() => () => fnRef.current())
}

export const useThrottle = <T>(value: T, ms = 200) => {
  const [state, setState] = useState<T>(value)
  const timeout = useRef<ReturnType<typeof setTimeout>>()
  const nextValue = useRef(null) as any
  const hasNextValue = useRef(0) as any

  useEffect(() => {
    if (!timeout.current) {
      setState(value)
      const timeoutCallback = () => {
        if (hasNextValue.current) {
          hasNextValue.current = false
          setState(nextValue.current)
          timeout.current = setTimeout(timeoutCallback, ms)
        } else {
          timeout.current = undefined
        }
      }
      timeout.current = setTimeout(timeoutCallback, ms)
    } else {
      nextValue.current = value
      hasNextValue.current = true
    }
  }, [value])

  useUnmount(() => {
    timeout.current && clearTimeout(timeout.current)
  })

  return state
}
export const useThrottleFn = <T, U extends any[]>(
  fn: (...args: U) => T,
  ms = 200,
  args: U,
) => {
  const [state, setState] = useState<T | null>(null)
  const timeout = useRef<ReturnType<typeof setTimeout>>()
  const nextArgs = useRef<U>()

  useEffect(() => {
    if (!timeout.current) {
      setState(fn(...args))
      const timeoutCallback = () => {
        if (nextArgs.current) {
          setState(fn(...nextArgs.current))
          nextArgs.current = undefined
          timeout.current = setTimeout(timeoutCallback, ms)
        } else {
          timeout.current = undefined
        }
      }
      timeout.current = setTimeout(timeoutCallback, ms)
    } else {
      nextArgs.current = args
    }
  }, args)

  useUnmount(() => {
    timeout.current && clearTimeout(timeout.current)
  })

  return state
}
export type ThrottledFunction<T extends (...args: any) => any> = (
  ...args: Parameters<T>
) => ReturnType<T>
export const throttle = <T extends (...args: any) => any>(
  func: T,
  limit: number,
): ThrottledFunction<T> => {
  let inThrottle: boolean
  let lastResult: ReturnType<T>

  return function (this: any): ReturnType<T> {
    // eslint-disable-next-line prefer-rest-params
    const args = arguments
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const context = this

    if (!inThrottle) {
      inThrottle = true

      setTimeout(() => (inThrottle = false), limit)

      lastResult = func.apply(context, args as any)
    }

    return lastResult
  }
}
