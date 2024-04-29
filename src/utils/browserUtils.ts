import Browser from 'webextension-polyfill'

/**
 * 是否处于隐私模式下
 */
export const isIncognitoContext = async () => {
  // const fs = window.RequestFileSystem || window.webkitRequestFileSystem;
  // if (!fs) return false
  // return new Promise(resolve => {
  //     fs(window.TEMPORARY, 100, () => resolve(true), () => resolve(false))
  // })
  // 插件直接调用此方法即可
  return Browser.extension.inIncognitoContext
}

/**
 * 获取平台信息
 */
export const getPlatformInfo = async () => {
  const userAgent = navigator.userAgent
  const userAgentData = (navigator as any).userAgentData

  if (userAgentData) {
    const data = await userAgentData.getHighEntropyValues([
      'platform',
      'platformVersion',
      'architecture',
      'uaFullVersion',
    ])
    return {
      platform: data.platform,
      platformVersion: data.platformVersion,
      ...getBrowserInfo(),
      // browser: userAgentData.brands.map((brand: any) => brand.brand).join(','),
      browserVersion: data.uaFullVersion,
      cpuArch: data.architecture,
      userAgent,
    }
  }

  let platform = 'unknown'
  let platformVersion = 'unknown'

  if (userAgent.includes('Win')) {
    platform = 'Windows'
    const match = userAgentData.match(/Windows NT ([\d.]+)/)
    if (match) {
      platformVersion = match[1]
    }
  } else if (userAgent.includes('Mac')) {
    platform = 'MacOS'
    const match = userAgent.match(/Mac OS X ([\d_]+)/)
    if (match) {
      platformVersion = match[1].replace(/_/g, '.')
    }
  } else if (userAgentData.includes('Linux')) {
    platform = 'Linux'
  }

  return {
    platform,
    platformVersion,
    ...getBrowserInfo,
    userAgent,
  }
}

export const getBrowserInfo = () => {
  const userAgent = navigator.userAgent
  if (userAgent.indexOf('Opera') > -1) {
    return {
      browser: 'Opera',
      browserVersion: getBrowserVersion('Opera'),
    }
  } else if (userAgent.indexOf('Edge') > -1) {
    return {
      browser: 'Edge',
      browserVersion: getBrowserVersion('Edge'),
    }
  } else if (userAgent.indexOf('Chrome') > -1) {
    return {
      browser: 'Chrome',
      browserVersion: getBrowserVersion('Chrome'),
    }
  } else if (userAgent.indexOf('Safari') > -1) {
    return {
      browser: 'Safari',
      browserVersion: getBrowserVersion('Safari'),
    }
  } else if (userAgent.indexOf('Firefox') > -1) {
    return {
      browser: 'Firefox',
      browserVersion: getBrowserVersion('Firefox'),
    }
  }
}

export const getBrowserVersion = (type: string) => {
  const userAgent = navigator.userAgent
  if (type == 'Safari') {
    //Safari版本
    return userAgent.match(/Version\/([\d.]+)/)?.[1]
  } else {
    return userAgent.match(new RegExp(type + '/([\\d.]+)'))?.[1]
  }
}
