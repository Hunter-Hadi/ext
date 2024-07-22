import { isPlainObject } from 'lodash-es'

import { IChatUploadFile } from '@/features/indexed_db/conversations/models/Message'
import { md5TextEncrypt } from '@/features/security'
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
import { uploadMaxAIDocument } from '@/features/shortcuts/utils/maxAIDocument'
import { sliceTextByTokens } from '@/features/shortcuts/utils/tokenizer'
import { sha1FileEncrypt } from '@/utils/encryptionHelper'

/**
 * @since 2024-07-12
 * @description 上传相关document
 */
export class ActionMaxAIUploadDocument extends Action {
  static type: ActionIdentifier = 'MAXAI_UPLOAD_DOCUMENT'

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
    const documentConfig =
      this.parameters.MaxAIDocumentActionConfig ||
      params.MaxAIDocumentActionConfig

    const conversationEngine = engine.clientConversationEngine
    const conversationId = conversationEngine?.currentConversationId || ''

    if (!documentConfig) return
    if (this.isStopAction) return

    const conversation = await conversationEngine?.getCurrentConversation()

    if (this.isStopAction) return

    const { link, pureText, docType } = documentConfig
    let file = documentConfig.file

    const text = pureText || this.parameters.compliedTemplate || ''

    const { text: sliceText, tokens } = await sliceTextByTokens(
      text,
      this.MAX_UPLOAD_TEXT_TOKENS,
      {
        thread: 4,
        partOfTextLength: 20 * 1000,
      },
    )

    if (this.isStopAction) return

    if (docType === 'webpage' || docType === 'email') {
      // webpage的file里存储内容为{ pureTextMD5, readabilityMarkdown }
      const pureTextMD5 = md5TextEncrypt(sliceText)
      const readabilityMarkdown =
        (file as any)?.readabilityMarkdown || sliceText || ''
      const jsonData = { pureTextMD5, readabilityMarkdown }
      const jsonBlob = new Blob([JSON.stringify(jsonData)], {
        type: 'application/json',
      })
      file = new File([jsonBlob], 'data.json', { type: 'application/json' })
    } else if (docType === 'pdf') {
      // pdf需要针对处理，如果文件大于32MB，后端会报错，前端按照json上传不影响用户summary和chat
      if (file instanceof File) {
        if (file.size >= 32 * 1024 * 1024) {
          // 文件大于32mb，会上传失败，不影响后续chat这里file裁剪成json
          const pureTextMD5 = md5TextEncrypt(sliceText)
          const jsonData = { pureTextMD5 }
          const jsonBlob = new Blob([JSON.stringify(jsonData)], {
            type: 'application/json',
          })
          file = new File([jsonBlob], 'data.json', { type: 'application/json' })
        }
      }
    } else if (docType === 'youtube') {
      // youtube的file里格式化存储内容
      const comments = (file as any).comments || []
      const transcripts = (file as any).transcripts || []
      const jsonData = { ...file, comments, transcripts }
      const jsonBlob = new Blob([JSON.stringify(jsonData)], {
        type: 'application/json',
      })
      file = new File([jsonBlob], 'data.json', { type: 'application/json' })
    }

    if (isPlainObject(file)) {
      const jsonData = { ...file }
      const jsonBlob = new Blob([JSON.stringify(jsonData)], {
        type: 'application/json',
      })
      file = new File([jsonBlob], 'data.json', { type: 'application/json' })
    }

    if (!(file instanceof File)) {
      // TODO 需要有详细的错误显示
      this.error = 'Sorry, cannot get file'
      return
    }

    const docId = documentConfig.docId || (await sha1FileEncrypt(file))
    const onlyCheck = ['webpage', 'email', 'youtube'].includes(docType || '')

    if (this.isStopAction) return

    await new Promise((resolve) => {
      uploadMaxAIDocument(
        {
          link,
          pure_text: sliceText,
          tokens,
          doc_id: docId,
          doc_type: docType as any,
          file: file as File,
        },
        (message) => {
          if (
            documentConfig.doneType === 'document_create' &&
            message.event === 'document_create'
          ) {
            resolve(docId)
          }
          if (
            documentConfig.doneType === 'upload_done' &&
            message.event === 'upload_done'
          ) {
            resolve(docId)
          }
        },
        onlyCheck,
      )
        .then(async (result) => {
          if (result.success && result.doc_url) {
            // 有doc_url说明需要更新attachments
            // 大于32mb的pdf不需要存储，因为上方已经拆分成纯json文件
            if (
              docType !== 'pdf' ||
              (docType === 'pdf' && (file as File).type.includes('pdf'))
            ) {
              const uploadedFile: IChatUploadFile = {
                id: result.doc_id,
                fileName: (file as File).name,
                fileType: (file as File).type,
                fileSize: (file as File).size,
                uploadedFileId: result.doc_id,
                uploadProgress: 100,
                uploadedUrl: result.doc_url,
              }
              await conversationEngine?.updateConversation(
                {
                  meta: {
                    attachments: [uploadedFile],
                  },
                },
                conversationId,
                true,
              )
            }
          }
          resolve(docId)
        })
        .catch((err) => {
          resolve('')
        })
    })

    if (this.isStopAction) return

    // 更新conversation里的docId
    if (conversation?.type === 'Summary') {
      await conversationEngine?.updateConversation(
        {
          meta: {
            pageSummary: {
              docId,
              // 新版本替换掉conversation里的content内容，减小大小
              content: '',
            },
            // 新版本替换掉原先前端存储的prompt，减小大小
            systemPrompt: '',
          },
        },
        conversationId,
        true,
      )
    }

    this.output = docId
  }

  async stop(params: { engine: IShortcutEngineExternalEngine }) {
    this.isStopAction = true
    await stopActionMessageStatus(params)
    return true
  }
}
