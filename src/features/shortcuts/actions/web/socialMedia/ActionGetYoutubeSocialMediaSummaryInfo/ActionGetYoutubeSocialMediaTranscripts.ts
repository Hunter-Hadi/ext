import { getFeatureNameByConversationAndContextMenu } from '@/features/auth/utils/log'
import { stopActionMessageStatus } from '@/features/shortcuts/actions/utils/actionMessageTool'
import {
  TranscriptResponse,
  YoutubeTranscript,
} from '@/features/shortcuts/actions/web/ActionGetYoutubeTranscriptOfURL/YoutubeTranscript'
import Action from '@/features/shortcuts/core/Action'
import { IShortcutEngineExternalEngine } from '@/features/shortcuts/types'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import { SummaryContextMenuOverwriteMap } from '@/features/sidebar/utils/pageSummaryHelper'
import { getCurrentDomainHost } from '@/utils/dataHelper/websiteHelper'

/**
 * @since 2024-03-17
 * @description youtube拿取时间文本TRANSCRIPT数据
 * @deprecated - TODO 需要重构，这个多余了. 已经有-> src/features/shortcuts/actions/web/ActionGetYoutubeTranscriptOfURL
 */
export class ActionGetYoutubeSocialMediaTranscripts extends Action {
  static type: ActionIdentifier = 'YOUTUBE_GET_TRANSCRIPT'
  isStopAction = false
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
    try {
      const { clientMessageChannelEngine, clientConversationEngine } = engine
      // TODO 需要重构,临时记录call-api
      if (clientMessageChannelEngine) {
        const recordContextMenuData =
          SummaryContextMenuOverwriteMap['YOUTUBE_VIDEO_SUMMARY']?.[
            'transcript'
          ]
        if (clientConversationEngine?.currentConversationId) {
          const conversation =
            await clientConversationEngine?.getCurrentConversation()
          await clientMessageChannelEngine
            .postMessage({
              event: 'Client_logCallApiRequest',
              data: {
                name: recordContextMenuData?.text || 'UNKNOWN',
                id: recordContextMenuData?.id || 'UNKNOWN',
                type: 'preset',
                featureName:
                  getFeatureNameByConversationAndContextMenu(conversation),
                host: getCurrentDomainHost(),
                conversationId: clientConversationEngine?.currentConversationId,
                url: location.href,
              },
            })
            .then()
            .catch()
        }
      }
      if (this.isStopAction) return
      // TODO 某些视频这里返回的只有英文，下面处理结果要针对用户语言优化
      const transcripts = await this.getYoutubeTranscript()
      if (this.isStopAction) return
      if (!transcripts || transcripts.length === 0) {
        this.output = JSON.stringify([])
        return
      }
      const sectionMaxCharsNum = this.computeSectionMaxChars(transcripts)
      if (this.isStopAction) return
      const transcriptsProcessedData = this.splitTranscriptArrayByWordCount(
        transcripts,
        sectionMaxCharsNum,
      )
      if (this.isStopAction) return
      this.output = JSON.stringify(transcriptsProcessedData)
    } catch (e) {
      this.output = JSON.stringify([])
    }
  }
  /**
   * @description 计算出当前一章最大多少字数
   */
  computeSectionMaxChars(dataArray: TranscriptResponse[]) {
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
  /**
   * @description 根据maxChars 进行切片章节
   */
  splitTranscriptArrayByWordCount(
    dataArray: TranscriptResponse[],
    maxChars = 515,
  ) {
    const result: TranscriptResponse[] = [] // 存储分割后的结果
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
  async getYoutubeTranscript() {
    const currentUrl = window.location.href.includes('youtube.com')
      ? window.location.href
      : ''
    const youtubeLinkURL = this.parameters.URLActionURL || currentUrl || ''
    if (!youtubeLinkURL) {
      this.error = 'Youtube URL is empty.'
      return false
    }
    if (this.isStopAction) return
    let transcripts: TranscriptResponse[] = []
    transcripts = await YoutubeTranscript.fetchTranscript(youtubeLinkURL) //获取youtube transcript 数据
    if (transcripts && transcripts.length !== 0) {
      return transcripts
    } else {
      //本地开发 发现会 有跨域异常问题，所以这里做一个重试请求
      await new Promise((resolve) => setTimeout(resolve, 1000)) // 等待1秒重试请求
      transcripts = await YoutubeTranscript.fetchTranscript(youtubeLinkURL) //获取youtube transcript 数据
      return transcripts
    }
  }
  generateTimestampedLinks(dataArray: TranscriptResponse[]) {
    // 对数组中的每个对象进行映射操作
    const links: TranscriptResponse[] = dataArray.map((item) => {
      // 从数据中取出start和text
      const { start } = item
      // 格式化start时间为"小时:分钟:秒"的格式
      const timeString = this.formatSecondsAsTimestamp(start)
      // 返回格式化后的字符串
      return {
        ...item,
        start: timeString,
      }
    })

    // 将所有的链接拼接成为一个长字符串，每个链接之间用换行符分隔
    return links
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
  async stop(params: { engine: IShortcutEngineExternalEngine }) {
    this.isStopAction = true
    await stopActionMessageStatus(params)
    return true
  }
}
