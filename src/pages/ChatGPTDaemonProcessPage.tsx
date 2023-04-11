import React, { FC, useEffect, useRef, useState } from 'react'
import Browser from 'webextension-polyfill'
import {
  ChatGPTDaemonProcess,
  ContentScriptConnectionV2,
  IChatGPTDaemonProcess,
} from '@/features/chatgpt'
import './chatGPT.less'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import { IconButton, Stack, Typography } from '@mui/material'
import { IOpenAIChatListenTaskEvent } from '@/background/app'
import {
  CHROME_EXTENSION_POST_MESSAGE_ID,
  ROOT_DAEMON_PROCESS_ID,
} from '@/types'
import CloseIcon from '@mui/icons-material/Close'
import Log from '@/utils/Log'
import { setChromeExtensionSettings } from '@/background/utils'

const APP_NAME = process.env.APP_NAME
const log = new Log('ChatGPTDaemonProcessPage')
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
    if (pageSuccessLoaded) {
      const port = new ContentScriptConnectionV2({
        runtime: 'daemon_process',
      })
      console.log(pageSuccessLoaded, 'pageSuccessLoaded')
      port
        .postMessage({
          event: 'OpenAIDaemonProcess_daemonProcessExist',
          data: {},
        })
        .then((res) => {
          log.info(res)
          // 没有守护进程实例
          if (res.success && res.data?.isExist === false) {
            log.info(`init ${APP_NAME} chatGPT daemon process`)
            // 更新模型列表
            chatGptInstanceRef.current
              .getAllModels()
              .then(async (models) => {
                if (models.length > 0) {
                  await setChromeExtensionSettings({
                    models,
                  })
                  await port.postMessage({
                    event: 'OpenAIDaemonProcess_setDaemonProcess',
                  })
                  stopDaemonProcessClose()
                  const nextRoot = document.getElementById('__next')
                  if (nextRoot && !isDisabledTopBar()) {
                    nextRoot.classList.add('use-chat-gpt-ai-running')
                  }
                  setShowDaemonProcessBar(true)
                  Browser.runtime.onMessage.addListener(listener)
                }
              })
              .catch()
          } else {
            // 有守护进程实例
            log.info('close listen')
            document.getElementById(ROOT_DAEMON_PROCESS_ID)?.remove()
          }
        })
      const listener = async (msg: any) => {
        const { event, data } = msg
        if (msg?.id && msg.id !== CHROME_EXTENSION_POST_MESSAGE_ID) {
          return
        }
        return new Promise((resolve) => {
          const exec = async () => {
            switch (event as IOpenAIChatListenTaskEvent) {
              case 'OpenAIDaemonProcess_ping':
                {
                  log.info('DaemonProcess_ping')
                  await port.postMessage({
                    event: 'OpenAIDaemonProcess_pong',
                  })
                }
                break
              case 'OpenAIDaemonProcess_createConversation':
                {
                  const { conversationId, model } = data
                  log.info(
                    'DaemonProcess_createConversation',
                    conversationId,
                    model,
                  )
                  const conversation =
                    await chatGptInstanceRef.current?.createConversation(
                      conversationId,
                      model,
                    )
                  if (conversation) {
                    await conversation.fetchHistoryAndConfig()
                    return {
                      success: true,
                      data: {
                        conversationId: conversation?.conversationId || '',
                      },
                      message: 'create conversation success',
                    }
                  } else {
                    return {
                      success: false,
                      data: {
                        conversationId: '',
                      },
                      message: 'create conversation fail',
                    }
                  }
                }
                break
              case 'OpenAIDaemonProcess_askChatGPTQuestion':
                {
                  const { taskId, question } = data
                  log.info(
                    'OpenAIDaemonProcess_askChatGPTQuestion',
                    taskId,
                    question,
                  )
                  const {
                    conversationId,
                    messageId,
                    parentMessageId,
                    question: questionText,
                    regenerate,
                  } = question
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
                      log.info('AbortFunction exec', messageId)
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
                        prompt: questionText,
                        signal: controller.signal,
                        onEvent(event) {
                          if (event.type === 'error') {
                            log.info('error')
                            log.info('abort Controller remove', messageId)
                            chatGptInstanceRef.current?.removeAbortWithMessageId(
                              messageId,
                            )
                            port.postMessage({
                              event: 'OpenAIDaemonProcess_taskResponse',
                              data: {
                                taskId,
                                data: event.data,
                                error:
                                  event.data.message || event.data.detail || '',
                                done: true,
                              },
                            })
                            return
                          }
                          if (event.type === 'done') {
                            log.info('done')
                            log.info('abort Controller remove', messageId)
                            // TODO -更新服务器缓存的最后会话ID
                            chatGptInstanceRef.current?.removeAbortWithMessageId(
                              messageId,
                            )
                            port.postMessage({
                              event: 'OpenAIDaemonProcess_taskResponse',
                              data: {
                                taskId,
                                data: {},
                                error: '',
                                done: true,
                              },
                            })
                            return
                          }
                          port.postMessage({
                            event: 'OpenAIDaemonProcess_taskResponse',
                            data: {
                              taskId,
                              data: event.data,
                              error: '',
                              done: false,
                            },
                          })
                          log.info(event.data)
                        },
                      },
                      regenerate === true,
                    )
                  }
                }
                break
              case 'OpenAIDaemonProcess_removeConversation':
                {
                  const { conversationId } = data
                  log.info(
                    'OpenAIDaemonProcess_removeConversation',
                    conversationId,
                  )
                  if (conversationId) {
                    const isSuccessDeleteConversation =
                      await chatGptInstanceRef.current.closeConversation(
                        conversationId,
                      )
                    return {
                      success: isSuccessDeleteConversation,
                      data: {},
                      message: 'ok',
                    }
                  }
                }
                break
              case 'OpenAIDaemonProcess_abortAskChatGPTQuestion':
                {
                  const { messageId } = data
                  log.info(
                    'OpenAIDaemonProcess_abortAskChatGPTQuestion listen',
                    messageId,
                  )
                  if (messageId) {
                    console.log(
                      'abort Controller run',
                      chatGptInstanceRef.current,
                      messageId,
                    )
                    chatGptInstanceRef.current?.abortWithMessageId(messageId)
                    return {
                      success: true,
                      data: {},
                      message: 'ok',
                    }
                  } else {
                    return {
                      success: false,
                      data: {},
                      message: 'messageId is empty',
                    }
                  }
                }
                break
              default:
                break
            }
            return undefined
          }
          exec().then((res) => {
            if (res && res.data) {
              resolve(res)
            }
          })
        })
      }
      return () => {
        Browser.runtime.onMessage.removeListener(listener)
      }
    }
    return () => {
      console.log('unmount')
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
