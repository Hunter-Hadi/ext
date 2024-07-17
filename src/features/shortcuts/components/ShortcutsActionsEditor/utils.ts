import sha256 from 'crypto-js/sha256'
import dayjs from 'dayjs'
import sanitizeHtml from 'sanitize-html'
import sanitize from 'sanitize-html'

import { PRESET_VARIABLE_MAP } from '@/features/shortcuts/components/ShortcutsActionsEditor/hooks/useShortcutEditorActionsVariables'
import { IActionSetVariable } from '@/features/shortcuts/components/ShortcutsActionsEditor/types'

/**
 * 基于字符串生成随机颜色
 * @param str
 */
export const generateRandomColor = (str: string): string => {
  const hash = sha256(str).toString()
  const color = '#' + hash.substring(0, 6)
  return color
}
export const generateRandomColorWithTheme = (
  str: string,
  isDarkMode: boolean,
) => {
  const color = generateRandomColor(str)
  if (isDarkMode) {
    return hexChangeLightnessAndSaturation(color, 0.75, 0.9)
  } else {
    return hexChangeLightnessAndSaturation(color, 0.3, 0.95)
  }
}

/**
 * 对html进行转义
 * @param html
 */
export const escapeHtml = (html: string) => {
  return sanitizeHtml(html, {
    allowedTags: ['span', 'br'],
    allowedAttributes: {
      span: ['contenteditable', 'style', 'data-variable-name'],
    },
    nonBooleanAttributes: [],
    disallowedTagsMode: 'recursiveEscape',
  } as sanitize.IOptions)
}

/**
 * 生成变量的html内容
 * @param variableName - 存在DB的变量名
 * @param variableLabel - 用户看到的变量名
 * @param darkMode
 */
export const generateVariableHtmlContent = (
  variableName: string,
  variableLabel: string,
  darkMode?: boolean,
) => {
  const color = generateRandomColorWithTheme(variableName, darkMode || false)
  return `<span contenteditable="false" style="color: ${color}" data-variable-name="${variableName}">{{${variableLabel}}}</span>`
}

export const htmlToTemplate = (html: string) => {
  const div = document.createElement('div')
  div.contentEditable = 'true'
  div.innerHTML = escapeHtml(html)
  const nodes = Array.from(div.childNodes)
  nodes.forEach((node) => {
    // 还原变量
    // 判断是不是变量
    if ((node as HTMLSpanElement).tagName === 'SPAN') {
      const span = node as HTMLSpanElement
      const variableName = span.getAttribute('data-variable-name')
      const variable = `{{${variableName}}}`
      if (variable) {
        span.innerHTML = variable
      }
    }
  })
  return div.innerText
}

export const promptTemplateToHtml = (
  template: string,
  variableMap: Map<string, IActionSetVariable>,
  darkMode?: boolean,
) => {
  // example: 111 {{CURRENT_TITLE}} {{APPLE}} => 111 <span>{{Current title}}</span> <span>{{Apple}}</span>
  // 生成labelMap
  const labelMap = new Map<string, IActionSetVariable>()
  Array.from(variableMap.values()).forEach((variable) => {
    if (variable.label) {
      labelMap.set(variable.label, variable)
    }
  })
  // 正则表达式，用于匹配Handlebars变量
  const variableRegex = /\{\{([^{}]+?)\}\}/g
  const escapeEl = document.createElement('textarea')
  escapeEl.textContent = template
  const escapeHTML = escapeEl.innerHTML
  escapeEl.remove()
  // 使用replace()方法替换变量
  const html = escapeHTML.replace(variableRegex, (match, variable) => {
    // 检查变量是否在映射中存在
    const findVariable =
      labelMap.get(variable) ||
      variableMap.get(variable) ||
      (PRESET_VARIABLE_MAP as any)[variable]
    if (findVariable) {
      const variableName = findVariable.VariableName
      // 将匹配到的变量转换为HTML
      const variableHtmlTag = generateVariableHtmlContent(
        variableName,
        findVariable.label || variableName,
        darkMode,
      )
      return variableHtmlTag
    } else {
      // 将其他变量视为普通文本
      return match
    }
  })
  return html
}

/**
 * 在更新变量后,基于html和新的变量更新html
 * @param html
 * @param variableMap
 * @param darkMode
 */
export const updateHtmlWithVariables = (
  html: string,
  variableMap: Map<string, IActionSetVariable>,
  darkMode?: boolean,
) => {
  const div = document.createElement('div')
  div.innerHTML = html
  const nodes = Array.from(div.childNodes)
  nodes.forEach((node) => {
    // 判断是不是变量
    if ((node as HTMLSpanElement).tagName === 'SPAN') {
      const span = node as HTMLSpanElement
      const variableName = span.getAttribute('data-variable-name')
      const variable = variableMap.get(variableName || '')
      if (variable) {
        span.innerHTML = `{{${variable.label}}}`
        span.style.color = generateRandomColorWithTheme(
          variableName || '',
          darkMode || false,
        )
      }
    }
  })
  return div.innerHTML
}

/**
 * 把html转换成template
 * @param editor
 * @param cursorSelectionRange
 * @param html
 */
