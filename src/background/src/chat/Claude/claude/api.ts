import { ClaudeConversation } from '@/background/src/chat/Claude/claude/types'
import { v4 as uuidV4 } from 'uuid'

/**
 * claude.ai api都是基于organizationId的，所以需要先获取organizationId
 */
export const getCaludeOrganizationId = async () => {
  // get https://claude.ai/chats html content
  const chatsHtml = await fetch('https://claude.ai/chats')
  const content = await chatsHtml.text()
  const OrganizationId =
    /organization.{6}uuid.{5}[a-z0-9-]{36}/
      .exec(content)?.[0]
      ?.split('uuid\\":\\"')?.[1] || ''
  return OrganizationId
}
/**
 * 创建一个claude conversation
 * @param organizationId
 * @param name
 */
export const createClaudeConversation = async (
  organizationId: string,
  name?: string,
): Promise<ClaudeConversation | undefined> => {
  try {
    if (!organizationId) {
      return undefined
    }
    const conversationId = uuidV4()
    const response = await fetch(
      `https://claude.ai/api/organizations/${organizationId}/chat_conversations`,
      {
        method: 'POST', // or 'PUT
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name || '',
          uuid: conversationId,
        }),
      },
    )
    if (response.status === 200) {
      const body = await response.json()
      if (body.uuid) {
        return body as ClaudeConversation
      }
      return undefined
    } else {
      // 需要提示用户登陆了
      return undefined
    }
  } catch (e) {
    console.log('create claude conversation error', e)
    return undefined
  }
}

export const deleteClaudeConversation = async (
  organizationId: string,
  conversationId: string,
) => {
  // https://claude.ai/api/organizations/bc0adc4b-2a47-47f6-a476-ff6217ae950d/chat_conversations/85712a39-7d3f-4bb1-9c2f-523e5a57e4e1
  // DELETE
  try {
    const response = await fetch(
      `https://claude.ai/api/organizations/${organizationId}/chat_conversations/${conversationId}`,
      {
        method: 'DELETE',
      },
    )
    if (response.status === 200) {
      return true
    }
    return false
  } catch (e) {
    return false
  }
}
