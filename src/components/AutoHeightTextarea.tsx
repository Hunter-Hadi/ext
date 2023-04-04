import React, { FC, useEffect, useMemo, useState } from 'react'
import { Box, Skeleton, SxProps } from '@mui/material'
import { throttle } from '@/utils/useThrottle'
import { useRecoilValue } from 'recoil'
import {
  getAppActiveElement,
  getFloatingContextMenuActiveElement,
} from '@/utils'
import { AppState } from '@/store'
import {
  ROOT_CHAT_BOX_INPUT_ID,
  ROOT_CONTAINER_ID,
  ROOT_FLOATING_INPUT_ID,
} from '@/types'
import { FloatingDropdownMenuState } from '@/features/contextMenu/store'

const MAX_LINE = () => {
  return Math.max(Math.floor((window.innerHeight * 0.5) / 24) || 5)
}
const LINE_HEIGHT = 24

const autoSizeTextarea = (
  textareaElement: HTMLTextAreaElement,
  childrenHeight = 0,
) => {
  const boxElement = textareaElement?.parentElement
  if (textareaElement && boxElement) {
    textareaElement.style.cssText = 'height:0px'
    const scrollHeight = textareaElement.value
      ? textareaElement.scrollHeight
      : LINE_HEIGHT
    let height = Math.min(LINE_HEIGHT * MAX_LINE(), scrollHeight)
    height = Math.max(childrenHeight, height)
    let paddingHeight = childrenHeight
    if (childrenHeight > 0) {
      // padding height
      paddingHeight += 16
    }
    boxElement.style.cssText = `height: ${height + paddingHeight}px`
    textareaElement.style.cssText = `height: ${height}px`
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
    // debugger
    // console.log('textareaElement', textareaElement.scrollHeight)
    textareaElement.focus()
    textareaElement.setSelectionRange(value.length, value.length)
    // textareaElement.scrollTo(0, 0)
  }, 100)
}

const autoFocusWithAllWebsite = (
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
  textareaRef: React.RefObject<HTMLTextAreaElement>
  loading?: boolean
  error?: boolean
  defaultValue?: string
  onChange?: (value: string) => void
  onEnter?: (value: string) => void
  onKeydown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  children?: React.ReactNode
  childrenHeight?: number
  sx?: SxProps
  InputId?: string
  stopPropagation?: boolean
  placeholder?: string
}> = (props) => {
  const appState = useRecoilValue(AppState)
  const floatingDropdownMenu = useRecoilValue(FloatingDropdownMenuState)
  const {
    defaultValue,
    onChange,
    onEnter,
    onKeydown,
    loading,
    children,
    childrenHeight = 0,
    error = false,
    textareaRef,
    InputId = ROOT_CHAT_BOX_INPUT_ID,
    stopPropagation = true,
    placeholder = 'Ask ChatGPT...',
    sx,
  } = props
  // const textareaRef = useRef<null | HTMLTextAreaElement>(null)
  const [inputValue, setInputValue] = useState(defaultValue || '')

  const throttleAutoSizeTextarea = useMemo(
    () => throttle(autoSizeTextarea, 200),
    [],
  )

  useEffect(() => {
    setInputValue(defaultValue || '')
    setTimeout(() => {
      if (textareaRef.current) {
        if (
          textareaRef.current?.isSameNode(getAppActiveElement()) ||
          textareaRef.current?.isSameNode(getFloatingContextMenuActiveElement())
        ) {
          throttleAutoSizeTextarea(textareaRef.current, childrenHeight)
        } else {
          const isOpenApp =
            document
              .querySelector(`#${ROOT_CONTAINER_ID}`)
              ?.classList.contains('open') || false
          isOpenApp &&
            InputId === ROOT_CHAT_BOX_INPUT_ID &&
            focusTextareaAndAutoSize(
              textareaRef.current,
              childrenHeight,
              'defaultValue, textareaRef' + InputId,
            )
        }
      }
    }, 100)
  }, [defaultValue])

  useEffect(() => {
    const timer = setInterval(() => {
      if (textareaRef.current) {
        throttleAutoSizeTextarea(textareaRef.current, childrenHeight)
      }
    }, 1000)
    return () => {
      clearInterval(timer)
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
      autoFocusWithAllWebsite(textareaRef.current, childrenHeight)
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
      autoFocusWithAllWebsite(textareaRef.current, childrenHeight)
    }
  }, [appState.open, loading])
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
          '& > textarea': {
            maxHeight: '30px',
            opacity: 0,
          },
          '& .chat-box__input-skeleton': {
            opacity: 1,
            zIndex: 1,
            display: 'block',
          },
        },
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
        ...sx,
      }}
    >
      <Box component={'div'} className={'chat-box__input-skeleton'}>
        <Skeleton height={LINE_HEIGHT} />
      </Box>
      <textarea
        id={InputId}
        placeholder={placeholder}
        disabled={loading}
        ref={textareaRef}
        value={inputValue}
        rows={1}
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
          // detect shift enter
          if (event.key === 'Enter' && event.shiftKey) {
            console.log('shift enter')
          } else if (event.key === 'Enter') {
            onEnter && onEnter(event.currentTarget.value)
            setInputValue('')
            event.preventDefault()
          } else if (event.code === 'Space') {
            event.stopPropagation()
            return
          }
          onKeydown && onKeydown(event)
        }}
        onClick={(event) => {
          autoFocusWithAllWebsite(event.currentTarget, childrenHeight)
        }}
        onInput={(event) => {
          console.log(
            'onInput!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!',
            event.currentTarget.value,
          )
          setInputValue(event.currentTarget.value)
          onChange && onChange(event.currentTarget.value)
          throttleAutoSizeTextarea(event.currentTarget, childrenHeight)
        }}
        onBlur={(event) => {
          throttleAutoSizeTextarea(event.currentTarget, childrenHeight)
          afterAutoFocusWithAllWebsite(event.currentTarget)
        }}
      />
      {children}
    </Box>
  )
}

export default AutoHeightTextarea
