import React, { FC, useEffect, useMemo, useRef, useState } from 'react'
import { Box, Skeleton, SxProps } from '@mui/material'
import { throttle } from '@/utils/useThrottle'
import { useRecoilValue } from 'recoil'
import { getAppActiveElement } from '@/utils'
import { AppState } from '@/store'
import { ROOT_CHAT_BOX_INPUT_ID } from '@/types'

const MAX_LINE = () => {
  return Math.max(Math.floor((window.innerHeight * 0.5) / 24) || 5)
}
const LINE_HEIGHT = 24

const removeModalEvent = (textareaElement: HTMLTextAreaElement) => {
  let isMatchElement = false
  const muiModalElement = document.querySelector(
    'div[data-testid=sentinelStart][tabindex="0"]',
  )
  // mui的modal的判断
  if (
    muiModalElement?.nextElementSibling &&
    muiModalElement.nextElementSibling.getAttribute('tabindex') === '-1'
  ) {
    muiModalElement.nextElementSibling.removeAttribute('tabindex')
    isMatchElement = true
  }
  // linkedin的modal的判断
  if (window.location.host === 'www.linkedin.com') {
    const linkedinModalElement = document.querySelector(
      'div[tabindex="-1"][role="dialog"]',
    ) as HTMLDivElement
    if (linkedinModalElement) {
      linkedinModalElement.removeAttribute('tabindex')
      ;(document.activeElement as HTMLElement)?.blur()
      isMatchElement = true
      setTimeout(() => {
        linkedinModalElement.setAttribute('tabindex', '-1')
      }, 100)
    }
  }
  if (isMatchElement) {
    console.log('match need remove modal')
    focusTextareaAndAutoSize(textareaElement)
  }
}
const afterRemoveModalEvent = (textareaElement: HTMLTextAreaElement) => {
  console.log('afterRemoveModalEvent')
}

const autoSizeTextarea = (
  textareaElement: HTMLTextAreaElement,
  childrenHeight = 0,
) => {
  const boxElement = textareaElement?.parentElement
  if (textareaElement && boxElement) {
    const scrollHeight = textareaElement.value
      ? textareaElement.scrollHeight
      : LINE_HEIGHT
    textareaElement.style.cssText = 'height:0px'
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
) => {
  autoSizeTextarea(textareaElement, childrenHeight)
  setTimeout(() => {
    // focus input
    // const value = textareaElement.value
    // let findIndex = -1
    // const matchString =
    //   ['Write a reply to this email: ', 'Write an email to...'].find((str) => {
    //     findIndex = value.indexOf(str)
    //     return findIndex > -1
    //   }) || ''
    // textareaElement.value = ''
    // textareaElement.value = value
    // console.log('focusTextareaAndAutoSize', findIndex)
    textareaElement.focus()
    // textareaElement.setSelectionRange(
    //   Math.max(matchString.length + findIndex, 0),
    //   Math.max(matchString.length + findIndex, 0),
    // )
    textareaElement.scrollTo(0, 0)
  }, 100)
}

const AutoHeightTextarea: FC<{
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
  const {
    defaultValue,
    onChange,
    onEnter,
    onKeydown,
    loading,
    children,
    childrenHeight = 0,
    error = false,
    InputId = ROOT_CHAT_BOX_INPUT_ID,
    stopPropagation = true,
    placeholder = 'Ask ChatGPT...',
    sx,
  } = props
  const textareaRef = useRef<null | HTMLTextAreaElement>(null)
  const [inputValue, setInputValue] = useState(defaultValue || '')
  const throttleAutoSizeTextarea = useMemo(
    () => throttle(autoSizeTextarea, 200),
    [],
  )
  useEffect(() => {
    setInputValue(defaultValue || '')
    setTimeout(() => {
      if (textareaRef.current) {
        if (textareaRef.current?.isSameNode(getAppActiveElement())) {
          throttleAutoSizeTextarea(textareaRef.current, childrenHeight)
        } else {
          console.log(getAppActiveElement())
          focusTextareaAndAutoSize(textareaRef.current, childrenHeight)
        }
      }
    }, 100)
  }, [defaultValue, textareaRef])
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
  useEffect(() => {
    if (appState.open && textareaRef.current) {
      focusTextareaAndAutoSize(textareaRef.current, childrenHeight)
    }
  }, [appState, textareaRef, loading])
  return (
    <Box
      component={'div'}
      className={loading ? 'chat-box__input--loading' : ''}
      borderRadius={'8px'}
      border={`1px solid ${error ? 'rgb(239, 83, 80)' : '#e0e0e0'}`}
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
          color: 'rgba(0,0,0,.87)!important',
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
        onKeyUp={(event) => {
          if (stopPropagation) {
            event.stopPropagation()
          }
        }}
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
          }
          onKeydown && onKeydown(event)
        }}
        onClick={(event) => {
          removeModalEvent(event.currentTarget)
        }}
        onInput={(event) => {
          console.log(
            'onInput!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!',
            event.currentTarget.value,
          )
          setInputValue(event.currentTarget.value)
          onChange && onChange(event.currentTarget.value)
        }}
        onBlur={(event) => {
          throttleAutoSizeTextarea(event.currentTarget, childrenHeight)
          afterRemoveModalEvent(event.currentTarget)
        }}
      />
      {children}
    </Box>
  )
}

export default AutoHeightTextarea
