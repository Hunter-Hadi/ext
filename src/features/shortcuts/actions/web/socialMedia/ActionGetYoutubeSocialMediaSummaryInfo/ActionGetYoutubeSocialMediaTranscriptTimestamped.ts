import JSON5 from 'json5'
import { v4 as uuidV4 } from 'uuid'

import { DEFAULT_AI_OUTPUT_LANGUAGE_VALUE } from '@/constants'
import clientAskMaxAIChatProvider from '@/features/chatgpt/utils/clientAskMaxAIChatProvider'
import { clientChatConversationModifyChatMessages } from '@/features/chatgpt/utils/clientChatConversation'
import generatePromptAdditionalText from '@/features/shortcuts/actions/chat/ActionAskChatGPT/generatePromptAdditionalText'
import { stopActionMessageStatus } from '@/features/shortcuts/actions/utils/actionMessageTool'
import {
  TranscriptResponse,
  YoutubeTranscript,
} from '@/features/shortcuts/actions/web/ActionGetYoutubeTranscriptOfURL/YoutubeTranscript'
import Action from '@/features/shortcuts/core/Action'
import { withLoadingDecorators } from '@/features/shortcuts/decorators'
import { IShortcutEngineExternalEngine } from '@/features/shortcuts/types'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import { clientAbortFetchAPI } from '@/features/shortcuts/utils'
import {
  getTextTokens,
  sliceTextByTokens,
} from '@/features/shortcuts/utils/tokenizer'
import clientGetLiteChromeExtensionDBStorage from '@/utils/clientGetLiteChromeExtensionDBStorage'

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
export class ActionGetYoutubeSocialMediaTranscriptTimestamped extends Action {
  static type: ActionIdentifier = 'YOUTUBE_GET_TRANSCRIPT_TIMESTAMPED'
  isStopAction = false
  requestIntervalTime = 1000 * 4 //一个接口更下一个接口的间隔时间，因为很短设置了时间限制，保守4秒
  requestExceptionIntervalTime = 1000 * 5 //接口异常等待时间后执行
  maxChatGptTokens = 13000 //一个切片 最多 的tokens储存量
  abortTaskIds: string[] = [] //接口取消功能数据
  errorRequestOrder = 0 //接口异常情况请求次数记录
  errorMaxRequestOrder = 3 //接口异常情况请求最多次数记录
  viewLatestTranscriptData: TranscriptTimestampedParamType[] = []
  currentWebPageTitle = ''
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
    try {
      this.output = JSON.stringify([]) //设置初始值，翻译return 异常数据导致视图渲染错误
      if (this.isStopAction) return
      this.currentWebPageTitle = params?.CURRENT_WEBPAGE_TITLE || ''

      const transcripts = await this.getYoutubeTranscript() //获取youtube transcript 数据
      console.log('simply transcripts', transcripts)
      if (this.isStopAction) return
      const conversationId =
        engine.clientConversationEngine?.currentConversationIdRef?.current
      const messageId = (params as { AI_RESPONSE_MESSAGE_ID?: string })
        .AI_RESPONSE_MESSAGE_ID
      if (
        !transcripts ||
        transcripts.length === 0 ||
        !conversationId ||
        !messageId
      ) {
        //为空
        this.output = JSON.stringify([])
        return
      }
      if (this.isStopAction) return

      const chaptersInfoList = this.getChaptersInfoList()
      const transcriptsText = transcripts.map((item) => item.text).join('')
      const transcriptsTokens = getTextTokens(transcriptsText || '').length

      if (
        chaptersInfoList &&
        chaptersInfoList.length !== 0 &&
        transcriptsTokens > 1000 //tokens大于1000才进入chapters逻辑，因为怕官方切片过于多，这个功能后续要慢慢调试
      ) {
        if (this.isStopAction) return

        //进入chapters逻辑判断
        const chapterTextList: TranscriptTimestampedTextType[] =
          this.getChaptersAllTextList(chaptersInfoList, transcripts)
        if (this.isStopAction) return

        const chapterSliceTextList = await this.chaptersSliceTextByTokens(
          chapterTextList,
        )
        console.log(
          'simply chapterTextList look tokens --',
          chapterSliceTextList,
        )
        if (this.isStopAction) return

        if (chapterSliceTextList.length > 0) {
          const chapterList = await this.batchRequestUpdateMessage(
            conversationId,
            messageId,
            chapterSliceTextList,
          )
          this.output = JSON.stringify(chapterList)
        } else {
          this.output = JSON.stringify([])
        }
      } else {
        //自己创建chapters逻辑
        if (this.isStopAction) return
        const chaptersList = this.createChapters(transcripts)
        if (this.isStopAction) return
        const chapterTextList: TranscriptTimestampedTextType[] =
          this.getChaptersAllTextList(chaptersList, transcripts)
        console.log('simply chapterTextList look tokens --', chapterTextList)
        if (chapterTextList.length > 0) {
          if (this.isStopAction) return
          const chapterList = await this.batchRequestUpdateMessage(
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
  async chaptersSliceTextByTokens(
    chapterTextList: TranscriptTimestampedTextType[],
  ) {
    try {
      for (const index in chapterTextList) {
        const sliceTextResult = await sliceTextByTokens(
          chapterTextList[index].text,
          this.maxChatGptTokens,
        )
        chapterTextList[index].text = sliceTextResult.text
        chapterTextList[index].tokens = sliceTextResult.tokens
      }
      return chapterTextList
    } catch (e) {
      console.log('simply chaptersSliceTextByTokens', chapterTextList)
      return chapterTextList
    }
  }
  async batchRequestUpdateMessage(
    conversationId: string,
    messageId: string,
    chapterTextList: TranscriptTimestampedTextType[],
  ) {
    try {
      const transcriptViewDataList: TranscriptTimestampedParamType[] =
        this.getPrepareViewData(chapterTextList)
      //创建更新transcript视图逻辑
      for (const index in chapterTextList) {
        if (this.isStopAction) return transcriptViewDataList //用户取消直接返回
        const startTime = Date.now() // 记录请求开始时间
        const transcriptList = await this.requestGptGetTranscriptJson(
          chapterTextList[index],
        ) //请求GPT返回json
        if (this.isStopAction) return transcriptViewDataList
        const endTime = Date.now() // 记录请求结束时间
        const requestDuration = endTime - startTime // 计算请求耗时
        if (transcriptList) {
          this.errorRequestOrder = 0
          transcriptViewDataList[index].text = transcriptList?.text
          transcriptViewDataList[index].children = transcriptList?.children
          transcriptViewDataList[index].status = 'complete'
        } else {
          transcriptViewDataList[index].status = 'error'
          if (this.errorRequestOrder >= this.errorMaxRequestOrder - 1) {
            this.isStopAction = true
          }
          this.errorRequestOrder += 1
        }
        this.updateConversationMessageInfo(
          conversationId,
          messageId,
          transcriptViewDataList,
        )
        // 如果请求耗时少于 几 秒，就等待剩余时间
        if (requestDuration < this.requestIntervalTime) {
          await new Promise((resolve) =>
            setTimeout(resolve, this.requestIntervalTime - requestDuration),
          )
        }
      }
      return transcriptViewDataList
    } catch (e) {
      return []
    }
  }
  async requestGptGetTranscriptJson(chapterTextList: {
    text: string
    start: string
    tokens?: number
  }) {
    const maxRetries = 2 // 最大尝试次数
    let retries = 0 // 当前尝试次数
    // 语言
    const userSelectedLanguage =
      (await clientGetLiteChromeExtensionDBStorage()).userSettings?.language ||
      DEFAULT_AI_OUTPUT_LANGUAGE_VALUE
    const getHaveLanguagePrompt = await generatePromptAdditionalText({
      AI_RESPONSE_LANGUAGE: userSelectedLanguage,
    }) //获取用户的i18设置prompt
    const systemPrompt = `Ignore all previous instructions. ${getHaveLanguagePrompt.data},you are a tool for summarizing transcripts
    Help me quickly understand the summary of key points and the start timestamp
    The transcript are composed in the following format
    [start:transcript start time,text: transcript text]
    Follow the required format, don't write anything extra, avoid generic phrases, and don't repeat my task. 
    gpt output text : No matter what the script says,Returned summarizing text language is ${getHaveLanguagePrompt.data}
    Return in JSON format:
    interface IJsonFormat {
    text: string //About 10-20 words to describe, Text description of the main content of the entire chapter, write down the text.${userSelectedLanguage}
    start: number //In seconds，User reference text start time
    children: [
    //The 1-3 key points on VIDEO TRANSCRIPT, starting from low to high, allow me to quickly understand the details, and pay attention to all the VIDEO TRANSCRIPT 1-3 key points
    {
      text: string //About 10-20 words to describe, the first key point, Write text.${getHaveLanguagePrompt.data}  
      start: number //In seconds，User reference text start time
    },
    {
      text: string //About 10-20 words to describe, the second key point,write the text.${getHaveLanguagePrompt.data}  
      start: number //In seconds，User reference text start time
    },
    {
      text: string //About 10-20 words to describe, the third key point, write the text.${getHaveLanguagePrompt.data}  
      start: number //In seconds，User reference text start time
    },
    ]
    }
    The returned JSON can have up to two levels
    `
    const newPrompt = `
    Ignore all previous instructions.${getHaveLanguagePrompt.data}
    [VIDEO TITLE]:
    ${this.currentWebPageTitle}
    [VIDEO TRANSCRIPT]:
    ${chapterTextList.text}

    Above is the transcript
    gpt output text :No matter what the VIDEO TRANSCRIPT says.${getHaveLanguagePrompt.data}
    Ignore all previous instructions.${getHaveLanguagePrompt.data}
    `
    console.log('simply getHaveLanguagePrompt.data', getHaveLanguagePrompt.data)
    const attemptRequest: () => Promise<
      TranscriptTimestampedGptType | false
    > = async () => {
      const currentAbortTaskId = uuidV4()
      this.abortTaskIds.push(currentAbortTaskId)
      if (this.isStopAction) return false
      try {
        const askData = await clientAskMaxAIChatProvider(
          'OPENAI_API',
          'gpt-3.5-turbo-1106',
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
        console.log('simply askData', askData)
        if (this.isStopAction) return false
        this.abortTaskIds = this.abortTaskIds.filter(
          (id) => id !== currentAbortTaskId,
        )
        if (askData && askData.success && askData.data) {
          //测试返回的tokens最多为213
          // const gptReturnTokens = getTextTokens(askData.data || '').length
          // console.log('simply gpt return tokens', gptReturnTokens)
          const transcriptData = this.getObjectFromString(askData.data)
          console.log('simply ok transcriptData', transcriptData)
          if (transcriptData) {
            return transcriptData
          } else {
            throw new Error('jsonError')
          }
        } else {
          throw new Error('requestError')
        }
      } catch (error: any) {
        if (error.message === 'jsonError') {
          // 处理 jsonError
          retries++
          if (retries <= maxRetries) {
            console.log(`Retry attempt ${retries}`)
            await new Promise((resolve) =>
              setTimeout(resolve, this.requestExceptionIntervalTime),
            ) // 出现异常等待时间后请求
            return attemptRequest() // 递归调用进行重试
          } else {
            return false
          }
        } else {
          // 处理其他可能的错误
          console.log('发生了未知错误')
          return false
        }
      }
    }

    return new Promise<TranscriptTimestampedGptType | false>(
      (resolve, reject) => {
        attemptRequest().then(resolve).catch(reject)
      },
    )
  }

  /**
   * @since 2024-03-25
   * @description 获取视图渲染的数据格式
   */
  getPrepareViewData(list: { start: string }[]) {
    const newList: TranscriptTimestampedParamType[] = list.map((item) => ({
      id: uuidV4(),
      start: this.timestampToSeconds(item.start),
      text: '',
      status: 'loading',
      children: [],
    }))
    return newList
  }

  /**
   * @since 2024-03-25
   * @description 注入transcriptList 文本 数据到chaptersList 官方章节数据中
   */
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
  /**
   * @since 2024-03-25
   * @description 获取youtube Chapters 官方章节数据
   */
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
  /**
   * @since 2024-03-25
   * @description 时间转为妙
   */
  timestampToSeconds = (timestamp: string) => {
    const timeArray = timestamp.split(':').map(Number)

    let totalSeconds = 0
    for (let i = timeArray.length - 1; i >= 0; i--) {
      totalSeconds += timeArray[i] * Math.pow(60, timeArray.length - 1 - i)
    }

    return totalSeconds
  }
  /**
   * @since 2024-03-25
   * @description 
    计算所有字幕文本的tokens总数
    最多13000 tokens一章
    最少600 tokens一章
   */
  createChapters(dataArray: TranscriptResponse[]) {
    let currentTokens = 1000
    const allText = dataArray.map((item) => item.text).join('')
    const systemPromptTokens = getTextTokens(allText || '').length
    const allDuration = dataArray[dataArray.length - 1].start
    if (systemPromptTokens < 2000) {
      currentTokens = 500
    } else if (systemPromptTokens < 4000) {
      currentTokens = 600
    } else if (systemPromptTokens < 5000) {
      currentTokens = 1000
    } else if (systemPromptTokens < 10000) {
      currentTokens = 1200
    } else if (systemPromptTokens < this.maxChatGptTokens * 10) {
      currentTokens = systemPromptTokens / 10
    } else {
      currentTokens = this.maxChatGptTokens
    } // 这里是Chapters根据tokens分章

    // 首先，计算最多1万tokens一章可以分出的章节数
    let chapterCount = Math.floor(systemPromptTokens / currentTokens)
    console.log('simply chapterCount 1', chapterCount)

    // 检查是否有余数且余数大于设定的阈值（2000个tokens）
    if (systemPromptTokens % currentTokens > 200 || chapterCount === 0) {
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
  /**
   * @since 2024-03-25
   * @description 这是一个合并章节数据，拿来进行gpt合并提问，但不稳定，暂时放这
   */
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
  /**
   * @since 2024-03-25
   * @description 解析gpt返回的string json 数据
   */
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
    const regex = /```json\n([\s\S]*?)\n```/
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
  /**
   * @since 2024-03-25
   * @description 更新Message消息，主要是deepDive
   */
  async updateConversationMessageInfo(
    conversationId: string,
    messageId: string,
    transcriptData: TranscriptTimestampedParamType[],
  ) {
    console.log(
      'updateConversationMessageInfo',
      conversationId,
      messageId,
      transcriptData,
    )
    this.viewLatestTranscriptData = transcriptData
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
                    value: this.currentWebPageTitle,
                  },
                ],
              },
              deepDive: [
                {
                  type: 'timestampedSummary',
                  status: 'complete',
                  title: {
                    title: 'Summary',
                    titleIcon: 'SummaryInfo',
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
    this.isStopAction = true
    this.abortTaskIds.forEach((id) => {
      clientAbortFetchAPI(id)
    })
    await stopActionMessageStatus(params, {
      metadata: {
        sources: {
          status: 'complete',
        },
        isComplete: true,
        deepDive: [
          {
            type: 'transcript',
            title: {
              title: 'Transcript',
              titleIcon: 'Menu',
            },
            value: this
              .viewLatestTranscriptData as unknown as TranscriptResponse[],
          },
          {
            title: {
              title: 'Deep dive',
              titleIcon: 'TipsAndUpdates',
            },
            value: 'Ask AI anything about the video...',
          },
        ],
      },
    })
    return true
  }
}
