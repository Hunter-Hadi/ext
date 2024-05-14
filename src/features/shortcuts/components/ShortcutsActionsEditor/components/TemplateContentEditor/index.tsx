import Box from '@mui/material/Box'
import { SxProps, Theme } from '@mui/material/styles'
import React, { FC, useMemo } from 'react'
import ContentEditable, {
  Props as ContentEditableProps,
} from 'react-contenteditable'

import { getMaxAISidebarSelection } from '@/features/sidebar/utils/chatMessagesHelper'
import { mergeWithObject } from '@/utils/dataHelper/objectHelper'

interface IProps extends ContentEditableProps {
  error?: boolean
  placeholder?: string
  minHeight?: number
  maxHeight?: number
  sx?: SxProps
}

const TemplateContentEditor: FC<IProps> = (props) => {
  const {
    error,
    disabled,
    placeholder,
    minHeight = 240,
    maxHeight = 450,
    sx,
    ...contentEditProps
  } = props

  const memoSx = useMemo<SxProps>(() => {
    return mergeWithObject([
      {
        pointerEvents: disabled ? 'none' : 'auto',

        '.prompt-template-input[contenteditable=true]:empty:before': {
          content: 'attr(data-placeholder)',
          display: 'block',
          color: '#aaa',
        },
        '.prompt-template-input': {
          '--borderColor': 'rgb(208, 208, 208)',
          bgcolor: (t: Theme) =>
            t.palette.mode === 'dark' ? '#3E3F4C' : '#fff',
          display: 'block',
          boxSizing: 'border-box',
          width: 'calc(100% - 4px)',
          minHeight: `${minHeight}px`,
          maxHeight: `${maxHeight}px`,
          overflow: 'auto',
          borderRadius: '4px',
          border: '1px solid',
          outline: '0px solid',
          outlineColor: 'var(--borderColor)',
          borderColor: 'var(--borderColor)',
          p: 1,
          fontSize: 16,
          lineHeight: 1.4,
          letterSpacing: '0.4px',
          WebkitUserModify: 'read-write-plaintext-only',
          '&:hover': {
            '--borderColor': (t: Theme) =>
              t.palette.mode === 'dark' ? '#fff' : 'rgba(0, 0, 0,.87)',
          },
          '&:focus': {
            '--borderColor': (t: Theme) => t.palette.primary.main,
            outlineWidth: 1,
          },
        },
      },
      sx,
      error
        ? {
            '& .prompt-template-input': {
              '--borderColor': (t: Theme) =>
                `${t.palette.error.main}!important`,
            },
          }
        : {},
    ])
  }, [disabled, minHeight, maxHeight, sx, error])

  return (
    <Box sx={memoSx}>
      <ContentEditable
        className={'prompt-template-input'}
        id={'prompt-template-input'}
        // disabled={disabled}
        data-placeholder={placeholder}
        onKeyDown={(event) => {
          console.log(
            'ContentEditable onKeyUp',
            event,
            getMaxAISidebarSelection()?.getRangeAt(0)?.cloneRange(),
          )
          if (
            event.key === 'ContentEditable Backspace' ||
            event.key === 'Enter'
          ) {
            const selection = getMaxAISidebarSelection()
            if (selection && selection.toString() && selection.focusNode) {
              if (event.currentTarget.contains(selection.focusNode)) {
                // 删除选中的内容
                const range = selection.getRangeAt(0)
                range.deleteContents()
                if (event.key === 'Enter') {
                  // 添加换行符
                  const br = document.createElement('br')
                  range.insertNode(br)
                  range.setStartAfter(br)
                  range.setEndAfter(br)
                }
                // 阻止默认的删除事件
                event.preventDefault()
              }
            }
          }
        }}
        {...(contentEditProps as any)}
      />
    </Box>
  )
}

export default TemplateContentEditor
