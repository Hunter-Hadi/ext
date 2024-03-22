export const computeMaxChars = (dataArray: { text: string }[]) => {
  let totalLength = 0

  for (let i = 0; i < dataArray.length; i++) {
    totalLength += dataArray[i].text.length
  }
  if (totalLength < 2000) {
    return 350
  } else {
    return 500
  }
}
export const splitArrayByWordCount = (
  dataArray: { text: string; start: string; duration: string }[],
  maxChars = 515,
) => {
  const result: { text: string; start: string; duration: string }[] = [] // 存储分割后的结果
  let currentItem = { start: '', duration: 0, text: '' }
  let currentTextList: string[] = [] // 当前文本暂存列表
  let currentCharsCount = 0 // 当前字符计数

  dataArray.forEach((item, index) => {
    // 如果当前item的text和已有的text累加不会超过maxChars，就继续合并
    if (currentCharsCount + item.text.length <= maxChars) {
      // 设置start时间为第一次合并的item时间
      if (currentItem.start === '') {
        currentItem.start = item.start
      }

      // 累加duration
      currentItem.duration += parseFloat(item.duration)

      currentTextList.push(item.text)
      currentCharsCount += item.text.length

      // 如果是数组的最后一个元素，也直接加到结果中
      if (index === dataArray.length - 1) {
        currentItem.text = currentTextList.join(' ')

        result.push({
          ...currentItem,
          duration: currentItem.duration.toString(),
        })
      }
    } else {
      // 当累加文本长度超过maxChars时，先将之前的text合并
      currentItem.text = currentTextList.join(' ')
      result.push({
        ...currentItem,
        duration: currentItem.duration.toString(),
      })

      // 重置currentItem和计数器，为下一个合并做准备
      currentItem = {
        start: item.start,
        duration: parseFloat(item.duration),
        text: item.text,
      }
      currentTextList = [item.text]
      currentCharsCount = item.text.length
    }
  })

  return result
}
