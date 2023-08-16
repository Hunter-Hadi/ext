export const list2Options = <T>(
  list?: T[],
  options?: {
    labelKey: keyof T
    valueKey: keyof T
  },
): any[] => {
  if (!list) {
    return []
  }
  if (typeof list[0] === 'string' || typeof list[0] === 'number') {
    return list.map((item) => {
      return { label: String(item), value: String(item) }
    })
  }
  const { labelKey = 'label', valueKey = 'value' } = options || {}
  return list.map(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    (
      item: T & {
        label?: string
        value?: string
      },
    ) => {
      return {
        label: item[labelKey] as string,
        value: item[valueKey] as string,
        origin: item,
      }
    },
  )
}

/**
 * 从后往前找，直到找到最近的选项
 * @param list
 * @param predicate
 */
export const listReverseFind = <T>(
  list: T[],
  predicate: (item: T) => boolean,
): T | undefined => {
  for (let i = list.length - 1; i >= 0; i--) {
    const item = list[i]
    if (predicate(item)) {
      return item
    }
  }
  return undefined
}
