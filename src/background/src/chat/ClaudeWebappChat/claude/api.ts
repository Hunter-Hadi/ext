import { v4 as uuidV4 } from 'uuid'

import { ClaudeAttachment, ClaudeConversation } from './types'

/**
 * claude.ai api都是基于organizationId的，所以需要先获取organizationId
 */
export const getClaudeOrganizationId = async () => {
  try {
    const response = await fetch('https://claude.ai/api/organizations', {
      redirect: 'error',
      cache: 'no-cache',
    })
    const organization = await response.json()
    return organization?.[0]?.uuid
  } catch (e) {
    return ''
  }
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
    if (response.status === 201 || response.status === 200) {
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

export const getAllClaudeConversations = async (organizationId: string) => {
  // https://claude.ai/api/organizations/bc0adc4b-2a47-47f6-a476-ff6217ae950d/chat_conversations
  try {
    const response = await fetch(
      `https://claude.ai/api/organizations/${organizationId}/chat_conversations`,
      {
        method: 'GET',
      },
    )
    if (response.status === 200) {
      const body = await response.json()
      if (body.length) {
        return body as ClaudeConversation[]
      }
      return []
    }
    return []
  } catch (e) {
    console.log('get all claude conversations error', e)
    return []
  }
}

/**
 * 用来批量删除创建的conversation
 * @param organizationId
 * @param conversationName
 */
export const removeAllCacheClaudeConversation = async (
  organizationId: string,
  conversationName: string,
) => {
  let allClaudeConversations = await getAllClaudeConversations(organizationId)
  allClaudeConversations = allClaudeConversations.filter(
    (conversation) => conversation.name === conversationName,
  )
  console.log('allClaudeConversations', allClaudeConversations)
  // promise.all 5个一组 延迟5s
  let deleteConversationIdGroup: string[] = []
  while (allClaudeConversations.length) {
    deleteConversationIdGroup = allClaudeConversations
      .splice(0, 5)
      .map((conversation) => conversation.uuid)
    await Promise.all(
      deleteConversationIdGroup.map((conversationId) =>
        deleteClaudeConversation(organizationId, conversationId),
      ),
    )
    await new Promise((resolve) => setTimeout(resolve, 5000))
  }
  console.log('delete all cache Conversation end')
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
    if (response.status === 204 || response.status === 200) {
      return true
    }
    return false
  } catch (e) {
    return false
  }
}

export const uploadClaudeAttachment = async (
  organizationId: string,
  file: File | Blob,
  fileName?: string,
): Promise<{
  success: boolean
  data: ClaudeAttachment | undefined
  error: string
}> => {
  const formData = new FormData()
  formData.append('file', file, fileName || (file as File)?.name || '')
  formData.append('orgUuid', organizationId)
  const response = await fetch('https://claude.ai/api/convert_document', {
    method: 'POST',
    body: formData,
  })
  if (response.status === 200) {
    const body = await response.json()
    if (body.extracted_content) {
      body.file_name = fileName || (file as File)?.name || body.file_name || ''
      return {
        success: true,
        data: body as ClaudeAttachment,
        error: '',
      }
    }
  }
  let errorMessage = 'Upload failed.'
  if (response.status === 429) {
    errorMessage = 'Exceeded file upload rate limit'
  }
  return {
    success: false,
    data: undefined,
    error: errorMessage,
  }
}
