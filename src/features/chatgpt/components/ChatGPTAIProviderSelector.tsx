import React, { FC } from 'react'
import {
  FormControl,
  Stack,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Tooltip,
  CircularProgress,
  Chip,
} from '@mui/material'
import { CHAT_GPT_PROVIDER } from '@/types'
import { ChatGPTModelsSelector } from '@/features/chatgpt/components/ChatGPTModelsSelector'
import { IChatGPTProviderType } from '@/background/provider/chat'
import useChatGPTProvider from '@/features/chatgpt/hooks/useChatGPTProvider'
import { useRecoilValue } from 'recoil'
import { ChatGPTConversationState } from '@/features/gmail/store'
import UseChatGPTAIQuotaLeft from '@/features/chatgpt/components/UseChatGPTAIQuotaLeft'
import { ChatGPTClientState } from '@/features/chatgpt/store'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import {
  BardIcon,
  BingIcon,
  ChatGPTIcon,
  OpenAIIcon,
  UseChatGptIcon,
} from '@/components/CustomIcon'
import BulletList from '@/components/BulletList'

const ArrowDropDownIconCustom = () => {
  return (
    <ArrowDropDownIcon
      sx={{
        color: 'text.secondary',
        fontSize: '16px',
        position: 'absolute',
        right: '8px',
        top: 'calc(50% - 8px)',
      }}
    />
  )
}

const providerOptions = [
  {
    beta: false,
    label: 'Free AI',
    value: CHAT_GPT_PROVIDER.USE_CHAT_GPT_PLUS,
    description:
      'We are providing Free AI using GPT-3.5-turbo to power the extension. To get more Free AI, all you need to do is share your referral link and invite your friends to join us. You can find your referral link by clicking the "Get more Free AI!" link above.👆',
    features: [
      `👍 Free to use`,
      `✅ No OpenAI account required`,
      `✅ No country restrictions`,
      `✅ No ChatGPT interruptions`,
      `✅ Always available`,
      `✅ Fast response speed`,
      `❌ GPT-4 unavailable`,
    ],
    icon: <UseChatGptIcon sx={{ fontSize: 20 }} />,
  },
  {
    beta: false,
    label: 'ChatGPT',
    value: CHAT_GPT_PROVIDER.OPENAI,
    icon: <ChatGPTIcon sx={{ fontSize: 20 }} />,
    description: `Use your own ChatGPT to power the extension. You need to log into your own ChatGPT account, and keep the pinned ChatGPT website tab open to power the extension without interruption.`,
    features: [
      `🔒 OpenAI account required`,
      `🔒 Country restrictions apply`,
      `😔 ChatGPT interruptions`,
      '',
      `For ChatGPT free plan:`,
      `👍 Free to use`,
      `❌ Not always available`,
      `😔 Standard response speed`,
      `❌ GPT-4 unavailable`,
      '',
      `For ChatGPT Plus:`,
      `💰 Pay $20/mo to OpenAI`,
      `✅ Always available`,
      `✅ Fast response speed`,
      `✅ GPT-4 available`,
    ],
  },
  {
    beta: false,
    label: 'OpenAI API',
    value: CHAT_GPT_PROVIDER.OPENAI_API,
    icon: (
      <OpenAIIcon
        sx={{
          fontSize: 20,
          color: (t) => (t.palette.mode === 'dark' ? '#fff' : 'rgba(0,0,0,1)'),
        }}
      />
    ),
    description: `Use your own OpenAI API key to power the extension. Most are unaware that all ChatGPT users can easily obtain their own API key for free trial usage from OpenAI. To create your OpenAI API key, refer to the instructions provided on our Settings page.`,
    features: [
      `💰 Pay $ as you go to OpenAI`,
      `🔒 OpenAI account required`,
      `🔒 Country restrictions apply`,
      `✅ No ChatGPT interruptions`,
      `✅ Always available`,
      `✅ Fast response speed`,
      `🤔 GPT-4 may be available`,
    ],
  },
  {
    beta: true,
    label: 'Bing',
    value: CHAT_GPT_PROVIDER.BING,
    icon: (
      <BingIcon
        sx={{
          fontSize: 20,
        }}
      />
    ),
    description: `Use your own New Bing Chat to power the extension. You need to log into your own Microsoft account that has access to the New Bing Chat. If your Microsoft account does not have access to the New Bing Chat, you can join the waitlist at bing.com/chat.`,
    features: [
      `👍 Free to use`,
      `✅ No OpenAI account required`,
      `✅ No country restrictions`,
      `🔒 New Bing Chat access required`,
      `❌ Not always available`,
      `😔 Standard response speed`,
      `✅  GPT-4 unavailable`,
    ],
  },
  {
    beta: true,
    label: 'Bard',
    value: CHAT_GPT_PROVIDER.BARD,
    icon: (
      <BardIcon
        sx={{
          fontSize: 20,
        }}
      />
    ),
    description: `Use your own Bard to power the extension. You need to log into your own Google account that has access to Bard. If your Google account does not have access to Bard, you can join the waitlist at bard.google.com.`,
    features: [
      `👍 Free to use`,
      `✅ No OpenAI account required`,
      `🔒 Country restrictions apply`,
      `🔒 Bard access required`,
      `❌ Not always available`,
      `😔 Standard response speed`,
      `✅  Bard AI by Google available`,
    ],
  },
]

