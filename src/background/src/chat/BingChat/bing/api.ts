import random from 'lodash-es/random'
import { FetchResponse, ofetch } from 'ofetch'
import { v4 as uuidV4 } from 'uuid'
import { ConversationResponse } from './types'

// https://github.com/acheong08/EdgeGPT/blob/master/src/EdgeGPT.py#L32
function randomIP() {
  return `13.${random(104, 107)}.${random(0, 255)}.${random(0, 255)}`
}

const API_ENDPOINT = 'https://www.bing.com/turing/conversation/create'

export async function createConversation(): Promise<ConversationResponse> {
  const headers = {
    'x-ms-client-request-id': uuidV4(),
    'x-ms-useragent':
      'azsdk-js-api-client-factory/1.0.0-beta.1 core-rest-pipeline/1.10.3 OS/macOS',
  }

  let rawResponse: FetchResponse<ConversationResponse>
  try {
    rawResponse = await ofetch.raw<ConversationResponse>(API_ENDPOINT, {
      headers,
      redirect: 'error',
    })
    if (!rawResponse._data?.result) {
      throw new Error(
        `Please sign in to [bing.com](https://bing.com/), complete any required verifications, then try again.`,
      )
    }
  } catch (err) {
    console.error('retry bing create', err)
    rawResponse = await ofetch.raw<ConversationResponse>(API_ENDPOINT, {
      headers: { ...headers, 'x-forwarded-for': randomIP() },
      redirect: 'error',
    })
    if (!rawResponse._data) {
      throw new Error(
        `Please sign in to [bing.com](https://bing.com/), complete any required verifications, then try again.`,
      )
    }
  }

  const data = rawResponse._data

  if (data.result.value !== 'Success') {
    let message = `${data.result.value}: ${data.result.message}\n\nPlease sign in to [bing.com](http://bing.com/), complete any required verifications, then try again.`
    if (data.result.value === 'UnauthorizedRequest') {
      message += '\n[Log into bing.com to continue.](https://www.bing.com/)'
    }
    if (data.result.value === 'Forbidden') {
      message += '\n[Log into bing.com to continue.](https://www.bing.com/)'
    }
    throw new Error(message)
  }

  const conversationSignature = rawResponse.headers.get(
    'x-sydney-conversationsignature',
  )!
  const encryptedConversationSignature =
    rawResponse.headers.get('x-sydney-encryptedconversationsignature') ||
    undefined

  data.conversationSignature =
    data.conversationSignature || conversationSignature
  data.encryptedConversationSignature = encryptedConversationSignature

  return data
}
