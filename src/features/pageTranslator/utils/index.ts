// 判断 element 是否是有效的元素
export const checkValidElement = (element: HTMLElement | null) => {
  if (element) {
    const { display } = getComputedStyle(element)

    return (
      element.tagName !== 'SCRIPT' &&
      element.tagName !== 'STYLE' &&
      element.tagName !== 'NOSCRIPT' &&
      element.tagName !== 'IFRAME' &&
      element.tagName !== 'BODY' &&
      element.tagName !== 'CODE' &&
      element.tagName !== 'OBJECT' &&
      element.tagName !== 'EM' &&
      element.tagName !== 'CITE' &&
      element.closest('cite') === null &&
      display !== 'none' &&
      !element.classList.contains('notranslate')
    )
  }

  return false
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
