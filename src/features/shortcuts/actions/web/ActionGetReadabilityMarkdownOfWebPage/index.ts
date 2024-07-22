import {
  getIframeOrSpecialHostPageContent,
  getReadabilityPageMarkdown,
} from '@/features/chat-base/summary/utils/pageContentHelper'
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

/**
 * 抓取当前网页可读内容并转换为markdown，此action会保留图片视频等信息
 */
export class ActionGetReadabilityMarkdownOfWebPage extends Action {
  static type: ActionIdentifier = 'GET_READABILITY_MARKDOWN_OF_WEBPAGE'
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
      // TODO 如果readability没有抓取到内容需要fallback自定义抓取逻辑
      const result =
        (await getIframeOrSpecialHostPageContent()) ||
        getReadabilityPageMarkdown() ||
        ''
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
