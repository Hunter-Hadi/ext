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

/**
 * @since 2024-07-12
 * @description 创建document逻辑，对于不同docType生成document的逻辑不同
 * TODO 1. summary类型根据url读取缓存里的内容
 * TODO 2. 未过期读取缓存的doc上下文上传doc
 * TODO 3. 过期重新执行对应actions上传doc
 */
export class ActionMaxAICreateDocument extends Action {
  static type: ActionIdentifier = 'MAXAI_CREATE_DOCUMENT'

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
    const documentConfig =
      this.parameters.MaxAIDocumentActionConfig ||
      params.MaxAIDocumentActionConfig

    if (!documentConfig) {
      return
    }

    const { clientConversationEngine, shortcutsEngine } = engine
    const conversationId = clientConversationEngine?.currentConversationId || ''

    console.log(conversationId)

    const docType =
      documentConfig.docType === 'summary'
        ? this.getSummaryDocType()
        : documentConfig.docType

    switch (docType) {
      case 'page_content__webpage':
        shortcutsEngine?.pushActions(
          [
            {
              type: 'GET_READABILITY_CONTENTS_OF_WEBPAGE',
              parameters: {},
            },
            {
              type: 'SET_VARIABLE',
              parameters: {
                VariableName: 'READABILITY_CONTENTS',
              },
            },
            {
              type: 'GET_READABILITY_MARKDOWN_OF_WEBPAGE',
              parameters: {},
            },
            {
              type: 'SET_VARIABLE',
              parameters: {
                VariableName: 'READABILITY_MARKDOWN',
              },
            },
            {
              type: 'MAXAI_UPLOAD_DOCUMENT',
              parameters: {
                MaxAIDocumentActionConfig: {
                  link: '{{CURRENT_WEBPAGE_URL}}',
                  pureText: '{{READABILITY_CONTENTS}}',
                  docType: 'page_content__webpage',
                  doneType: 'document_create',
                  file: {
                    readabilityMarkdown: '{{READABILITY_MARKDOWN}}',
                  },
                },
              },
            },
          ],
          'after',
        )
        break
      case 'page_content__email':
        shortcutsEngine?.pushActions(
          [
            {
              type: 'GET_EMAIL_CONTENTS_OF_WEBPAGE',
              parameters: {},
            },
            {
              type: 'SET_VARIABLE',
              parameters: {
                VariableName: 'READABILITY_CONTENTS',
              },
            },
            {
              type: 'MAXAI_UPLOAD_DOCUMENT',
              parameters: {
                MaxAIDocumentActionConfig: {
                  link: '{{CURRENT_WEBPAGE_URL}}',
                  pureText: '{{READABILITY_CONTENTS}}',
                  docType: 'page_content__email',
                  doneType: 'document_create',
                  file: {
                    readabilityMarkdown: '{{READABILITY_CONTENTS}}',
                  },
                },
              },
            },
          ],
          'after',
        )
        break
      case 'page_content__pdf':
        shortcutsEngine?.pushActions(
          [
            {
              type: 'GET_PDF_FILE_OF_CRX',
              parameters: {},
            },
            {
              type: 'SET_VARIABLE',
              parameters: {
                VariableName: 'PDF_FILE',
              },
            },
            {
              type: 'GET_PDF_CONTENTS_OF_CRX',
              parameters: {},
            },
            {
              type: 'SET_VARIABLE',
              parameters: {
                VariableName: 'READABILITY_CONTENTS',
              },
            },
            {
              type: 'TEXT_HANDLER',
              parameters: {
                ActionTextHandleParameters: {
                  trim: true,
                },
              },
            },
            {
              type: 'SCRIPTS_CONDITIONAL',
              parameters: {
                WFFormValues: {
                  Value: '',
                  WFSerializationType: 'WFDictionaryFieldValue',
                },
                WFCondition: 'Equals',
                WFConditionalIfTrueActions: [
                  // 无PDF内容
                ],
                WFConditionalIfFalseActions: [
                  // 有PDF内容
                  {
                    type: 'MAXAI_UPLOAD_DOCUMENT',
                    parameters: {
                      MaxAIDocumentActionConfig: {
                        pureText: '{{READABILITY_CONTENTS}}',
                        docType: 'page_content__pdf',
                        doneType: 'document_create',
                        file: '{{PDF_FILE}}' as any,
                      },
                    },
                  },
                ],
              },
            },
          ],
          'after',
        )
        break
      case 'page_content__youtube':
        shortcutsEngine?.pushActions(
          [
            {
              type: 'GET_SOCIAL_MEDIA_POST_CONTENT_OF_WEBPAGE',
              parameters: {
                OperationElementSelector: 'ytd-watch-metadata #title',
              },
            },
            {
              type: 'GET_YOUTUBE_TRANSCRIPT_OF_URL',
              parameters: {},
            },
            {
              type: 'SET_VARIABLE',
              parameters: {
                VariableName: 'YOUTUBE_TRANSCRIPTS',
              },
            },
            {
              type: 'MAXAI_UPLOAD_DOCUMENT',
              parameters: {
                MaxAIDocumentActionConfig: {
                  link: '{{CURRENT_WEBPAGE_URL}}',
                  pureText: '',
                  docType: 'page_content__youtube',
                  doneType: 'document_create',
                  file: {
                    description: '{{SOCIAL_MEDIA_POST_CONTENT}}',
                    author: '{{SOCIAL_MEDIA_POST_AUTHOR}}',
                    date: '{{SOCIAL_MEDIA_POST_DATE}}',
                    title: '{{SOCIAL_MEDIA_POST_TITLE}}',
                    comments: '{{SOCIAL_MEDIA_TARGET_POST_OR_COMMENTS}}',
                    transcripts: '{{YOUTUBE_TRANSCRIPTS}}',
                  },
                },
              },
            },
          ],
          'after',
        )
        break
    }

    if (this.isStopAction) return
  }

  getSummaryDocType() {
    const summaryType = getPageSummaryType()
    switch (summaryType) {
      case 'DEFAULT_EMAIL_SUMMARY':
        return 'page_content__email'
      case 'PDF_CRX_SUMMARY':
        return 'page_content__pdf'
      case 'YOUTUBE_VIDEO_SUMMARY':
        return 'page_content__youtube'
      case 'PAGE_SUMMARY':
      default:
        return 'page_content__webpage'
    }
  }

  async stop(params: { engine: IShortcutEngineExternalEngine }) {
    this.isStopAction = true
    await stopActionMessageStatus(params)
    return true
  }
}
