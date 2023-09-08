import { APP_USE_CHAT_GPT_API_HOST } from '@/constants'
import { getAccessToken } from '@/utils/request'
import { md5TextEncrypt } from '@/utils/encryptionHelper'
import { sendLarkBotMessage } from '@/utils/larkBot'

export const MaxUploadTxtFileSize = 1024 * 1024 * 32 // 32MB
export const MaxUploadTxtFileTokens = 400 * 1000 // 400k

export const stringConvertTxtUpload = async (
  text: string,
  filename?: string,
) => {
  const accessToken = await getAccessToken()
  return new Promise<string>((resolve) => {
    const file = new File([text], filename || 'file.txt', {
      type: 'text/plain',
    })
    const formData = new FormData()
    formData.append('file', file, file.name.replace(/\.pdf$/, '.txt'))
    formData.append('doc_id', md5TextEncrypt(text))
    fetch(`${APP_USE_CHAT_GPT_API_HOST}/gpt/analyze_file`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    })
      .then((response) => response.json())
      .then((result) => {
        const docId = result?.data?.doc_id || ''
        if (!docId) {
          sendLarkBotMessage(
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
        sendLarkBotMessage(
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
