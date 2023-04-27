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
    label: 'Free usage',
    value: CHAT_GPT_PROVIDER.USE_CHAT_GPT_PLUS,
    description: 'Our premium AI powered by ChatGPT turbo. Use it for free.',
    features: [
      `😊 Free to use`,
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
    label: 'ChatGPT',
    value: CHAT_GPT_PROVIDER.OPENAI,
    icon: <ChatGPTIcon sx={{ fontSize: 20 }} />,
    description: `Use your own ChatGPT to power the extension.`,
    features: [
      `👎 OpenAI account required`,
      `👎 Country restrictions apply`,
      `👎 ChatGPT interruptions`,
      '',
      `For ChatGPT free plan:`,
      `😊 Free to use`,
      `👎 Not always available`,
      `👎 Standard response speed`,
      `❌ GPT-4 unavailable`,
      '',
      `For ChatGPT Plus:`,
      `😞 Pay $20/mo to OpenAI`,
      `✅ Always available`,
      `✅ Fast response speed`,
      `✅ GPT-4 available`,
    ],
  },
  {
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
    description: `Use your own OpenAI API to power the extension.`,
    features: [
      `😞 Pay $ as you go to OpenAI`,
      `👎 OpenAI account required`,
      `👎 Country restrictions apply`,
      `✅ No ChatGPT interruptions`,
      `✅ Always available`,
      `✅ Fast response speed`,
      `🤔 GPT-4 may be available`,
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
