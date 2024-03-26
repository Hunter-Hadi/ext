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
}> => {
  try {
    const result = await fetch(
      `https://chat.openai.com/backend-api/sentinel/chat-requirements`,
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
      return {
        chatRequirementsToken: data?.token || '',
        dx: data?.arkose?.dx || '',
      }
    }
    return {
      chatRequirementsToken: '',
      dx: '',
    }
  } catch (e) {
    return {
      chatRequirementsToken: '',
      dx: '',
    }
  }
}
export default generateSentinelChatRequirementsToken
