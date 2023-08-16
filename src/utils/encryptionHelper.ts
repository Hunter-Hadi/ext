import AES from 'crypto-js/aes'
import md5 from 'crypto-js/md5'
export const aesJsonEncrypt = (data: any, key = 'MaxAI') => {
  return AES.encrypt(JSON.stringify(data), key).toString()
}

export const md5TextEncrypt = (data: string) => {
  return md5(data).toString()
}
