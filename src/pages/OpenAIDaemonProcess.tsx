import CloseIcon from '@mui/icons-material/Close'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import dayjs from 'dayjs'
import cloneDeep from 'lodash-es/cloneDeep'
import React, { FC, useEffect, useRef, useState } from 'react'
import Browser from 'webextension-polyfill'

import { IOpenAIChatListenTaskEvent } from '@/background/app'
import { setChromeExtensionLocalStorage } from '@/background/utils/chromeExtensionStorage/chromeExtensionLocalStorage'
import CloseAlert from '@/components/CloseAlert'
import { UseChatGptIcon } from '@/components/CustomIcon'
import {
  CHROME_EXTENSION_LOCAL_STOP_KEEP_CHAT_IFRAME_TIME_STAMP_SAVE_KEY,
  MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID,
  OPENAI_IFRAME_ID,
} from '@/constants'
import {
  ChatGPTDaemonProcess,
  ContentScriptConnectionV2,
  IChatGPTDaemonProcess,
} from '@/features/chatgpt'
import useDaemonBrokenListener from '@/features/chatgpt/hooks/useDaemonBrokenListener'
import { MAXAI_CHATGPT_WEBAPP_DAEMON_PROCESS_ID } from '@/features/common/constants'
import useInterval from '@/features/common/hooks/useInterval'
import {
  listenChatGPTFileUploadChange,
  pingChatGPTFileUploadServer,
  startMockChatGPTUploadFile,
} from '@/pages/chatgpt/fileUploadContentScriptHelper'
import { chromeExtensionClientOpenPage } from '@/utils'
import Log from '@/utils/Log'

const APP_NAME = String(process.env.APP_NAME)

const setDaemonProcessTabTitle = () => {
  setInterval(() => {
    document.title = `${APP_NAME} - AI Copilot for the Web`
  }, 1000)
  return
}

