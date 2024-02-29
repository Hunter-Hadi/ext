import { MAXAI_TRANSLATE_CUSTOM_ELEMENT } from '@/features/pageTranslator/constants'

// 判断元素是否是 inline element
export const isInlineElement = (element: HTMLElement) => {
  const { display } = getComputedStyle(element)
  return display.includes('inline')
}

// 判断元素是否是 block element
export const isBlockElement = (element: HTMLElement) => {
  return !isInlineElement(element)
}

// 确认当前 容器没有 maxai-trans 元素
export const checkChildHasTranslateElement = (
  containerElement: HTMLElement,
) => {
  return !!containerElement.querySelector(
    `& > ${MAXAI_TRANSLATE_CUSTOM_ELEMENT}`,
  )
}

// 将 elementToInsert 插入到 referenceElement 之后
export const insertAfter = function (
  elementToInsert: Node | Element,
  referenceElement: Node | Element,
) {
  referenceElement.parentElement?.insertBefore(
    elementToInsert,
    referenceElement.nextSibling,
  )
}

// 判断当前 element 是否是 显示状态
export const isElementVisible = (element: HTMLElement) => {
  const { display, visibility, opacity } = getComputedStyle(element)
  return display !== 'none' && visibility !== 'hidden' && opacity !== '0'
}

// 找到第一个不为 inline 的父元素
export const findFirstNotInlineParentElement = (
  element: Node | HTMLElement | null,
): HTMLElement | null => {
  let parentElement = element?.parentElement
  while (parentElement) {
    const { display } = getComputedStyle(parentElement)
    if (!display.includes('inline') && display !== 'none') {
      return parentElement
    }
    parentElement = parentElement.parentElement
  }
  return null
}

// 找到仅包含当前 textNode 的父元素
export const findParentElementWithTextNode = (textNode: Node) => {
  let parentElement = textNode.parentElement
  let resultElement = null
  while (
    parentElement &&
    parentElement.tagName !== 'BODY' &&
    isInlineElement(parentElement) &&
    parentElement.childNodes.length === 1
  ) {
    resultElement = parentElement
    parentElement = parentElement.parentElement
  }
  return resultElement
}

/**
 * 获取指定元素及其子元素中所有的文本节点
 */
export function getAllTextNodes(element: Element | Node) {
  const textNodes: Node[] = []

  // 定义一个递归函数来遍历所有子节点
  function recurseThroughNodes(element: Element | Node) {
    // 遍历当前节点的所有子节点
    const childNodes = Array.from(element.childNodes)
    for (const child of childNodes) {
      // 如果子节点是文本节点，则添加到数组中
      if (child.nodeType === 3) {
        textNodes.push(child)
      } else {
        // 如果子节点不是文本节点，则递归遍历该节点的子节点
        recurseThroughNodes(child)
      }
    }
  }

  // 从指定元素开始递归遍历
  recurseThroughNodes(element)

  return textNodes
}

// 判断当前元素是否是 其父元素的最后一个 textNode 元素
export const isLastTextNode = (
  node: Node,
  parentElement?: HTMLElement | null,
) => {
  // 首先检查提供的节点是否是文本节点
  if (node.nodeType !== Node.TEXT_NODE) {
    return false
  }

  // 获取父元素
  const containerElement = parentElement ?? node.parentElement
  if (!containerElement) {
    return false // 如果没有父元素，直接返回false
  }

  const textNode = getAllTextNodes(containerElement)
  const lastTextNode = textNode[textNode.length - 1]
  return lastTextNode === node
}

// 判断 element 是否是有效的元素
export const isTranslationValidElement = (element: HTMLElement | null) => {
  try {
    if (element) {
      const blackTagList = [
        'title',
        'SCRIPT',
        'STYLE',
        'NOSCRIPT',
        'IFRAME',
        'BODY',
        'CODE',
        'PRE',
        'OBJECT',
        'EM',
        'CITE',
        'STRONG',
        'NOBR',
      ]
      if (blackTagList.includes(element.tagName)) {
        return false
      }

      if (
        element.closest('CODE') ||
        element.closest('PRE') ||
        element.closest('cite')
      ) {
        return false
      }

      const { display } = getComputedStyle(element)
      if (display === 'none') {
        return false
      }

      if (
        element.getAttribute('translate') === 'no' ||
        element.getAttribute('contenteditable') === 'true' ||
        element.classList.contains('notranslate')
      ) {
        return false
      }

      if (element.className.includes('icon')) {
        // icon 不翻译
        return false
      }

      if (/^\d+$/.test(element.innerText)) {
        // 纯数字的元素不翻译
        return false
      }

      const text = element.innerText.trim()
      if (text.length <= 2) {
        // 字数太少不翻译
        return false
      }

      if (
        /^(.){0,3}(\d*[,:._-])*\d+(.){0,5}$/g.test(text) ||
        /^(([A-Z0-9]+[_-])*[A-Z0-9]){1,8}$/g.test(text) ||
        /^\w+@\w+[.]\w+$/g.test(text) ||
        /^(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)$/.test(
          text,
        ) ||
        /^@[\S]+$/g.test(text) ||
        /^[-`~!@#$%^&*()_+=[\]{};:'",<.>/?]+$/g.test(text)
      ) {
        // 一些特殊的文本不翻译（规则参考 Sider）
        return false
      }

      return true
    } else {
      return false
    }
  } catch (error) {
    return false
  }
}

// 将 language code 转换成  translate api 支持的 code
export const languageCodeToApiSupportCode = (code: string) => {
  const codeToSupportCodeMap: Record<string, string> = {
    am: 'am',
    ar: 'ar',
    bg: 'bg',
    bn: 'bn',
    ca: 'ca',
    cs: 'cs',
    da: 'da',
    de: 'de',
    el: 'el',
    en: 'en',
    en_GB: 'en',
    en_US: 'en',
    es: 'es',
    es_419: 'es',
    et: 'et',
    fa: 'fa',
    fi: 'fi',
    fil: 'fil',
    fr: 'fr',
    gu: 'gu',
    he: 'he',
    he_IL: 'he',
    hi: 'hi',
    hr: 'hr',
    hy: 'hy',
    hu: 'hu',
    in: 'in',
    id: 'id',
    it: 'it',
    ja: 'ja',
    kn: 'kn',
    ko: 'ko',
    lt: 'lt',
    lv: 'lv',
    ml: 'ml',
    mr: 'mr',
    ms: 'ms',
    nl: 'nl',
    no: 'no',
    pl: 'pl',
    pt_BR: 'pt',
    pt_PT: 'pt',
    ro: 'ro',
    ru: 'ru',
    sk: 'sk',
    sl: 'sl',
    sr: 'sr',
    sv: 'sv',
    sw: 'sw',
    ta: 'ta',
    te: 'te',
    th: 'th',
    tr: 'tr',
    ua: 'ua',
    uk: 'uk',
    vi: 'vi',
    zh_CN: 'zh-Hans',
    zh_TW: 'zh-Hant',
  }
  return codeToSupportCodeMap[code] || code
}
