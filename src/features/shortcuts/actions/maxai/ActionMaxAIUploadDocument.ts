import {
  IShortcutEngineExternalEngine,
  withLoadingDecorators,
} from '@/features/shortcuts'
import Action from '@/features/shortcuts/core/Action'
import { templateParserDecorator } from '@/features/shortcuts/decorators'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import { uploadMaxAIDocument } from '@/features/shortcuts/utils/maxAIDocument'
import { sha1FileEncrypt } from '@/utils/encryptionHelper'

/**
 * @since 2024-07-12
 * @description 上传相关document
 */
export class ActionMaxAIUploadDocument extends Action {
  static type: ActionIdentifier = 'MAXAI_UPLOAD_DOCUMENT'
  constructor(
    id: string,
    type: ActionIdentifier,
    parameters: ActionParameters,
    autoExecute: boolean,
  ) {
    super(id, type, parameters, autoExecute)
  }
  @templateParserDecorator()
  @withLoadingDecorators()
  async execute(
    params: ActionParameters,
    engine: IShortcutEngineExternalEngine,
  ) {
    const uploadConfig =
      this.parameters.MaxAIUploadDocumentConfig ||
      params.MaxAIUploadDocumentConfig

    if (!uploadConfig?.file) {
      // 没有内容
      this.output = ''
      return
    }

    const docId =
      uploadConfig.doc_id || (await sha1FileEncrypt(uploadConfig.file))

    await new Promise((resolve) => {
      uploadMaxAIDocument(uploadConfig, (message) => {
        if (
          uploadConfig.doneType === 'document_create' &&
          message.event === 'document_create'
        ) {
          resolve(docId)
        }
        if (
          uploadConfig.doneType === 'upload_done' &&
          message.event === 'upload_done'
        ) {
          resolve(docId)
        }
      })
        .then((result) => {
          resolve(docId)
        })
        .catch((err) => {
          resolve('')
        })
    })

    this.output = docId
  }
}
