import random from 'lodash-es/random'
import { ofetch } from 'ofetch'
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
      'azsdk-js-api-client-factory/1.0.0-beta.1 core-rest-pipeline/1.10.0 OS/Win32',
  }

  let resp: ConversationResponse
  try {
    resp = await ofetch(API_ENDPOINT, { headers, redirect: 'error' })
    console.log(resp)
    if (!resp.result) {
      throw new Error('Invalid response')
    }
  } catch (err) {
    console.error('retry bing create', err)
    resp = await ofetch(API_ENDPOINT, {
      headers: { ...headers, 'x-forwarded-for': randomIP() },
      redirect: 'error',
    })
    if (!resp) {
      throw new Error(
        `Please sign in to [bing.com](https://bing.com/), complete any required verifications, then try again.`,
      )
    }
  }
  if (resp.result.value !== 'Success') {
    let message = `${resp.result.value}: ${resp.result.message}\n\nPlease sign in to [bing.com](http://bing.com/), complete any required verifications, then try again.`
    if (resp.result.value === 'UnauthorizedRequest') {
      message += '\n[Log into bing.com to continue.](https://www.bing.com/)'
    }
    if (resp.result.value === 'Forbidden') {
      message += '\n[Log into bing.com to continue.](https://www.bing.com/)'
    }
    throw new Error(message)
  }
  return resp
}
