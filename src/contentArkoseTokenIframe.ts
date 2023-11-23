/**
 * 1. 注入windowArkoseTokenIFrame.js
 */

import Browser from 'webextension-polyfill'

const isInIframe = () => {
  try {
    return window.self !== window.top
  } catch (e) {
    // 如果跨域访问iframe，则会抛出异常
    return true
  }
}

window.onload = () => {
  if (window.location.origin === 'https://chat.openai.com' && isInIframe()) {
    alert('contentArkoseTokenIframe')
    // 1. 注入windowArkoseTokenIFrame
    const script = document.createElement('script')
    script.src = Browser.runtime.getURL(
      'assets/openai/windowArkoseTokenIframe.js',
    )
    script.type = 'module'
    script.setAttribute(
      'data-arkose_token_gpt_3_5',
      Browser.runtime.getURL(
        'assets/openai/js/v2/3D86FBBA-9D22-402A-B512-3420086BA6CC/api.js',
      ),
    )
    script.setAttribute(
      'data-arkose_token_gpt_4',
      Browser.runtime.getURL(
        'assets/openai/js/v2/35536E1E-65B4-4D96-9D97-6ADB7EFF8147/api.js',
      ),
    )
    document.body.appendChild(script)
  }
}
