import { IArtifacts } from '@/features/chatgpt/components/artifacts'

// export const MAXAI_ARTIFACTS_SANDBOX_HOST = 'http://127.0.0.1:3838'
export const MAXAI_ARTIFACTS_SANDBOX_HOST = 'https://www.maxai.space'

export const startSandBoxRender = async (
  rootContainer: HTMLDivElement,
  artifacts: IArtifacts,
) => {
  return new Promise((resolve) => {
    if (!rootContainer || !rootContainer.querySelector) {
      resolve(false)
      return
    }
    const timer = setTimeout(() => {
      resolve(false)
    }, 10 * 1000)
    rootContainer?.querySelector('iframe')?.remove()
    const iframe = document.createElement('iframe')
    iframe.style.width = '100%'
    iframe.style.height = '100%'
    iframe.style.border = 'none'
    iframe.src = `${MAXAI_ARTIFACTS_SANDBOX_HOST}?t=${new Date().getTime()}`
    iframe.onload = () => {
      iframe?.contentWindow?.postMessage(
        {
          artifacts,
        },
        '*',
      )
      clearTimeout(timer)
      resolve(true)
    }
    iframe.onerror = () => {
      clearTimeout(timer)
      resolve(false)
    }
    rootContainer?.appendChild(iframe)
  })
}
