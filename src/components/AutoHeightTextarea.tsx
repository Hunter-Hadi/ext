import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import React, {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useRecoilValue } from 'recoil'

import { IUserChatMessageExtraType } from '@/features/chatgpt/types'
import {
  MAXAI_FLOATING_CONTEXT_MENU_INPUT_ID,
  MAXAI_SIDEBAR_CHAT_BOX_INPUT_ID,
} from '@/features/common/constants'
import useEffectOnce from '@/features/common/hooks/useEffectOnce'
import { throttle } from '@/features/common/hooks/useThrottle'
import { FloatingDropdownMenuState } from '@/features/contextMenu/store'
import { isFloatingContextMenuVisible } from '@/features/contextMenu/utils'
import { useUploadImagesAndSwitchToMaxAIVisionModel } from '@/features/sidebar/components/SidebarChatBox/SidebarScreenshortButton'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import { AppState } from '@/store'
import { getInputMediator } from '@/store/InputMediator'
import {
  getAppActiveElement,
  getFloatingContextMenuActiveElement,
} from '@/utils'
import { isMaxAIImmersiveChatPage } from '@/utils/dataHelper/websiteHelper'

export const LINE_HEIGHT = 24

export const TEXTAREA_PADDING_Y = 8

const MAX_LINE = () => {
  return Math.max(Math.floor((window.innerHeight * 0.5) / 24) || 5)
}

const autoSizeTextarea = (
  textareaElement: HTMLTextAreaElement,
  childrenHeight = 0,
  minHeight = 0,
) => {
  const boxElement = textareaElement?.parentElement?.parentElement
  if (textareaElement && boxElement) {
    const textareaStyle = window.getComputedStyle(textareaElement)
    const minLine = Number(textareaElement.getAttribute('data-min-line')) || 1
    const paddingLength =
      parseInt(textareaStyle.paddingTop ?? TEXTAREA_PADDING_Y, 10) +
      parseInt(textareaStyle.paddingBottom ?? TEXTAREA_PADDING_Y, 10)
    textareaElement.style.cssText = 'height:0px'
    const scrollHeight = textareaElement.value
      ? textareaElement.scrollHeight
      : LINE_HEIGHT * minLine + paddingLength // 最小高度
    let textAreaHeight = Math.min(LINE_HEIGHT * MAX_LINE(), scrollHeight)
    if (minHeight === 0) {
      minHeight =
        (textareaElement?.previousElementSibling as HTMLElement)
          ?.offsetHeight || 0
    }
    const minTextAreaHeight = Math.max(
      LINE_HEIGHT * minLine + paddingLength,
      minHeight || 0,
    )
    textAreaHeight = Math.max(minTextAreaHeight, textAreaHeight)
    textareaElement.style.cssText = `height: ${textAreaHeight}px`
    const boxHeight = textAreaHeight + childrenHeight
    boxElement.style.cssText = `height: ${boxHeight}px`
    console.log(
      '修复高度',
      JSON.stringify(
        {
          paddingLength: paddingLength,
          textAreaHeight: textAreaHeight,
          childrenHeight: childrenHeight,
          boxHeight,
        },
        null,
        4,
      ),
    )
  }
}

const focusTextareaAndAutoSize = (
  textareaElement: HTMLTextAreaElement,
  childrenHeight = 0,
  minHeight = 0,
) => {
  autoSizeTextarea(textareaElement, childrenHeight, minHeight)
  setTimeout(() => {
    autoSizeTextarea(textareaElement, childrenHeight, minHeight)
    // focus input
    const value = textareaElement.value
    // let findIndex = -1
    // const matchString =
    //   ['Write a reply to this email: ', 'Write an email to...'].find((str) => {
    //     findIndex = value.indexOf(str)
    //     return findIndex > -1
    //   }) || ''
    // textareaElement.value = ''
    // textareaElement.value = value
    // console.log('focusTextareaAndAutoSize', findIndex)
    // console.log('textareaElement', textareaElement.scrollHeight)
    textareaElement.focus()
    textareaElement.setSelectionRange(value.length, value.length)
    // textareaElement.scrollTo(0, 0)
  }, 100)
}

