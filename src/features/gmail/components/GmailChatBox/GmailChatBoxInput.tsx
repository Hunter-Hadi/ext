import React, { FC, useEffect, useMemo, useRef, useState } from 'react'
import { Box, Skeleton } from '@mui/material'
import { throttle } from '@/utils/useThrottle'
import { useRecoilValue } from 'recoil'
import { getAppActiveElement } from '@/utils'
import { ROOT_CHAT_BOX_INPUT_ID } from '@/types'
import { AppState } from '@/store'

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
const afterRemoveModalEvent = (textareaElement: HTMLTextAreaElement) => null

const autoSizeTextarea = (textareaElement: HTMLTextAreaElement) => {
  const boxElement = textareaElement?.parentElement
  if (textareaElement && boxElement) {
    textareaElement.style.cssText = 'height:0px'
    const height = Math.min(
      LINE_HEIGHT * MAX_LINE(),
      textareaElement.scrollHeight,
    )
    let paddingHeight = 44.5
    if (textareaElement.scrollHeight > LINE_HEIGHT) {
      // padding height
      paddingHeight += 16
    }
    boxElement.style.cssText = `height: ${height + paddingHeight}px`
    textareaElement.style.cssText = `height: ${height}px`
  }
}

const focusTextareaAndAutoSize = (textareaElement: HTMLTextAreaElement) => {
  autoSizeTextarea(textareaElement)
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

const GmailChatBoxInput: FC<{
  loading?: boolean
  error?: boolean
  defaultValue?: string
  onChange?: (value: string) => void
  onEnter?: (value: string) => void
  children?: React.ReactNode
}> = (props) => {
  const appState = useRecoilValue(AppState)
  const {
    defaultValue,
    onChange,
    onEnter,
    loading,
    children,
    error = false,
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
          throttleAutoSizeTextarea(textareaRef.current)
        } else {
          console.log(getAppActiveElement())
          focusTextareaAndAutoSize(textareaRef.current)
        }
      }
    }, 100)
  }, [defaultValue, textareaRef])
  useEffect(() => {
    if (appState.open) {
      const timer = setInterval(() => {
        if (textareaRef.current) {
          throttleAutoSizeTextarea(textareaRef.current)
        }
      }, 1000)
      return () => {
        clearInterval(timer)
      }
    }
    return () => {
      // do nothing
    }
  }, [appState])
  useEffect(() => {
    if (appState.open && textareaRef.current) {
      focusTextareaAndAutoSize(textareaRef.current)
    }
  }, [appState, textareaRef])
  return (
    <Box
      component={'div'}
      className={loading ? 'chat-box__input--loading' : ''}
      borderRadius={'8px'}
      border={`1px solid ${error ? 'rgb(239, 83, 80)' : '#e0e0e0'}`}
      width={'100%'}
      minHeight={44}
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
          maxHeight: '100.5px',
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
          color: 'rgba(0,0,0,.87)!important',
          p: 1,
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
      }}
    >
      <Box component={'div'} className={'chat-box__input-skeleton'}>
        <Skeleton height={LINE_HEIGHT} />
      </Box>
      <textarea
        id={ROOT_CHAT_BOX_INPUT_ID}
        placeholder={'Ask ChatGPT...'}
        disabled={loading}
        ref={textareaRef}
        value={inputValue}
        rows={1}
        onKeyDown={(event) => {
          event.stopPropagation()
          // detect shift enter
          if (event.key === 'Enter' && event.shiftKey) {
            console.log('shift enter')
          } else if (event.key === 'Enter') {
            onEnter && onEnter(event.currentTarget.value)
            setInputValue('')
            event.preventDefault()
          }
        }}
        onClick={(event) => {
          removeModalEvent(event.currentTarget)
        }}
        onInput={(event) => {
          setInputValue(event.currentTarget.value)
          onChange && onChange(event.currentTarget.value)
        }}
        onBlur={(event) => {
          throttleAutoSizeTextarea(event.currentTarget)
          afterRemoveModalEvent(event.currentTarget)
        }}
        onKeyUp={(event) => {
          event.stopPropagation()
        }}
      />
      {children}
    </Box>
  )
}
export default GmailChatBoxInput
