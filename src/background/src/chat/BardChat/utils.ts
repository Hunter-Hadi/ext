import { ofetch } from 'ofetch'

function extractFromHTML(variableName: string, html: string) {
  const regex = new RegExp(`"${variableName}":"([^"]+)"`)
  const match = regex.exec(html)
  return match?.[1]
}

export const fetchBardRequestParams = async () => {
  try {
    const html = await ofetch('https://gemini.google.com/', {
      responseType: 'text',
    })
    const atValue = extractFromHTML('SNlM0e', html)
    const blValue = extractFromHTML('cfb2h', html)
    return { atValue, blValue }
  } catch (e) {
    console.error('fetchBardRequestParams', e)
    return { atValue: '', blValue: '' }
  }
}

export const parseBardResponse = (resp: string) => {
  try {
    const dataList =
      resp.split('\n').filter((str) => str.startsWith(`[["wrb.fr"`)) || []
    const data = JSON.parse(dataList[1] || dataList[0])
    const payload = JSON.parse(data?.[0]?.[2])
    if (!payload) {
      // FIXME: 需要测试所有场景
      // throw new ChatError('Failed to access Bard', ErrorCode.BARD_EMPTY_RESPONSE)
      return {
        text: '',
        error:
          'Please log into [bard.google.com](https://gemini.google.com) and try again.',
        ids: ['', '', ''] as [string, string, string],
      }
    }
    console.debug('bard response payload', payload)
    let text = payload[4][0][1][0] as string
    const images = payload?.[4]?.[0]?.[12]?.[7]?.[0] || []
    if (images.length > 0) {
      images.map((image: any) => {
        const imageUrl = image?.[0]?.[3]?.[3]
        const imageText = image?.[1]?.[0]
        if (imageUrl && imageText) {
          text = text.replace(imageText, `!${imageText}(${imageUrl})`)
        }
      })
    }
    return {
      text,
      error: '',
      ids: [...payload[1], payload[4][0][0]] as [string, string, string],
    }
  } catch (e) {
    console.error('parseBardResponse', e)
    return {
      text: '',
      error: `Something went wrong. Please try again.`,
      ids: ['', '', ''],
    }
  }
}
