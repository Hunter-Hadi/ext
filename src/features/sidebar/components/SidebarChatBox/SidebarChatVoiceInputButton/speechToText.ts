import { APP_USE_CHAT_GPT_API_HOST } from '@/constants'
import { clientRequestHeaderGenerator } from '@/utils/clientRequestHeaderGenerator'
import { getAccessToken } from '@/utils/request'

/**
 * 语音转文字
 * @param audioFile
 */
export const maxAISpeechToText = async (audioFile: File): Promise<string> => {
  try {
    // /gpt/speech_to_text
    const accessToken = await getAccessToken()
    const formData = new FormData()
    // webm
    formData.append('audio_file', audioFile)
    const result = await fetch(
      `${APP_USE_CHAT_GPT_API_HOST}/gpt/speech_to_text`,
      {
        method: 'POST',
        headers: await clientRequestHeaderGenerator({
          Authorization: `Bearer ${accessToken}`,
        }),
        body: formData,
      },
    )
    const data = (await result.json()) as {
      status: string
      data: {
        speech_text: string
      }
    }
    if (data.status !== 'OK') {
      return ''
    }
    return data?.data?.speech_text || ''
  } catch (e) {
    return ''
  }
}
