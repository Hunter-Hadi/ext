import Browser from 'webextension-polyfill'

import TranslateTextItem from '@/features/pageTranslator/core/TranslateTextItem'
import { languageCodeToApiSupportCode } from '@/features/pageTranslator/utils'
import { clientProxyFetchAPI } from '@/features/shortcuts/utils'
import { promiseTimeout } from '@/utils/promiseUtils'

const TRANSLATOR_ACCESS_TOKEN_CACHE_KEY = 'TRANSLATOR_ACCESS_TOKEN_CACHE_KEY'

const MAX_TRANSLATOR_ITEMS_COUNT = 30

interface ITranslationResponse {
  translations: {
    text: string
    to: string
  }[]
  detectedLanguage: {
    language: string
    score: number
  }
}

class TranslateService {
  token: string

  authFetching: boolean

  constructor() {
    this.token = ''
    this.authFetching = false

    this.getCacheToken().then((token) => {
      this.token = token
    })
  }

  async getCacheToken() {
    const cache = await Browser.storage.local.get(
      TRANSLATOR_ACCESS_TOKEN_CACHE_KEY,
    )
    if (cache[TRANSLATOR_ACCESS_TOKEN_CACHE_KEY]) {
      return cache[TRANSLATOR_ACCESS_TOKEN_CACHE_KEY] as string
    }
    return ''
  }

  async setCacheToken(token: string) {
    await Browser.storage.local.set({
      [TRANSLATOR_ACCESS_TOKEN_CACHE_KEY]: token,
    })
  }

  async fetchAccessToken() {
    try {
      if (this.authFetching) {
        return
      }
      this.authFetching = true
      const authResponse = await clientProxyFetchAPI(
        'https://edge.microsoft.com/translate/auth',
        {
          method: 'GET',
          parse: 'text',
        },
      )
      if (
        authResponse.responseRaw?.ok === true &&
        authResponse.responseRaw?.status === 200
      ) {
        const accessToken = await authResponse.data
        this.token = accessToken
        await this.setCacheToken(accessToken)
      }
    } catch (error) {
      console.error('fetchAccessToken error', error)
    } finally {
      this.authFetching = false
    }
  }

  async translate(
    needTranslateItems: TranslateTextItem[],
    to = '',
    from = '',
    canReTry = true,
  ): Promise<boolean> {
    if (!this.token) {
      await this.fetchAccessToken()
    }
    try {
      if (!this.token) {
        needTranslateItems.forEach((item) => item.updateFetchStatus('error'))
        return false
      }

      if (needTranslateItems.length > MAX_TRANSLATOR_ITEMS_COUNT) {
        const result = []
        for (
          let i = 0;
          i < needTranslateItems.length;
          i += MAX_TRANSLATOR_ITEMS_COUNT
        ) {
          const items = needTranslateItems.slice(
            i,
            i + MAX_TRANSLATOR_ITEMS_COUNT,
          )
          const translateResponse = await this.translate(items, to, from)
          result.push(translateResponse)
        }

        return result.every((item) => item)
      }

      const needTextArray = needTranslateItems
        .map((item) => item.rawText)
        .filter((text) => text)

      if (needTextArray.length <= 0) {
        return false
      }

      needTranslateItems.forEach((item) => item.updateFetchStatus('fetching'))

      const fixedToCode = languageCodeToApiSupportCode(to)
      const fixedFromCode = languageCodeToApiSupportCode(from)

      const fetchTranslatorResponse = await promiseTimeout(
        clientProxyFetchAPI<ITranslationResponse[]>(
          `https://api-edge.cognitive.microsofttranslator.com/translate?from=${fixedFromCode}&to=${fixedToCode}&api-version=3.0&includeSentenceLength=true`,
          {
            parse: 'json',
            method: 'POST',
            body: JSON.stringify(needTextArray.map((text) => ({ Text: text }))),
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.token}`,
            },
          },
        ),
        20000, // 20s
        null,
      )

      const translatorResponseRaw = fetchTranslatorResponse?.responseRaw

      if (translatorResponseRaw?.status === 401 && canReTry) {
        await this.fetchAccessToken()
        return this.translate(needTranslateItems, to, from, false)
      }

      let isSuccess = false
      if (
        fetchTranslatorResponse &&
        fetchTranslatorResponse.data &&
        translatorResponseRaw?.ok === true &&
        translatorResponseRaw?.status === 200
      ) {
        const data = fetchTranslatorResponse?.data ?? null

        if (data.length === needTextArray.length) {
          isSuccess = true
          for (let i = 0; i < data.length; i++) {
            const translateItem = needTranslateItems[i]
            const translatedDataItem = data?.[i]
            if (translatedDataItem) {
              translateItem.translatedText =
                translatedDataItem.translations?.[0]?.text
              translateItem.translatedLangCode =
                translatedDataItem.translations?.[0]?.to
              translateItem.originalLangCode =
                translatedDataItem.detectedLanguage?.language

              translateItem.isTranslated = true

              translateItem.updateFetchStatus('success')
            }
          }
        }
        return isSuccess
      }
      if (!isSuccess) {
        needTranslateItems.forEach((item) => item.updateFetchStatus('error'))
      }
      return isSuccess
    } catch (error) {
      needTranslateItems.forEach((item) => item.updateFetchStatus('error'))
      return false
    }
  }
}

export default TranslateService
