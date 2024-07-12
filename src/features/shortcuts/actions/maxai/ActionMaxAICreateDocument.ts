import { getPageSummaryType } from '@/features/chat-base/summary/utils/pageSummaryHelper'
import {
  IShortcutEngineExternalEngine,
  parametersParserDecorator,
  withLoadingDecorators,
} from '@/features/shortcuts'
import { stopActionMessageStatus } from '@/features/shortcuts/actions/utils/actionMessageTool'
import Action from '@/features/shortcuts/core/Action'
import { templateParserDecorator } from '@/features/shortcuts/decorators'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import { MaxAIDocumentType } from '@/features/shortcuts/types/Extra/MaxAICreateDocumentConfig'

/**
 * @since 2024-07-12
 * @description 创建document逻辑，对于不同docType生成document的逻辑不同
 */
export class ActionMaxAIUploadDocument extends Action {
  static type: ActionIdentifier = 'MAXAI_CREATE_DOCUMENT'

  // 纯文本内容上限 800k
  MAX_UPLOAD_TEXT_TOKENS = 800 * 1000

  isStopAction = false

  constructor(
    id: string,
    type: ActionIdentifier,
    parameters: ActionParameters,
    autoExecute: boolean,
  ) {
    super(id, type, parameters, autoExecute)
  }

  @parametersParserDecorator(['outputTemplate'])
  @templateParserDecorator()
  @withLoadingDecorators()
  async execute(
    params: ActionParameters,
    engine: IShortcutEngineExternalEngine,
  ) {
    const createConfig =
      this.parameters.MaxAICreateDocumentConfig ||
      params.MaxAICreateDocumentConfig

    const conversationEngine = engine.clientConversationEngine
    const conversationId = conversationEngine?.currentConversationId || ''

    if (!createConfig) return

    const maxAIDocument: MaxAIDocumentType = {
      ...createConfig,
    }

    if (createConfig.docType === 'summary') {
      // 根据当前summary类型生成docType
      const pageSummaryType = getPageSummaryType()
      switch (pageSummaryType) {
        case 'PAGE_SUMMARY':
          break
        case 'DEFAULT_EMAIL_SUMMARY':
          break
        case 'PDF_CRX_SUMMARY':
          break
        case 'YOUTUBE_VIDEO_SUMMARY':
          break
        default:
          break
      }
    }

    if (this.isStopAction) return

    if (!(file instanceof File)) {
      // TODO 需要有详细的错误显示
      this.error = 'Sorry, cannot get file'
      return
    }

    if (this.isStopAction) return
  }

  async stop(params: { engine: IShortcutEngineExternalEngine }) {
    this.isStopAction = true
    await stopActionMessageStatus(params)
    return true
  }
}
