import { IArtifacts } from '@/features/chatgpt/components/artifacts'

// export const MAXAI_ARTIFACTS_SANDBOX_HOST = 'http://127.0.0.1:3838'
export const MAXAI_ARTIFACTS_SANDBOX_HOST = 'https://www.maxai.space'
//
export const startSandBoxRender = (
  rootContainer: HTMLDivElement,
  artifacts: IArtifacts,
) => {
  if (!rootContainer || !rootContainer.querySelector) {
    return
  }
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
  }
  rootContainer?.appendChild(iframe)
}
