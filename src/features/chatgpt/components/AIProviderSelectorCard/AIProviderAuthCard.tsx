import React, { FC, useEffect, useState } from 'react'
import { AIProviderOptionType } from '@/features/chatgpt/components/AIProviderSelectorCard/AIProviderOptions'
import AIProviderInfoCard from '@/features/chatgpt/components/AIProviderSelectorCard/AIProviderInfoCard'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { ContentScriptConnectionV2 } from '@/features/chatgpt'
import { AI_PROVIDER_MAP } from '@/constants'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Link from '@mui/material/Link'
import { chromeExtensionClientOpenPage } from '@/utils'
import Stack from '@mui/material/Stack'
import TooltipButton from '@/components/TooltipButton'
import { useRecoilValue } from 'recoil'
import { ChatGPTClientState } from '@/features/chatgpt/store'
import TextOnlyTooltip from '@/components/TextOnlyTooltip'

const port = new ContentScriptConnectionV2()

const AIProviderAuthCard: FC<{
  aiProviderOption: AIProviderOptionType
}> = (props) => {
  const { aiProviderOption } = props
  const chatGPTClientState = useRecoilValue(ChatGPTClientState)
  const [showJumpToChatGPT, setShowJumpToChatGPT] = useState(false)
  useEffect(() => {
    let timer: any | null = null
    if (
      chatGPTClientState.status === 'loading' ||
      chatGPTClientState.status === 'complete'
    ) {
      timer = setTimeout(() => {
        setShowJumpToChatGPT(true)
      }, 10 * 1000)
    }
    return () => {
      if (timer) {
        setShowJumpToChatGPT(false)
        clearTimeout(timer)
      }
    }
  }, [chatGPTClientState.status])
  return (
    <AIProviderInfoCard
      authMode
      aiProviderOption={aiProviderOption}
      boxSx={{
        p: 0,
      }}
    >
      {(chatGPTClientState.status === 'loading' ||
        chatGPTClientState.status === 'complete') && (
        <Stack>
          {aiProviderOption.value === AI_PROVIDER_MAP.OPENAI && (
            <TextOnlyTooltip
              placement={'bottom'}
              arrow
              open
              PopperProps={{
                sx: {
                  maxWidth: '237px',
                  zIndex: '2147483632!important',
                },
              }}
              title={
                showJumpToChatGPT && (
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
                        event: 'Client_authChatGPTProvider',
                        data: {
                          provider: AI_PROVIDER_MAP.OPENAI,
                        },
                      })
                    }}
                  >
                    <Typography
                      component={'span'}
                      textAlign={'center'}
                      fontSize={'14px'}
                      fontWeight={400}
                    >
                      {`If connection takes more than 10 seconds, `}
                    </Typography>
                    <Typography
                      component={'span'}
                      textAlign={'center'}
                      fontSize={'14px'}
                      fontWeight={400}
                      sx={{
                        textDecoration: 'underline',
                      }}
                    >
                      {'check your ChatGPT page '}
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
                )
              }
            >
              <Stack
                justifyContent={'center'}
                alignItems={'center'}
                height={'100%'}
                sx={{
                  height: '40px',
                }}
              >
                <Typography fontSize={'18px'} fontWeight={700}>
                  Connecting to ChatGPT...
                </Typography>
              </Stack>
            </TextOnlyTooltip>
          )}
        </Stack>
      )}
      {chatGPTClientState.status === 'needAuth' && (
        <Stack spacing={2}>
          <TooltipButton
            TooltipProps={{
              arrow: true,
              placement: 'bottom',
              PopperProps: {
                sx: {
                  maxWidth: '237px',
                  zIndex: '2147483632!important',
                },
              },
            }}
            sx={{
              fontSize: '14px',
              fontWeight: 400,
              width: '100%',
              px: '0',
              py: '6px',
              height: '40px',
            }}
            title={
              aiProviderOption.value === AI_PROVIDER_MAP.OPENAI && (
                <Box sx={{ display: 'inline' }}>
                  <Typography
                    component={'span'}
                    fontSize={14}
                    textAlign={'left'}
                  >
                    {`If experiencing frequent interruptions and network errors, try `}
                  </Typography>
                  <Link
                    fontSize={14}
                    color={'#fff'}
                    sx={{
                      textDecorationColor: '#fff',
                    }}
                    href={'#'}
                    onClick={async () => {
                      await chromeExtensionClientOpenPage({
                        key: 'options',
                        query: '#chatgpt-stable-mode',
                      })
                    }}
                  >
                    ChatGPT Stable Mode
                  </Link>
                  <Typography
                    component={'span'}
                    fontSize={14}
                    textAlign={'left'}
                  >
                    {`.`}
                  </Typography>
                </Box>
              )
            }
            onClick={async () => {
              await port.postMessage({
                event: 'Client_authChatGPTProvider',
                data: {
                  provider: aiProviderOption.value,
                },
              })
            }}
            variant={'contained'}
            disableElevation
            fullWidth
          >
            {aiProviderOption.authButtonText}
            {aiProviderOption.authOpenInNew && (
              <OpenInNewIcon sx={{ fontSize: '16px', ml: '4px' }} />
            )}
          </TooltipButton>
        </Stack>
      )}
    </AIProviderInfoCard>
  )
}
export default AIProviderAuthCard
