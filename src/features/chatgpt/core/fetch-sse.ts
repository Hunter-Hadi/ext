import { createParser } from 'eventsource-parser'
import isEmpty from 'lodash-es/isEmpty'

import { IAIProviderType } from '@/background/provider/chat'
import { AI_PROVIDER_MAP } from '@/constants'

import { streamAsyncIterable } from './stream-async-inerable'

export const fetchSSE = async (
  resource: string,
  options: RequestInit & {
    onMessage: (message: string) => void
    provider: IAIProviderType
  },
) => {
  const { onMessage, ...fetchOptions } = options
  const resp = await fetch(resource, fetchOptions)
  console.log(resp, 'straming resp')
  if (!resp.ok) {
    const error = await resp.json().catch(() => ({}))
    if (fetchOptions.provider === AI_PROVIDER_MAP.OPENAI) {
      if (resp.status === 401) {
        location.href = 'https://chat.openai.com/auth/login'
      } else if (resp.status === 403) {
        location.reload()
      } else if (resp.status === 418) {
        // 418 I'm a teapot
      }
    }
    throw new Error(
      JSON.stringify(
        !isEmpty(error)
          ? error
          : { message: `${resp.status} ${resp.statusText}`, detail: '' },
      ),
    )
  }
  const parser = createParser((event) => {
    if (event.type === 'event') {
      console.log(event, 'straming event')
      if (
        [
          'USE_CHAT_GPT_PLUS',
          'MAXAI_CLAUDE',
          'MAXAI_GEMINI',
          'MAXAI_DALLE',
          'MAXAI_FREE',
        ].includes(fetchOptions.provider)
      ) {
        if (
          event.data.includes(
            `\\u200b\\u200d\\u200c\\u2060\\u200b\\u200d\\u200c\\u2060`,
          ) ||
          event.data.includes(
            `\u200b\u200d\u200c\u2060\u200b\u200d\u200c\u2060`,
          )
        ) {
          let splitErrorText: string = ''
          let error: null | { conversation_id: null; text: string } = null
          try {
            error = JSON.parse(event.data)
          } catch (e) {
            // do nothing
          }
          try {
            splitErrorText =
              error?.text
                .split(`'detail': '`)[1]
                .split(`'}`)[0]
                .split('\\u200b')[0] || ''
          } catch (e) {
            // do nothing
          }
          if (error) {
            throw new Error(
              JSON.stringify(
                error.text
                  ? {
                      message: splitErrorText || error.text,
                    }
                  : error,
              ),
            )
          }
        }
      }
      onMessage(event.data)
    }
  })
  const decoder = new TextDecoder()
  for await (const chunk of streamAsyncIterable(resp.body!)) {
    const str = decoder.decode(chunk)
    parser.feed(str)
  }
}
