import { IUploadDocumentPayload } from '@/features/shortcuts/utils/maxAIDocument'
import { ICommentData } from '@/features/shortcuts/utils/socialMedia/SocialMediaPostContext'

// 完成时机，document_create或者upload_done
export type MaxAIUploadDocumentDoneType = 'document_create' | 'upload_done'

export interface MaxAIUploadDocumentConfig {
  // 网页链接
  link?: string
  // 纯文本内容
  pureText: string
  // docId
  docId?: string
  // docType
  docType: IUploadDocumentPayload['doc_type']
  // 完成类型
  doneType: MaxAIUploadDocumentDoneType
  // 文件，如果是json会转成json file
  file?:
    | File // image/chat_file/pdf传递文件
    | {
        // webpage/email传递参数
        readabilityMarkdown: string
      }
    | {
        // youtube传递参数
        content: string
        author: string
        date: string
        title: string
        comments: ICommentData[]
        transcripts: { start: string; text: string }[]
      }
}
