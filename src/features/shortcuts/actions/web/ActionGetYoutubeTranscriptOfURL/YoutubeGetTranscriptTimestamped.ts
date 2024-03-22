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

/**
 * @since 2024-03-17
 * @description youtube拿取时间文本TRANSCRIPT数据进行TIMESTAMPED
 */
export class ActionYoutubeGetTranscriptTimestamped extends Action {
  static type: ActionIdentifier = 'YOUTUBE_GET_TRANSCRIPT_TIMESTAMPED'
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
    console.log('simply params', params, engine)
    // console.log('simply getChaptersInfoList', this.getChaptersInfoList())
    try {
      const transcript = params.LAST_ACTION_OUTPUT as
        | TranscriptResponse[]
        | undefined
      if (
        !transcript ||
        transcript.length === 0 ||
        !engine.clientConversationEngine?.currentConversationIdRef?.current
      ) {
        //为空
        this.output = JSON.stringify([])
        return
      }
      const chaptersInfoList = this.getChaptersInfoList()
      console.log('simply chaptersInfoList', chaptersInfoList)

      if (chaptersInfoList) {
        //进入chapters逻辑判断
        const chapterTextList = this.getChaptersAllTextList(
          chaptersInfoList,
          transcript,
        )
        console.log('simply chapterTextList', chapterTextList)
        const oldTranscriptList: any[] = this.getPrepareData(chapterTextList)
        console.log('simply oldTranscriptList 1', oldTranscriptList)
        if (chapterTextList.length > 0) {
          for (const index in chapterTextList) {
            const transcriptList: any = await this.testAjaxGet(
              params.CURRENT_WEBPAGE_TITLE || '',
              chapterTextList[index],
            )
            oldTranscriptList[index].text = transcriptList?.text
            oldTranscriptList[index].children = transcriptList?.children
            oldTranscriptList[index].status = 'complete'

            console.log('simply oldTranscriptList 2', oldTranscriptList)

            this.upConversationMessageInfo(
              engine.clientConversationEngine?.currentConversationIdRef
                ?.current,
              (params as any).AI_RESPONSE_MESSAGE_ID,
              oldTranscriptList,
            )
            this.output = JSON.stringify(oldTranscriptList)
          }
          console.log('simply end ----------------------')
        } else {
          this.output = JSON.stringify([])
        }
      } else {
        //进入
        this.output = JSON.stringify([])
      }
    } catch (e) {
      this.output = JSON.stringify([])
    }
  }
  async askGptReturnJson(
    title: string,
    chapterTextList: {
      text: string
      title: string
      start: string
      // tokens: number
    },
  ) {
    const abortTaskId = uuidV4()
    const jsonFormat = {
      start: 'Write  Start Time',
      text: 'Write content',
      tip: 'The content should not exceed 20 words',
      children: [
        {
          start: 'Write Start Time',
          text: 'Write son content',
          tip: 'The content should not exceed 20 words',
        },
      ],
    }
    const newPrompt = `
    Your goal is to divide the large blocks of your transcript into information sections with common themes, and record the start timestamp of each section.
Each information block contains a timestamp start at the beginning of the chapter, a text description of the main content of the entire chapter, and 1-3 key points that explain the main ideas of the children throughout the chapter. Do not use words like "emphasis" to delve deeper into specific details and terminology.
Your answer must be concise, rich in content, easy to read and understand.
According to the required format, do not write any additional content, avoid using common phrases, and do not repeat my tasks. Focus on practical implementation. Including specific topics for discussion, suggestions for students
The content is as follows 
${JSON.stringify(chapterTextList)}`
    console.log('simply sssss', newPrompt)
    const askDAta = await clientAskMaxAIChatProvider(
      'USE_CHAT_GPT_PLUS',
      'claude-3-haiku',
      {
        message_content: [
          {
            type: 'text',
            text: newPrompt,
          },
        ],
        prompt_id: 'cae761b7-3703-4ff9-83ab-527b7a24e53b',
        prompt_name: '[Search] smart page',
      },
      abortTaskId,
    )
    try {
      console.log('simply askDAta', askDAta.data)

      console.log('simply askDAta JSON', JSON.parse(askDAta.data))
    } catch (e) {
      console.error('simply askDAta error', e)
      return askDAta
    }
    return askDAta
  }
  getPrepareData(
    list: {
      tokens: number
      text: string
      title: string
      start: string
    }[],
  ) {
    return list.map((item) => ({
      id: uuidV4(),
      start: this.timestampToSeconds(item.start),
      text: '',
      status: 'loading',
      children: [],
    }))
  }
  testAjaxGet(title: string, chapterTextList: any) {
    //快速开发prompt 使用
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
The returned JSON can have up to two levels`
    const newPrompt = `
[VIDEO TRANSCRIPT]:
${JSON.stringify(chapterTextList)}
`
    const myHeaders = new Headers()
    myHeaders.append(
      'Authorization',
      'Bearer sk-LEg28pwlYqYj0qBmAXjBv5gRTVsy0CvKhcThzOkdOLxti4qP',
    )
    myHeaders.append('User-Agent', 'Apifox/1.0.0 (https://apifox.com)')
    myHeaders.append('Content-Type', 'application/json')

    const raw = JSON.stringify({
      model: 'gpt-3.5-turbo-1106',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: newPrompt,
        },
      ],
      stream: false,
      params: {
        n: 1,
        response_format: {
          type: 'json_object',
        },
      },
    })

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
    }
    return new Promise((resolve, reject) => {
      fetch(
        'https://api.chatanywhere.com.cn/v1/chat/completions',
        requestOptions,
      )
        .then((response) => response.text())
        .then((result) => {
          try {
            console.log('simply ajax', JSON.parse(result).choices)
            const jsonStr: string = JSON.parse(result)?.choices?.[0]?.message
              ?.content
            console.log('simply json', this.getObjectFromString(jsonStr))
            resolve(this.getObjectFromString(jsonStr))
          } catch (e) {
            reject()
          }
        })
        .catch((error) => {
          console.log('simply ajax error', error)
          reject()
        })
    })
  }
  getChaptersAllTextList(
    chaptersList: {
      title: string
      start: string
    }[],
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
        chaptersTextList[
          currentChapterIndex
        ].text += `[start:${transcriptStartSeconds},text:${transcript.text}]`
      }
    })

    return chaptersTextList.map((item) => {
      const systemPromptTokens = getTextTokens(item.text || '').length
      return { ...item, tokens: systemPromptTokens }
    })
  }
  getChaptersInfoList() {
    const chapters: {
      title: string
      start: string
    }[] = []
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
  computeMaxChars(dataArray: TranscriptResponse[]) {
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
        return JSON.parse(jsonStr)
      } catch (error) {
        match = null
      }
    }

    // 尝试匹配 ```json ```包裹中匹配
    const regex = /```json\n([\s\S]*?)\n```/
    match = str.match(regex)
    if (match) {
      jsonStr = match[1]

      try {
        return JSON.parse(jsonStr)
      } catch (error) {
        match = null
      }
    }

    // 直接尝试解析
    try {
      if (jsonStr) {
        return JSON.parse(jsonStr)
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
              isComplete: true,
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
    await stopActionMessage(params)
    return true
  }
}
