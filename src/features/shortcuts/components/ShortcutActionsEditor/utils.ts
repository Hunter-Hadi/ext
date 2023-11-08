import sanitizeHtml from 'sanitize-html'
import sanitize from 'sanitize-html'
import sha256 from 'crypto-js/sha256'

/**
 * 基于字符串生成随机颜色
 * @param str
 */
export const generateRandomColor = (str: string): string => {
  const hash = sha256(str).toString()
  const color = '#' + hash.substring(2, 8)
  return color
}

/**
 * 对html进行转义
 * @param html
 */
export const escapeHtml = (html: string) => {
  return sanitizeHtml(html, {
    allowedTags: [],
    allowedAttributes: false,
    nonBooleanAttributes: [],
    disallowedTagsMode: 'recursiveEscape',
  } as sanitize.IOptions)
}

/**
 * 生成变量的html内容
 * @param variableName
 */
export const generateVariableHtmlContent = (variableName: string) => {
  const color = generateRandomColor(variableName)
  return `<span contenteditable="false" style="color: ${color}" data-variable-name="${variableName}">${variableName}</span>`
}

export const promptTemplateToHtml = (template: string) => {
  // example: 111 {{XXX}} {{DDDD}} => 111 <span>{{XXX}}</span> <span>{{DDDD}}</span>
  let html = ''
  let p1: number | null = null
  let p2: number | null = null
  for (let i = 0; i < template.length; i++) {
    const char = template[i]
    if (char === '{' && template[i + 1] === '{') {
      p1 = i
      i += 1
      continue
    }
    if (p1 !== null && char === '}' && template[i + 1] === '}') {
      p2 = i + 2
      i += 1
    }
    if (p1 !== null && p2 !== null && p1 < p2) {
      // 如果找到了一对 {{}} 就生成一个 span
      const variableName = template.slice(p1, p2)
      const variableHtmlTag = generateVariableHtmlContent(variableName)
      html += variableHtmlTag
      p1 = null
      p2 = null
    } else if (p1 && !/[_a-zA-Z0-9]/.test(char)) {
      // 如果找到了一个 {{ 但是没有找到配对的 }} 就把 {{ 当成普通字符
      html += template.slice(p1, i)
      p1 = null
    } else if (p1 === null) {
      // 如果没有找到 {{ 就把所有的字符都当成普通字符
      html += char
    }
  }
  debugger
  return html
}
