import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { FC, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import TooltipButton from '@/components/TooltipButton'
import { AI_PROVIDER_MAP } from '@/constants'
import { AIProviderOptionType } from '@/features/chatgpt/components/AIProviderModelSelectorCard/AIProviderOptions'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import { chromeExtensionClientOpenPage } from '@/utils'

const AIProviderAuthButton: FC<{
  aiProviderOption: AIProviderOptionType
}> = (props) => {
  const { aiProviderOption } = props
  const { authAIProvider, conversationStatus } = useClientConversation()
  const { t } = useTranslation(['common', 'client'])
  const [showJumpToChatGPT, setShowJumpToChatGPT] = useState(false)

  useEffect(() => {
    let timer: any | null = null
    if (conversationStatus === 'loading' || conversationStatus === 'complete') {
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
  }, [conversationStatus])
  return (
    <Stack
      sx={{
        width: '100%',
      }}
    >
      {(conversationStatus === 'loading' ||
        conversationStatus === 'complete') && (
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
                    onClick={async () => {
                      await authAIProvider()
                    }}
                  >
                    <Typography
                      component={'span'}
                      textAlign={'center'}
                      fontSize={'14px'}
                      fontWeight={400}
                    >
                      {t('client:provider__chatgpt_web_app__waiting_tooltip1')}
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
                      {t('client:provider__chatgpt_web_app__waiting_tooltip2')}
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
                      {t('client:provider__chatgpt_web_app__waiting_tooltip3')}
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
                <Typography fontSize={'16px'} fontWeight={700}>
                  {t('client:provider__chatgpt_web_app__connecting')}
                </Typography>
              </Stack>
            </TextOnlyTooltip>
          )}
        </Stack>
      )}
      {conversationStatus === 'needAuth' && (
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
              borderRadius: '8px',
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
                    {t(
                      'client:provider__chatgpt_web_app__stable_mode_tooltip1',
                    )}
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
                        query: '#/chatgpt-stable-mode',
                      })
                    }}
                  >
                    {t(
                      'client:provider__chatgpt_web_app__stable_mode_tooltip2',
                    )}
                  </Link>
                  <Typography
                    component={'span'}
                    fontSize={14}
                    textAlign={'left'}
                  >
                    {t(
                      'client:provider__chatgpt_web_app__stable_mode_tooltip3',
                    )}
                  </Typography>
                </Box>
              )
            }
            onClick={async () => {
              await authAIProvider()
            }}
            variant={'contained'}
            disableElevation
            fullWidth
            data-testid='ai-provider-auth-button'
          >
            {t(aiProviderOption.authButtonText as any)}
            {aiProviderOption.authOpenInNew && (
              <OpenInNewIcon sx={{ fontSize: '16px', ml: '4px' }} />
            )}
          </TooltipButton>
        </Stack>
      )}
    </Stack>
  )
}
export default AIProviderAuthButton
