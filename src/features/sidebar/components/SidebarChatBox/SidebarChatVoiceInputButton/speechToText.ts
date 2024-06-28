import { APP_USE_CHAT_GPT_API_HOST } from '@/constants'
import { clientRequestHeaderGenerator } from '@/utils/clientRequestHeaderGenerator'
import { getAccessToken } from '@/utils/request'

const TRANSCRIPTION_TIMEOUT = 30 * 1000

/**
 * 语音转文字
 * @param audioFile
 */
export const maxAISpeechToText = async (
  audioFile: File,
): Promise<{
  status: 'success' | 'error' | 'timeout'
  data: {
    speechText: string
  }
}> => {
  try {
    // /gpt/speech_to_text
    const accessToken = await getAccessToken()
    const formData = new FormData()
    // webm
    formData.append('audio_file', audioFile)
    const controller = new AbortController()
    const signal = controller.signal
    const headers = await clientRequestHeaderGenerator({
      Authorization: `Bearer ${accessToken}`,
    })
    return new Promise((resolve) => {
      // 30s 超时
      const timer = setTimeout(() => {
        controller.abort()
      }, TRANSCRIPTION_TIMEOUT)
      fetch(`${APP_USE_CHAT_GPT_API_HOST}/gpt/speech_to_text`, {
        signal,
        method: 'POST',
        headers,
        body: formData,
      })
        .then(async (result) => {
          clearTimeout(timer)
          const data = (await result.json()) as {
            status: string
            data: {
              speech_text: string
            }
          }
          if (data.status !== 'OK') {
            resolve({
              status: 'error',
              data: {
                speechText: '',
              },
            })
          }
          resolve({
            status: 'success',
            data: {
              speechText: data?.data?.speech_text || '',
            },
          })
        })
        .catch((error) => {
          // 判断是否是abort
          if (error.name === 'AbortError') {
            resolve({
              status: 'timeout',
              data: {
                speechText: '',
              },
            })
            return
          }
          clearTimeout(timer)
          resolve({
            status: 'error',
            data: {
              speechText: '',
            },
          })
        })
    })
  } catch (e) {
    return {
      status: 'error',
      data: {
        speechText: '',
      },
    }
  }
}
