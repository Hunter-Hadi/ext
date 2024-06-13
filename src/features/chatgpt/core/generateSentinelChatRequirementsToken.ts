import { sha3_512 } from 'js-sha3'
import lodashGet from 'lodash-es/get'
import { v4 as uuidV4 } from 'uuid'
import Browser from 'webextension-polyfill'

import { CHATGPT_WEBAPP_HOST } from '@/constants'

export function getProofConfig() {
  return [
    navigator.hardwareConcurrency + screen.width + screen.height,
    new Date().toString(),
    lodashGet(performance, 'memory.jsHeapSizeLimit', 0),
    0,
    navigator.userAgent,
    '',
    '',
    navigator.language,
    navigator.languages.join(','),
    0,
  ]
}
export const getOpenAIDeviceId = async () => {
  let value = (await Browser.storage.local.get('oai_device_id'))?.[
    'oai_device_id'
  ]
  if (!value) {
    value = uuidV4()
    await Browser.storage.local.set({ oai_device_id: value })
  }
  return value
}

export async function calcProofToken(seed: string, diff: string) {
  const config = getProofConfig()
  const S = performance.now()
  for (let i = 0; i < 5e5; i++) {
    config[3] = i
    config[9] = Math.round(performance.now() - S)
    const jsonData = JSON.stringify(config)
    const base = btoa(
      String.fromCharCode(...new TextEncoder().encode(jsonData)),
    )
    if (sha3_512(seed + base).slice(0, diff.length) <= diff) {
      return base
    }
  }
  return 'wQ8Lk5FbGpA2NcR9dShT6gYjU7VxZ4De'
}

/**
 * 生成sentinel chat requirements token用于openAI的请求头
 * @param jwtToken - 用户的jwt token
 * @param kind - primary_assistant
 * @returns {Promise<{token: string, dx: string}>}
 * @description - token是用在请求头`Openai-Sentinel-Chat-Requirements-Token`里的，dx是用在生成arkose token里
 */
const generateSentinelChatRequirementsToken = async (
  jwtToken: string,
  kind = 'primary_assistant',
): Promise<{
  chatRequirementsToken: string
  dx: string
  proofToken: string
}> => {
  try {
    const p = `gAAAAAC` + (await calcProofToken(Math.random().toString(), '0'))
    const result = await fetch(
      `https://${CHATGPT_WEBAPP_HOST}/backend-api/sentinel/chat-requirements`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({
          p,
        }),
      },
    )
    if (result.status === 200) {
      const data = await result.json()
      const returnObject = {
        chatRequirementsToken: '',
        dx: '',
        proofToken: '',
      }
      returnObject.chatRequirementsToken = data?.token || ''
      if (data?.arkose?.required) {
        returnObject.dx = data?.arkose?.dx || ''
      }
      if (data?.proofofwork?.required) {
        const seed = data.proofofwork.seed
        const difficulty = data.proofofwork.difficulty
        returnObject.proofToken =
          `gAAAAAB` + (await calcProofToken(seed, difficulty))
      }
      return returnObject
    }
    return {
      chatRequirementsToken: '',
      dx: '',
      proofToken: '',
    }
  } catch (e) {
    return {
      chatRequirementsToken: '',
      dx: '',
      proofToken: '',
    }
  }
}
export default generateSentinelChatRequirementsToken
