import React, { FC } from 'react'
import FormControl from '@mui/material/FormControl'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Tooltip from '@mui/material/Tooltip'
import CircularProgress from '@mui/material/CircularProgress'
import Chip from '@mui/material/Chip'

import { CHAT_GPT_PROVIDER } from '@/types'
import { ChatGPTOpenAIModelSelector } from '@/features/chatgpt/components/ChatGPTOpenAIModelSelector'
import { IChatGPTProviderType } from '@/background/provider/chat'
import useChatGPTProvider from '@/features/chatgpt/hooks/useChatGPTProvider'
import { useRecoilValue } from 'recoil'
import { ChatGPTConversationState } from '@/features/gmail/store'
// import UseChatGPTAIQuotaLeft from '@/features/chatgpt/components/UseChatGPTAIQuotaLeft'
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
import TextIcon from '@/components/TextIcon'
import { ChatGPTOpenAIAPIModelSelector } from '@/features/chatgpt/components/ChatGPTOpenAIAPIComponents'

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
    label: 'ChatGPT',
    value: CHAT_GPT_PROVIDER.OPENAI,
    logo: <ChatGPTIcon sx={{ fontSize: 20 }} />,
    shortDescription: `Use your own ChatGPT to power the extension.`,
    description: `You need to log into your own ChatGPT account, and keep the pinned ChatGPT website tab open to power the extension.`,
    features: [
      `[Lock] OpenAI account required`,
      `[Lock] Country restrictions apply`,
      `[Unhappy] ChatGPT interruptions`,
      '',
      `For ChatGPT free plan:`,
      `[ThumbUp] Free to use`,
      `[Incorrect] Not always available`,
      `[Unhappy] Standard response speed`,
      `[Incorrect] GPT-4 unavailable`,
      '',
      `For ChatGPT Plus:`,
      `[Database] Pay $20/mo to OpenAI`,
      `[Done] Always available`,
      `[Done] Fast response speed`,
      `[Done] GPT-4 available`,
    ],
  },
  {
    beta: false,
    label: 'OpenAI API',
    value: CHAT_GPT_PROVIDER.OPENAI_API,
    logo: (
      <OpenAIIcon
        sx={{
          fontSize: 20,
          color: (t) => (t.palette.mode === 'dark' ? '#fff' : 'rgba(0,0,0,1)'),
        }}
      />
    ),
    shortDescription: `Use your own OpenAI API key to power the extension.`,
    description: `Most are unaware that all ChatGPT users can easily obtain their own API key for free trial usage from OpenAI. To create your OpenAI API key, refer to the instructions provided on our Settings page.`,
    features: [
      `[Database] Pay $ as you go to OpenAI`,
      `[Lock] OpenAI account required`,
      `[Lock] Country restrictions apply`,
      `[Done] No ChatGPT interruptions`,
      `[Done] Always available`,
      `[Done] Fast response speed`,
      `[QuestionMark] GPT-4 may be available`,
    ],
  },
  {
    beta: false,
    label: 'Free AI',
    value: CHAT_GPT_PROVIDER.USE_CHAT_GPT_PLUS,
    shortDescription: `Use our OpenAI API key (GPT-3.5-turbo) for free behind the scenes to power the extension.`,
    description: `To get more Free AI without a daily limit, all you need to do is share your referral link and invite your friends to join us.`,
    features: [
      `[ThumbUp] Free to use`,
      `[Done] No OpenAI account required`,
      `[Done] No country restrictions`,
      `[Done] No ChatGPT interruptions`,
      `[Done] Always available`,
      `[Done] Fast response speed`,
      `[Incorrect] GPT-4 unavailable`,
    ],
    logo: <UseChatGptIcon sx={{ fontSize: 20 }} />,
  },
  {
    beta: false,
    label: 'Bard',
    value: CHAT_GPT_PROVIDER.BARD,
    logo: (
      <BardIcon
        sx={{
          fontSize: 20,
        }}
      />
    ),
    shortDescription: `Use your own Bard to power the extension.`,
    description: `You need to log into your own Google account that has access to Bard. If your Google account does not have access to Bard, you can enable it instantly on bard.google.com.`,
    features: [
      `[ThumbUp] Free to use`,
      `[Done] No OpenAI account required`,
      `[Lock] Country restrictions apply`,
      `[Lock] Bard access required`,
      `[Incorrect] Not always available`,
      `[Unhappy] Standard response speed`,
      `[Done]  Bard AI by Google available`,
    ],
  },
  {
    beta: false,
    label: 'Bing',
    value: CHAT_GPT_PROVIDER.BING,
    logo: (
      <BingIcon
        sx={{
          fontSize: 20,
        }}
      />
    ),
    shortDescription: `Use your own New Bing Chat to power the extension.`,
    description: `Use your own New Bing Chat to power the extension. You need to log into your own Microsoft account that has access to the New Bing Chat. If your Microsoft account does not have access to the New Bing Chat, you can join the waitlist at bing.com/chat.`,
    features: [
      `[ThumbUp] Free to use`,
      `[Done] No OpenAI account required`,
      `[Done] No country restrictions`,
      `[Lock] New Bing Chat access required`,
      `[Incorrect] Not always available`,
      `[Unhappy] Standard response speed`,
      `[Done]  GPT-4 unavailable`,
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
      sx={{ height: 56, p: 1, mt: 1, maxWidth: 400, mx: 'auto', width: '100%' }}
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
                  provider.logo
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
                      <Stack
                        width={'100%'}
                        direction={'row'}
                        alignItems={'center'}
                        spacing={1}
                        mb={1}
                      >
                        {provider.logo}
                        <Typography
                          fontSize={'14px'}
                          color={'text.primary'}
                          textAlign={'left'}
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
                      <Typography
                        fontSize={'14px'}
                        color={'text.primary'}
                        textAlign={'left'}
                        fontWeight={700}
                        mb={2}
                      >
                        {provider.shortDescription}
                      </Typography>
                      <Typography
                        fontSize={'12px'}
                        color={'text.primary'}
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
                        textList={provider.features.map((feature) => {
                          // feature text:
                          // [ThumbUp] Free to use
                          // match: [icon]
                          const match = feature.match(/\[(.*?)\]/)
                          const icon = match ? match[1] : ''
                          const text = feature.replace(/\[(.*?)\]/, '')
                          return (
                            <Stack
                              key={feature}
                              width={'100%'}
                              direction={'row'}
                              spacing={1}
                              alignItems={'start'}
                            >
                              {icon && (
                                <TextIcon
                                  sx={{
                                    position: 'relative',
                                    fontSize: 14,
                                    top: 2,
                                  }}
                                  icon={icon as any}
                                />
                              )}
                              <Typography
                                fontSize={'12px'}
                                color={'text.primary'}
                                textAlign={'left'}
                              >
                                {text}
                              </Typography>
                            </Stack>
                          )
                        })}
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
                    {provider.logo}
                    <Typography
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
        clientState.status === 'success' && <ChatGPTOpenAIModelSelector />}
      {provider === CHAT_GPT_PROVIDER.OPENAI_API &&
        clientState.status === 'success' && <ChatGPTOpenAIAPIModelSelector />}
    </Stack>
  )
}
export { ChatGPTAIProviderSelector }
