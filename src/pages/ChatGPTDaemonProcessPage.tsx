import React, { FC, useEffect, useRef, useState } from 'react'
import Browser from 'webextension-polyfill'
import { ChatGPTDaemonProcess, IChatGPTDaemonProcess } from '@/features/chatgpt'
import './chatGPT.less'
import SettingsIcon from '@mui/icons-material/Settings'
import { Stack, Typography } from '@mui/material'
import {
  IChromeExtensionChatGPTDaemonProcessListenEvent,
  IChromeExtensionChatGPTDaemonProcessListenTaskEvent,
} from '@/background'
const stopDaemonProcessClose = () => {
  setInterval(() => {
    document.title = 'EzMail.AI daemon process is running...'
  }, 1000)
  return
  window.onbeforeunload = (event) => {
    event.returnValue = 'Are you sure you want to close?'
    setTimeout(() => {
      console.log('not close')
    }, 0)
    return 'Are you sure you want to close?'
  }
}

const useDaemonProcess = () => {
  const chatGptInstanceRef = useRef<IChatGPTDaemonProcess | null>(null)
  const [showDaemonProcessBar, setShowDaemonProcessBar] = useState(false)
  useEffect(() => {
    const port = Browser.runtime.connect()
    const listener = async (msg: any) => {
      const { event, data } = msg
      switch (event as IChromeExtensionChatGPTDaemonProcessListenEvent) {
        case 'DaemonProcess_getChatGPTProxyInstanceResponse':
          if (data.isInit) {
            console.log('close listen')
            document
              .getElementById('EzMail_AI_ChatGPT_DaemonProcess_ROOT')
              ?.remove()
            Browser.runtime?.onMessage?.removeListener(listener)
            port?.onMessage?.removeListener(listener)
            port?.disconnect()
          } else {
            console.log('init EzMail.AI chatGPT daemon process')
            chatGptInstanceRef.current = new ChatGPTDaemonProcess()
            stopDaemonProcessClose()
            const nextRoot = document.getElementById('__next')
            if (nextRoot) {
              nextRoot.classList.add('ezmail-ai-running')
            }
            port.postMessage({
              event: 'DaemonProcess_initChatGPTProxyInstance',
            })
            setShowDaemonProcessBar(true)
          }
          break
        case 'DaemonProcess_listenClientPing':
          {
            console.log('DaemonProcess_listenClientPing')
            port.postMessage({
              event: 'DaemonProcess_Pong',
            })
          }
          break
        case 'DaemonProcess_clientAsyncTask':
          {
            const { taskId, data: asyncEventData } = data
            const asyncEventName: IChromeExtensionChatGPTDaemonProcessListenTaskEvent =
              data.event
            console.log(
              'receive clientAsyncTask: \t',
              asyncEventName,
              taskId,
              asyncEventData,
            )
            const sendMessageToClient = (
              data: any,
              error = '',
              done = true,
            ) => {
              port.postMessage({
                event: 'DaemonProcess_asyncTaskResponse',
                data: {
                  taskId,
                  data,
                  done,
                  error,
                },
              })
            }
            switch (asyncEventName) {
              case 'DaemonProcess_createConversation':
                {
                  const conversation =
                    await chatGptInstanceRef.current?.createConversation()
                  console.log(
                    'DaemonProcess_createConversation created',
                    conversation,
                  )
                  if (conversation) {
                    sendMessageToClient({
                      conversationId: conversation.id,
                    })
                  } else {
                    sendMessageToClient({}, 'create conversation failed')
                  }
                }
                break
              case 'DaemonProcess_sendMessage':
                {
                  console.log(
                    'DaemonProcess_sendMessage listen',
                    asyncEventData,
                  )
                  const {
                    conversationId,
                    question,
                    messageId,
                    parentMessageId,
                    regenerate,
                  } = asyncEventData
                  let conversation =
                    chatGptInstanceRef.current?.getConversation(conversationId)
                  if (!conversation) {
                    conversation =
                      await chatGptInstanceRef.current?.createConversation(
                        conversationId,
                      )
                  }
                  if (conversation) {
                    const controller = new AbortController()
                    const abortFunction = () => {
                      console.log('abort Controller abortFunction', messageId)
                      controller.abort()
                    }
                    chatGptInstanceRef.current?.addAbortWithMessageId(
                      messageId,
                      abortFunction,
                    )
                    await conversation.generateAnswer(
                      {
                        messageId,
                        parentMessageId,
                        prompt: question,
                        signal: controller.signal,
                        onEvent(event) {
                          if (event.type === 'error') {
                            console.log('error')
                            console.log('abort Controller remove', messageId)
                            chatGptInstanceRef.current?.removeAbortWithMessageId(
                              messageId,
                            )
                            sendMessageToClient(
                              event.data,
                              event.data.message || event.data.detail || '',
                              true,
                            )
                          }
                          if (event.type === 'done') {
                            console.log('done')
                            console.log('abort Controller remove', messageId)
                            chatGptInstanceRef.current?.removeAbortWithMessageId(
                              messageId,
                            )
                            sendMessageToClient({}, '', true)
                            return
                          }
                          sendMessageToClient(event.data, '', false)
                          console.log(event.data)
                        },
                      },
                      regenerate === true,
                    )
                  } else {
                    sendMessageToClient({}, 'conversationId not find', true)
                    chatGptInstanceRef.current
                      ?.closeConversation(conversationId)
                      .then()
                      .catch()
                  }
                }
                break
              case 'DaemonProcess_removeConversation':
                {
                  console.log(
                    'DaemonProcess_removeConversation listen',
                    asyncEventData,
                  )
                  const { conversationId } = asyncEventData
                  if (conversationId) {
                    const conversation =
                      chatGptInstanceRef.current?.getConversation(
                        conversationId,
                      )
                    if (conversation) {
                      await conversation.close()
                    }
                  }
                  sendMessageToClient({}, '', true)
                }
                break
              case 'DaemonProcess_abortMessage':
                {
                  console.log(
                    'DaemonProcess_abortMessage listen',
                    asyncEventData,
                  )
                  const { messageId } = asyncEventData
                  if (messageId) {
                    console.log(
                      'abort Controller run',
                      chatGptInstanceRef.current,
                      messageId,
                    )
                    chatGptInstanceRef.current?.abortWithMessageId(messageId)
                    sendMessageToClient({ success: true }, '', true)
                  } else {
                    sendMessageToClient({ success: false }, '', true)
                  }
                }
                break
              default:
                break
            }
          }
          break
        default:
          break
      }
    }
    port.onMessage.addListener(listener)
    Browser.runtime.onMessage.addListener(listener)
    console.log('onload')
    let init = false
    const isPageLoad = () => {
      if (
        (document.body.querySelector('h1')?.innerText.indexOf('ChatGPT') || 0) >
        -1
      ) {
        return true
      }
      const navA = document.querySelectorAll('nav a')
      for (let i = 0; i < navA.length; i++) {
        if ((navA[i] as HTMLElement)?.innerText === 'Log out') {
          return true
        }
      }
      return false
    }
    const timer = setInterval(() => {
      if (isPageLoad() && !init) {
        port.postMessage({ event: 'DaemonProcess_getChatGPTProxyInstance' })
      }
    }, 1000)
    if (isPageLoad()) {
      init = true
      port.postMessage({ event: 'DaemonProcess_getChatGPTProxyInstance' })
    }
    return () => {
      clearInterval(timer)
      Browser.runtime?.onMessage?.removeListener(listener)
      port?.onMessage?.removeListener(listener)
      port?.disconnect()
    }
  }, [])
  return {
    showDaemonProcessBar,
  }
}

