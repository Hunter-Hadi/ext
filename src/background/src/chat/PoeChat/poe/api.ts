import { ofetch } from 'ofetch'
import md5 from 'md5'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import ChatViewQuery from './graphql/ChatViewQuery.graphql'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import AddMessageBreakMutation from './graphql/AddMessageBreakMutation.graphql'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import SendMessageMutation from './graphql/SendMessageMutation.graphql'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import SubscriptionsMutation from './graphql/SubscriptionsMutation.graphql'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import MessageAddedSubscription from './graphql/MessageAddedSubscription.graphql'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import ViewerStateUpdatedSubscription from './graphql/ViewerStateUpdatedSubscription.graphql'

export const GRAPHQL_QUERIES = {
  AddMessageBreakMutation,
  ChatViewQuery,
  SendMessageMutation,
  SubscriptionsMutation,
  MessageAddedSubscription,
  ViewerStateUpdatedSubscription,
}

export interface PoeSettings {
  formkey: string
  tchannelData: ChannelData
}

interface ChannelData {
  minSeq: string
  channel: string
  channelHash: string
  boxName: string
  baseHost: string
  targetUrl: string
  enableWebsocket: boolean
}

async function getFormkey() {
  const html: string = await ofetch('https://poe.com', {
    parseResponse: (txt) => txt,
  })
  const r = html.match(/<script>if(.+)throw new Error;(.+),window.+<\/script>/)
  const scriptText = r![2]
  const key = scriptText.match(/var .="(\w+)"/)![1]
  const cipherPairs = Array.from(
    scriptText.matchAll(/\[(\d+)\]=.\[(\d+)\]/g),
  ).map((m) => [Number(m[1]), Number(m[2])])
  const result: string[] = Array(cipherPairs.length)
  for (const [i, j] of cipherPairs) {
    result[i] = key[j]
  }
  return result.join('')
}

export async function getPoeSettings(): Promise<PoeSettings> {
  const [settings, formkey] = await Promise.all([
    ofetch<PoeSettings>('https://poe.com/api/settings'),
    getFormkey().catch((err) => {
      console.error(err)
      throw new Error('Failed to get formkey')
    }),
  ])
  console.debug('poe formkey', formkey)
  settings.formkey = formkey
  return settings
}

export interface GqlHeaders {
  formkey: string
  tchannel: string
}

export async function gqlRequest(
  queryName: keyof typeof GRAPHQL_QUERIES,
  variables: any,
  poeSettings: PoeSettings,
) {
  const query = GRAPHQL_QUERIES[queryName]
  const payload = { query, variables }
  const tagId = md5(
    JSON.stringify(payload) + poeSettings.formkey + 'WpuLMiXEKKE98j56k',
  )
  return ofetch('https://poe.com/api/gql_POST', {
    method: 'POST',
    body: payload,
    headers: {
      'poe-formkey': poeSettings.formkey,
      'poe-tag-id': tagId,
      'poe-tchannel': poeSettings.tchannelData.channel,
    },
  })
}

export async function getChatId(
  bot: string,
  poeSettings: PoeSettings,
): Promise<number> {
  const resp = await gqlRequest('ChatViewQuery', { bot }, poeSettings)
  if (!resp.data) {
    throw new Error('You need to login to [Poe](https://www.poe.com) first.')
  }
  return resp.data.chatOfBot.chatId
}
