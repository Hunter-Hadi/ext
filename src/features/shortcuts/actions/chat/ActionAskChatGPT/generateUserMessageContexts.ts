import { orderBy } from 'lodash-es'

import { IUserChatMessageExtraMetaContextType } from '@/features/chatgpt/types'
import { IShortCutsParameter } from '@/features/shortcuts/hooks/useShortCutsParameters'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'

const generateUserMessageContexts = (
  shortCutsParameters: Record<string, IShortCutsParameter>,
  promptText: string,
): IUserChatMessageExtraMetaContextType[] => {
  const contextMap: Map<
    string,
    IUserChatMessageExtraMetaContextType
  > = new Map()
  const customVariables = Object.keys(shortCutsParameters).filter(
    (key) => shortCutsParameters[key].isBuildIn !== true,
  )
  customVariables.forEach((key) => {
    const value = shortCutsParameters[key]?.value
    if (typeof value === 'string' && !contextMap.has(key)) {
      contextMap.set(key, {
        type: 'text',
        key: shortCutsParameters[key].label || key,
        value,
      })
    }
  })
  // 特殊的上下文的key
  const specialContextKeyMap: {
    [key in keyof ActionParameters & {
      SYSTEM_CURRENT_DATE: 'SYSTEM_CURRENT_DATE'
    }]: string
  } = {
    SELECTED_TEXT: 'Selected text',
    AI_RESPONSE_LANGUAGE: 'AI Response language',
    AI_RESPONSE_TONE: 'Tone',
    AI_RESPONSE_WRITING_STYLE: 'Writing style',
    CURRENT_WEBSITE_DOMAIN: 'Current website domain',
    // Settings - My own prompts - Capabilities
    SYSTEM_CURRENT_DATE: 'Current date',
  }
  Object.keys(specialContextKeyMap).forEach((specialContextKey) => {
    if (contextMap.has(specialContextKey)) {
      // 如果已经有了，那就不用再添加了，但是需要更新key
      contextMap.set(specialContextKey, {
        ...contextMap.get(specialContextKey)!,
        type: 'text',
        key: (specialContextKeyMap as any)[specialContextKey],
      })
    } else {
      // 如果没有，那就添加
      const value = shortCutsParameters[specialContextKey]?.value
      // 因为是Special的，所以需要判断值是否存在，才能添加
      if (value && typeof value === 'string') {
        contextMap.set(specialContextKey, {
          type: 'text',
          key: (specialContextKeyMap as any)[specialContextKey],
          value,
        })
      }
    }
  })
  if (
    contextMap.has('AI_RESPONSE_LANGUAGE') &&
    !contextMap.has('AI_RESPONSE_TONE') &&
    !contextMap.has('AI_RESPONSE_WRITING_STYLE')
  ) {
    // AI_RESPONSE_LANGUAGE不会单独出现，所以需要删除
    contextMap.delete('AI_RESPONSE_LANGUAGE')
  }
  // 如果有selected text，但是不在prompt中，那就删除
  if (
    contextMap.get('SELECTED_TEXT') &&
    !promptText.includes(contextMap.get('SELECTED_TEXT')?.value as string)
  ) {
    contextMap.delete('SELECTED_TEXT')
  }
  return orderBy(
    Array.from(contextMap.values()),
    (item) => item.value.length,
    'desc',
  )
}
export default generateUserMessageContexts
