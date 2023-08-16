import Browser from 'webextension-polyfill'

const PAGE_SUMMARY_LOCAL_STORAGE_SAVE_KEY =
  'MAXAI_PAGE_SUMMARY_LOCAL_STORAGE_SAVE_KEY'

export const getPageSummaryConversationId = async () => {
  try {
    const pageUrl = window.location.href
    // remove hash or query
    const url = pageUrl.split('#')[0].split('?')[0]
    const cache = await Browser.storage.local.get(
      PAGE_SUMMARY_LOCAL_STORAGE_SAVE_KEY,
    )
    if (cache && cache[PAGE_SUMMARY_LOCAL_STORAGE_SAVE_KEY]) {
      const cacheData = JSON.parse(cache[PAGE_SUMMARY_LOCAL_STORAGE_SAVE_KEY])
      return cacheData[url]
    } else {
      return ''
    }
  } catch (e) {
    console.log(e)
    return ''
  }
}

export const setPageSummaryConversationId = async (conversationId: string) => {
  try {
    const pageUrl = window.location.href
    // remove hash or query
    const url = pageUrl.split('#')[0].split('?')[0]
    const cache = await Browser.storage.local.get(
      PAGE_SUMMARY_LOCAL_STORAGE_SAVE_KEY,
    )
    if (cache && cache[PAGE_SUMMARY_LOCAL_STORAGE_SAVE_KEY]) {
      const cacheData = JSON.parse(cache[PAGE_SUMMARY_LOCAL_STORAGE_SAVE_KEY])
      cacheData[url] = conversationId
      await Browser.storage.local.set({
        [PAGE_SUMMARY_LOCAL_STORAGE_SAVE_KEY]: JSON.stringify(cacheData),
      })
      return true
    } else {
      await Browser.storage.local.set({
        [PAGE_SUMMARY_LOCAL_STORAGE_SAVE_KEY]: JSON.stringify({
          [url]: conversationId,
        }),
      })
      return true
    }
  } catch (e) {
    console.log(e)
    return false
  }
}
