// import FingerprintJS from '@fingerprintjs/fingerprintjs'

import Browser from 'webextension-polyfill'

export const FINGER_PRINT_LOCAL_STORAGE_SAVE_KEY = 'x_fid'

export const initFingerPrint = (): Promise<string | undefined> => {
  return new Promise((resolve) => {
    resolve('')
    // if (typeof window !== 'undefined') {
    //   try {
    //     const fpPromise = FingerprintJS.load()
    //     fpPromise.then((fp) => {
    //       fp.get().then((result) => {
    //         Browser.storage.local.set({
    //           [FINGER_PRINT_LOCAL_STORAGE_SAVE_KEY]: result.visitorId,
    //         })
    //         resolve(result.visitorId)
    //       })
    //     })
    //   } catch (e) {
    //     console.log('initFingerPrint error: \t', e)
    //     resolve(undefined)
    //   }
    // }
  })
}
export const getFingerPrint = async () => {
  const res = await Browser.storage.local.get(
    FINGER_PRINT_LOCAL_STORAGE_SAVE_KEY,
  )
  const fingerPrint = res[FINGER_PRINT_LOCAL_STORAGE_SAVE_KEY]
  if (!fingerPrint) {
    return await initFingerPrint()
  }
  return fingerPrint.replace(/"/g, '')
}