export const promptEditorAddHtmlToFocusNode = (
  editor: HTMLDivElement,
  html: string,
  cursorSelectionRange?: Range,
) => {
  const cursorSelection = window.getSelection()
  let clonedNodes: Node[] = []
  if (cursorSelectionRange) {
    cursorSelection?.removeAllRanges()
    cursorSelection?.addRange(cursorSelectionRange)
  }
  if (editor && cursorSelection && editor.contains(cursorSelection.focusNode)) {
    // 还原cursorSelectionRange
    let variableElementNode: HTMLSpanElement | null = null
    if (cursorSelection.focusNode?.isSameNode(editor)) {
      // 获取选中的真实nodes
      const focusNodeIndex = cursorSelectionRange?.endOffset
        ? cursorSelectionRange.endOffset - 1
        : editor.childNodes.length - 1
      const selectedNode = (editor.childNodes[focusNodeIndex] ||
        editor.childNodes[editor.childNodes.length - 1]) as HTMLSpanElement
      if (selectedNode?.hasAttribute?.('data-variable-name')) {
        variableElementNode = selectedNode
      }
    } else {
      if (
        cursorSelection.focusNode?.parentElement?.hasAttribute(
          'data-variable-name',
        )
      ) {
        variableElementNode = cursorSelection.focusNode.parentElement
      }
    }
    const range = cursorSelection.getRangeAt(0)
    const fragment = range.createContextualFragment(html)
    // 复制节点
    clonedNodes = Array.from(fragment.childNodes).map((node) =>
      node.cloneNode(true),
    )
    if (variableElementNode) {
      // 如果focusNode 是 variableElementNode 就把 html 插入到 variableElementNode 的后面
      // 因为是插入到后面，所以需要先把节点倒序
      clonedNodes.reverse().forEach((node) => variableElementNode?.after(node))
    } else {
      // 如果focusNode 不是 variableElementNode 就把 html 插入到 focusNode 的后面
      // 因为是插入到后面，所以需要先把节点倒序
      clonedNodes.reverse().forEach((node) => range.insertNode(node))
    }
  } else if (editor) {
    // 如果没有找到 focusNode 就直接插入到最后，并且返回新的 cursorSelection
    const range = document.createRange()
    const fragment = range.createContextualFragment(html)
    // 复制节点
    clonedNodes = Array.from(fragment.childNodes).map((node) =>
      node.cloneNode(true),
    )
    // 将复制后的节点添加到 document.body
    clonedNodes.forEach((node) => editor.appendChild(node))
  }
  // 现在你可以访问插入后的节点
  if (clonedNodes.length > 0) {
    console.log(clonedNodes)
    // 选中cloneNodes
    const newRange = document.createRange()
    const first = clonedNodes[0]
    const last = clonedNodes[clonedNodes.length - 1]
    newRange.setStartBefore(first)
    newRange.setEndAfter(last)
    const cloneRange = newRange.cloneRange()
    // 清空原有的selection
    const selection = window.getSelection()
    selection?.removeAllRanges()
    selection?.addRange(newRange)
    // 返回新的 cursorSelection
    return cloneRange
  } else {
    return null
  }
}

export function setOpacity(hexColor: string, opacity: number): string {
  // 去除颜色代码中的 #
  hexColor = hexColor.replace('#', '')

  // 将颜色代码转换为 RGB 值
  const r = parseInt(hexColor.substr(0, 2), 16)
  const g = parseInt(hexColor.substr(2, 2), 16)
  const b = parseInt(hexColor.substr(4, 2), 16)

  // 将不透明度转换为 0-1 范围
  const alpha = opacity / 100

  // 构建带有指定不透明度的 RGBA 颜色代码
  const rgbaColor = `rgba(${r}, ${g}, ${b}, ${alpha})`

  return rgbaColor
}

/**
 * 调整颜色的亮度
 * @param hex
 * @param targetLightness
 * @param targetSaturation
 */
export function hexChangeLightnessAndSaturation(
  hex: string,
  targetLightness: number,
  targetSaturation: number,
): string {
  // 将Hex转换为RGB
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)

  // 将RGB转换为HSL
  const rNormalized = r / 255
  const gNormalized = g / 255
  const bNormalized = b / 255

  const max = Math.max(rNormalized, gNormalized, bNormalized)
  const min = Math.min(rNormalized, gNormalized, bNormalized)

  let h = 0
  if (max !== min) {
    const d = max - min
    switch (max) {
      case rNormalized:
        h =
          (gNormalized - bNormalized) / d + (gNormalized < bNormalized ? 6 : 0)
        break
      case gNormalized:
        h = (bNormalized - rNormalized) / d + 2
        break
      case bNormalized:
        h = (rNormalized - gNormalized) / d + 4
        break
    }

    h /= 6
  }

  // 调整亮度和饱和度
  const adjustedL = Math.max(0, Math.min(1, targetLightness))
  const adjustedS = Math.max(0, Math.min(1, targetSaturation))

  // 将HSL转换为Hex
  const hueToRgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }

  const q =
    adjustedL < 0.5
      ? adjustedL * (1 + adjustedS)
      : adjustedL + adjustedS - adjustedL * adjustedS
  const p = 2 * adjustedL - q

  const rAdjusted = Math.round(hueToRgb(p, q, h + 1 / 3) * 255)
  const gAdjusted = Math.round(hueToRgb(p, q, h) * 255)
  const bAdjusted = Math.round(hueToRgb(p, q, h - 1 / 3) * 255)

  const adjustedHex = `#${rAdjusted.toString(16).padStart(2, '0')}${gAdjusted
    .toString(16)
    .padStart(2, '0')}${bAdjusted.toString(16).padStart(2, '0')}`

  return adjustedHex
}
export const promptNameToVariable = (name: string) => {
  //  'Start ddda 30'.match(/[a-zA-Z0-9]+/g)
  const words = name.match(/[a-zA-Z0-9]+/g) || []
  const variable = words.join('_').toUpperCase()
  const date = dayjs().format('YYYYHHmmss')
  if (variable) {
    return `CUSTOM_VARIABLE_${variable}_${date}`
  } else {
    return `CUSTOM_VARIABLE_${date}`
  }
}
