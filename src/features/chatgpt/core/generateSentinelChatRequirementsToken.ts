import { sha3_512 } from 'js-sha3'

import { CHATGPT_WEBAPP_HOST } from '@/constants'

function getProofConfig() {
  return [
    navigator.hardwareConcurrency + screen.width + screen.height,
    new Date().toString(),
    4294705152,
    0,
    navigator.userAgent,
  ]
}
export async function calcProofToken(seed: string, diff: string) {
  const config = getProofConfig()

  for (let i = 0; i < 1e5; i++) {
    config[3] = i
    const jsonData = JSON.stringify(config)
    const base = btoa(
      String.fromCharCode(...new TextEncoder().encode(jsonData)),
    )
    const hashHex = sha3_512(seed + base)
    console.debug('POW', i, base, hashHex)
    if (hashHex.slice(0, diff.length) <= diff) {
      return 'gAAAAAB' + base
    }
  }

  const base = btoa(seed)
  return 'gAAAAABwQ8Lk5FbGpA2NcR9dShT6gYjU7VxZ4D' + base
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
    const result = await fetch(
      `https://${CHATGPT_WEBAPP_HOST}/backend-api/sentinel/chat-requirements`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({
          conversation_mode_kind: kind,
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
        returnObject.proofToken = await calcProofToken(seed, difficulty)
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
