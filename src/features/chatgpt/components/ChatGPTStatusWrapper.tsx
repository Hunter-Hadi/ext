import { FC, useEffect, useState } from 'react'
import { Box, Stack, Paper, Typography, Button, Divider } from '@mui/material'
import React from 'react'
import { useRecoilValue } from 'recoil'
import { ChatGPTClientState } from '@/features/chatgpt/store'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { CHAT_GPT_PROVIDER, CHROME_EXTENSION_POST_MESSAGE_ID } from '@/types'
import { ContentScriptConnectionV2 } from '@/features/chatgpt/utils'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { ChatGPTAIProviderSelector } from '@/features/chatgpt/components/ChatGPTAIProviderSelector'

const port = new ContentScriptConnectionV2()

const ProviderFeatureItem: FC<{
  title: string
  variant: 'contained' | 'outlined'
}> = ({ title, variant }) => {
  return (
    <Stack spacing={1} direction={'row'} alignItems={'center'}>
      {variant === 'outlined' ? (
        <CheckCircleOutlineIcon sx={{ fontSize: 20 }} />
      ) : (
        <CheckCircleIcon sx={{ fontSize: 20 }} />
      )}
      <Typography fontSize={'14px'} fontWeight={400}>
        {title}
      </Typography>
    </Stack>
  )
}

const ChatGPTStatusWrapper: FC = () => {
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
          backgroundColor: 'rgba(0,0,0,0.1)',
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
                  port.postMessage({
                    event: 'Client_switchChatGPTProvider',
                    data: {
                      provider: CHAT_GPT_PROVIDER.OPENAI,
                    },
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
  if (status === 'needAuth') {
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
              onClick={async () => {
                debugger
                await port.postMessage({
                  event: 'Client_authChatGPTProvider',
                  data: {
                    provider: CHAT_GPT_PROVIDER.OPENAI,
                  },
                })
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
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 1,
        display: 'flex',
        textAlign: 'left',
        justifyContent: 'center',
        alignItems: 'center',
        '& + *': {
          filter: 'blur(5px)',
        },
      }}
    >
      <Box sx={{ position: 'absolute', top: 0, width: '100%' }}>
        <ChatGPTAIProviderSelector />
      </Box>
      <Stack
        p={2}
        sx={{
          mx: 3,
          width: '100%',
          border: '1px solid',
          borderColor: 'customColor.borderColor',
        }}
      >
        <Typography
          textAlign={'left'}
          fontSize={'16px'}
          fontWeight={700}
          color={'text.primary'}
        >
          UseChatGPT.AI Plus
        </Typography>
        <Paper sx={{ p: 0.5, mt: 1, mb: 2 }}>
          <Stack spacing={1}>
            <ProviderFeatureItem
              title={'No OpenAl interruptions'}
              variant={'contained'}
            />
            <ProviderFeatureItem title={'99% uptime'} variant={'contained'} />
            <ProviderFeatureItem
              title={'2x faster response time'}
              variant={'contained'}
            />
            <ProviderFeatureItem
              title={'No country restrictions'}
              variant={'contained'}
            />
          </Stack>
        </Paper>
        <Button
          sx={{ height: 40 }}
          onClick={() => {
            port.postMessage({
              event: 'Client_switchChatGPTProvider',
              data: {
                provider: CHAT_GPT_PROVIDER.USE_CHAT_GPT_PLUS,
              },
            })
            port.destroy()
          }}
          variant={'contained'}
          disableElevation
          fullWidth
          endIcon={<OpenInNewIcon />}
        >
          Continue free
        </Button>
        <Divider sx={{ my: 2 }} />
        <Typography
          textAlign={'left'}
          fontSize={'16px'}
          fontWeight={700}
          color={'text.primary'}
        >
          Your own ChatGPT account
        </Typography>
        <Paper sx={{ p: 0.5, mt: 1, mb: 2 }}>
          <Stack spacing={1}>
            <ProviderFeatureItem
              title={'OpenAl account required'}
              variant={'outlined'}
            />
            <ProviderFeatureItem
              title={'OpenAl login interruptions'}
              variant={'outlined'}
            />
            <ProviderFeatureItem
              title={'ChatGPT downtimes'}
              variant={'outlined'}
            />
            <ProviderFeatureItem
              title={'OpenAl country restrictions'}
              variant={'outlined'}
            />
          </Stack>
        </Paper>
        <Button
          sx={{ height: 40 }}
          onClick={async () => {
            const result = await port.postMessage({
              event: 'Client_switchChatGPTProvider',
              data: {
                provider: CHAT_GPT_PROVIDER.OPENAI,
              },
            })
            if (result.success) {
              debugger
              await port.postMessage({
                event: 'Client_authChatGPTProvider',
                data: {},
              })
            }
          }}
          variant={'outlined'}
          disableElevation
          fullWidth
          endIcon={<OpenInNewIcon />}
        >
          Continue
        </Button>
      </Stack>
    </Box>
  )
}
export { ChatGPTStatusWrapper }
