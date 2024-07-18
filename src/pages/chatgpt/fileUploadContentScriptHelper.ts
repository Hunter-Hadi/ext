import { v4 as uuidV4 } from 'uuid'

import { IChatUploadFile } from '@/features/indexed_db/conversations/models/Message'
const MAX_AI_CHAT_GPT_MESSAGE_KEY = 'MAX_AI_CHAT_GPT_MESSAGE_KEY'

const getFileUploadInput = () => {
  return document.querySelector('input[type="file"]') as HTMLInputElement
}

export const pingChatGPTFileUploadServer = () => {
  return new Promise<boolean>((resolve) => {
    let success = false
    let isDone = false
    const maxDelay = 3 * 1000
    const timer = setTimeout(() => {
      if (isDone) {
        return
      }
      isDone = true
      window.removeEventListener('message', onceListener)
      resolve(success)
    }, maxDelay)
    const taskId = uuidV4()
    window.postMessage({
      event: MAX_AI_CHAT_GPT_MESSAGE_KEY,
      type: 'ping',
      data: {
        taskId,
      },
    })
    const onceListener = (event: any) => {
      if (
        event.data?.event === MAX_AI_CHAT_GPT_MESSAGE_KEY &&
        event.data?.type === 'pong' &&
        event.data?.data?.taskId === taskId
      ) {
        if (isDone) {
          return
        }
        isDone = true
        success = event.data?.data?.success || false
        clearTimeout(timer)
        window.removeEventListener('message', onceListener)
        resolve(success)
      }
    }
    window.addEventListener('message', onceListener)
  })
}

const emitFileUploadServiceStartUpload = (files: any[]) => {
  return new Promise<boolean>((resolve) => {
    let success = false
    let isDone = false
    const maxDelay = 3 * 1000
    const timer = setTimeout(() => {
      if (isDone) {
        return
      }
      isDone = true
      window.removeEventListener('message', onceListener)
      resolve(success)
    }, maxDelay)
    const taskId = uuidV4()
    window.postMessage({
      event: MAX_AI_CHAT_GPT_MESSAGE_KEY,
      type: 'upload',
      data: {
        taskId,
        files,
      },
    })
    const onceListener = (event: any) => {
      if (
        event.data?.event === MAX_AI_CHAT_GPT_MESSAGE_KEY &&
        event.data?.type === 'upload_result' &&
        event.data?.data?.taskId === taskId
      ) {
        if (isDone) {
          return
        }
        success = event.data?.data?.success || false
        isDone = true
        clearTimeout(timer)
        window.removeEventListener('message', onceListener)
        resolve(success)
      }
    }
    window.addEventListener('message', onceListener)
  })
}

export const startMockChatGPTUploadFile = (files: IChatUploadFile[]) => {
  return new Promise((resolve) => {
    const fileInfo = files[0]
    const uploadInput = getFileUploadInput()
    if (!uploadInput || !fileInfo?.blobUrl) {
      resolve(false)
      return
    }
    const xhr = new XMLHttpRequest()
    xhr.open('GET', fileInfo.blobUrl, true)
    // cors
    xhr.withCredentials = true
    xhr.responseType = 'blob'
    xhr.onload = function () {
      if (this.status === 200) {
        // 创建 Blob 对象
        const fileContent = this.response
        // 创建 Blob 对象
        const blob = new Blob([fileContent], { type: fileInfo.fileType })
        // 创建 File 对象
        const newFile = new File([blob], fileInfo.fileName, {
          type: fileInfo.fileType,
        })
        const list = new DataTransfer()
        list.items.add(newFile)
        const myFileList = list.files
        emitFileUploadServiceStartUpload(files).then((success) => {
          if (!success) {
            console.error('文件上传失败')
            resolve(false)
            return
          }
          uploadInput!.files = myFileList
          const event = new Event('change', { bubbles: true })
          uploadInput!.dispatchEvent(event)
          resolve(true)
        })
      } else {
        console.error('文件下载失败')
        resolve(false)
      }
    }
    xhr.send()
  })
}

export const listenChatGPTFileUploadChange = (
  callback: (files: IChatUploadFile[]) => void,
) => {
  const listener = (event: any) => {
    if (
      event.data?.event === MAX_AI_CHAT_GPT_MESSAGE_KEY &&
      event.data?.type === 'upload_change_result' &&
      event.data?.data?.files?.length
    ) {
      const files = event.data.data.files
      callback(files)
    }
  }
  window.addEventListener('message', listener)
  return () => {
    window.removeEventListener('message', listener)
  }
}
