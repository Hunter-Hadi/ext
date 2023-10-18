import { arkoseTokenGenerator } from '@/features/chatgpt/core/ArkoseGenerator'
// arkose
const arkoseScriptSrc = document
  .querySelector('script[data-arkose]')
  ?.getAttribute('data-arkose')
if (arkoseScriptSrc) {
  arkoseTokenGenerator.injectScript(arkoseScriptSrc)
}
