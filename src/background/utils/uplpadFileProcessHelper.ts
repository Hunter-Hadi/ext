export const serializeUploadFile = async (src: File) => {
  const wasBlob = src instanceof Blob
  const blob = wasBlob ? src : await new Response(src).blob()
  const reader = new FileReader()
  return new Promise((resolve) => {
    reader.onload = () =>
      resolve([reader.result, blob.type, wasBlob] as [string, string, boolean])
    reader.readAsDataURL(blob)
  })
}
export const deserializeUploadFile = ([base64, type, wasBlob]: [
  string,
  string,
  boolean,
]) => {
  const str = atob(base64.slice(base64.indexOf(',') + 1))
  const len = str.length
  const arr = new Uint8Array(len)
  for (let i = 0; i < len; i += 1) arr[i] = str.charCodeAt(i)
  if (!wasBlob) {
    type =
      base64
        .match(/^data:(.+?);base64/)?.[1]
        .replace(
          /(boundary=)[^;]+/,
          (_, p1) => p1 + String.fromCharCode(...arr.slice(2, arr.indexOf(13))),
        ) || ''
  }
  return [arr, type] as [Uint8Array, string]
}

export const file2base64 = async (file: File): Promise<string | undefined> => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => {
      const base64String = reader.result as string
      resolve(base64String)
    }
    reader.onerror = () => {
      resolve(undefined)
    }
    reader.readAsDataURL(file)
  })
}
export const base642file = (
  base64String: string,
  filename: string,
): File | undefined => {
  try {
    const arr = base64String.split(',')
    const type = arr[0].match(/:(.*?);/)![1]
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while (n > 0) {
      n -= 1
      u8arr[n] = bstr.charCodeAt(n)
    }
    return new File([u8arr], filename, { type })
  } catch (e) {
    return undefined
  }
}
export const base642Unit8Array = (base64String: string): Uint8Array => {
  const arr = base64String.split(',')
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n > 0) {
    n -= 1
    u8arr[n] = bstr.charCodeAt(n)
  }
  return u8arr
}

export const checkFileTypeIsImage = (file: File): boolean => {
  const type = file.type
  return type.startsWith('image/')
}
