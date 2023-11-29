import Browser from 'webextension-polyfill'
import { COUNTRIES_MAP } from '@/utils/staticData'

export type ICountryIconSizeType =
  | '16x12'
  | '20x15'
  | '24x18'
  | '28x21'
  | '32x24'
  | '36x27'
  | '40x30'
  | '48x36'
  | '56x42'
  | '60x45'
  | '64x48'
  | '72x54'
  | '80x60'
  | '84x63'
  | '96x72'
  | '108x81'
  | '112x84'
  | '120x90'
  | '128x96'
  | '144x108'
  | '160x120'
  | '192x144'
  | '224x168'
  | '256x192'
/**
 * 返回 对应 国家的 国旗 icon
 *
 *
 * `return` => (`United Arab Emirates`, `size?: CountryIconSize`) => `https://flagcdn.com/{size ? size : '40x30'}/ae.png`
 *
 */
export const countryIcon = (
  countryName: string | undefined = '',
  size?: ICountryIconSizeType,
  strictMode = false,
): string => {
  const countryCode =
    COUNTRIES_MAP.get(countryName) ||
    COUNTRIES_MAP.get(countryName.toLocaleLowerCase())
  if (strictMode && !countryCode) {
    return ''
  } else {
    return `https://flagcdn.com/${size ? size : '40x30'}/${
      countryCode || countryName.toLocaleLowerCase()
    }.png`
  }
}
export const countryOptions = () => {
  const options: Array<{
    value: string
    label: string
  }> = []
  COUNTRIES_MAP.forEach((value, key) => {
    options.push({
      value,
      label: key,
    })
  })
  return options
}
export const domain2Favicon = (domain: string) => {
  return `https://www.google.com/s2/favicons?domain=${domain}`
}

export const getCurrentDomainHost = () => {
  try {
    if (
      typeof window !== undefined &&
      window.location.href.includes(Browser.runtime.id)
    ) {
      const crxPageUrl = window.location.origin + window.location.pathname
      // crx page - immersive chat
      if (crxPageUrl === Browser.runtime.getURL('/pages/chat/index.html')) {
        return Browser.runtime.getURL('/pages/chat/index.html')
      } else if (
        // crx page - pdf viewer
        crxPageUrl === Browser.runtime.getURL('/pages/pdf/web/viewer.html')
      ) {
        return Browser.runtime.getURL('/pages/pdf/web/viewer.html')
      }
    }
    const host = (window.location.host || location.host)
      .replace(/^www\./, '')
      .replace(/:\d+$/, '')
    // lark doc的子域名是动态的，所以需要特殊处理
    if (host.includes('larksuite.com')) {
      return 'larksuite.com'
    }
    return host
  } catch (e) {
    return ''
  }
}

/**
 * 判断是否是MaxAI的immersive chat页面
 */
export const isMaxAIImmersiveChatPage = () => {
  try {
    return (
      getCurrentDomainHost() ===
      Browser.runtime.getURL('/pages/chat/index.html')
    )
  } catch (e) {
    return false
  }
}

/**
 * 判断是否是MaxAI的PDF页面
 */
export const isMaxAIPDFPage = () => {
  try {
    return (
      getCurrentDomainHost() ===
      Browser.runtime.getURL('/pages/pdf/web/viewer.html')
    )
  } catch (e) {
    return false
  }
}