const log = new Log('ChatGPTDaemonProcessPage')
// const stopDaemonProcessClose = () => {
//   window.onbeforeunload = (event) => {
//     event.returnValue = 'Are you sure you want to close?'
//     setTimeout(() => {
//       console.log('[Daemon Process]: not close')
//     }, 0)
//     return 'Are you sure you want to close?'
//   }
// }

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
  const isInitRef = useRef(false)
  useDaemonBrokenListener()
  const isPageLoad = () => {
    const h1Elements = document.body.querySelectorAll('h1')
    for (let i = 0; i < h1Elements.length; i++) {
      const innerText = (h1Elements[i] as HTMLElement)?.innerText || ''
      if (
        innerText.indexOf('ChatGPT') > -1 ||
        innerText.indexOf('New chat') > -1
      ) {
        setPageSuccessLoaded(true)
        return
      }
    }
    if (document.body.querySelector('button[data-testid="send-button"]')) {
      setPageSuccessLoaded(true)
      return
    }
    const textareaElements = document.body.querySelectorAll('textarea')
    for (let i = 0; i < textareaElements.length; i++) {
      if (textareaElements[i] instanceof HTMLTextAreaElement) {
        setPageSuccessLoaded(true)
        return
      }
    }
    const navA = document.querySelectorAll('nav a')
    for (let i = 0; i < navA.length; i++) {
      if ((navA[i] as HTMLElement)?.innerText === 'Log out') {
        setPageSuccessLoaded(true)
        return
      }
    }
    const newChatA = document.querySelectorAll('a')
    for (let i = 0; i < newChatA.length; i++) {
      if ((newChatA[i] as HTMLElement)?.innerText === 'New chat') {
        setPageSuccessLoaded(true)
        return
      }
    }
    setPageSuccessLoaded(false)
  }
  useEffect(() => {
    const timer = setInterval(() => {
      if (isInitRef.current) {
        clearInterval(timer)
        return
      }
      isPageLoad()
    }, 1000)
    return () => {
      clearInterval(timer)
    }
  }, [])
  useEffect(() => {
    if (pageSuccessLoaded) {
      isInitRef.current = true
      const clientPort = new ContentScriptConnectionV2({
        runtime: 'client',
      })
      const port = new ContentScriptConnectionV2({
        runtime: 'daemon_process',
      })
      port
        .postMessage({
          event: 'OpenAIDaemonProcess_daemonProcessExist',
          data: {},
        })
        .then(async (res) => {
          log.info(res)
          if (res.success && res.data?.isExist === false) {
            // 没有守护进程实例
            log.info(`init ${APP_NAME} chatGPT daemon process`)
            // 更新模型列表
            try {
              await clientPort.postMessage({
                event: 'Client_updateTabVisible',
                data: {
                  visible: false,
                  windowVisible: false,
                  windowFocus: false,
                },
              })
              const [models = [], plugins = []] = await Promise.all([
                chatGptInstanceRef.current.getAllModels(),
                chatGptInstanceRef.current.getAllPlugins(),
              ])
              if (models.length > 0) {
                await setChromeExtensionLocalStorage((settings) => {
                  const newSettings = cloneDeep(settings)
                  const openAISettings =
                    newSettings.thirdProviderSettings?.OPENAI
                  let currentModel = openAISettings?.model
                  const defaultModel =
                    models.find((model) => model?.title?.includes('Default')) ||
                    models[0]
                  if (currentModel) {
                    // 确认当前模型是否存在
                    const findModel = models.find(
                      (model) => model?.slug === currentModel,
                    )
                    if (!findModel) {
                      currentModel = defaultModel?.slug
                    }
                  } else {
                    // 设置默认模型
                    currentModel = defaultModel?.slug
                  }
                  if (!newSettings.thirdProviderSettings?.OPENAI) {
                    newSettings.thirdProviderSettings!.OPENAI = {}
                  }
                  newSettings.thirdProviderSettings!.OPENAI.modelOptions = models
                  newSettings.thirdProviderSettings!.OPENAI.pluginOptions = plugins
                  newSettings.thirdProviderSettings!.OPENAI.model = currentModel
                  log.info(`set currentModel model`, currentModel)
                  return newSettings
                })
                await port.postMessage({
                  event: 'OpenAIDaemonProcess_setDaemonProcess',
                })
                setDaemonProcessTabTitle()
                const nextRoot = document.getElementById('__next')
                if (nextRoot && !isDisabledTopBar()) {
                  nextRoot?.classList.add('use-chat-gpt-ai-running')
                }
                setShowDaemonProcessBar(true)
                Browser.runtime.onMessage.addListener(listener)
              } else {
                // models不可能为0
                log.error('models is empty')
                await clientPort.postMessage({
                  event: 'Client_updateTabVisible',
                  data: {
                    visible: true,
                    windowVisible: true,
                    windowFocus: true,
                  },
                })
              }
            } catch (e) {
              await clientPort.postMessage({
                event: 'Client_updateTabVisible',
                data: {
                  visible: true,
                  windowVisible: true,
                  windowFocus: true,
                },
              })
              log.error(e)
              // 重载页面
              setTimeout(() => {
                window.location.reload()
              }, 1000)
            }
          } else {
            // 有守护进程实例
            log.info('close listen')
            document
              .getElementById(MAXAI_CHATGPT_WEBAPP_DAEMON_PROCESS_ID)
              ?.remove()
          }
        })
      const stopFileUploadListen = listenChatGPTFileUploadChange((files) => {
        console.log('chatGPTUploadFileChangeListener', files)
        clientPort.postMessage({
          event: 'Client_chatUploadFilesChange',
          data: {
            files,
          },
        }) // 通知background
      })
      const listener = async (msg: any) => {
        const { event, data } = msg
        if (msg?.id && msg.id !== MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID) {
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
                  return {
                    success: true,
                    data: {},
                    message: 'ok',
                  }
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
                  const conversation = await chatGptInstanceRef.current?.createConversation(
                    conversationId,
                    model,
                  )
                  if (conversation) {
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
                  const { taskId, question, options, openAIModel } = data
                  log.info(
                    'OpenAIDaemonProcess_askChatGPTQuestion',
                    taskId,
                    question,
                    options,
                    openAIModel,
                  )
                  const {
                    conversationId,
                    messageId,
                    parentMessageId,
                    question: questionText,
                  } = question
                  let conversation = chatGptInstanceRef.current?.getConversation(
                    conversationId,
                  )
                  if (!conversation) {
                    if (openAIModel) {
                      conversation = await chatGptInstanceRef.current?.createConversation(
                        conversationId,
                        openAIModel,
                      )
                    } else {
                      conversation = await chatGptInstanceRef.current?.createConversation(
                        conversationId,
                      )
                    }
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
                        meta: options.meta,
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
                      options.regenerate === true,
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
                    const isSuccessDeleteConversation = await chatGptInstanceRef.current.closeConversation(
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
              case 'OpenAIDaemonProcess_pingFilesUpload':
                {
                  const success = await pingChatGPTFileUploadServer()
                  return {
                    success,
                    data: {},
                    message: 'ok',
                  }
                }
                break
              case 'OpenAIDaemonProcess_filesUpload':
                {
                  const { files } = data
                  const success = await startMockChatGPTUploadFile(files)
                  return {
                    success,
                    data: {},
                    message: 'ok',
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
        stopFileUploadListen()
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

const OpenAIDaemonProcess: FC = () => {
  const { showDaemonProcessBar } = useDaemonProcess()
  const [close, setClose] = useState(() => {
    return isDisabledTopBar()
  })
  if (!showDaemonProcessBar) {
    return null
  }
  if (close) {
    return (
      <>
        <KeepChatAliveDaemonProcess />
      </>
    )
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
          bgcolor: '#7601D3',
          zIndex: 1000,
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
              "Once you click 'OK', the ChatGPT.AI top bar won't show up anymore. But please still keep this ChatGPT tab open so you can keep using the MaxAI.me extension without interruption.",
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
      <KeepChatAliveDaemonProcess />
    </>
  )
}

const openIframe = (path: string) => {
  const iframeInstance = document.getElementById(
    OPENAI_IFRAME_ID,
  ) as HTMLIFrameElement
  if (iframeInstance) {
    iframeInstance.src = path
  } else {
    const iframe = document.createElement('iframe')
    iframe.id = OPENAI_IFRAME_ID
    iframe.style.cssText = `height: 0px; width: 100%;`
    iframe.src = path
    iframe.onload = function () {
      const iframeText =
        (iframe.contentWindow &&
          iframe.contentWindow.document.documentElement.innerText) ||
        '{}'
      try {
        const iframeJson = JSON.parse(iframeText)
        if (iframeJson.expires) {
          console.log(
            `[KeepChatAliveDaemonProcess] iframe: Expire date: ${iframeJson.expires}`,
          )
        } else if (
          iframeText.match(
            /Please stand by|while we are checking your browser|Please turn JavaScript on|Please enable Cookies|reload the page/,
          )
        ) {
          console.log(`[KeepChatAliveDaemonProcess] iframe: BypassCF`)
        }
      } catch (e) {
        console.log(`[KeepChatAliveDaemonProcess] iframe: ${e}`)
      }
    }
    const main = document.querySelector('main')
    main && main.lastElementChild && main.lastElementChild.appendChild(iframe)
  }
}

const fetchAuthSession = (authUrl = '/api/auth/session') => {
  return new Promise((resolve) => {
    fetch(authUrl).then((response) => {
      response.text().then((data) => {
        try {
          const contentType = response.headers.get('Content-Type')
          if (
            contentType &&
            contentType.indexOf('application/json') > -1 &&
            response.status !== 403 &&
            data.indexOf(`"expires":"`) > -1
          ) {
            const iframe = document.getElementById(
              OPENAI_IFRAME_ID,
            ) as HTMLIFrameElement
            if (iframe && iframe.contentWindow) {
              iframe.contentWindow.document.documentElement.innerHTML = data
            } else {
              openIframe(authUrl)
            }
            resolve(true)
          } else {
            openIframe(authUrl)
            resolve(false)
          }
        } catch (e) {
          console.log(
            `[KeepChatAliveDaemonProcess] error: ${e},\nERROR RESPONSE:\n${data}`,
          )
          openIframe(authUrl)
          resolve(false)
        }
      })
    })
  })
}

const KeepChatAliveDaemonProcess: FC = () => {
  const isOpenKeepChatAliveRef = useRef(false)
  const [StopAlertShow, setStopAlertShow] = useState(false)
  const [showTimeText, setShowTimeText] = useState('')
  useInterval(() => {
    const getSettings = async () => {
      try {
        const setting =
          (await Browser.storage.local.get(
            CHROME_EXTENSION_LOCAL_STOP_KEEP_CHAT_IFRAME_TIME_STAMP_SAVE_KEY,
          )) || {}
        const stopKeepChatIframeSettings =
          setting[
            CHROME_EXTENSION_LOCAL_STOP_KEEP_CHAT_IFRAME_TIME_STAMP_SAVE_KEY
          ]
        if (stopKeepChatIframeSettings) {
          const { end } = JSON.parse(stopKeepChatIframeSettings)
          const now = dayjs().utc()
          const diffSeconds = dayjs(end).utc().diff(now, 'seconds')
          let timeText = ''
          if (diffSeconds < 60) {
            timeText = `1 minute`
          } else if (diffSeconds < 60 * 60) {
            timeText = `${Math.floor(diffSeconds / 60)} minutes`
          } else if (diffSeconds < 60 * 60 * 24) {
            if (diffSeconds < 60 * 60 * 2) {
              timeText = `1 hour`
            } else {
              timeText = `${Math.floor(diffSeconds / 60 / 60)} hours`
            }
          }
          setShowTimeText(timeText)
          if (diffSeconds > 30) {
            // 当前距离结束时间超过30秒
            // 开启keep alive iframe
            isOpenKeepChatAliveRef.current = true
            setStopAlertShow(true)
            console.log(
              '[KeepChatAliveDaemonProcess]: getSettings',
              isOpenKeepChatAliveRef.current,
            )
            return
          }
        }
        setStopAlertShow(false)
        isOpenKeepChatAliveRef.current = false
      } catch (e) {
        console.error(e)
        isOpenKeepChatAliveRef.current = false
      }
      console.log(
        '[KeepChatAliveDaemonProcess]: getSettings',
        isOpenKeepChatAliveRef.current,
      )
    }
    getSettings()
  }, 1000 * 3)
  useInterval(() => {
    if (isOpenKeepChatAliveRef.current) {
      console.log('[KeepChatAliveDaemonProcess]: keep chat alive')
      fetchAuthSession()
    } else {
      console.log('[KeepChatAliveDaemonProcess]: stop keep chat alive')
    }
  }, 1000 * 30)
  return (
    <>
      {StopAlertShow && (
        <Box position={'absolute'} right={8} top={8} zIndex={10000}>
          <CloseAlert
            icon={<></>}
            sx={{
              // bgcolor: '#7601D3',
              // '& .MuiAlert-icon': {
              //   display: 'none',
              // },
              // '& .MuiAlert-message': {
              //   p: '0!important',
              // },
              // '& *': {
              //   color: '#fff',
              // },
              p: '16px!important',
              bgcolor: '#fff',
              border: '1px solid #7601D3',
              '& > div': {
                '&:first-of-type': {
                  display: 'none',
                },
                '&:nth-of-type(2)': {
                  padding: '0!important',
                },
                '&:last-of-type': {
                  margin: '0!important',
                  padding: '0!important',
                  position: 'absolute',
                  top: 4,
                  right: 4,
                },
              },
              '& *': {
                color: '#7601D3',
              },
            }}
          >
            <Stack spacing={1}>
              <Stack direction={'row'} alignItems={'center'} spacing={1}>
                <UseChatGptIcon sx={{ fontSize: 16 }} />
                <Typography variant={'body1'} fontSize={16} fontWeight={700}>
                  Stable Mode is enabled
                </Typography>
              </Stack>
              <Typography variant={'body1'} fontSize={16}>
                Will be disabled automatically in {showTimeText}
              </Typography>
              <Button
                disableElevation
                variant={'contained'}
                sx={{
                  bgcolor: '#7601D3',
                  color: '#fff',
                  '&:hover': {
                    bgcolor: '#7601D3',
                  },
                  textTransform: 'none',
                }}
                onClick={async () => {
                  await chromeExtensionClientOpenPage({
                    key: 'options',
                    query: '#/chatgpt-stable-mode',
                  })
                }}
              >
                Disable now
              </Button>
            </Stack>
          </CloseAlert>
        </Box>
      )}
    </>
  )
}

export default OpenAIDaemonProcess
