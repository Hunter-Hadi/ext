import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import useTheme from '@mui/material/styles/useTheme'
import React, { FC, useMemo, useState } from 'react'

import { UseChatGptIcon } from '@/components/CustomIcon'

const ContextMenuMockTextarea: FC<{
  defaultValue?: string
  onChange?: (value: string) => void
  placeholder?: string
}> = (props) => {
  const {
    defaultValue = '',
    onChange,
    placeholder = 'Ask AI to edit or generate...',
  } = props
  const { palette } = useTheme()
  const [inputValue, setInputValue] = useState<string>(defaultValue)
  const haveDraft = useMemo(() => {
    return inputValue !== ''
  }, [inputValue])
  return (
    <div
      style={{
        position: 'relative',
        zIndex: 1,
        boxSizing: 'border-box',
        border: '1px solid',
        borderColor: palette.customColor.borderColor,
        background: palette.customColor.paperBackground,
        borderRadius: '6px',
        boxShadow:
          'rgb(15 15 15 / 5%) 0px 0px 0px 1px, rgb(15 15 15 / 10%) 0px 3px 6px, rgb(15 15 15 / 20%) 0px 9px 24px',
        overflow: 'hidden',
        isolation: 'isolate',
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'row',
        gap: '8px',
        width: '100%',
        padding: '7px 8px',
        marginBottom: '4px',
      }}
    >
      <UseChatGptIcon
        sx={{
          flexShrink: 0,
          color: 'primary.main',
          height: '20px',
          width: '20px',
          m: '4px',
          alignSelf: 'start',
        }}
      />
      <Stack
        direction={'row'}
        width={0}
        flex={1}
        alignItems={'center'}
        spacing={1}
        justifyContent={'left'}
      >
        <Box
          component={'div'}
          borderRadius={'8px'}
          width={'100%'}
          sx={{
            border: 'none',
            borderRadius: 0,
            minHeight: '24px',
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'row',
            flexWrap: 'wrap',
            overflow: 'hidden',
            '& > textarea': {
              p: 0,
              color: (t) =>
                t.palette.mode === 'dark'
                  ? '#fff'
                  : 'rgba(0,0,0,.87)!important',
              my: 1.5,
              fontSize: '16px',
              minHeight: 24 + 'px',
              lineHeight: 24 + 'px',
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
          <textarea
            placeholder={placeholder}
            value={inputValue}
            rows={1}
            onInput={(event) => {
              const value = (event.target as HTMLTextAreaElement).value.replace(
                /\n/g,
                '',
              )
              setInputValue(value)
              onChange?.(value)
            }}
          />
        </Box>
        <IconButton
          sx={{
            height: '20px',
            width: '20px',
            flexShrink: 0,
            alignSelf: 'center',
            alignItems: 'center',
            p: 0,
            m: '2px',
            cursor: haveDraft ? 'pointer' : 'default',
            bgcolor: haveDraft ? 'primary.main' : 'rgb(219,219,217)',
            '&:hover': {
              bgcolor: haveDraft ? 'primary.main' : 'rgb(219,219,217)',
            },
          }}
        >
          <ArrowUpwardIcon
            sx={{
              color: '#fff',
              fontSize: 16,
            }}
          />
        </IconButton>
      </Stack>
    </div>
  )
}
export default ContextMenuMockTextarea
