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

/**
 * 递归获取对象的path和value
 * @param object
 * @param callback
 * @param path
 */
export const getAllPathsAndValues = (
  object: any,
  callback: (path: string[], value: any) => void,
  path: string[] = [],
) => {
  Object.entries(object).forEach(([key, value]) => {
    const newPath = [...path, key]
    if (typeof value === 'object' && value !== null) {
      getAllPathsAndValues(value, callback, newPath)
    } else {
      callback(newPath, value)
    }
  })
}

/**
 * 锯齿合并数组
 *
 * e.g: interleaveMerge([1, 4, 7], [2, 5, 8], [3, 6, 9]);
 *
 * return [1, 2, 3, 4, 5, 6, 7, 8, 9]
 */
export const interleaveMerge = (...arrays: any[]) => {
  const maxLength = arrays.reduce((max, arr) => Math.max(max, arr.length), 0)
  const result = []
  for (let i = 0; i < maxLength; i++) {
    for (const array of arrays) {
      array[i] && result.push(array[i])
    }
  }

  return result
}
