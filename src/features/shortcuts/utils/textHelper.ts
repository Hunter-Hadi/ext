export interface ITextHandlerParameters {
  trim?: boolean
  noQuotes?: boolean
  noCommand?: boolean
  noSummaryTag?: boolean
}

export function textHandler(text: string, params?: ITextHandlerParameters) {
  let value = text

  if (params?.trim) {
    value = value.trim()
  }

  if (params?.noQuotes) {
    value = value.replaceAll('"', '')
  }

  if (params?.noCommand) {
    if (value.includes('site:')) {
      value = value.replace(/site:[^ ]+/g, '')
    }
    if (value.includes('page:')) {
      value = value.replace(/page:[^ ]+/g, '')
    }
    if (value.includes(':')) {
      const regex = /[a-zA-Z]+:[a-zA-Z]+/g
      value = value.replace(regex, '')
    }
  }

  if (params?.noSummaryTag) {
    value = value.replaceAll('<summary>', '').replaceAll('</summary>', '')
    // 删除第一个换行符
    if (value[0] === '\n') {
      value = value.slice(1)
    }
  }

  return value
}
