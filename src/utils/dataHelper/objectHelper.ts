import { mergeWith } from 'lodash-es'
import isArray from 'lodash-es/isArray'

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
  return mergeWith({}, ...objects, (objValue: any, srcValue: any) => {
    if (isArray(srcValue)) {
      return srcValue
    }
    return undefined
  })
}
