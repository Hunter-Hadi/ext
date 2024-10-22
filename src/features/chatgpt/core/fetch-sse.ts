import { createParser } from 'eventsource-parser'
import isEmpty from 'lodash-es/isEmpty'

import maxAIBackgroundSafeFetch from '@/background/api/maxAIBackgroundSafeFetch'
import { IAIProviderType } from '@/background/provider/chat'
import { AI_PROVIDER_MAP, CHATGPT_WEBAPP_HOST } from '@/constants'
import maxAIClientSafeFetch from '@/utils/maxAIClientSafeFetch'

import { streamAsyncIterable } from './stream-async-inerable'

export const fetchSSE = async (
  resource: string,
  options: RequestInit & {
    onMessage: (message: string) => void
    provider: IAIProviderType
    taskId?: string
    inClient?: boolean // 临时新增，后续拆出api packages会重新整理
  },
) => {
  const { onMessage, inClient, ...fetchOptions } = options
  const resp = inClient
    ? await maxAIClientSafeFetch(resource, fetchOptions)
    : await maxAIBackgroundSafeFetch(
        resource,
        fetchOptions,
        fetchOptions.taskId,
      )
  console.log(resp, 'straming resp')
  if (!resp.ok) {
    const error = await resp.json().catch(() => ({}))
    if (fetchOptions.provider === AI_PROVIDER_MAP.OPENAI) {
      if (resp.status === 401) {
        location.href = `https://${CHATGPT_WEBAPP_HOST}/auth/login`
      } else if (resp.status === 403) {
        location.reload()
      } else if (resp.status === 418) {
        // 418 I'm a teapot
      }
    }
    if (resp.status === 413) {
      throw new Error(
        JSON.stringify({
          message:
            "Your input has reached the model's token limit. If you believe this is an error, please contact us at hello@maxai.me",
          detail: '',
        }),
      )
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
          'MAxAI_LLAMA',
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
