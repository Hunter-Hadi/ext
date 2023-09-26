export interface IChatGPTConversationRawMappingData {
  id: string
  parent: string
  children: string[]
  message?: {
    id: string
    author: {
      role: string
      metadata: {
        [key: string]: any
      }
    }
    create_time: number
    content: {
      content_type: string
      parts: string[]
    }
    end_turn: boolean
    weight: number
    metadata: {
      model_slug: string
      finish_details: {
        type: string
        stop: string
      }
    }
    recipient: string
  }
}

export const mappingToMessages = (
  currentNode: string,
  mapping: {
    [key: string]: IChatGPTConversationRawMappingData
  },
) => {
  // NOTE: 基于目前的需求，只需要一层结构的Messages
  // 从current_node节点找到root就行
  const messages: Array<{
    messageId: string
    parentMessageId: string
    text: string
  }> = []
  let nodeId = currentNode
  while (mapping[nodeId]) {
    const node = mapping[nodeId]
    if (!node.message) {
      break
    }
    const text = node.message.content.parts.join('')
    if (!text) {
      break
    }
    messages.push({
      messageId: node.id,
      parentMessageId: node.parent,
      text,
    })
    nodeId = node.parent
  }
  console.log('[Daemon Process]: history messages: ', messages)
  return messages
}
