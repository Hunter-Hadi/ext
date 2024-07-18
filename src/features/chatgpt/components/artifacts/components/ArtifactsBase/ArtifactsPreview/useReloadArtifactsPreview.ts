import { useEffect } from 'react'

export const reloadArtifactsPreview = () => {
  window.postMessage('maxai-artifact-reload', '*')
}
export const useReloadArtifactsPreview = (reloadFunction: () => void) => {
  useEffect(() => {
    const messageListener = (event: MessageEvent) => {
      if (event.data === 'maxai-artifact-reload') {
        reloadFunction()
      }
    }
    window.addEventListener('message', messageListener)
    return () => {
      window.removeEventListener('message', messageListener)
    }
  }, [reloadFunction])
}
