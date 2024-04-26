import { ContentScriptConnectionV2 } from '@/features/chatgpt'
import { mixpanelIdentify } from '@/features/mixpanel/utils'
import Log from '@/utils/Log'
const log = new Log('ContentScript/CheckIsLogin')

const port = new ContentScriptConnectionV2({
  runtime: 'client',
})
const parseJwt = (token: string) => {
  const base64Url = token.split('.')[1]
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  const jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split('')
      .map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      })
      .join(''),
  )
  return JSON.parse(jsonPayload)
}

const syncIsLogin = async () => {
  const loginEmail = window.localStorage.getItem(
    'UseChatGPTAuthServiceProvider.email',
  )
  const localStoreKeyPrefix = `UseChatGPTAuthServiceProvider.${loginEmail}`
  const accessToken = window.localStorage.getItem(
    localStoreKeyPrefix + '.accessToken',
  )
  const refreshToken = window.localStorage.getItem(
    localStoreKeyPrefix + '.refreshToken',
  )

  // 从网页中获取 client user id （客户端生成的 user id）
  const clientUserId = window.localStorage.getItem('CLIENT_USER_ID')
  if (clientUserId) {
    mixpanelIdentify('identify', clientUserId)
  }

  if (refreshToken) {
    const userInfo = parseJwt(refreshToken)
    const exp = userInfo.exp
    if (exp * 1000 > Date.now()) {
      log.info('not expired')
      await port.postMessage({
        event: 'Client_updateUseChatGPTAuthInfo',
        data: {
          accessToken,
          refreshToken,
          userInfo,
          clientUserId,
        },
      })
    }
  } else {
    // expired
    log.info('expired')
    await port.postMessage({
      event: 'Client_updateUseChatGPTAuthInfo',
      data: {},
    })
    await port.postMessage({
      event: 'Client_destroyWithLogout',
      data: {},
    })
  }
}

syncIsLogin()

// add history change listener

let lastPathname = location.pathname

const observer = new MutationObserver(function (mutations) {
  mutations.forEach(function (mutation) {
    if (lastPathname !== location.pathname) {
      lastPathname = location.pathname
      syncIsLogin()
    }
  })
})

observer.observe(document.querySelector('body') as HTMLBodyElement, {
  attributes: true,
  childList: true,
  subtree: true,
})
