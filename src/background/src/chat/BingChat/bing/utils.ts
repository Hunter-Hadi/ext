import { file2base64 } from '@/background/utils/uplpadFileProcessHelper'

import { ChatResponseMessage } from './types'

export function convertMessageToMarkdown(message: ChatResponseMessage): string {
  if (message.messageType === 'InternalSearchQuery') {
    return message.text
  }
  if (message.messageType === 'InternalLoaderMessage') {
    return `_${message.text}_`
  }
  for (const card of message.adaptiveCards) {
    for (const block of card.body) {
      if (block.type === 'TextBlock') {
        return block.text
      }
    }
  }
  return ''
}

const RecordSeparator = String.fromCharCode(30)

export const websocketUtils = {
  packMessage(data: any) {
    return `${JSON.stringify(data)}${RecordSeparator}`
  },
  unpackMessage(data: string | ArrayBuffer | Blob) {
    return data
      .toString()
      .split(RecordSeparator)
      .filter(Boolean)
      .map((s) => JSON.parse(s))
  },
}

export const bingCompressedImageDataAsync = async (file: File) => {
  const base64Data = await file2base64(file)
  return new Promise<string>((resolve) => {
    const bingMaxImagePixels = 360000
    const imageCompressionRate = 0.7
    const U = document.createElement('img')
    U.src = base64Data || ''
    U.onload = async () => {
      try {
        let q = U.width
        let j = U.height
        const rate = bingMaxImagePixels / (q * j)
        const o = Math.sqrt(rate)
        q *= o
        j *= o
        const Y = await bingGetOrientationAsync(file)
        const K = document.createElement('canvas')
        const processOrientation = (O: any, B: any, G: any, U: any, q: any) => {
          const j = B.style.width,
            W = B.style.height,
            Y = B.getContext('2d')
          if (
            (O > 4
              ? ((B.width = U),
                (B.height = G),
                (B.style.width = W),
                (B.style.height = j))
              : ((B.width = G),
                (B.height = U),
                (B.style.width = j),
                (B.style.height = W)),
            Y)
          ) {
            switch (O) {
              case 2:
                Y.translate(G, 0), Y.scale(-1, 1)
                break
              case 3:
                Y.translate(G, U), Y.rotate(Math.PI)
                break
              case 4:
                Y.translate(0, U), Y.scale(1, -1)
                break
              case 5:
                Y.rotate(0.5 * Math.PI), Y.scale(1, -1)
                break
              case 6:
                Y.rotate(0.5 * Math.PI), Y.translate(0, -U)
                break
              case 7:
                Y.rotate(0.5 * Math.PI), Y.translate(G, -U), Y.scale(-1, 1)
                break
              case 8:
                Y.rotate(-0.5 * Math.PI), Y.translate(-G, 0)
            }
            Y.fillStyle = '#FFFFFF'
            Y.fillRect(0, 0, G, U)
            Y.drawImage(q, 0, 0, G, U)
          }
        }
        processOrientation(Y, K, q, j, U)
        const compressRate = Math.min(1, imageCompressionRate)
        const base64Data = K.toDataURL('image/jpeg', compressRate)
        resolve(base64Data)
      } catch (e) {
        resolve('')
      }
    }
    U.onerror = () => {
      resolve('')
    }
  })
}

const getArrayBufferAsync = (file: File) => {
  return new Promise((B, G) => {
    const U = new FileReader()
    ;(U.onabort = () => {
      G('Load Aborted')
    }),
      (U.onerror = () => {
        G(U.error)
      }),
      (U.onload = () => {
        B(U.result)
      }),
      U.readAsArrayBuffer(file)
  })
}
export const bingGetOrientationAsync = async (file: File) => {
  const np = {
    '1': 'Default',
    '2': 'HFlip',
    '3': 'R180',
    '4': 'HFlipR180',
    '5': 'HFlipR270',
    '6': 'R270',
    '7': 'HFlipR90',
    '8': 'R90',
    NotJpeg: -2,
    '-2': 'NotJpeg',
    NotDefined: -1,
    '-1': 'NotDefined',
    Default: 1,
    HFlip: 2,
    R180: 3,
    HFlipR180: 4,
    HFlipR270: 5,
    R270: 6,
    HFlipR90: 7,
    R90: 8,
  }
  const B = (await getArrayBufferAsync(file)) as any,
    G = new DataView(B)
  if (65496 !== G.getUint16(0, !1)) return np.NotJpeg
  const U = G.byteLength
  let q = 2
  for (; q < U; ) {
    const O = G.getUint16(q, !1)
    if (((q += 2), 65505 === O)) {
      if (1165519206 !== G.getUint32((q += 2), !1)) break
      const O = 18761 === G.getUint16((q += 6), !1)
      q += G.getUint32(q + 4, O)
      const B = G.getUint16(q, O)
      q += 2
      for (let U = 0; U < B; U++)
        if (274 === G.getUint16(q + 12 * U, O)) {
          const B = q + 12 * U + 8
          return G.getUint16(B, O)
        }
    } else {
      if (65280 != (65280 & O)) break
      q += G.getUint16(q, !1)
    }
  }
  return np.NotDefined
}
