import { getAppRootElement } from '@/utils'
import { v4 } from 'uuid'
import { CHROME_EXTENSION_POST_MESSAGE_ID } from '@/types'

export const compileTemplate = (template: string, variables: any) => {
  return new Promise<{
    success: boolean
    error: string
    data: string
  }>((resolve) => {
    const taskId = 'compile_task_' + v4()
    const timeout = setTimeout(() => {
      resolve({
        success: false,
        error: 'timeout',
        data: '',
      })
      window.removeEventListener('message', handleChildMessage)
    }, 10000)
    // 定义回调函数
    const handleChildMessage = (originalEvent: any) => {
      const { event, taskId, data, success, error } = originalEvent.data
      if (
        event === 'renderTemplateResponse' &&
        taskId === taskId &&
        originalEvent.origin === 'https://www.ezmail.ai'
      ) {
        resolve({
          success,
          error,
          data,
        })
        clearTimeout(timeout)
        window.removeEventListener('message', handleChildMessage)
      }
    }
    window.addEventListener('message', handleChildMessage)
    getAppRootElement()
      ?.querySelector<HTMLIFrameElement>('#EzMail_AI_TEMPLATE_COMPILE')
      ?.contentWindow?.postMessage(
        {
          id: CHROME_EXTENSION_POST_MESSAGE_ID,
          event: 'renderTemplate',
          data: {
            taskId,
            template,
            variables,
          },
        },
        '*',
      )
  })
}
