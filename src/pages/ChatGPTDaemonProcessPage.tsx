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
import {
  CHROME_EXTENSION_POST_MESSAGE_ID,
  ROOT_DAEMON_PROCESS_ID,
} from '@/types'

const APP_NAME = process.env.APP_NAME

const stopDaemonProcessClose = () => {
  setInterval(() => {
    document.title = `${APP_NAME} daemon process is running...`
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
  const chatGptInstanceRef = useRef<IChatGPTDaemonProcess>(
    new ChatGPTDaemonProcess(),
  )
  const [showDaemonProcessBar, setShowDaemonProcessBar] = useState(false)
  const [pageSuccessLoaded, setPageSuccessLoaded] = useState(false)
  const isPageLoad = () => {
    const h1Index = document.body
      .querySelector('h1')
      ?.innerText.indexOf('ChatGPT')
    if ((h1Index === undefined ? -1 : h1Index) > -1) {
      setPageSuccessLoaded(true)
      return
    }
    const navA = document.querySelectorAll('nav a')
    for (let i = 0; i < navA.length; i++) {
      if ((navA[i] as HTMLElement)?.innerText === 'Log out') {
        setPageSuccessLoaded(true)
        return
      }
    }
    setPageSuccessLoaded(false)
  }
  useEffect(() => {
    const timer = setInterval(() => {
      isPageLoad()
    }, 1000)
    return () => {
      clearInterval(timer)
    }
  }, [])
  useEffect(() => {
    console.log(pageSuccessLoaded, 'pageSuccessLoaded')
    const port = Browser.runtime.connect()
    const listener = async (msg: any) => {
      const { event, data } = msg
      if (msg?.id && msg.id !== CHROME_EXTENSION_POST_MESSAGE_ID) {
        return
      }
      switch (event as IChromeExtensionChatGPTDaemonProcessListenEvent) {
        case 'DaemonProcess_getChatGPTProxyInstanceResponse':
          if (data.isInit) {
            console.log('close listen')
            document.getElementById(ROOT_DAEMON_PROCESS_ID)?.remove()
            Browser.runtime?.onMessage?.removeListener(listener)
            port?.onMessage?.removeListener(listener)
            port?.disconnect()
          } else {
            console.log(`init ${APP_NAME} chatGPT daemon process`)
            chatGptInstanceRef.current
              .getAllModels()
              .then((models) => {
                if (models.length) {
                  const port = Browser.runtime.connect()
                  port.postMessage({
                    id: CHROME_EXTENSION_POST_MESSAGE_ID,
                    event: 'DaemonProcess_updateSettings',
                    data: {
                      key: 'models',
                      data: models,
                    },
                  })
                }
              })
              .catch()
            stopDaemonProcessClose()
            const nextRoot = document.getElementById('__next')
            if (nextRoot) {
              nextRoot.classList.add('use-chat-gpt-ai-running')
            }
            port.postMessage({
              id: CHROME_EXTENSION_POST_MESSAGE_ID,
              event: 'DaemonProcess_initChatGPTProxyInstance',
            })
            setShowDaemonProcessBar(true)
          }
          break
        case 'DaemonProcess_listenClientPing':
          {
            console.log('DaemonProcess_listenClientPing')
            port.postMessage({
              id: CHROME_EXTENSION_POST_MESSAGE_ID,
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
                id: CHROME_EXTENSION_POST_MESSAGE_ID,
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
                  const { model } = asyncEventData
                  const conversation =
                    await chatGptInstanceRef.current?.createConversation(
                      '',
                      model,
                    )
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
              case 'DaemonProcess_compileTemplate':
                {
                  // try {
                  // const { template, variables } = asyncEventData
                  //   debugger
                  //   sendMessageToClient(
                  //     { success: true, data: result },
                  //     '',
                  //     true,
                  //   )
                  // } catch (e) {
                  //   debugger
                  //   sendMessageToClient(
                  //     { success: false, data: 'compile error' },
                  //     '',
                  //     true,
                  //   )
                  // }
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
    if (pageSuccessLoaded) {
      port.onMessage.addListener(listener)
      Browser.runtime.onMessage.addListener(listener)
      port.postMessage({
        id: CHROME_EXTENSION_POST_MESSAGE_ID,
        event: 'DaemonProcess_getChatGPTProxyInstance',
      })
    }
    return () => {
      Browser.runtime?.onMessage?.removeListener(listener)
      port?.onMessage?.removeListener(listener)
      port?.disconnect()
    }
  }, [pageSuccessLoaded])
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
        sx={{
          top: 0,
          position: 'absolute',
          height: 40,
          width: '100%',
          bgcolor: process.env.APP_ENV === 'EZ_MAIL_AI' ? '#1D56D7' : '#7601D3',
          zIndex: process.env.APP_ENV === 'EZ_MAIL_AI' ? 999 : 1000,
          color: '#fff',
        }}
        spacing={1}
        direction={'row'}
        alignItems={'center'}
        justifyContent={'center'}
      >
        <div className={'use-chat-gpt-ai-setting-icon'}>
          <SettingsIcon sx={{ fontSize: 16 }} />
        </div>
        <Typography variant={'body1'} component={'span'}>
          {`Please keep this page open to use ${APP_NAME} extension.`}
        </Typography>
      </Stack>
    </>
  )
}

export default ChatGPTDaemonProcessPage
