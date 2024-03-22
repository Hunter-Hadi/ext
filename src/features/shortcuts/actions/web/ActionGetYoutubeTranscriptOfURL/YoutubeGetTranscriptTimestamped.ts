import JSON5 from 'json5'
import { v4 as uuidV4 } from 'uuid'

import clientAskMaxAIChatProvider from '@/features/chatgpt/utils/clientAskMaxAIChatProvider'
import { clientChatConversationModifyChatMessages } from '@/features/chatgpt/utils/clientChatConversation'
import Action from '@/features/shortcuts/core/Action'
import { IShortcutEngineExternalEngine } from '@/features/shortcuts/types'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import { getTextTokens } from '@/features/shortcuts/utils/tokenizer'

import { stopActionMessage } from '../../common'
import { TranscriptResponse } from './YoutubeTranscript'
import { withLoadingDecorators } from '@/features/shortcuts/decorators'
import { clientAbortFetchAPI } from '@/features/shortcuts/utils'

type TranscriptTimestampedType = {
  title: string
  start: string
}
type TranscriptTimestampedTextType = {
  text: string
  start: string
  tokens?: number
}
type TranscriptTimestampedGptType = {
  children: TranscriptTimestampedParamType[]
  start: number
  text: string
}
type TranscriptTimestampedParamType = {
  id: string
  children: TranscriptTimestampedParamType[]
  status: 'loading' | 'complete' | 'error'
  start: number
  text: string
}
/**
 * @since 2024-03-17
 * @description youtube拿取时间文本TRANSCRIPT数据进行TIMESTAMPED
 */
