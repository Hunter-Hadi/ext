import { createParser } from 'eventsource-parser'
import isEmpty from 'lodash-es/isEmpty'
import { streamAsyncIterable } from './stream-async-inerable'
import { IAIProviderType } from '@/background/provider/chat'
import { AI_PROVIDER_MAP } from '@/constants'

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
      onMessage(event.data)
    }
  })
  const decoder = new TextDecoder()
  for await (const chunk of streamAsyncIterable(resp.body!)) {
    const str = decoder.decode(chunk)
    parser.feed(str)
  }
}
