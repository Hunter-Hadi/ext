import { IChatGPTConversationRawMappingData } from '@/features/chatgpt'

export const mappingToMessages = (
  currentNode: string,
  mapping: {
    [key: string]: IChatGPTConversationRawMappingData
  },
) => {
  // TODO - 基于目前的需求，只需要一层结构的Messages
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
  console.log('[Daemon process]: history messages: ', messages)
  return messages
}