export const autoFocusWithAllWebsite = (
  textareaElement: HTMLTextAreaElement,
  childrenHeight = 0,
  minHeight = 0,
) => {
  let matchWebsite = ''
  const muiModalElement = document.querySelector(
    'div[data-testid=sentinelStart][tabindex="0"]',
  )
  // mui的modal的判断
  if (
    muiModalElement?.nextElementSibling &&
    muiModalElement.nextElementSibling.getAttribute('tabindex') === '-1'
  ) {
    matchWebsite = 'mui'
    muiModalElement.nextElementSibling.removeAttribute('tabindex')
  }
  // linkedin的modal的判断
  if (window.location.host === 'www.linkedin.com') {
    const linkedinModalElement = document.querySelector(
      'div[tabindex="-1"][role="dialog"]',
    ) as HTMLDivElement
    if (linkedinModalElement) {
      matchWebsite = 'linkedin'
      linkedinModalElement.removeAttribute('tabindex')
      ;(document.activeElement as HTMLElement)?.blur()
      setTimeout(() => {
        linkedinModalElement.setAttribute('tabindex', '-1')
      }, 100)
    }
  }
  if (
    textareaElement.isSameNode(getAppActiveElement()) ||
    textareaElement.isSameNode(getFloatingContextMenuActiveElement())
  ) {
    return
  }
  console.log('matchWebsite', matchWebsite)
  focusTextareaAndAutoSize(textareaElement, childrenHeight, minHeight)
}

const afterAutoFocusWithAllWebsite = (textareaElement: HTMLTextAreaElement) => {
  console.log('afterRemoveModalEvent')
}

