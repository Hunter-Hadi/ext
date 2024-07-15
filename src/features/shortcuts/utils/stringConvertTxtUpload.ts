import { APP_USE_CHAT_GPT_API_HOST, isProduction } from '@/constants'
import { getMaxAIChromeExtensionAccessToken } from '@/features/auth/utils'
import { md5TextEncrypt } from '@/features/security'
import maxAIClientSafeFetch from '@/utils/maxAIClientSafeFetch'
import { clientSendMaxAINotification } from '@/utils/sendMaxAINotification/client'

// export const MaxUploadTxtFileSize = 1024 * 1024 * 32 // 32MB
export const MAX_UPLOAD_TEXT_FILE_TOKENS = 400 * 1000 // 400k

export const createDocId = (text: string) => {
  return md5TextEncrypt(text)
}

export const checkDocIdExist = async (accessToken: string, docId: string) => {
  return new Promise<boolean>((resolve) => {
    maxAIClientSafeFetch(`${APP_USE_CHAT_GPT_API_HOST}/gpt/check_doc_exists`, {
      method: 'POST',
      body: JSON.stringify({
        doc_id: docId,
      }),
    })
      .then((response) => response.json())
      .then((result) => {
        if (isProduction) {
          resolve(result?.data?.exists || false)
          return
        }
        resolve(false)
      })
      .catch((e) => {
        resolve(false)
      })
  })
}

export const stringConvertTxtUpload = async (
  text: string,
  filename?: string,
) => {
  const accessToken = await getMaxAIChromeExtensionAccessToken()
  // eslint-disable-next-line no-async-promise-executor
  return new Promise<string>(async (resolve) => {
    const docId = createDocId(text)
    // 查看docId是否存在
    if (await checkDocIdExist(accessToken, docId)) {
      resolve(docId)
      return
    }
    const file = new File([text], filename || 'file.txt', {
      type: 'text/plain',
    })
    const formData = new FormData()
    formData.append('file', file, file.name.replace(/\.pdf$/, '.txt'))
    formData.append('doc_id', docId)
    maxAIClientSafeFetch(`${APP_USE_CHAT_GPT_API_HOST}/gpt/analyze_file`, {
      method: 'POST',
      body: formData,
    })
      .then((response) => response.json())
      .then((result) => {
        const docId = result?.data?.doc_id || ''
        if (!docId) {
          clientSendMaxAINotification(
            'MAXAI_API',
            '[API] [/gpt/analyze_file] error',
            JSON.stringify(
              {
                error: 'response docId is empty',
              },
              null,
              2,
            ),
            {
              uuid: '6f02f533-def6-4696-b14e-1b00c2d9a4df',
            },
          )
        }
        resolve(docId)
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
        resolve('')
      })
  })
}
