import { Action } from '@/features/shortcuts/core/Action'
import { IAction } from '@/features/shortcuts'
import { getEzMailAppRootElement } from '@/utils'
import { v4 } from 'uuid'
export class PromptAction extends Action {
  static type = 'prompt'
  constructor(id: string, type: IAction['type'], parameters?: any) {
    super(id, 'prompt', parameters)
  }
  execute(params: any) {
    // const result = await sendAsyncTask('DaemonProcess_compileTemplate', {
    //   template: this.parameters?.template || '',
    //   variables: params,
    // })
    // console.log(result)
    return new Promise<any>((resolve) => {
      console.log('ShortCutEngine prompt start', this.parameters, params)
      console.log(
        getEzMailAppRootElement()?.querySelector<HTMLIFrameElement>(
          '#EzMail_AI_TEMPLATE_COMPILE',
        ),
      )
      const taskId = 'compile_task_' + v4()
      // 定义回调函数
      function handleChildMessage(data: any) {
        debugger
        console.log('Parent received message from child: ' + data)
        window.removeEventListener('message', handleChildMessage)
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
            callback: handleChildMessage,
          },
          '*',
        )
    })
    // debugger
  }
}
