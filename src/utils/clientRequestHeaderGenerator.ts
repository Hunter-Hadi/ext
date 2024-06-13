import merge from 'lodash-es/merge'
import Browser from 'webextension-polyfill'

import { convertHexToString } from '@/background/api/backgroundRequestHeaderGenerator'
import { APP_VERSION } from '@/constants'
import { getCurrentDomainHost } from '@/utils/dataHelper/websiteHelper'
import { aesJsonEncrypt } from '@/utils/encryptionHelper'
import { backgroundGetBrowserUAInfo } from '@/utils/sendMaxAINotification/background'

/**
 * Generate client request header
 * @param headerInit
 * @param formUrl
 */
export const clientRequestHeaderGenerator = async (
  headerInit?: HeadersInit,
  formUrl?: string,
) => {
  try {
    const uaInfo = await backgroundGetBrowserUAInfo()
    const senderUrl =
      formUrl ||
      (typeof window !== 'undefined'
        ? window.location.href
        : Browser.runtime.getURL('/pages/settings/index.html'))
    const domain = getCurrentDomainHost(senderUrl)
    const path = senderUrl
    // 稍微添加一下逆向的难度
    const hexHeaders = {
      // X-Browser-Name
      [convertHexToString('582d42726f777365722d4e616d65')]:
        uaInfo?.browser?.name || convertHexToString('554e4b4e4f574e'),
      // X-Browser-Version
      [convertHexToString('582d42726f777365722d56657273696f6e')]:
        uaInfo?.browser?.version || convertHexToString('554e4b4e4f574e'),
      // X-Browser-Major
      [convertHexToString('582d42726f777365722d4d616a6f72')]:
        uaInfo?.browser?.major || convertHexToString('554e4b4e4f574e'),
      // X-App-Version
      [convertHexToString(`582d4170702d56657273696f6e`)]: APP_VERSION,
      // X-App-Env - MaxAI-Browser-Extension
      [convertHexToString(`582d4170702d456e76`)]: convertHexToString(
        `4d617841492d42726f777365722d457874656e73696f6e`,
      ),
      // X-Authorization
      [convertHexToString(`582d417574686f72697a6174696f6e`)]: aesJsonEncrypt({
        // X-Client-Domain
        [convertHexToString(`582d436c69656e742d446f6d61696e`)]: domain,
        // X-Client-Path
        [convertHexToString(`582d436c69656e742d50617468`)]: path,
      }),
    }
    return merge(hexHeaders, headerInit)
  } catch (e) {
    return headerInit
  }
}
