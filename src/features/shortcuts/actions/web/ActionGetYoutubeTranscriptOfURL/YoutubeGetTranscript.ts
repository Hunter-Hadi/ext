import Action from '@/features/shortcuts/core/Action'
import { IShortcutEngineExternalEngine } from '@/features/shortcuts/types'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'

import { TranscriptResponse } from './YoutubeTranscript'

/**
 * @since 2024-03-17
 * @description youtube拿取时间文本TRANSCRIPT数据
 */
export class ActionYoutubeGetTranscript extends Action {
  static type: ActionIdentifier = 'YOUTUBE_GET_TRANSCRIPT'
  constructor(
    id: string,
    type: ActionIdentifier,
    parameters: ActionParameters,
    autoExecute: boolean,
  ) {
    super(id, type, parameters, autoExecute)
  }
  async execute(
    params: ActionParameters,
    engine: IShortcutEngineExternalEngine,
  ) {
    console.log('simply params', params.LAST_ACTION_OUTPUT, engine)
    try {
      const timeTextList = this.splitArrayByWordCount(
        (params.LAST_ACTION_OUTPUT as unknown) as TranscriptResponse[],
      )
      if (timeTextList && timeTextList.length > 0) {
        this.output = this.generateTimestampedLinks(
          timeTextList,
          window.location.href,
        )
        return
      }
      this.output = 'Sorry, No  Transcription Available... 😢'
    } catch (e) {
      this.output = 'Sorry, No  Transcription Available... 😢'
    }
  }
  splitArrayByWordCount(arr: TranscriptResponse[], maxChars = 515) {
    const result: TranscriptResponse[] = [] // 存储分割后的结果
    let currentItem = { start: '', duration: 0, text: '' }
    let currentTextList: string[] = [] // 当前文本暂存列表
    let currentCharsCount = 0 // 当前字符计数

    arr.forEach((item, index) => {
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
        if (index === arr.length - 1) {
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
  generateTimestampedLinks(dataArray: TranscriptResponse[], url: string) {
    // 对数组中的每个对象进行映射操作
    const links = dataArray.map((item) => {
      // 从数据中取出start和text
      const { start, text } = item

      // 格式化start时间为"小时:分钟:秒"的格式
      const timeString = this.formatSecondsAsTimestamp(start)

      // 返回格式化后的字符串
      return `- [${timeString}](${url}&t=${start}s) ${text}\n`
    })

    // 将所有的链接拼接成为一个长字符串，每个链接之间用换行符分隔
    return links.join('')
  }

  // 将秒数格式化为"小时:分钟:秒"的格式
  formatSecondsAsTimestamp(seconds: string) {
    // 将字符串转换为浮点数并取整
    const totalSeconds = Math.round(parseFloat(seconds))
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds - hours * 3600) / 60)
    const sec = totalSeconds - hours * 3600 - minutes * 60

    // 使用padStart在个位数前添加0，格式化字符串为两位数
    const hoursString = hours.toString().padStart(2, '0')
    const minutesString = minutes.toString().padStart(2, '0')
    const secondsString = sec.toString().padStart(2, '0')
    if (hoursString !== '00') {
      return `${hoursString}:${minutesString}:${secondsString}`
    } else {
      return `${minutesString}:${secondsString}`
    }
  }
}
