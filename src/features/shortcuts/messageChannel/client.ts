import { createClientMessageListener } from '@/background/utils'
import { clientExecuteOperationElement } from '@/features/shortcuts/utils/OperationElementHelper'

export const ShortcutMessageClientInit = () => {
  createClientMessageListener(async (event, data, sender) => {
    switch (event) {
      case 'ShortCuts_ClientExecuteOperationPageElement':
        {
          const { taskId, OperationElementConfig } = data
          if (!taskId) {
            return {
              success: false,
              message: 'No taskId',
              data: null,
            }
          }
          await clientExecuteOperationElement(taskId, OperationElementConfig)
          return {
            success: true,
            data: true,
            message: 'ok',
          }
        }
        break
      default:
        break
    }
    return undefined
  })
}