const AutoHeightTextarea: FC<{
  loading?: boolean
  error?: boolean
  defaultValue?: string
  onChange?: (value: string, options: IUserChatMessageExtraType) => void
  onEnter?: (value: string, options: IUserChatMessageExtraType) => void
  onKeydown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  children?: React.ReactNode
  sx?: SxProps
  InputId?: string
  stopPropagation?: boolean
  placeholder?: string
  debounceOnChange?: boolean
  expandNode?: React.ReactNode
  minLine?: number
}> = (props) => {
  const appState = useRecoilValue(AppState)
  const {
    currentSidebarConversationId,
    currentSidebarConversationType,
  } = useSidebarSettings()
  const floatingDropdownMenu = useRecoilValue(FloatingDropdownMenuState)
  const {
    isMaxAIVisionModel,
    uploadImagesAndSwitchToMaxAIVisionModel,
  } = useUploadImagesAndSwitchToMaxAIVisionModel()
  const {
    defaultValue,
    onChange,
    onEnter,
    onKeydown,
    loading,
    children,
    error = false,
    InputId = MAXAI_SIDEBAR_CHAT_BOX_INPUT_ID,
    stopPropagation = true,
    placeholder = 'Ask AI...',
    expandNode,
    sx,
    minLine = 1,
  } = props
  const textareaRef = useRef<null | HTMLTextAreaElement>(null)
  const onCompositionRef = useRef(false)
  const nextMessageIsActionRef = useRef(false)
  const [inputValue, setInputValue] = useState(defaultValue || '')
  const childrenHeightRef = useRef(0)
  const expandHeightRef = useRef(0)
  const childrenRef = useRef<HTMLDivElement>(null)
  const expandRef = useRef<HTMLDivElement>(null)
  const throttleAutoSizeTextarea = useMemo(
    () => throttle(autoSizeTextarea, 200),
    [],
  )
  const isImmersiveChatRef = useRef(isMaxAIImmersiveChatPage())
  const computedChildrenHeight = (source: string) => {
    console.log(
      `修复高度${source}`,
      JSON.stringify({
        图片高度: expandHeightRef.current,
        children高度: childrenHeightRef.current,
        textarea高度: textareaRef.current?.offsetHeight,
      }),
    )
    return [childrenHeightRef.current, expandHeightRef.current]
  }
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value
      if (InputId === MAXAI_SIDEBAR_CHAT_BOX_INPUT_ID) {
        getInputMediator('chatBoxInputMediator').updateInputValue(value)
      } else if (InputId === MAXAI_FLOATING_CONTEXT_MENU_INPUT_ID) {
        getInputMediator('floatingMenuInputMediator').updateInputValue(value)
      } else {
        setInputValue(value)
      }
      if (onChange) {
        onChange(value, {
          includeHistory: !nextMessageIsActionRef.current,
        })
      }
    },
    [onChange],
  )
  const metaDataRef = useRef<any>({})
  useEffect(() => {
    if (InputId === MAXAI_SIDEBAR_CHAT_BOX_INPUT_ID) {
      const handleInputUpdate = (newInputValue: string, metaData: any) => {
        console.log(metaData)
        if (metaData) {
          metaDataRef.current = metaData
        }
        if (newInputValue.startsWith('``NO_HISTORY_&#``\n')) {
          newInputValue = newInputValue.replace('``NO_HISTORY_&#``\n', '')
          nextMessageIsActionRef.current = true
        }
        setInputValue(newInputValue)
      }
      getInputMediator('chatBoxInputMediator').subscribe(handleInputUpdate)
      return () => {
        getInputMediator('chatBoxInputMediator').unsubscribe(handleInputUpdate)
      }
    }
    if (InputId === MAXAI_FLOATING_CONTEXT_MENU_INPUT_ID) {
      const handleInputUpdate = (newInputValue: string) => {
        if (newInputValue.startsWith('``NO_HISTORY_&#``\n')) {
          newInputValue = newInputValue.replace('``NO_HISTORY_&#``\n', '')
          nextMessageIsActionRef.current = true
        }
        setInputValue(newInputValue)
      }
      getInputMediator('floatingMenuInputMediator').subscribe(handleInputUpdate)
      return () => {
        getInputMediator('floatingMenuInputMediator').unsubscribe(
          handleInputUpdate,
        )
      }
    }
    return () => {
      // do nothing
    }
  }, [])
  useEffect(() => {
    nextMessageIsActionRef.current = false
    metaDataRef.current = {}
  }, [loading])
  // 更新input高度
  useEffect(() => {
    throttleAutoSizeTextarea(
      textareaRef.current!,
      ...computedChildrenHeight('inputValue1'),
    )
    setTimeout(() => {
      if (textareaRef.current) {
        autoSizeTextarea(
          textareaRef.current,
          ...computedChildrenHeight('inputValue2'),
        )
      }
    }, 0)
  }, [inputValue])
  // 计算children的高度
  useEffect(() => {
    const childrenObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setTimeout(() => {
          childrenHeightRef.current =
            (entry.target as HTMLElement)?.offsetHeight || 0
          if (textareaRef.current) {
            autoSizeTextarea(
              textareaRef.current,
              ...computedChildrenHeight('children'),
            )
          }
        }, 100)
      }
    })
    const expandObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setTimeout(() => {
          expandHeightRef.current =
            (entry.target as HTMLElement)?.offsetHeight || 0
          if (textareaRef.current) {
            autoSizeTextarea(
              textareaRef.current,
              ...computedChildrenHeight('expand'),
            )
          }
        }, 100)
      }
    })
    if (expandRef.current) {
      expandObserver.observe(expandRef.current)
    }
    if (childrenRef.current) {
      childrenObserver.observe(childrenRef.current)
    }
    return () => {
      childrenObserver.disconnect()
      expandObserver.disconnect()
    }
  }, [])
  // 浮动dropdown chat input
  useEffect(() => {
    if (
      floatingDropdownMenu.open &&
      textareaRef.current &&
      InputId === MAXAI_FLOATING_CONTEXT_MENU_INPUT_ID
    ) {
      console.log('focusTextareaAndAutoSize 浮动dropdown chat input', InputId)
      autoFocusWithAllWebsite(
        textareaRef.current,
        ...computedChildrenHeight('floatingDropdownMenu'),
      )
    }
  }, [floatingDropdownMenu.open])
  // 侧边栏chat input
  useEffect(() => {
    if (
      (appState.open || isImmersiveChatRef.current) &&
      textareaRef.current &&
      InputId === MAXAI_SIDEBAR_CHAT_BOX_INPUT_ID &&
      !isFloatingContextMenuVisible()
    ) {
      console.log('focusTextareaAndAutoSize 侧边栏chat input', InputId)
      autoFocusWithAllWebsite(
        textareaRef.current,
        ...computedChildrenHeight('appState'),
      )
    }
  }, [
    appState.open,
    loading,
    currentSidebarConversationType,
    currentSidebarConversationId,
  ])
  useEffectOnce(() => {
    if (
      InputId === MAXAI_SIDEBAR_CHAT_BOX_INPUT_ID &&
      isImmersiveChatRef.current
    ) {
      setTimeout(() => {
        autoFocusWithAllWebsite(
          textareaRef.current!,
          ...computedChildrenHeight('appState'),
        )
      }, 100)
    }
  })
  return (
    <Box
      component={'div'}
      className={loading ? 'chat-box__input--loading' : ''}
      borderRadius={'8px'}
      border={`1px solid`}
      borderColor={`${error ? 'rgb(239, 83, 80)' : 'customColor.borderColor'}`}
      width={'100%'}
      minHeight={34}
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'row',
        flexWrap: 'wrap',
        overflow: 'hidden',
        '& .chat-box__input-skeleton': {
          opacity: 0,
          zIndex: -1,
          position: 'absolute',
          top: 0,
          padding: '8px',
          left: 0,
          width: '100%',
          display: 'none',
        },
        '&.chat-box__input--loading': {
          maxHeight: '106.5px',
          overflow: 'hidden',
          position: 'relative',
          '& textarea': {
            opacity: 0,
          },
          '& .chat-box__input-skeleton': {
            opacity: 1,
            zIndex: 1,
            display: 'block',
          },
        },
        ...sx,
      }}
    >
      <Box component={'div'} className={'chat-box__input-skeleton'}>
        <Skeleton height={LINE_HEIGHT} />
      </Box>
      <Stack
        alignItems={'start'}
        width={'100%'}
        direction={'row'}
        sx={{
          '& > textarea': {
            p: 1,
            maxHeight: loading ? LINE_HEIGHT * minLine + 16 : 'unset',
            color: (t) =>
              t.palette.mode === 'dark' ? '#fff' : 'rgba(0,0,0,.87)!important',
            my: 1.5,
            fontSize: '16px',
            // minHeight: LINE_HEIGHT * minLine + 'px',
            lineHeight: LINE_HEIGHT + 'px',
            background: 'transparent!important',
            borderColor: 'transparent!important',
            margin: '0!important',
            border: '0!important',
            outline: '0!important',
            boxShadow: 'none!important',
            width: '100%',
            resize: 'none',
            overflow: 'hidden',
            overflowY: 'auto',
            fontFamily: '"Roboto","Helvetica","Arial",sans-serif!important',
            '&::-webkit-scrollbar': {
              width: 0,
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'transparent',
            },
          },
        }}
      >
        <Stack
          ref={expandRef}
          className={'max-ai-user-input__expand'}
          sx={{
            '&:has(> div)': { py: 1, pl: 1 },
            alignSelf: 'start',
          }}
        >
          {expandNode}
        </Stack>
        <textarea
          id={InputId}
          placeholder={placeholder}
          disabled={loading}
          ref={textareaRef}
          value={inputValue}
          rows={1}
          data-min-line={minLine}
          onCopy={(event) => {
            event.stopPropagation()
          }}
          onCut={(event) => {
            event.stopPropagation()
          }}
          onPaste={async (event) => {
            event.stopPropagation()
            if (isMaxAIVisionModel) {
              // 粘贴处理
              const clipboardData = event.clipboardData
              const items = clipboardData?.items
              const images = Array.from(items).filter((item) => {
                return item.type.indexOf('image') !== -1
              })
              if (images.length) {
                console.log('粘贴图片', images)
                event.preventDefault()
                const imageFiles = []
                for (const image of images) {
                  const file = image.getAsFile()
                  if (file) {
                    imageFiles.push(file)
                  }
                }
                await uploadImagesAndSwitchToMaxAIVisionModel(imageFiles)
              }
            }
          }}
          // onKeyDownCapture={(event) => {
          //   console.log('测试键盘 onKeyDownCapture', event)
          //   if (stopPropagation) {
          //     event.stopPropagation()
          //   }
          // }}
          // onKeyUpCapture={(event) => {
          //   console.log('测试键盘 onKeyUpCapture', event)
          //   if (stopPropagation) {
          //     event.stopPropagation()
          //   }
          // }}
          // onKeyPressCapture={(event) => {
          //   console.log('测试键盘 onKeyPressCapture', event)
          //   if (stopPropagation) {
          //     event.stopPropagation()
          //   }
          // }}
          onKeyUp={(event) => {
            console.log('测试键盘 onKeyUp', event)
            if (stopPropagation) {
              event.stopPropagation()
            }
          }}
          onKeyPress={(event) => {
            console.log('测试键盘 onKeyPress', event)
            if (stopPropagation) {
              event.stopPropagation()
            }
          }}
          onKeyDown={(event) => {
            console.log('测试键盘 onKeyDown', event)
            if (stopPropagation) {
              // 如果是方向键或者esc键，不阻止冒泡
              if (
                event.key === 'ArrowUp' ||
                event.key === 'ArrowDown' ||
                event.key === 'ArrowLeft' ||
                event.key === 'ArrowRight' ||
                event.key === 'Escape'
              ) {
                // 因为会影响float context menu
                if (InputId === MAXAI_FLOATING_CONTEXT_MENU_INPUT_ID) {
                  return
                }
              }
              event.stopPropagation()
            }
            if (onCompositionRef.current) {
              return
            }
            // detect shift enter
            if (event.key === 'Enter' && event.shiftKey) {
              console.log('shift enter')
            } else if (event.key === 'Enter') {
              event.preventDefault()
              const value = event.currentTarget.value
              if (!value || !value.trim()) {
                // value 没有值或者都是空格时不触发 ask
                return
              }
              onEnter &&
                onEnter(value, {
                  includeHistory: !nextMessageIsActionRef.current,
                  meta: metaDataRef.current,
                })
              nextMessageIsActionRef.current = false
              metaDataRef.current = {}
            } else if (event.code === 'Space') {
              event.stopPropagation()
              return
            }
            onKeydown && onKeydown(event)
          }}
          onClick={(event) => {
            autoFocusWithAllWebsite(
              event.currentTarget,
              ...computedChildrenHeight('click'),
            )
          }}
          onCompositionUpdate={(event) => {
            console.log('测试键盘 onCompositionUpdate', event)
            if (stopPropagation) {
              event.stopPropagation()
            }
          }}
          onCompositionStart={(event) => {
            console.log('测试键盘 onCompositionStart', event)
            if (stopPropagation) {
              event.stopPropagation()
            }
            onCompositionRef.current = true
          }}
          onCompositionEnd={(event) => {
            console.log('测试键盘 onCompositionEnd', event)
            if (stopPropagation) {
              event.stopPropagation()
            }
            onCompositionRef.current = false
            handleChange(event as any)
          }}
          onInput={(event) => {
            if (stopPropagation) {
              event.stopPropagation()
            }
            if (onCompositionRef.current) {
              console.log(
                '测试键盘 onInput 中文输入法',
                event.currentTarget.value,
                event,
              )
              // 中文输入法下，不触发 onInput
              setInputValue(event.currentTarget.value)
            } else {
              console.log('测试键盘 onInput', event.currentTarget.value, event)
              handleChange(event as any)
            }
          }}
          onBlur={(event) => {
            throttleAutoSizeTextarea(
              event.currentTarget,
              ...computedChildrenHeight('blur'),
            )
            afterAutoFocusWithAllWebsite(event.currentTarget)
          }}
        />
      </Stack>
      <Stack ref={childrenRef} width={'100%'}>
        {children}
      </Stack>
    </Box>
  )
}

export default AutoHeightTextarea
