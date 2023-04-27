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
