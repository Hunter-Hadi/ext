// web worker
import cl100k_base from 'gpt-tokenizer/esm/encoding/cl100k_base'

import { WebWorkerEventType } from '@/utils/webWorkerClient'

const getTextTokens = (text: string) => {
  try {
    const tokens = cl100k_base.encode(text)
    return tokens || []
  } catch (error) {
    console.error('getTextTokens encode error', error)
    return []
  }
}
self.addEventListener('message', (event) => {
  const { taskId, data, eventType } = event.data
  const handleMessage = async () => {
    switch (eventType as WebWorkerEventType) {
      case 'WEB_WORKER_GET_TOKENS':
        return getTextTokens(data)
      default:
        return undefined
    }
  }
  handleMessage().then((result) => {
    self.postMessage({
      taskId,
      data: result,
    })
  })
})
