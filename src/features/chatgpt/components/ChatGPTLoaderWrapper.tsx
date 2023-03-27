import { FC, useEffect, useState } from 'react'
import { Box, Stack, Paper, Typography, Button } from '@mui/material'
import React from 'react'
import { useRecoilValue } from 'recoil'
import { ChatGPTClientState } from '@/features/chatgpt/store'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { CHROME_EXTENSION_POST_MESSAGE_ID } from '@/types'
import { ContentScriptConnection } from '@/features/chatgpt/utils'

const ChatGPTLoaderWrapper: FC = () => {
  const { status } = useRecoilValue(ChatGPTClientState)
  const [showJumpToChatGPT, setShowJumpToChatGPT] = useState(false)
  useEffect(() => {
    let timer: any | null = null
    if (status === 'loading' || status === 'complete') {
      timer = setTimeout(() => {
        setShowJumpToChatGPT(true)
      }, 10000)
    }
    return () => {
      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [status])
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
            <Typography fontSize={'20px'} fontWeight={700}>
              Connecting to ChatGPT...
            </Typography>
            {showJumpToChatGPT && (
              <Box
                sx={{
                  cursor: 'pointer',
                  textAlign: 'center',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
                onClick={() => {
                  const port = new ContentScriptConnection()
                  port.postMessage({
                    id: CHROME_EXTENSION_POST_MESSAGE_ID,
                    event: 'Client_openChatGPTDaemonProcess',
                  })
                  port.destroy()
                }}
              >
                <Typography
                  component={'span'}
                  textAlign={'center'}
                  fontSize={'14px'}
                  fontWeight={400}
                >
                  {`If connection takes more than 10 seconds, check your `}
                </Typography>
                <Typography
                  component={'span'}
                  textAlign={'center'}
                  fontSize={'14px'}
                  fontWeight={400}
                >
                  {'ChatGPT page '}
                </Typography>
                <OpenInNewIcon
                  sx={{ fontSize: 14, position: 'relative', top: 3 }}
                />
                <Typography
                  component={'span'}
                  textAlign={'center'}
                  fontSize={'14px'}
                  fontWeight={400}
                >
                  {' for issues.'}
                </Typography>
              </Box>
            )}
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
          <Typography fontSize={'20px'} fontWeight={700}>
            Please log in to ChatGPT to continue
          </Typography>
          <Button
            onClick={() => {
              const port = new ContentScriptConnection()
              port.postMessage({
                id: CHROME_EXTENSION_POST_MESSAGE_ID,
                event: 'Client_openChatGPTDaemonProcess',
              })
              port.destroy()
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
