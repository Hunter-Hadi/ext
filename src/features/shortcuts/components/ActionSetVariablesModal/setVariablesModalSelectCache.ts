import Browser from 'webextension-polyfill'

const CHROME_EXTENSION_SET_VARIABLES_MODAL_SELECT_KEY =
  'CHROME_EXTENSION_SET_VARIABLES_MODAL_SELECT_KEY'
export const getSetVariablesModalSelectCache = async () => {
  const cache = await Browser.storage.local.get(
    CHROME_EXTENSION_SET_VARIABLES_MODAL_SELECT_KEY,
  )
  try {
    if (cache[CHROME_EXTENSION_SET_VARIABLES_MODAL_SELECT_KEY]) {
      return JSON.parse(cache[CHROME_EXTENSION_SET_VARIABLES_MODAL_SELECT_KEY])
    } else {
      return {}
    }
  } catch (e) {
    return {}
  }
}

export const setVariablesModalSelectCache = async (key: string, value: any) => {
  try {
    const cache = await getSetVariablesModalSelectCache()
    cache[key] = value
    await Browser.storage.local.set({
      [CHROME_EXTENSION_SET_VARIABLES_MODAL_SELECT_KEY]: JSON.stringify(cache),
    })
    return true
  } catch (e) {
    return false
  }
}
