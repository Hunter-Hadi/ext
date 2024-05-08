// 保存原始的 fetch 方法的引用
import { CHATGPT_WEBAPP_HOST } from '@/constants'
import { IChatUploadFile } from '@/features/chatgpt/types'

const MAX_AI_CHAT_GPT_MESSAGE_KEY = 'MAX_AI_CHAT_GPT_MESSAGE_KEY'
let maxAIChatGPTBlockNextRequest = false
let maxAIChatGPTUploadFiles: IChatUploadFile[] = []

const maxAIInjectOriginFetch = window.fetch
// 定义新的 fetch 方法
const maxAIInjectFetch = (url: string, options: any) => {
  console.log('监听到 fetch 请求1:', url, options)
  // 调用原始的 fetch 方法
  return maxAIInjectOriginFetch(url, options).then(function (response) {
    return new Promise((resolve) => {
      // 打印响应的状态码
      console.log('Response status:', response.status)
      // 克隆响应
      if (
        maxAIChatGPTBlockNextRequest &&
        ([
          `https://${CHATGPT_WEBAPP_HOST}/backend-api/files`,
          `https://${CHATGPT_WEBAPP_HOST}/backend-api/conversation/interpreter/process_upload`,
        ].includes(url) ||
          url.includes(`https://${CHATGPT_WEBAPP_HOST}/backend-api/files`))
      ) {
        const cloneResponse = response.clone()
        // https://${CHATGPT_WEBAPP_HOST}/backend-api/files // 第一次上传
        // https://${CHATGPT_WEBAPP_HOST}/backend-api/conversation/interpreter/process_upload // 第二次上传
        // https://${CHATGPT_WEBAPP_HOST}/backend-api/files/uuid/uploaded // 第二次上传
        const step =
          url === `https://${CHATGPT_WEBAPP_HOST}/backend-api/files` ? 1 : 2
        cloneResponse
          .json()
          .then((result) => {
            console.log('克隆的响应:', result)
            window.postMessage({
              event: MAX_AI_CHAT_GPT_MESSAGE_KEY,
              type: 'upload_change',
              data: {
                status: response.status,
                url: url,
                result,
                progress: step === 2 ? 100 : 80,
                done: step === 2,
              },
            })
            if (step === 2) {
              result.status = 'error'
              // 将对象转换为字符串，并创建新的响应对象
              const modifiedResponse = new Response(JSON.stringify(result), {
                status: 500,
                statusText: 'error',
                headers: response.headers,
              })
              maxAIChatGPTBlockNextRequest = false
              resolve(modifiedResponse)
            }
            resolve(response)
          })
          .catch((e) => {
            resolve(response)
          })
      } else {
        resolve(response)
      }
    })
  })
}
// 将新的 fetch 方法赋值给 window.fetch
;(window as any).fetch = maxAIInjectFetch

const getFileUploadInput = () => {
  return document.querySelector('input[type="file"]') as HTMLInputElement
}

window.addEventListener('message', (event) => {
  if (event.data?.event === MAX_AI_CHAT_GPT_MESSAGE_KEY) {
    const { type, data } = event.data
    switch (type) {
      case 'ping':
        {
          const { taskId } = data
          const hasFileUploadInput = !!getFileUploadInput()
          window.postMessage({
            event: MAX_AI_CHAT_GPT_MESSAGE_KEY,
            type: 'pong',
            data: {
              taskId,
              success: hasFileUploadInput,
            },
          })
        }
        break
      case 'upload':
        {
          const { files, taskId } = data
          maxAIChatGPTUploadFiles = files
          maxAIChatGPTBlockNextRequest = true
          window.postMessage({
            event: MAX_AI_CHAT_GPT_MESSAGE_KEY,
            type: 'upload_result',
            data: {
              taskId,
              success: true,
            },
          })
        }
        break
      case 'upload_change':
        {
          const { result, progress, done } = data
          const file = maxAIChatGPTUploadFiles[0] as IChatUploadFile
          // result,
          //   progress: step === 2 ? 100 : 80,
          // done: step === 2,
          if (result?.file_id) {
            file.uploadedFileId = result?.file_id
          }
          if (result.status === 'success') {
            file.uploadProgress = progress
            file.uploadStatus = done ? 'success' : 'uploading'
            file.uploadedUrl = result?.download_url
          } else {
            file.uploadProgress = 0
            file.uploadStatus = 'error'
            file.uploadErrorMessage = result?.error || 'upload error'
          }
          window.postMessage({
            event: MAX_AI_CHAT_GPT_MESSAGE_KEY,
            type: 'upload_change_result',
            data: {
              files: maxAIChatGPTUploadFiles,
            },
          } as any)
        }
        break
      default:
        break
    }
  }
})
