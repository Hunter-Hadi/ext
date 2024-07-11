import { parseReadabilityDocument } from '@/features/chat-base/summary/utils/documentContentHelper'
import { getIframeOrSpecialHostPageContent } from '@/features/chat-base/summary/utils/pageContentHelper'
import {
  IShortcutEngineExternalEngine,
  pushOutputToChat,
  templateParserDecorator,
  withLoadingDecorators,
} from '@/features/shortcuts'
import { stopActionMessageStatus } from '@/features/shortcuts/actions/utils/actionMessageTool'
import Action from '@/features/shortcuts/core/Action'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'

export class ActionGetReadabilityContentsOfWebPage extends Action {
  static type: ActionIdentifier = 'GET_READABILITY_CONTENTS_OF_WEBPAGE'
  originalInnerText: string = ''
  isStopAction = false
  constructor(
    id: string,
    type: ActionIdentifier,
    parameters: ActionParameters,
    autoExecute: boolean,
  ) {
    super(id, type, parameters, autoExecute)
  }
  @templateParserDecorator()
  @pushOutputToChat({
    onlyError: true,
  })
  @withLoadingDecorators()
  async execute(
    params: ActionParameters,
    engine: IShortcutEngineExternalEngine,
  ) {
    try {
      if (this.isStopAction) return
      // TODO 目前ReadabilityPageContent是从document.cloneNode(true)读取出来的内容对于样式判断不准确
      // let result =
      //   (await getIframeOrSpecialHostPageContent()) ||
      //   (await getReadabilityPageContent())
      // if (result.length < 100 && typeof document !== 'undefined') {
      //   result = await getVisibilityPageContent()
      // }
      let result = await getIframeOrSpecialHostPageContent()
      if (!result) {
        const clear = parseReadabilityDocument(document, false)
        this.originalInnerText = result = document.body.innerText
        clear()
      }
      this.output = result
    } catch (e) {
      this.error = (e as any).toString()
    }
  }
  async stop(params: { engine: IShortcutEngineExternalEngine }) {
    this.isStopAction = true
    await stopActionMessageStatus(params)
    return true
  }
}
