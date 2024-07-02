/**
 * 这个文件只是为了给后端生成一些json数据，没有实际作用
 */
import { IContextMenuItem } from '@/features/contextMenu/types'

export const generatePromptActionStringArray = (
  prefix: string,
  items: IContextMenuItem[],
  toCopyString: boolean = false,
): string[] | string => {
  const result: string[] = []
  const map = new Map<string, IContextMenuItem>()

  // Map each item by its id for quick lookup
  items.forEach((item) => map.set(item.id, item))

  // Helper function to recursively build the string path
  function buildPath(item: IContextMenuItem, withItemId: boolean): string {
    const parent = map.get(item.parent)
    if (!parent) {
      return withItemId ? `${item.text} (${item.id})` : item.text
    }
    return `${buildPath(parent, false)} -> ${
      withItemId ? `${item.text} (${item.id})` : item.text
    }`
  }

  // Main logic to filter and generate the string paths
  items.forEach((item) => {
    if (item.data.type === 'shortcuts') {
      const path = buildPath(item, true)
      result.push(`${prefix} -> ${path}`)
    }
  })
  return toCopyString ? '\n' + result.join('\n') : result
}
