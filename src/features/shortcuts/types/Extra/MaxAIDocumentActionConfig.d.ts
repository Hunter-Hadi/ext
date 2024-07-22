import { IUploadDocumentPayload } from '@/features/shortcuts/utils/maxAIDocument'

export interface MaxAIDocumentActionConfig {
  // 网页链接
  link?: string
  // 纯文本内容
  pureText?: string
  // 纯文本tokens
  tokens?: number
  // docId
  docId?: string
  // docType 新增summary，为summary的时候会自动根据当前页面类型创建doc
  docType: IUploadDocumentPayload['doc_type'] | 'summary'
  // 上传结束响应事件
  doneType: 'document_create' | 'upload_done'
  // 文件，如果是json会转成json file
  file?:
    | File
    | {
        [key: string]: any
      }
}
