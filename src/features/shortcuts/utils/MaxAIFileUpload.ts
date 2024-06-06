import { getAccessToken } from '@/background/api/backgroundFetch'
import { APP_USE_CHAT_GPT_API_HOST } from '@/constants'
import { clientSendMaxAINotification } from '@/utils/sendMaxAINotification/client'
// 上传的文件用途
export type MaxAIFileUploadUseCase =
  // 总结
  | 'summary'
  // 多模态
  | 'multimodal'
  // 提取文本的文档
  | 'extracted_doc'
export type MaxAIFileUploadResponse = {
  file_id: string
  file_url: string
  error: string
  success: boolean
}

/**
 * MaxAI上传文件
 * @param file
 * @param options
 */
export const maxAIFileUpload = async (
  file: File,
  options: {
    useCase: MaxAIFileUploadUseCase
    filename?: string
  },
) => {
  const { useCase, filename = file.name } = options
  const accessToken = await getAccessToken()
  // eslint-disable-next-line no-async-promise-executor
  return new Promise<MaxAIFileUploadResponse>(async (resolve) => {
    if (!accessToken) {
      console.error('accessToken is empty')
      resolve({
        file_url: '',
        file_id: '',
        success: false,
        error: 'Please login to continue.',
      })
    }
    const formData = new FormData()
    formData.append('file', file)
    formData.append('file_name', filename)
    formData.append('use_case', useCase)
    fetch(`${APP_USE_CHAT_GPT_API_HOST}/app/upload_file`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    })
      .then((response) => response.json())
      .then((result) => {
        if (
          result.status === 'OK' &&
          result.data?.file_id &&
          result.data?.file_url
        ) {
          resolve({
            success: true,
            error: '',
            file_id: result.data.file_id,
            file_url: result.data.file_url,
          })
          return
        }
        console.error('文件上传错误:', result)
        resolve({
          file_url: '',
          file_id: '',
          success: false,
          error: 'Failed to upload file',
        })
      })
      .catch((error) => {
        console.error('文件上传错误:', error)
        clientSendMaxAINotification(
          'MAXAI_API',
          '[API] [/gpt/analyze_file] error',
          JSON.stringify(
            {
              error: error?.message || error?.toString() || 'unknown error',
            },
            null,
            2,
          ),
          {
            uuid: '6f02f533-def6-4696-b14e-1b00c2d9a4df',
          },
        )
        resolve({
          file_url: '',
          file_id: '',
          success: false,
          error: 'Failed to upload file',
        })
      })
  })
}
