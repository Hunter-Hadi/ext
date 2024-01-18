/**
 * 转换text为aspectRatio
 * @param text
 */
export const artTextToAspectRatio = (text?: string) => {
  if (!text) {
    return 1
  }
  try {
    const [width, height] = text.split(':').map(Number)
    const ratio = width / height
    return isNaN(ratio) ? 1 : ratio
  } catch (e) {
    return 1
  }
}
