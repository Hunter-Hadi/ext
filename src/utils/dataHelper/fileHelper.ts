/**
 * base64 to blob
 */
export function dataURItoBlob(dataURI: string) {
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0] // mime类型
  const byteString = self.atob(dataURI.split(',')[1]) //base64 解码
  const arrayBuffer = new ArrayBuffer(byteString.length) //创建缓冲数组
  const intArray = new Uint8Array(arrayBuffer) //创建视图

  for (let i = 0; i < byteString.length; i++) {
    intArray[i] = byteString.charCodeAt(i)
  }
  return new Blob([intArray], { type: mimeString })
}

/**
 * blob to base64
 * @param blob
 */
export const convertBlobToBase64 = (blob: Blob) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      resolve(reader.result as string)
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/**
 * base64 to blob
 * @param base64
 * @param contentType
 */
export const convertBase64ToBlob = (base64: string, contentType = '') => {
  let base64String = base64
  let type = contentType
  if (base64String.startsWith('data:')) {
    const [fileType, base64Dat] = base64String.split(',')
    if (!type) {
      type = fileType.split(';')[0].split(':')[1]
    }
    base64String = base64Dat
  }
  const byteCharacters = atob(base64String)
  const byteArrays = []
  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512)
    const byteNumbers = new Array(slice.length)
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    byteArrays.push(byteArray)
  }

  return new Blob(byteArrays, { type })
}
