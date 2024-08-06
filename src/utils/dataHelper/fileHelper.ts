/**
 * base64 to blob
 */
export const dataURItoBlob = (dataURI: string) => {
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

/**
 * image to blob
 */
export const imageToBlob = (image: HTMLImageElement) => {
  return new Promise<Blob>((resolve, reject) => {
    // 如果图片是网络图片，则重新带上 crossOrigin = 'anonymous' 加载图片，避免跨域原因污染画布无法导出 blob
    if (image.src.startsWith('http')) {
      const src = image.src
      image = new Image()
      image.crossOrigin = 'anonymous'
      image.src = src
    }
    if (image.complete && image.naturalWidth > 0 && image.naturalHeight > 0) {
      resolve(imageToBlobLoaded(image))
    } else {
      image.onload = function () {
        resolve(imageToBlobLoaded(image))
      }
      image.onerror = function (e) {
        console.log('使用 img onload 获取图片失败，使用 fetch 再次获取图片')
        // 当图片可能出现跨域错误时，在使用fetch获取图片
        // PS：在某些页面使用 fetch 会跨域，在某些页面使用 image onload 会跨域。所以两种都试一次。优先使用 image onload ，再使用 fetch
        resolve(fetchImageToBlob(image.src))
      }
    }
  })
}

/**
 * fetch image to blob
 */
export const fetchImageToBlob = (src: string) => {
  return new Promise<Blob>((resolve, reject) => {
    fetch(src, {
      method: 'GET',
      cache: 'no-store', // 不使用缓存，否则某些S3存储桶链接会报跨域错误
      mode: 'cors',
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status}`)
        }
        return response.blob()
      })
      .then((blob) => {
        resolve(blob)
      })
      .catch((error) => {
        console.log('使用 fetch 获取图片失败')
        reject(error)
      })
  })
}

/**
 * image to blob(image loaded)
 */
const imageToBlobLoaded = (image: HTMLImageElement) => {
  const canvas = document.createElement('canvas')
  canvas.width = image.naturalWidth
  canvas.height = image.naturalHeight

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw 'imageToBlobLoaded failed. ctx is null'
  }
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Canvas.toBlob failed.'))
      } else {
        resolve(blob)
      }
    }, 'image/png')
  })
}

/**
 * blob to File
 */
export const blobToFile = (blob: Blob, fileName: string) => {
  return new File([blob], fileName, { type: blob.type })
}
