import NavigateBeforeOutlinedIcon from '@mui/icons-material/NavigateBeforeOutlined'
import NavigateNextOutlinedIcon from '@mui/icons-material/NavigateNextOutlined'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { FC } from 'react'

import useSmoothConversationLoading from '@/features/chatgpt/hooks/useSmoothConversationLoading'
import useFloatingContextMenuDraft from '@/features/contextMenu/hooks/useFloatingContextMenuDraft'

const WritingMessageBoxPagination: FC = () => {
  const {
    historyMessages,
    activeMessageIndex,
    goToNextMessage,
    goToPreviousMessage,
  } = useFloatingContextMenuDraft()
  const { smoothConversationLoading } = useSmoothConversationLoading()
  if (historyMessages.length < 2) {
    return null
  }
  const isDisabledPrevious = activeMessageIndex === 0
  const isDisabledNext = activeMessageIndex === historyMessages.length - 1
  return (
    <Stack
      flexShrink={0}
      direction={'row'}
      gap={0.5}
      lineHeight={'24px'}
      alignItems={'center'}
    >
      <Divider
        orientation="vertical"
        flexItem
        sx={{
          m: 0.5,
        }}
      />
      <IconButton
        sx={{ width: '24px', height: '24px' }}
        disabled={smoothConversationLoading || isDisabledPrevious}
      >
        <NavigateBeforeOutlinedIcon
          onClick={goToPreviousMessage}
          sx={{
            fontSize: '20px',
            p: '2px',
            color: 'text.secondary',
            cursor: 'pointer',
            opacity: isDisabledPrevious ? 0.4 : 1,
          }}
        />
      </IconButton>
      <Typography
        fontSize={'12px'}
        color={'text.secondary'}
        fontWeight={400}
        lineHeight={'24px'}
      >
        {`${activeMessageIndex + 1} of ${historyMessages.length}`}
      </Typography>
      <IconButton
        sx={{ width: '24px', height: '24px' }}
        disabled={smoothConversationLoading || isDisabledNext}
      >
        <NavigateNextOutlinedIcon
          onClick={goToNextMessage}
          sx={{
            fontSize: '20px',
            p: '2px',
            color: 'text.secondary',
            cursor: 'pointer',
            opacity: isDisabledNext ? 0.4 : 1,
          }}
        />
      </IconButton>
    </Stack>
  )
}
export default WritingMessageBoxPagination
