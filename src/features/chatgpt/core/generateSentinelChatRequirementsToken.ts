/**
 * 生成sentinel chat requirements token用于openAI的请求头
 * @param token
 * @param kind
 */
const generateSentinelChatRequirementsToken = async (
  token: string,
  kind = 'conversation_mode_kind',
) => {
  try {
    const result = await fetch(
      `https://chat.openai.com/backend-api/sentinel/chat-requirements`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          conversation_mode_kind: kind,
        }),
      },
    )
    if (result.status === 200) {
      const data = await result.json()
      return data.token || ''
    }
    return ''
  } catch (e) {
    return ''
  }
}
export default generateSentinelChatRequirementsToken
