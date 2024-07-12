import { IUploadDocumentPayload } from '@/features/shortcuts/utils/maxAIDocument'

// 完成时机，document_create或者upload_done
export type MaxAIUploadDocumentDoneType = 'document_create' | 'upload_done'

export interface MaxAIUploadDocumentConfig extends IUploadDocumentPayload {
  doneType: MaxAIUploadDocumentDoneType
}
