import AES from 'crypto-js/aes'
import Utf8 from 'crypto-js/enc-utf8'
import md5 from 'crypto-js/md5'

export const aesJsonEncrypt = (data: any, key = 'MaxAI') => {
  return AES.encrypt(JSON.stringify(data), key).toString()
}

export const md5TextEncrypt = (data: string) => {
  console.log('新版Conversation md5TextEncrypt', data)
  return md5(data).toString()
}

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
