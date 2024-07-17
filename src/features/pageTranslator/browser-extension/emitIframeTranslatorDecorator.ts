// emit Decorators
import { MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID } from '@/constants'
import { clientRunBackgroundFunction } from '@/utils'

const checkIsIframe = () => {
  try {
    return window.self !== window.top
  } catch (e) {
    return false
  }
}

const emitIframeTranslatorDecorator = (
  target: any,
  key: string,
  descriptor: PropertyDescriptor,
) => {
  const originalMethod = descriptor.value
  descriptor.value = function (...args: any[]) {
    const result = originalMethod.apply(this, args)
    if (!checkIsIframe()) {
      const currentTab = clientRunBackgroundFunction('tabs', 'query', [
        {
          active: true,
          currentWindow: true,
        },
      ])
      currentTab.then((tabs) => {
        const tabId = tabs?.[0]?.id
        if (tabId) {
          clientRunBackgroundFunction('tabs', 'sendMessage', [
            tabId,
            {
              id: MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID,
              event: 'Client_listenPageTranslationEvent',
              data: {
                fn: key,
                args,
              },
            },
          ])
            .then()
            .catch()
        }
      })
    }
    return result
  }
}

export default emitIframeTranslatorDecorator
