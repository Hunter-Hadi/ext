import React, {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import { SxProps } from '@mui/material/styles'
import { throttle } from '@/hooks/useThrottle'
import { useRecoilValue } from 'recoil'
import {
  getAppActiveElement,
  getFloatingContextMenuActiveElement,
} from '@/utils'
import { AppState } from '@/store'
import { ROOT_CHAT_BOX_INPUT_ID, ROOT_FLOATING_INPUT_ID } from '@/constants'
import { getMediator } from '@/store/InputMediator'
import Stack from '@mui/material/Stack'
import { FloatingDropdownMenuState } from '@/features/contextMenu/store'
import { IUserChatMessageExtraType } from '@/features/chatgpt/types'
import { ChatGPTConversationState } from '@/features/sidebar'

const MAX_LINE = () => {
  return Math.max(Math.floor((window.innerHeight * 0.5) / 24) || 5)
}
const LINE_HEIGHT = 24

const autoSizeTextarea = (
  textareaElement: HTMLTextAreaElement,
  childrenHeight = 0,
) => {
  const boxElement = textareaElement?.parentElement?.parentElement
  if (textareaElement && boxElement) {
    textareaElement.style.cssText = 'height:0px'
    const scrollHeight = textareaElement.value
      ? textareaElement.scrollHeight
      : LINE_HEIGHT
    let textAreaHeight = Math.min(LINE_HEIGHT * MAX_LINE(), scrollHeight)
    const minTextAreaHeight = LINE_HEIGHT + (childrenHeight > 0 ? 16 : 0)
    textAreaHeight = Math.max(minTextAreaHeight, textAreaHeight)
    textareaElement.style.cssText = `height: ${textAreaHeight}px`
    const boxHeight = textAreaHeight + childrenHeight
    boxElement.style.cssText = `height: ${boxHeight}px`
  }
}

const focusTextareaAndAutoSize = (
  textareaElement: HTMLTextAreaElement,
  childrenHeight = 0,
  from?: string,
) => {
  console.log('focusTextareaAndAutoSize from', from || '')
  autoSizeTextarea(textareaElement, childrenHeight)
  setTimeout(() => {
    autoSizeTextarea(textareaElement, childrenHeight)
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
  focusTextareaAndAutoSize(
    textareaElement,
    childrenHeight,
    `autoFocusWithAllWebsite [${matchWebsite}]`,
  )
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
}> = (props) => {
  const appState = useRecoilValue(AppState)
  const floatingDropdownMenu = useRecoilValue(FloatingDropdownMenuState)
  const conversation = useRecoilValue(ChatGPTConversationState)
  const {
    defaultValue,
    onChange,
    onEnter,
    onKeydown,
    loading,
    children,
    error = false,
    InputId = ROOT_CHAT_BOX_INPUT_ID,
    stopPropagation = true,
    placeholder = 'Ask AI...',
    expandNode,
    sx,
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
  const computedChildrenHeight = () => {
    if (
      textareaRef?.current?.offsetHeight &&
      expandRef.current?.offsetHeight &&
      textareaRef.current.offsetHeight >= expandRef.current.offsetHeight
    ) {
      if (InputId === ROOT_FLOATING_INPUT_ID) {
        console.log(
          'computedChildrenHeight 111',
          childrenHeightRef.current,
          expandHeightRef.current,
          textareaRef.current.offsetHeight,
        )
      }
      return childrenHeightRef.current
    } else {
      if (InputId === ROOT_FLOATING_INPUT_ID) {
        console.log(
          'computedChildrenHeight 222',
          childrenHeightRef.current + expandHeightRef.current,
        )
      }
      return (
        childrenHeightRef.current +
        expandHeightRef.current -
        (textareaRef.current?.offsetHeight || 0)
      )
    }
  }
  const isError = useMemo(() => {
    return inputValue.length > 4000
  }, [inputValue])
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value
      if (InputId === ROOT_CHAT_BOX_INPUT_ID) {
        getMediator('chatBoxInputMediator').updateInputValue(value)
      } else if (InputId === ROOT_FLOATING_INPUT_ID) {
        getMediator('floatingMenuInputMediator').updateInputValue(value)
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
    if (InputId === ROOT_CHAT_BOX_INPUT_ID) {
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
      getMediator('chatBoxInputMediator').subscribe(handleInputUpdate)
      return () => {
        getMediator('chatBoxInputMediator').unsubscribe(handleInputUpdate)
      }
    }
    if (InputId === ROOT_FLOATING_INPUT_ID) {
      const handleInputUpdate = (newInputValue: string) => {
        if (newInputValue.startsWith('``NO_HISTORY_&#``\n')) {
          newInputValue = newInputValue.replace('``NO_HISTORY_&#``\n', '')
          nextMessageIsActionRef.current = true
        }
        setInputValue(newInputValue)
      }
      getMediator('floatingMenuInputMediator').subscribe(handleInputUpdate)
      return () => {
        getMediator('floatingMenuInputMediator').unsubscribe(handleInputUpdate)
      }
    }
    return () => {
      // do nothing
    }
  }, [])
  useEffect(() => {
    nextMessageIsActionRef.current = false
    metaDataRef.current = {}
  }, [conversation.loading])
  // 更新input高度
  useEffect(() => {
    setTimeout(() => {
      if (textareaRef.current) {
        autoSizeTextarea(textareaRef.current, computedChildrenHeight())
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
            autoSizeTextarea(textareaRef.current, computedChildrenHeight())
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
            autoSizeTextarea(textareaRef.current, computedChildrenHeight())
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
      InputId === ROOT_FLOATING_INPUT_ID
    ) {
      console.log('focusTextareaAndAutoSize 浮动dropdown chat input', InputId)
      autoFocusWithAllWebsite(textareaRef.current, computedChildrenHeight())
    }
  }, [floatingDropdownMenu.open])
  // 侧边栏chat input
  useEffect(() => {
    if (
      appState.open &&
      textareaRef.current &&
      InputId === ROOT_CHAT_BOX_INPUT_ID
    ) {
      console.log('focusTextareaAndAutoSize 侧边栏chat input', InputId)
      autoFocusWithAllWebsite(textareaRef.current, computedChildrenHeight())
    }
  }, [appState.open, loading])
  return (
    <Box
      component={'div'}
      className={loading ? 'chat-box__input--loading' : ''}
      borderRadius={'8px'}
      border={`1px solid`}
      borderColor={`${
        isError || error ? 'rgb(239, 83, 80)' : 'customColor.borderColor'
      }`}
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
            maxHeight: '30px',
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
            color: (t) =>
              t.palette.mode === 'dark' ? '#fff' : 'rgba(0,0,0,.87)!important',
            my: 1.5,
            fontSize: '16px',
            minHeight: LINE_HEIGHT + 'px',
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
          onCopy={(event) => {
            event.stopPropagation()
          }}
          onCut={(event) => {
            event.stopPropagation()
          }}
          onPaste={(event) => {
            event.stopPropagation()
          }}
          // onKeyDownCapture={(event) => {
          //   if (stopPropagation) {
          //     event.stopPropagation()
          //   }
          // }}
          // onKeyUpCapture={(event) => {
          //   if (stopPropagation) {
          //     event.stopPropagation()
          //   }
          // }}
          onKeyUp={(event) => {
            if (stopPropagation) {
              event.stopPropagation()
            }
          }}
          onKeyPress={(event) => {
            if (stopPropagation) {
              event.stopPropagation()
            }
          }}
          // onKeyPressCapture={(event) => {
          //   if (stopPropagation) {
          //     event.stopPropagation()
          //   }
          // }}
          onKeyDown={(event) => {
            if (stopPropagation) {
              event.stopPropagation()
            }
            if (onCompositionRef.current) {
              return
            }
            // detect shift enter
            if (event.key === 'Enter' && event.shiftKey) {
              console.log('shift enter')
            } else if (event.key === 'Enter') {
              onEnter &&
                onEnter(event.currentTarget.value, {
                  includeHistory: !nextMessageIsActionRef.current,
                  meta: metaDataRef.current,
                })
              nextMessageIsActionRef.current = false
              metaDataRef.current = {}
              event.preventDefault()
            } else if (event.code === 'Space') {
              event.stopPropagation()
              return
            }
            onKeydown && onKeydown(event)
          }}
          onClick={(event) => {
            autoFocusWithAllWebsite(
              event.currentTarget,
              computedChildrenHeight(),
            )
          }}
          onCompositionStart={(event) => {
            if (stopPropagation) {
              event.stopPropagation()
            }
            onCompositionRef.current = true
          }}
          onCompositionEnd={(event) => {
            if (stopPropagation) {
              event.stopPropagation()
            }
            onCompositionRef.current = false
          }}
          onInput={handleChange}
          onBlur={(event) => {
            throttleAutoSizeTextarea(
              event.currentTarget,
              computedChildrenHeight(),
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
