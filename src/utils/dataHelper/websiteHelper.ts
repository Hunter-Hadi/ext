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
    return `https://flagcdn.com/${size ? size : '40x30'}/${countryCode || countryName.toLocaleLowerCase()
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

export const getCurrentDomainHost = (fromUrl?: string) => {
  try {
    const urlObj = fromUrl ? new URL(fromUrl) : window?.location || location
    if (
      typeof window !== undefined &&
      urlObj.href.includes(Browser.runtime.id)
    ) {
      const crxPageUrl = urlObj.origin + urlObj.pathname
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

    if (urlObj.host === '' && urlObj.origin === 'file://') {
      // 本地文件 (暂定本地文件返回 origin + pathname)
      return urlObj.origin + urlObj.pathname
    }

    const host = urlObj.host.replace(/^www\./, '').replace(/:\d+$/, '')
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

/**
 * 判断是否是MaxAI的页面
 */
export const isMaxAIPage = () => {
  try {
    return Browser.runtime.getURL('').startsWith(getCurrentDomainHost())
  } catch (e) {
    return false
  }
}

/**
 * 处理 MaxAI PDF Viewer 宽度改变
 */
export const handleMaxAIPDFViewerResize = () => {
  const htmlElement = document.body.parentElement;
  if (htmlElement) {
    const toolbarContainer: HTMLElement = document.querySelector('#toolbarContainer')!;
    const toolbarViewer: HTMLElement = toolbarContainer.querySelector('#toolbarViewer')!;
    const toolbarViewerLeft: HTMLElement = document.querySelector('#toolbarViewerLeft')!
    const toolbarViewerMiddle: HTMLElement = document.querySelector('#toolbarViewerMiddle')!
    const toolbarViewerRight: HTMLElement = document.querySelector('#toolbarViewerRight')!
    const viewerContainer: HTMLElement = document.querySelector('#viewerContainer')!

    let height = '64px', gridTemplateAreas = '', gridTemplateColumns = '', leftJustifySelf = '', middleJustifySelf = '', rightJustifySelf = '', inset = '64px 0 0';
    if (htmlElement.offsetWidth <= 560) {
      height = '96px';
      gridTemplateAreas = '"l" "m" "r"';
      gridTemplateColumns = 'auto';
      leftJustifySelf = 'center'
      rightJustifySelf = 'center'
      inset = '96px 0 0'
    } else if (htmlElement.offsetWidth <= 690) {
      gridTemplateAreas = '"l l r r" "l l m m"';
      gridTemplateColumns = 'auto auto';
      middleJustifySelf = 'flex-end';
    } else if (htmlElement.offsetWidth <= 980) {
      gridTemplateAreas = '"l l r r" "m m m m"';
      gridTemplateColumns = 'auto auto';
    } else {
      height = '';
      inset = '';
    }

    toolbarContainer.style.height = height;
    toolbarViewer.style.gridTemplateAreas = gridTemplateAreas;
    toolbarViewer.style.gridTemplateColumns = gridTemplateColumns;
    toolbarViewerLeft.style.justifySelf = leftJustifySelf;
    toolbarViewerMiddle.style.justifySelf = middleJustifySelf;
    toolbarViewerRight.style.justifySelf = rightJustifySelf;
    viewerContainer.style.inset = inset;
  }
}
