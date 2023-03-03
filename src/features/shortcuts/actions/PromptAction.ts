import { Action } from '@/features/shortcuts/core/Action'
import { IAction } from '@/features/shortcuts'
import { getEzMailAppRootElement } from '@/utils'
import { v4 } from 'uuid'
export class PromptAction extends Action {
  static type = 'prompt'
  constructor(
    id: string,
    type: IAction['type'],
    parameters?: any,
    autoNext?: boolean,
  ) {
    super(id, 'prompt', parameters, autoNext)
  }
  execute(params: any) {
    // const result = await sendAsyncTask('DaemonProcess_compileTemplate', {
    //   template: this.parameters?.template || '',
    //   variables: params,
    // })
    // console.log(result)
    return new Promise<any>((resolve, reject) => {
      console.log('ShortCutEngine prompt start', this.parameters, params)
      console.log(
        getEzMailAppRootElement()?.querySelector<HTMLIFrameElement>(
          '#EzMail_AI_TEMPLATE_COMPILE',
        ),
      )
      const taskId = 'compile_task_' + v4()
      // 定义回调函数
      const handleChildMessage = (originalEvent: any) => {
        const { event, taskId, data, success, error } = originalEvent.data
        if (event === 'renderTemplateResponse' && taskId === taskId) {
          if (success) {
            this.output = data
            resolve(data)
          } else {
            reject(error)
          }
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
              template: this.parameters?.template || '',
              variables: params,
            },
          },
          '*',
        )
    })
    // debugger
  }
}
