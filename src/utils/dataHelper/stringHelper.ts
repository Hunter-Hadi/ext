import * as EmailValidator from 'email-validator'

export const domain2HttpsDomain = (domain: string, filterExtension = false) => {
  if (!domain) {
    return ''
  }
  if (domain.search(/^http[s]?:\/\//) == -1) {
    domain = 'https://' + domain
  }
  if (filterExtension) {
    domain = domain.replace(/\.(json)+$/i, '')
  }
  return domain
}
export const string2CapitalizeFirstLetter = (
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  [first, ...rest]: string,
  locale = 'en',
) => {
  if (typeof window !== 'undefined') {
    locale = navigator.language
  }
  if (!first) {
    return ''
  }
  return (
    first.toLocaleUpperCase(locale) + (rest ? rest.join('') : '').toLowerCase()
  )
}
export const string2Capitalize = (text: string) => {
  return string2CapitalizeWithApStyle(text, {
    stopWords: [],
    keepSpaces: true,
  })
}
export const string2CapitalizeWithApStyle = (
  text: string,
  options?: {
    stopWords?: string[]
    keepSpaces?: boolean
  },
) => {
  const defaultsStopWords = [
    'a',
    'an',
    'and',
    'as',
    'at',
    'but',
    'by',
    'for',
    'if',
    'in',
    'nor',
    'of',
    'off',
    'on',
    'or',
    'per',
    'so',
    'the',
    'to',
    'up',
    'via',
    'yet',
  ]
  const opts = options || {}

  if (!text) return ''

  const stop = opts.stopWords || defaultsStopWords
  const keep = opts.keepSpaces
  const splitter = /(\s+|[-‑–—])/

  return text
    .split(splitter)
    .map((word, index, all) => {
      if (word.match(/\s+/)) return keep ? word : ' '
      if (word.match(splitter)) return word
      if (
        index !== 0 &&
        index !== all.length - 1 &&
        stop.includes(word.toLowerCase())
      ) {
        return word.toLowerCase()
      }
      return string2CapitalizeFirstLetter(word)
    })
    .join('')
}

export const currency2CurrencySymbol = (currency: string, locale = 'en-US') => {
  try {
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    })
    let symbol
    formatter.formatToParts(0).forEach(({ type, value }) => {
      if (type === 'currency') {
        symbol = value
      }
    })
    return symbol
  } catch (e) {
    return undefined
  }
}

export const checkIsDomain = (url: string) => {
  const regex = new RegExp(
    /^(((ht|f)tps?):\/\/)?([^!@#$%^&*?.\s-]([^!@#$%^&*?.\s]{0,63}[^!@#$%^&*?.\s])?\.)+[a-z]{2,6}\/?/,
  )
  return regex.test(url)
}

export const httpLink2Hostname = (httpLink: string) => {
  if (!httpLink) {
    return ''
  }
  try {
    const regExp =
      /^(?:https?:\/\/)?(?:www\.)?((?:(?!www\.|\.).)+\.[-a-zA-Z0-9.]+)/gm
    const host = httpLink.match(regExp)
    return (host ? host[0] : '').toLowerCase()
  } catch (e) {
    return httpLink
  }
}

export const string2DomainFaviconUrl = (
  keywordOrDomain: string,
  faviconSize: 16 | 32 | 48 | 64 | 96 | 128 | 144 = 16,
) => {
  const domain =
    httpLink2Hostname(keywordOrDomain) ||
    `${keywordOrDomain?.toLowerCase()}.com`
  return `https://www.google.com/s2/favicons?sz=${faviconSize}&domain_url=${domain}`
}

export const checkIsEmail = (email: string) => {
  return EmailValidator.validate(email)
}
