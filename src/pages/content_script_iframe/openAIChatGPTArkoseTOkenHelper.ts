import {
  CHAT_GPT_GPT4_ARKOSE_TOKEN,
  CHAT_GPT_GPT4_ARKOSE_TOKEN_KEY,
} from '@/constants'
import dayjs from 'dayjs'
import Browser from 'webextension-polyfill'
import Log from '@/utils/Log'

const arkoseLog = new Log('Arkose')

export const openAIChatGPTArkoseTokenHelper = () => {
  // https://tcr9i.chat.openai.com/v2/35536E1E-65B4-4D96-9D97-6ADB7EFF8147/api.js
  const href = window.location.href
  const key = CHAT_GPT_GPT4_ARKOSE_TOKEN_KEY
  if (href.includes('chat.openai.com') && href.includes(key)) {
    arkoseLog.info(window.location.href, 'arkose token iframe!!!!!!!!!!')
    // listen body element change
    const bodyObserver = new MutationObserver((mutations) => {
      // listen input element add
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLInputElement) {
            if (
              node.id === 'verification-token' ||
              node.id === 'FunCaptcha-Token'
            ) {
              if (node.value.trim() !== '') {
                const arkoseToken = {
                  token: node.value,
                  date: dayjs().utc().valueOf(),
                }
                arkoseLog.info('arkose token update', arkoseToken)
                Browser.storage.local.set({
                  [CHAT_GPT_GPT4_ARKOSE_TOKEN]: JSON.stringify(arkoseToken),
                })
              }
            }
          }
        })
      })
    })
    bodyObserver.observe(document.body, {
      childList: true,
      subtree: true,
    })
  }
}
