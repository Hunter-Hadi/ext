import { checkFileTypeIsImage } from '@/background/utils/uplpadFileProcessHelper'
import { APP_USE_CHAT_GPT_API_HOST } from '@/constants'
import { getMaxAIChromeExtensionAccessToken } from '@/features/auth/utils'
import { fetchSSE } from '@/features/chatgpt/core/fetch-sse'
import { clientFetchMaxAIAPI } from '@/features/shortcuts/utils/index'
import { sliceTextByTokens } from '@/features/shortcuts/utils/tokenizer'
import { sha1FileEncrypt } from '@/utils/encryptionHelper'
import { clientSendMaxAINotification } from '@/utils/sendMaxAINotification/client'

export type IUploadDocumentType =
  | 'page_content__webpage'
  | 'page_content__pdf'
  | 'page_content__email'
  | 'page_content__youtube'
  | 'image'
  | 'chat_file'

export type IUploadDocumentEvent =
  | 'document_create' // 这个事件必定会发生，数据库里创建记录
  | 'upload_to_s3'
  | 'embedding_done'
  | 'upload_to_es'
  | 'upload_done' // 这事件必定会发生，上传流程结束
  | 'upload_to_s3_failed'
  | 'embedding_failed'
  | 'upload_to_es_failed'

/**
 * 上传document参数
 */
export type IUploadDocumentPayload = {
  link?: string
  pure_text?: string
  tokens?: number
  doc_id?: string
  doc_type?: IUploadDocumentType
  project_content_type?: 'page_content'
  file: File
}

/**
 * 上传document响应消息
 */
export type IUploadDocumentMessage = {
  event: IUploadDocumentEvent
  data: {
    s3?: {
      doc_url?: string
      expires?: number
    }
  }
}

/**
 * 获取document数据
 */
export type IGetDocumentData = {
  s3: { doc_url?: string; expires?: number }
}

/**
 * 上传document后封装结果，upload_done
 */
export type IUploadDocumentResponse = {
  doc_id: string
  doc_url: string
  success: boolean
  error: string
  expires?: number
}

/**
 * 上传document事件监听
 */
export type IUploadDocumentListener = (message: IUploadDocumentMessage) => void

/**
 * 判断当前docId是否存在
 * @param docId
 * @param accessToken
 */
export const checkDocIdExist = async (docId: string, accessToken?: string) => {
  if (!accessToken) {
    accessToken = await getMaxAIChromeExtensionAccessToken()
  }
  const result = await clientFetchMaxAIAPI<{
    msg: string
    status: string
    data?: { exists: boolean }
  }>(`${APP_USE_CHAT_GPT_API_HOST}/app/check_document_by_id`, {
    doc_id: docId,
  })
  return Boolean(result.data?.data?.exists)
}

/**
 * 上传document
 * @param body
 * @param listener
 * @param onlyCheck 仅checkDocument是否存在不调用getDocument
 */
export const uploadMaxAIDocument = async (
  body: IUploadDocumentPayload,
  listener?: IUploadDocumentListener,
  onlyCheck?: boolean,
) => {
  const accessToken = await getMaxAIChromeExtensionAccessToken()
  const docId = body.doc_id || (await sha1FileEncrypt(body.file))
  const uploadResponse: IUploadDocumentResponse = {
    doc_id: docId,
    doc_url: '',
    success: false,
    error: '',
  }
  if (!accessToken) {
    uploadResponse.success = false
    uploadResponse.error = 'Please login to continue.'
    return uploadResponse
  }
  if (await checkDocIdExist(docId, accessToken)) {
    if (!onlyCheck) {
      const result = await getMaxAIDocument(docId)
      uploadResponse.doc_url = result?.s3?.doc_url || ''
      uploadResponse.expires = result?.s3?.expires
    }
    uploadResponse.success = true
    return uploadResponse
  }
  const formData = new FormData()
  if (!body.doc_type) {
    if (checkFileTypeIsImage(body.file)) {
      body.doc_type = 'image'
    } else {
      body.doc_type = 'chat_file'
    }
  }
  if (body.file.type === 'application/pdf' || body.file.name.endsWith('.pdf')) {
    body.doc_type = 'page_content__pdf'
  }
  if (body.pure_text && !body.tokens) {
    const { text: sliceText, tokens } = await sliceTextByTokens(
      body.pure_text,
      800 * 1000, // 纯文本内容上限 800k
      { thread: 4, partOfTextLength: 20 * 1000 },
    )
    body.pure_text = sliceText
    body.tokens = tokens
  }
  formData.append('doc_id', docId)
  formData.append('doc_type', body.doc_type)
  formData.append('pure_text', body.pure_text || '')
  formData.append('tokens', (body.tokens || 0) as any)
  formData.append('file', body.file)
  formData.append(
    'project_content_type',
    body.project_content_type || 'page_content',
  )
  if (body.link) {
    formData.append('link', body.link)
  }
  // TODO fetch-sse有冗余，后续要拆出通用方法，chatgpt/core/fetch-sse searchWithAI/chatCore/chatgpt/core/fetch-sse
  await fetchSSE(`${APP_USE_CHAT_GPT_API_HOST}/app/upload_document`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
    onMessage: (message) => {
      console.log('TEST upload document message', message)
      try {
        const uploadMessage = JSON.parse(message) as IUploadDocumentMessage
        if (uploadMessage.event) {
          listener?.(uploadMessage)
        }
        if (uploadMessage.event === 'upload_done') {
          uploadResponse.doc_url = uploadMessage.data.s3?.doc_url || ''
          uploadResponse.expires = uploadMessage.data.s3?.expires
          uploadResponse.success = true
        }
      } catch (e) {
        console.error(e)
      }
    },
    provider: '' as any,
  }).catch((error) => {
    try {
      error = JSON.parse(error.message || error)
    } catch (e) {
      // parser error
    }
    console.error('MaxAIDocument upload error', error)
    uploadResponse.success = false
    uploadResponse.error =
      error?.message || error?.detail || error?.toString() || 'unknown error'
    clientSendMaxAINotification(
      'MAXAI_API',
      '[API] [/app/upload_document] error',
      JSON.stringify(
        {
          error: uploadResponse.error,
        },
        null,
        2,
      ),
      {
        uuid: '6f02f533-def6-4696-b14e-1b00c2d9a4df',
      },
    )
  })
  return uploadResponse
}

/**
 * 获取document
 * @param docId
 */
export const getMaxAIDocument = async (docId: string) => {
  const result = await clientFetchMaxAIAPI<{
    msg: string
    status: string
    data?: IGetDocumentData
  }>(`${APP_USE_CHAT_GPT_API_HOST}/app/get_document`, {
    doc_id: docId,
  })
  if (result.data?.data) {
    return result.data.data
  }
  return null
}
