import { getEzMailAppRootElement } from '@/utils'
import { v4 } from 'uuid'

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
    getEzMailAppRootElement()
      ?.querySelector<HTMLIFrameElement>('#EzMail_AI_TEMPLATE_COMPILE')
      ?.contentWindow?.postMessage(
        {
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
