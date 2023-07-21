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
