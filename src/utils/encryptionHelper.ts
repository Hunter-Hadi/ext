import CryptoJS from 'crypto-js'
import AES from 'crypto-js/aes'
import Utf8 from 'crypto-js/enc-utf8'
import WordArray from 'crypto-js/lib-typedarrays'
import md5 from 'crypto-js/md5'

/**
 * json数据加密
 * @param data
 * @param key
 */
export const aesJsonEncrypt = (data: any, key = 'MaxAI') => {
  return AES.encrypt(JSON.stringify(data), key).toString()
}

/**
 * md5加密
 * @param data
 */
export const md5TextEncrypt = (data: string) => {
  console.log('新版Conversation md5TextEncrypt', data)
  return md5(data).toString()
}

/**
 * json加密数据解析
 * @param encryptedData
 * @param key
 */
export const aesJsonDecrypt = (encryptedData: string, key = 'MaxAI') => {
  const decryptedBytes = AES.decrypt(encryptedData, key)
  const decryptedData = decryptedBytes.toString(Utf8)
  try {
    return JSON.parse(decryptedData)
  } catch (e) {
    console.error(e)
    return {}
  }
}

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