const ChatGPTDaemonProcessPage: FC = () => {
  const { showDaemonProcessBar } = useDaemonProcess()
  if (!showDaemonProcessBar) {
    return null
  }
  return (
    <>
      {/*<Box*/}
      {/*  className={'EzMail-AI-chatgpt-daemon-overlay'}*/}
      {/*  sx={{*/}
      {/*    position: 'absolute',*/}
      {/*    top: 0,*/}
      {/*    left: 0,*/}
      {/*    width: '100%',*/}
      {/*    height: '100%',*/}
      {/*    zIndex: 999,*/}
      {/*    backgroundColor: 'rgba(0,0,0,0.5)',*/}
      {/*  }}*/}
      {/*/>*/}
      <Stack
        className={'EzMail-AI-chatgpt-daemon-process-bar'}
        sx={{
          top: 0,
          position: 'absolute',
          height: 40,
          width: '100%',
          bgcolor: '#1D56D7',
          zIndex: 999,
          color: '#fff',
        }}
        spacing={1}
        direction={'row'}
        alignItems={'center'}
        justifyContent={'center'}
      >
        <div className={'ezmail-ai-setting-icon'}>
          <SettingsIcon sx={{ fontSize: 16 }} />
        </div>
        <Typography variant={'body1'} component={'span'}>
          Please keep this page open to continue using the EzMail.AI Chrome
          extension.
        </Typography>
      </Stack>
    </>
  )
}

export default ChatGPTDaemonProcessPage
