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
    [key in keyof ActionParameters]: string
  } = {
    SELECTED_TEXT: 'Selected text',
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
  // 黑名单key, 来自于:
  // 1. Settings - my-own-prompts - capebilities
  const blackKeyList = ['SYSTEM_CURRENT_DATE']
  blackKeyList.forEach((key) => {
    if (contextMap.has(key)) {
      contextMap.delete(key)
    }
  })
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
