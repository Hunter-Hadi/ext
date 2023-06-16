import useChatGPTProvider from '@/features/chatgpt/hooks/useChatGPTProvider'
import Stack from '@mui/material/Stack'
import { APP_USE_CHAT_GPT_HOST, CHAT_GPT_PROVIDER } from '@/constants'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import DevTextSendControl from '@/features/gmail/components/GmailChatBox/DevTextSendControl'
import { ChatGPTPluginsSelector } from '@/features/chatgpt/components/ChatGPTPluginsSelector'
import React from 'react'
import { ChatGPTOpenAIAPITemperatureSlider } from '@/features/chatgpt/components/ChatGPTOpenAIAPIComponents'

const GmailChatBoxProviderComponents = () => {
  const { provider } = useChatGPTProvider()
  return (
    <Stack
      width={'100%'}
      sx={{
        maxWidth: 400,
        width: '100%',
        mx: 'auto',
      }}
    >
      {provider === CHAT_GPT_PROVIDER.USE_CHAT_GPT_PLUS && (
        <Link
          width={'100%'}
          href={APP_USE_CHAT_GPT_HOST + '/referral'}
          target={'_blank'}
          underline={'none'}
        >
          <Stack
            spacing={1}
            p={1}
            mx={1}
            my={2}
            textAlign={'center'}
            sx={{
              alignItems: 'center',
              borderRadius: '4px',
              bgcolor: (t) =>
                t.palette.mode === 'dark' ? 'rgb(3,19,11)' : 'rgb(229,246,253)',
            }}
          >
            <Typography fontSize={20} color={'text.primary'} fontWeight={700}>
              Get up to 24 weeks of Free AI without a daily limit!
            </Typography>
            <Typography fontSize={14} color={'text.primary'}>
              {`Invite your friends to join UseChatGPT.AI! For anyone who signs up
              using your referral link and installs UseChatGPT.AI extension,
              we'll give you both 1 week of Free AI without a daily limit!`}
            </Typography>
            <img
              src={`https://app.usechatgpt.ai/assets/images/referral/invite-your-friends-light.png`}
              alt="invite your friends"
              width={360}
              height={98}
            />
            <Button
              variant={'contained'}
              color={'primary'}
              sx={{
                fontSize: 16,
                fontWeight: 700,
              }}
              fullWidth
            >
              Invite your friends
            </Button>
          </Stack>
        </Link>
      )}
      {provider === CHAT_GPT_PROVIDER.USE_CHAT_GPT_PLUS && (
        <DevTextSendControl />
      )}
      {provider === CHAT_GPT_PROVIDER.OPENAI && <ChatGPTPluginsSelector />}
      {provider === CHAT_GPT_PROVIDER.OPENAI_API && (
        <ChatGPTOpenAIAPITemperatureSlider />
      )}
    </Stack>
  )
}
export default GmailChatBoxProviderComponents
