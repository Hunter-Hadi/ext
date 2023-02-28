import { FC } from 'react'
import { Box, Stack, Paper, Typography, Button } from '@mui/material'
import React from 'react'
import { useRecoilValue } from 'recoil'
import { ChatGPTClientState } from '@/features/chatgpt/store'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
const ChatGPTLoaderWrapper: FC = () => {
  const { status } = useRecoilValue(ChatGPTClientState)
  const { port } = useRecoilValue(ChatGPTClientState)
  if (status === 'success') {
    return null
  }
  if (status === 'loading' || status === 'complete') {
    return (
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          '& + *': {
            filter: 'blur(5px)',
          },
        }}
      >
        <Paper sx={{ width: '80%', p: 2, py: 4 }}>
          <Stack alignItems={'center'} height={'100%'} spacing={2}>
            <Typography fontSize={'1.3rem'} fontWeight={700}>
              Connecting to ChatGPT...
            </Typography>
          </Stack>
        </Paper>
      </Box>
    )
  }
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        '& + *': {
          filter: 'blur(5px)',
        },
      }}
    >
      <Paper sx={{ width: '80%', p: 2, py: 4 }}>
        <Stack alignItems={'center'} height={'100%'} spacing={2}>
          <Typography fontSize={'1.3rem'} fontWeight={700}>
            Please log in to ChatGPT to continue
          </Typography>
          <Button
            onClick={() => {
              if (port) {
                port?.postMessage({ event: 'Client_openChatGPTDaemonProcess' })
              } else {
                window.open('https://chat.openai.com/chat', '_blank')
              }
            }}
            variant={'contained'}
            disableElevation
            fullWidth
            endIcon={<OpenInNewIcon />}
          >
            Log in to ChatGPT
          </Button>
        </Stack>
      </Paper>
    </Box>
  )
}
export { ChatGPTLoaderWrapper }
