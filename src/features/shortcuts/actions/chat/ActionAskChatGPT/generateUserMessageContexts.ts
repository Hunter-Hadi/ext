import { orderBy } from 'lodash-es'

import { IUserChatMessageExtraMetaContextType } from '@/features/chatgpt/types'
import { IShortCutsParameter } from '@/features/shortcuts/hooks/useShortCutsParameters'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'

const generateUserMessageContexts = (
  shortCutsParameters: Record<string, IShortCutsParameter>,
): IUserChatMessageExtraMetaContextType[] => {
  const contextMap: Map<
    string,
    IUserChatMessageExtraMetaContextType
  > = new Map()
  const customVariables = Object.keys(shortCutsParameters).filter(
    (key) => shortCutsParameters[key].isBuildIn !== true,
  )
  customVariables.forEach((key) => {
    const value = shortCutsParameters[key].value
    if (value && typeof value === 'string' && !contextMap.has(key)) {
      let title = key.toLowerCase().replace(/_/g, ' ')
      // 首字母大写
      title = title.charAt(0).toUpperCase() + title.slice(1)
      contextMap.set(key, {
        type: 'text',
        key: title,
        value,
      })
    }
  })
  // 特殊的上下文
  const specialContextKeys: Array<keyof ActionParameters> = ['SELECTED_TEXT']
  specialContextKeys.forEach((specialContextKey) => {
    if (contextMap.has(specialContextKey)) {
      return
    }
    const value = shortCutsParameters[specialContextKey]?.value
    if (value && typeof value === 'string') {
      let title = specialContextKey.toLowerCase().replace(/_/g, ' ')
      // 首字母大写
      title = title.charAt(0).toUpperCase() + title.slice(1)
      contextMap.set(specialContextKey, {
        type: 'text',
        key: title,
        value,
      })
    }
  })
  return orderBy(
    Array.from(contextMap.values()),
    (item) => item.value.length,
    'desc',
  )
}
export default generateUserMessageContexts
