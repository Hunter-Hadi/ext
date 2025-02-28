import { createParser, ParseEvent } from 'eventsource-parser'
import isEmpty from 'lodash-es/isEmpty'

import { streamAsyncIterable } from './stream-async-inerable'

export const fetchSSE = async (
  resource: string,
  options: RequestInit & {
    onMessage: (message: string) => void
  },
) => {
  const { onMessage, ...fetchOptions } = options
  const resp = await fetch(resource, fetchOptions)
  console.log(resp, 'straming resp')
  if (!resp.ok) {
    const error = await resp.json().catch(() => ({}))
    // if (resp.status === 401) {
    //   location.href = 'https://chat.openai.com/auth/login'
    // } else if (resp.status === 403) {
    //   location.reload()
    // }
    throw new Error(
      JSON.stringify(
        !isEmpty(error)
          ? error
          : { message: `${resp.status} ${resp.statusText}`, detail: '' },
      ),
    )
  }

  if (fetchOptions.body) {
    const body = JSON.parse(fetchOptions.body as string)
    if (body.streaming === false) {
      const response = await resp.json()
      return response
    }
  }

  const parser = createParser((event: ParseEvent) => {
    if (event.type === 'event') {
      console.log(event, 'straming event')
      onMessage(event.data)
    }
  })
  for await (const chunk of streamAsyncIterable(resp.body!)) {
    const str = new TextDecoder().decode(chunk)
    parser.feed(str)
  }
}
