import Action from '@/features/shortcuts/core/Action'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import { ISystemChatMessage } from '@/features/chatgpt/types'
import { v4 as uuidV4 } from 'uuid'
import { OperationElementConfigType } from '@/features/shortcuts/types/Extra/OperationElementConfigType'
import { IExecuteOperationResult } from '@/features/shortcuts/utils/OperationElementHelper'
export class ActionOperationElement extends Action {
  static type: ActionIdentifier = 'OPERATION_ELEMENT'
  constructor(
    id: string,
    type: ActionIdentifier,
    parameters: ActionParameters,
    autoExecute: boolean,
  ) {
    super(id, type, parameters, autoExecute)
  }
  async execute(params: ActionParameters, engine: any) {
    try {
      const port = engine.getBackgroundConversation()
      const OperationElementConfig: OperationElementConfigType | undefined =
        this.parameters.OperationElementConfig || params.OperationElementConfig
      if (!port || !OperationElementConfig) {
        this.error = 'Action cannot execute!'
        return
      }
      const OperationElementTabID =
        this.parameters.OperationElementTabID || params.OperationElementTabID
      const result: {
        success: boolean
        data: IExecuteOperationResult | null
        message: string
      } = await port.postMessage({
        event: 'ShortCuts_OperationPageElement',
        data: {
          OperationElementConfig,
          OperationElementTabID,
        },
      })
      const executeResponse = result.data
      if (!executeResponse?.success) {
        OperationElementConfig.errorMessage &&
          this.pushMessageToChat(
            {
              type: 'system',
              messageId: uuidV4(),
              parentMessageId: '',
              text: OperationElementConfig.errorMessage,
              extra: {
                status: 'error',
              },
            } as ISystemChatMessage,
            engine,
          )
      } else {
        OperationElementConfig.successMessage &&
          this.pushMessageToChat(
            {
              type: 'system',
              messageId: uuidV4(),
              parentMessageId: '',
              text: OperationElementConfig.successMessage,
              extra: {
                status: 'info',
              },
            } as ISystemChatMessage,
            engine,
          )
        // 如果actionType === getText, output设置为获取到的innerText
        if (OperationElementConfig.actionType === 'getText') {
          this.output = executeResponse.elementsInnerText
        } else if (OperationElementConfig.actionType === 'getLink') {
          this.output = executeResponse.link
        }
      }
    } catch (e) {
      this.error = (e as any).toString()
    }
  }
}