const ChatGPTAIProviderSelector: FC = () => {
  const { loading: chatGPTConversationLoading } = useRecoilValue(
    ChatGPTConversationState,
  )
  const clientState = useRecoilValue(ChatGPTClientState)
  const {
    updateChatGPTProvider,
    provider,
    loading: switchProviderLoading,
  } = useChatGPTProvider()
  return (
    <Stack
      sx={{ height: 56, p: 1 }}
      spacing={2}
      direction={'row'}
      alignItems={'center'}
    >
      <FormControl size={'small'} sx={{ height: 40 }}>
        <InputLabel sx={{ fontSize: '16px' }} id="chatGPT-ai-provider-select">
          AI Provider
        </InputLabel>
        <Select
          IconComponent={ArrowDropDownIconCustom}
          disabled={chatGPTConversationLoading || switchProviderLoading}
          sx={{ fontSize: '14px' }}
          MenuProps={{
            elevation: 0,
            MenuListProps: {
              sx: {
                border: `1px solid`,
                borderColor: 'customColor.borderColor',
              },
            },
          }}
          labelId="chatGPT-ai-provider-select"
          value={provider || ''}
          label="AI Provider"
          onChange={async (event) => {
            const { value } = event.target
            await updateChatGPTProvider(value as IChatGPTProviderType)
          }}
          renderValue={(value) => {
            const provider = providerOptions.find(
              (provider) => provider.value === value,
            )
            if (!provider) {
              return (
                <Typography
                  fontSize={14}
                  color={'text.primary'}
                  textAlign={'left'}
                  width={130}
                  noWrap
                >
                  Select provider
                </Typography>
              )
            }
            return (
              <Stack
                width={130}
                direction={'row'}
                alignItems={'center'}
                spacing={1}
              >
                {switchProviderLoading ? (
                  <CircularProgress size={16} />
                ) : (
                  provider.icon
                )}
                <Typography
                  width={0}
                  flex={1}
                  textAlign={'left'}
                  noWrap
                  fontSize={'14px'}
                  color={'text.primary'}
                >
                  {provider.label}
                </Typography>
              </Stack>
            )
          }}
        >
          {providerOptions.map((provider) => {
            return (
              <MenuItem
                key={provider.value}
                value={provider.value}
                sx={{ p: 0 }}
              >
                <Tooltip
                  placement={'right-start'}
                  componentsProps={{
                    tooltip: {
                      sx: {
                        border: '1px solid rgb(245,245,245)',
                        bgcolor: 'background.paper',
                        p: 1,
                      },
                    },
                  }}
                  title={
                    <Stack width={'160px'}>
                      <Typography
                        fontSize={'14px'}
                        color={'text.primary'}
                        textAlign={'left'}
                        mb={1}
                      >
                        {provider.label}
                      </Typography>
                      <Typography
                        fontSize={'12px'}
                        color={'text.secondary'}
                        textAlign={'left'}
                        mb={2}
                      >
                        {provider.description}
                      </Typography>
                      <BulletList
                        pointProps={{
                          display: 'none',
                        }}
                        textProps={{
                          fontSize: '12px',
                          color: 'text.primary',
                          textAlign: 'left',
                        }}
                        textList={provider.features}
                      />
                    </Stack>
                  }
                >
                  <Stack
                    width={160}
                    sx={{ padding: '6px 16px' }}
                    direction={'row'}
                    alignItems={'center'}
                    spacing={1}
                  >
                    {provider.icon}
                    <Typography
                      width={0}
                      flex={1}
                      textAlign={'left'}
                      noWrap
                      fontSize={'14px'}
                      color={'text.primary'}
                    >
                      {provider.label}
                    </Typography>
                    {provider.beta && (
                      <Chip
                        sx={{ ml: 1 }}
                        label="Beta"
                        color="primary"
                        size={'small'}
                        variant={'outlined'}
                      />
                    )}
                  </Stack>
                </Tooltip>
              </MenuItem>
            )
          })}
        </Select>
      </FormControl>
      {provider === CHAT_GPT_PROVIDER.OPENAI &&
        clientState.status === 'success' && <ChatGPTModelsSelector />}
      {provider === CHAT_GPT_PROVIDER.USE_CHAT_GPT_PLUS &&
        clientState.status === 'success' && <UseChatGPTAIQuotaLeft />}
    </Stack>
  )
}
export { ChatGPTAIProviderSelector }
