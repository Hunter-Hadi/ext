import Browser from 'webextension-polyfill'

const script = document.createElement('script')
script.type = 'module'
script.src = Browser.runtime.getURL('/pages/chatgpt/arkose_inject.js')
script.setAttribute(
  'data-arkose',
  Browser.runtime.getURL(
    '/assets/openai/js/v2/35536E1E-65B4-4D96-9D97-6ADB7EFF8147/api.js',
  ),
)
;(document.head || document.documentElement).append(script)
