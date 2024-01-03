import debounce from 'lodash-es/debounce'
import { useCallback, useEffect, useRef } from 'react'

import { ContentScriptConnectionV2 } from '../utils'

// check session is expired
const checkSessionExpired = () => {
  const buttons = document.querySelectorAll('button')
  const isSessionExpired = Array.from(buttons).some((button) => {
    return button.textContent === 'Log in'
  })
  return isSessionExpired
}

const useDaemonBrokenListener = () => {
  const observer = useRef<MutationObserver | null>(null)

  const debounceCheckSessionExpired = useCallback(
    debounce(() => {
      const isExpired = checkSessionExpired()
      if (isExpired) {
        const port = new ContentScriptConnectionV2({
          runtime: 'daemon_process',
        })
        port.postMessage({
          event: 'OpenAIDaemonProcess_daemonProcessSessionExpired',
          data: {},
        })
      }
    }, 1000),
    [],
  )

  const mutationCallback = useCallback(
    (mutations: MutationRecord[]) => {
      if (mutations.every((mutation) => mutation.addedNodes.length <= 0)) {
        return
      }
      // console.log('useDaemonBrokenListener mutations.addedNodes', mutations)

      // only has addedNodes to check
      try {
        debounceCheckSessionExpired()
      } catch (error) {
        console.error('useDaemonBrokenListener error', error)
      }
    },
    [debounceCheckSessionExpired],
  )

  useEffect(() => {
    observer.current = new MutationObserver(mutationCallback)
  }, [mutationCallback])

  useEffect(() => {
    const rootEl = document.querySelector<HTMLBodyElement>('body')
    if (observer.current && rootEl) {
      observer.current.observe(rootEl, {
        childList: true,
        subtree: true,
      })
    }
    return () => {
      if (observer.current) {
        observer.current.disconnect()
      }
    }
  }, [])
}

export default useDaemonBrokenListener
