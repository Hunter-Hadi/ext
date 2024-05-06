import isArray from 'lodash-es/isArray'
import mergeWith from 'lodash-es/mergeWith'

export const objectFilterEmpty = (obj: any, filterEmptyString = true) => {
  const result: any = {}
  Object.keys(obj).forEach((key) => {
    if (obj[key] !== undefined && obj[key] !== null) {
      if (
        filterEmptyString &&
        typeof obj[key] === 'string' &&
        obj[key].trim() === ''
      ) {
        return
      }
      result[key] = obj[key]
    }
  })
  return result
}

export const mergeWithObject = (objects: any[]) => {
  return mergeWith(
    {},
    ...objects,
    (objValue: any, srcValue: any, key: string) => {
      // need to overwrite the navMetadata
      if (key === 'navMetadata') {
        return srcValue
      }

      if (isArray(srcValue)) {
        return srcValue
      }

      return undefined
    },
  )
}
