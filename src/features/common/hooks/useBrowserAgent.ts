import { useState } from 'react'

import useEffectOnce from '@/features/common/hooks/useEffectOnce'

type IBrowserAgentType = 'Chrome' | 'Edge' | 'Firefox'

const useBrowserAgent = () => {
  const [browserAgent, setBrowserAgent] = useState<IBrowserAgentType>('Chrome')

  useEffectOnce(() => {
    try {
      if (typeof window === 'undefined') return

      // edge
      const isEdge =
        window.navigator.userAgent.indexOf('Edge') > -1 ||
        window.navigator.userAgent.indexOf('Edg') !== -1

      if (isEdge) {
        setBrowserAgent('Edge')
        return
      }

      // firefox
      // const isFirefox = window.navigator.userAgent.indexOf('Firefox') > -1;
      // if (isFirefox) {
      //   setBrowserAgent('Firefox');
      //   return;
      // }

      // default Chrome
      setBrowserAgent('Chrome')
    } catch (error) {}
  })

  return {
    browserAgent,
  }
}

export default useBrowserAgent
