export interface IIndexDBAttachment {
  id: string
  messageId: string // 消息ID
  created_at: string // 创建时间
  updated_at: string // 更新时间
  fileSize: number // 文件大小
  fileName: string // 文件名
  fileType: string // 文件类型
  binaryData?: string // 二进制数据
  extractedText?: string // 提取的文本
}
