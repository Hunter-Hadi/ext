export const requestIdleCallbackPolyfill = (
  callback: IdleRequestCallback,
  options?: IdleRequestOptions,
): number => {
  const polyfillFn = function (cb: IdleRequestCallback) {
    const start = Date.now()
    const timer = setTimeout(function () {
      cb({
        didTimeout: false,
        timeRemaining: function () {
          return Math.max(0, 50 - (Date.now() - start))
        },
      })
    }, 1)
    return (timer as unknown) as number
  }
  try {
    if (typeof window !== undefined && window.requestIdleCallback) {
      return window.requestIdleCallback(callback, options)
    }
    return polyfillFn(callback)
  } catch (error) {
    return polyfillFn(callback)
  }
}
