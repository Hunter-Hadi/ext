import CryptoJS from 'crypto-js'
import WordArray from 'crypto-js/lib-typedarrays'

/**
 * 文件加密，逻辑和后端一致
 * @param file
 * @param key
 * @param blockSize
 */
export const sha1FileEncrypt = async (
  file: File,
  key = '7b82a776-daab-4847-a1df-dd35fc5059b0',
  blockSize = 65536,
): Promise<string> => {
  const fileReader = new FileReader()
  const hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA1, key)
  let offset = 0

  const readNextChuck = () => {
    return new Promise((resolve, reject) => {
      const blob = file.slice(offset, offset + blockSize)
      fileReader.onload = (event) => {
        const wordArray = WordArray.create(event.target?.result as any)
        hmac.update(wordArray)
        offset += blockSize
        resolve('')
      }
      fileReader.onerror = reject
      fileReader.readAsArrayBuffer(blob)
    })
  }

  while (offset < file.size) {
    await readNextChuck()
  }

  const hash = hmac.finalize()
  return hash.toString(CryptoJS.enc.Hex)

  // return new Promise((resolve, reject) => {
  //   reader.onload = () => {
  //     if (!reader.result) {
  //       return reject(new Error('file is empty'))
  //     }
  //     const wordArray = WordArray.create(reader.result as any);
  //     const hash = HmacSHA1(wordArray, key)
  //     resolve(hash.toString(Hex))
  //   }
  //   reader.onerror = reject
  //   reader.readAsBinaryString(file)
  // })
}