export class ActionYoutubeGetTranscriptTimestamped extends Action {
  static type: ActionIdentifier = 'YOUTUBE_GET_TRANSCRIPT_TIMESTAMPED'
  maxChapters = 20
  isStop = false
  abortTaskIds: string[] = []
  constructor(
    id: string,
    type: ActionIdentifier,
    parameters: ActionParameters,
    autoExecute: boolean,
  ) {
    super(id, type, parameters, autoExecute)
  }
  @withLoadingDecorators()
  async execute(
    params: ActionParameters,
    engine: IShortcutEngineExternalEngine,
  ) {
    console.log('simply params', params.LAST_ACTION_OUTPUT) //LAST_ACTION_OUTPUT有时候会没有
    try {
      const conversationId =
        engine.clientConversationEngine?.currentConversationIdRef?.current
      const messageId = (params as { AI_RESPONSE_MESSAGE_ID?: string })
        .AI_RESPONSE_MESSAGE_ID
      const transcript = params.LAST_ACTION_OUTPUT as
        | TranscriptResponse[]
        | undefined
      if (
        !transcript ||
        transcript.length === 0 ||
        !conversationId ||
        !messageId
      ) {
        //为空
        this.output = JSON.stringify([])
        return
      }

      const chaptersInfoList = this.getChaptersInfoList()
      const allText = transcript.map((item) => item.text).join('')
      const systemPromptTokens = getTextTokens(allText || '').length

      if (
        chaptersInfoList &&
        chaptersInfoList.length !== 0 &&
        systemPromptTokens > 2000
      ) {
        //进入chapters逻辑判断
        const chapterTextList: TranscriptTimestampedTextType[] = this.getChaptersAllTextList(
          chaptersInfoList,
          transcript,
        )
        if (chapterTextList.length > 0) {
          const chapterList = await this.batchAskGptUpdate(
            conversationId,
            messageId,
            chapterTextList,
          )
          this.output = JSON.stringify(chapterList)
        } else {
          this.output = JSON.stringify([])
        }
      } else {
        debugger
        //自己创建chapters逻辑
        const chaptersList = this.createChapters(transcript)
        const chapterTextList: TranscriptTimestampedTextType[] = this.getChaptersAllTextList(
          chaptersList,
          transcript,
        )
        if (chapterTextList.length > 0) {
          const chapterList = await this.batchAskGptUpdate(
            conversationId,
            messageId,
            chapterTextList,
          )
          this.output = JSON.stringify(chapterList)
        } else {
          this.output = JSON.stringify([])
        }
      }
    } catch (e) {
      this.output = JSON.stringify([])
    }
  }
  async batchAskGptUpdate(
    conversationId: string,
    messageId: string,
    chapterTextList: TranscriptTimestampedTextType[],
  ) {
    try {
      const oldTranscriptList: TranscriptTimestampedParamType[] = this.getPrepareData(
        chapterTextList,
      )
      for (const index in chapterTextList) {
        if (this.isStop) return oldTranscriptList
        const startTime = Date.now() // 记录请求开始时间
        const transcriptList = await this.askGptReturnJson(
          chapterTextList[index],
        )
        const endTime = Date.now() // 记录请求结束时间
        const requestDuration = endTime - startTime // 计算请求耗时
        if (this.isStop) return oldTranscriptList
        if (transcriptList) {
          oldTranscriptList[index].text = transcriptList?.text
          oldTranscriptList[index].children = transcriptList?.children
          oldTranscriptList[index].status = 'complete'
        } else {
          oldTranscriptList[index].status = 'error'
          oldTranscriptList[index].text = '错误了，请重试'
        }
        this.upConversationMessageInfo(
          conversationId,
          messageId,
          oldTranscriptList,
        )
        // 如果请求耗时少于5秒，等待剩余时间
        if (requestDuration < 3000) {
          await new Promise((resolve) =>
            setTimeout(resolve, 3000 - requestDuration),
          )
        }
      }
      return oldTranscriptList
    } catch (e) {
      return []
    }
  }
  async askGptReturnJson(chapterTextList: {
    text: string
    start: string
    tokens?: number
  }) {
    return new Promise<TranscriptTimestampedGptType>((resolve, reject) => {
      const systemPrompt = `Remember, you are a tool for summarizing transcripts
    Help me quickly understand the summary of key points and the start timestamp
    The transcript are composed in the following format
    [start:transcript start time,text: transcript text]
    Follow the required format, don't write anything extra, avoid generic phrases, and don't repeat my task. 
    Return in JSON format:
    interface IJsonFormat {
    text: string //About 10-20 words to describe, Text description of the main content of the entire chapter, write down the text
    start: number //In seconds，User reference text start time
    children: [
    //The 1-3 key points on VIDEO TRANSCRIPT, starting from low to high, allow me to quickly understand the details, and pay attention to all the VIDEO TRANSCRIPT 1-3 key points
    {
      text: string //About 10-20 words to describe, the first key point, Write text
      start: number //In seconds，User reference text start time
    },
    {
      text: string //About 10-20 words to describe, the second key point is to write the text
      start: number //In seconds，User reference text start time
    },
    {
      text: string //About 10-20 words to describe, the third key point, write the text
      start: number //In seconds，User reference text start time
    },
    ]
    }
    The returned JSON can have up to two levels
    `
      const newPrompt = `
    [VIDEO TRANSCRIPT]:
    ${chapterTextList.text}
    `
      const currentAbortTaskId = uuidV4()
      this.abortTaskIds.push(currentAbortTaskId)
      clientAskMaxAIChatProvider(
        'OPENAI_API',
        (chapterTextList.tokens || 0) > 1000 * 15
          ? 'gpt-4-0125-preview'
          : 'gpt-3.5-turbo-1106', //大于16k采用GPT4.0
        {
          chat_history: [
            {
              role: 'ai',
              content: [
                {
                  type: 'text',
                  text: systemPrompt,
                },
              ],
            },
          ],
          message_content: [
            {
              type: 'text',
              text: newPrompt,
            },
          ],
          prompt_id: uuidV4(),
          prompt_name: 'Timestamped summary',
        },
        currentAbortTaskId,
      )
        .then((askDAta) => {
          try {
            this.abortTaskIds = this.abortTaskIds.filter(
              (id) => id !== currentAbortTaskId,
            )
            try {
              console.log('simply askDAta', askDAta)
              console.log(
                'simply askDAta json',
                this.getObjectFromString(askDAta.data),
              )
              resolve(this.getObjectFromString(askDAta.data))
            } catch (e) {
              reject()
            }
          } catch (e) {
            console.error('simply askDAta error', e)
            reject()
          }
        })
        .catch((e) => {
          console.error('simply askDAta error', e)
          reject()
        })
    })
  }
  getPrepareData(list: { start: string }[]) {
    const newList: TranscriptTimestampedParamType[] = list.map((item) => ({
      id: uuidV4(),
      start: this.timestampToSeconds(item.start),
      text: '',
      status: 'loading',
      children: [],
    }))
    return newList
  }
  getChaptersAllTextList(
    chaptersList: TranscriptTimestampedType[],
    transcriptList: TranscriptResponse[],
  ) {
    // 将章节开始时间转换为秒并且缓存
    const chaptersStartSeconds = chaptersList.map((chapter) =>
      this.timestampToSeconds(chapter.start),
    )

    // 将最后章节的结束时间设置为无穷大，作为最后的边界
    chaptersStartSeconds.push(Infinity)

    // 准备最终的章节文本列表，初始时每个章节的文本都为空
    const chaptersTextList = chaptersList.map((chapter) => ({
      ...chapter,
      text: '',
    }))

    // 当前正在处理的章节索引
    let currentChapterIndex = 0

    // 遍历每个传录片段
    transcriptList.forEach((transcript) => {
      const transcriptStartSeconds = parseFloat(transcript.start)

      // 更新当前章节索引到适当的位置，确保当前传录片段落在正确的章节范围内
      while (
        transcriptStartSeconds >= chaptersStartSeconds[currentChapterIndex + 1]
      ) {
        currentChapterIndex++
      }

      // 将传录片段的文本加入到当前的章节文本中
      if (transcriptStartSeconds >= chaptersStartSeconds[currentChapterIndex]) {
        chaptersTextList[currentChapterIndex].text += transcript.text
          ? `[start:${transcriptStartSeconds},text:${transcript.text}]`
          : ''
      }
    })

    return chaptersTextList
      .filter((item) => !!item.text)
      .map((item) => {
        const systemPromptTokens = getTextTokens(item.text || '').length
        return { tokens: systemPromptTokens, ...item }
      })
  }
  getChaptersInfoList() {
    const chapters: TranscriptTimestampedType[] = []
    const chaptersAllDom = document.querySelectorAll(
      '#panels #content #contents ytd-macro-markers-list-item-renderer',
    )
    if (chaptersAllDom.length > 0) {
      chaptersAllDom.forEach((item) => {
        const title = item.querySelector('#details h4')?.innerHTML
        const start = item.querySelector('#details #time')?.innerHTML
        if (title && start) {
          chapters.push({
            title,
            start,
          })
        }
      })
      return chapters
    } else {
      return chapters
    }
  }
  timestampToSeconds = (timestamp: string) => {
    const timeArray = timestamp.split(':').map(Number)

    let totalSeconds = 0
    for (let i = timeArray.length - 1; i >= 0; i--) {
      totalSeconds += timeArray[i] * Math.pow(60, timeArray.length - 1 - i)
    }

    return totalSeconds
  }
  createChapters(dataArray: TranscriptResponse[]) {
    //最多1万tokens一章
    //最少1000tokens一章
    // 计算所有字幕文本的tokens总数
    let currentMinText = 1000
    const allText = dataArray.map((item) => item.text).join('')
    const systemPromptTokens = getTextTokens(allText || '').length
    const allDuration = dataArray[dataArray.length - 1].start
    if (systemPromptTokens < 2000) {
      currentMinText = 600 //5
    } else if (systemPromptTokens < 4000) {
      currentMinText = 800 //5
    } else if (systemPromptTokens < 5000) {
      currentMinText = 1000 //5
    } else if (systemPromptTokens < 10000) {
      currentMinText = 1200 //5
    } else if (systemPromptTokens < 130000) {
      currentMinText = systemPromptTokens / 10
    } else {
      currentMinText = 13000
    }
    // 首先，计算最多1万tokens一章可以分出的章节数
    let chapterCount = Math.floor(systemPromptTokens / currentMinText)
    console.log('simply chapterCount 1', chapterCount)

    // 检查是否有余数且余数大于设定的阈值（2000个tokens）
    if (systemPromptTokens % currentMinText > 500 || chapterCount === 0) {
      chapterCount += 1 // 如果余数大于2000，则章节数进1
    }
    console.log('simply chapterCount 2', chapterCount)
    const partDuration = parseFloat(allDuration) / chapterCount // 每份的时长

    const chapters = new Array(chapterCount).fill({}).map((item, index) => {
      return {
        title: index.toString(),
        start: (index * partDuration).toFixed(2).toString(),
      }
    })
    console.log(
      'simply totalLength',
      allText.length,
      systemPromptTokens,
      chapterCount,
      chapters,
    )
    return chapters
  }
  splitArrayByWordCount(dataArray: TranscriptResponse[], maxChars = 515) {
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
  getObjectFromString(str: string) {
    let jsonStr = null

    // 尝试匹配 json object
    const reg = /\{[\s\S]*\}/
    let match = str.match(reg)
    if (match) {
      jsonStr = match[0]
      try {
        return JSON5.parse(jsonStr)
      } catch (error) {
        match = null
      }
    }

    // 尝试匹配 ```json ```包裹中匹配
    const regex = /```json\s*([\s\S]*?)\s*```/
    match = str.match(regex)
    if (match) {
      jsonStr = match[1]

      try {
        return JSON5.parse(jsonStr)
      } catch (error) {
        match = null
      }
    }

    // 直接尝试解析
    try {
      if (jsonStr) {
        return JSON5.parse(jsonStr)
      } else {
        return null
      }
    } catch (error) {
      return null
    }
  }

  async upConversationMessageInfo(
    conversationId: string,
    messageId: string,
    transcriptData: any,
  ) {
    console.log(
      'upConversationMessageInfo',
      conversationId,
      messageId,
      transcriptData,
    )
    await clientChatConversationModifyChatMessages(
      'update',
      conversationId,
      0,
      [
        {
          type: 'ai',
          messageId: messageId,
          originalMessage: {
            metadata: {
              isComplete: false,
              sources: {
                status: 'complete',
              },
              copilot: {
                steps: [
                  {
                    title: 'Analyzing video',
                    status: 'complete',
                    icon: 'SmartToy',
                    value: '',
                  },
                ],
              },
              deepDive: [
                {
                  type: 'timestampedSummary',
                  status: 'complete',
                  title: {
                    title: 'Summary',
                    titleIcon: 'Menu',
                  },
                  value: transcriptData,
                },
              ],
            },
          },
        } as any,
      ],
    )
  }
  async stop(params: { engine: IShortcutEngineExternalEngine }) {
    this.isStop = true
    this.abortTaskIds.forEach((id) => {
      clientAbortFetchAPI(id)
    })
    await stopActionMessage(params)
    return true
  }
}
