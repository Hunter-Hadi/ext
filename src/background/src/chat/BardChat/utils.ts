import { ofetch } from 'ofetch'

function extractFromHTML(variableName: string, html: string) {
  const regex = new RegExp(`"${variableName}":"([^"]+)"`)
  const match = regex.exec(html)
  return match?.[1]
}

export const fetchBardRequestParams = async () => {
  const html = await ofetch('https://bard.google.com/faq')
  const atValue = extractFromHTML('SNlM0e', html)
  const blValue = extractFromHTML('cfb2h', html)
  return { atValue, blValue }
}

export const parseBardResponse = (resp: string) => {
  const data = JSON.parse(resp.split('\n')[3])
  const payload = JSON.parse(data[0][2])
  if (!payload) {
    debugger
    // FIXME: 需要测试所有场景
    // throw new ChatError('Failed to access Bard', ErrorCode.BARD_EMPTY_RESPONSE)
    return {
      text: 'Failed to access Bard',
      ids: ['', '', ''] as [string, string, string],
    }
  }
  console.debug('bard response payload', payload)
  const text = payload[0][0]
  return {
    text,
    ids: [...payload[1], payload[4][0][0]] as [string, string, string],
  }
}
