import { IUploadDocumentPayload } from '@/features/shortcuts/utils/maxAIDocument'

/**
 * 生成的document类型
 */
export interface MaxAIDocumentType {
  link: string
  pureText: string
  tokens: number
  docId: string
  docType: IUploadDocumentPayload['doc_type']
  projectContentType: IUploadDocumentPayload['project_content_type']
  file: File
}

/**
 * 生成document的参数
 */
export interface MaxAICreateDocumentConfig extends Partial<MaxAIDocumentType> {
  docType: IUploadDocumentPayload['doc_type'] | 'summary'
}

export type MaxAICreateDocumentConfig =
  | Partial<MaxAIDocumentType>
  | {
      docType: 'summary'
    }
