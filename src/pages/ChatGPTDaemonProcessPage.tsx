import React, { FC, useEffect, useRef, useState } from 'react'
import Browser from 'webextension-polyfill'
import { ChatGPTDaemonProcess, IChatGPTDaemonProcess } from '@/features/chatgpt'
import './chatGPT.less'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import { IconButton, Stack, Typography } from '@mui/material'
import {
  IChromeExtensionChatGPTDaemonProcessListenEvent,
  IChromeExtensionChatGPTDaemonProcessListenTaskEvent,
} from '@/background'
import {
  CHROME_EXTENSION_POST_MESSAGE_ID,
  ROOT_DAEMON_PROCESS_ID,
} from '@/types'
import CloseIcon from '@mui/icons-material/Close'
const APP_NAME = process.env.APP_NAME

const stopDaemonProcessClose = () => {
  setInterval(() => {
    document.title = `${APP_NAME} daemon process is running...`
  }, 1000)
  return
  window.onbeforeunload = (event) => {
    event.returnValue = 'Are you sure you want to close?'
    setTimeout(() => {
      console.log('[Daemon Process]: not close')
    }, 0)
    return 'Are you sure you want to close?'
  }
}

const isDisabledTopBar = () => {
  return (
    window.localStorage.getItem('hide_usechatgptai_daemon_process_button') ===
    'false'
  )
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
            console.log('[Daemon Process]: close listen')
            document.getElementById(ROOT_DAEMON_PROCESS_ID)?.remove()
            Browser.runtime?.onMessage?.removeListener(listener)
            port?.onMessage?.removeListener(listener)
            port?.disconnect()
          } else {
            console.log(
              `[Daemon Process]: init ${APP_NAME} chatGPT daemon process`,
            )
            chatGptInstanceRef.current
              .getAllModels()
              .then((models) => {
                if (models.length > 0) {
                  const port = Browser.runtime.connect()
                  port.postMessage({
                    id: CHROME_EXTENSION_POST_MESSAGE_ID,
                    event: 'DaemonProcess_updateSettings',
                    data: {
                      key: 'models',
                      data: models,
                    },
                  })
                  port.postMessage({
                    id: CHROME_EXTENSION_POST_MESSAGE_ID,
                    event: 'DaemonProcess_initChatGPTProxyInstance',
                  })
                  stopDaemonProcessClose()
                  const nextRoot = document.getElementById('__next')
                  if (nextRoot && !isDisabledTopBar()) {
                    nextRoot.classList.add('use-chat-gpt-ai-running')
                  }
                  setShowDaemonProcessBar(true)
                }
              })
              .catch()
          }
          break
        case 'DaemonProcess_listenClientPing':
          {
            console.log('[Daemon Process]: DaemonProcess_listenClientPing')
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
                  const {
                    model,
                    CACHE_CONVERSATION_ID: chromeExtensionCacheConversationId,
                  } = asyncEventData
                  console.log(
                    '[Daemon Process]: DaemonProcess_createConversation listen',
                    asyncEventData,
                  )
                  const conversation =
                    await chatGptInstanceRef.current?.createConversation(
                      chromeExtensionCacheConversationId || '',
                      model,
                    )
                  if (conversation) {
                    await conversation.fetchHistoryAndConfig()
                    sendMessageToClient({
                      conversationId: conversation.id,
                    })
                    conversation.model = model
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
                    conversation && (await conversation.fetchHistoryAndConfig())
                  }
                  if (conversation) {
                    const controller = new AbortController()
                    const abortFunction = () => {
                      console.log(
                        '[Daemon Process]: abort Controller abortFunction',
                        messageId,
                      )
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
                            console.log('[Daemon Process]: error')
                            console.log(
                              '[Daemon Process]: abort Controller remove',
                              messageId,
                            )
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
                            console.log('[Daemon Process]: done')
                            console.log(
                              '[Daemon Process]: abort Controller remove',
                              messageId,
                            )
                            // 更新服务器缓存的最后会话ID
                            if (conversation && conversation.conversationId) {
                              port.postMessage({
                                id: CHROME_EXTENSION_POST_MESSAGE_ID,
                                event:
                                  'DaemonProcess_updateCacheConversationId',
                                data: {
                                  conversationId: conversation.conversationId,
                                },
                              })
                            }
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
                    '[Daemon Process]: DaemonProcess_removeConversation listen',
                    asyncEventData,
                  )
                  const {
                    CACHE_CONVERSATION_ID: chromeExtensionCacheConversationId,
                  } = asyncEventData
                  if (chromeExtensionCacheConversationId) {
                    const isSuccessDeleteConversation =
                      await chatGptInstanceRef.current.closeConversation(
                        chromeExtensionCacheConversationId,
                      )
                    if (isSuccessDeleteConversation) {
                      // 清空缓存的会话ID
                      port.postMessage({
                        id: CHROME_EXTENSION_POST_MESSAGE_ID,
                        event: 'DaemonProcess_updateCacheConversationId',
                        data: {
                          conversationId: '',
                        },
                      })
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
  const [close, setClose] = useState(() => {
    return isDisabledTopBar()
  })
  if (!showDaemonProcessBar || close) {
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
          <SettingsOutlinedIcon sx={{ fontSize: 16 }} />
        </div>
        <Typography variant={'body1'} component={'span'}>
          {`Please keep this page open to use ${APP_NAME} extension.`}
        </Typography>
        <IconButton
          sx={{
            position: 'absolute',
            right: 16,
            color: '#fff',
          }}
          onClick={() => {
            const confirm = window.confirm(
              "Once you click 'OK', the ChatGPT.AI top bar won't show up anymore. But please still keep this ChatGPT tab open so you can keep using the UseChatGPT.AI extension without interruption.",
            )
            if (confirm) {
              window.localStorage.setItem(
                'hide_usechatgptai_daemon_process_button',
                JSON.stringify(false),
              )
              const nextRoot = document.getElementById('__next')
              nextRoot && nextRoot.classList.remove('use-chat-gpt-ai-running')
              setClose(true)
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </Stack>
    </>
  )
}

export default ChatGPTDaemonProcessPage
