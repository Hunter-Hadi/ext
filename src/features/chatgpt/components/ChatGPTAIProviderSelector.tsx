import React, { FC, useEffect, useRef, useState } from 'react'
import FormControl from '@mui/material/FormControl'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
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
  ClaudeIcon,
  OpenAIIcon,
  UseChatGptIcon,
} from '@/components/CustomIcon'
import BulletList from '@/components/BulletList'
import TextIcon from '@/components/TextIcon'
import { ChatGPTOpenAIAPIModelSelector } from '@/features/chatgpt/components/ChatGPTOpenAIAPIComponents'
import { ChatGPTClaudeModelSelector } from '@/features/chatgpt/components/ChatGPTClaudeModelSelector'

const FIXED_AI_PROVIDER = 'FIXED_AI_PROVIDER'

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
      `[Incorrect] Plugins unavailable`,
      '',
      `For ChatGPT Plus:`,
      `[Database] Pay $20/mo to OpenAI`,
      `[Done] Always available`,
      `[Done] Fast response speed`,
      `[Done] GPT-4 available`,
      `[Done] Plugins unavailable`,
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
      '[Done] GPT-4 availability depends on your account',
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
      `[Lock] Bard access required`,
      `[Lock] Country restrictions`,
      `[Done] Always available`,
      `[Unhappy] Standard response speed`,
      `[Done] Internet access and Bard AI & tools available`,
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
    description: `You need to log into your own Microsoft account that has access to the New Bing Chat. If your Microsoft account does not have access to the New Bing Chat, you can enable it instantly on bing.com/chat.`,
    features: [
      `[ThumbUp] Free to use`,
      `[Lock] New Bing Chat access required`,
      `[Done] No country restrictions`,
      `[Done] Always available`,
      `[Unhappy] Standard response speed`,
      `[Done] Internet access and GPT-4 available`,
    ],
  },
  {
    beta: false,
    label: 'Claude',
    value: CHAT_GPT_PROVIDER.CLAUDE,
    logo: (
      <ClaudeIcon
        sx={{
          fontSize: 20,
        }}
      />
    ),
    shortDescription: `Use your own Claude (operated by Poe) to power the extension.`,
    description: `You need to log into your own Poe account that has access to Claude-instant, Claude-instant-100k, Claude+. If you don't have a Poe account yet, you can easily get one for free on poe.com.`,
    features: [
      `[ThumbUp] Free to use`,
      `[Lock] Poe access required`,
      `[Lock] Country restrictions apply`,
      `[Done] Always available`,
      `[Unhappy] Standard response speed`,
      `[Done] Limited access to Claude-instant-100k and Claude+`,
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

  const [fixedMode, setFixedMode] = useState(false)
  const isHover = useRef(false)
  const fixedSwitchTimer = useRef<any | null>(null)

  useEffect(() => {
    const listener = (e: any) => {
      if (e.detail) {
        window.clearTimeout(fixedSwitchTimer.current)
        const { status } = e.detail
        if (status) {
          // 打开
          fixedSwitchTimer.current = setTimeout(() => {
            setFixedMode(true)
          }, 200)
        } else {
          // 关闭需要延迟一下，否则会出现闪烁
          fixedSwitchTimer.current = setTimeout(() => {
            if (!isHover.current) {
              setFixedMode(false)
            }
          }, 500)
        }
      }
    }
    window.addEventListener(FIXED_AI_PROVIDER, listener)
    return () => {
      window.removeEventListener(FIXED_AI_PROVIDER, listener)
    }
  }, [])

  const providerSelector = (
    <Stack
      sx={{
        height: 56,
        p: 1,
        pt: 2,
        maxWidth: 400,
        mx: 'auto',
        width: '100%',
      }}
      spacing={2}
      direction={'row'}
      alignItems={'center'}
      onMouseEnter={() => (isHover.current = true)}
      onMouseLeave={() => {
        isHover.current = false
        if (fixedMode) {
          triggetFixedAIProvider(false)
        }
      }}
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
          onClose={() => {
            isHover.current = false
            if (fixedMode) {
              triggetFixedAIProvider(false)
            }
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
      {provider === CHAT_GPT_PROVIDER.CLAUDE &&
        clientState.status === 'success' && <ChatGPTClaudeModelSelector />}
    </Stack>
  )

  return (
    <>
      {providerSelector}
      {fixedMode && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bgcolor: 'background.paper',
            // borderBottom: '1px solid #9393933d',
            zIndex: 1,
            pb: 1,
          }}
        >
          {providerSelector}
        </Box>
      )}
    </>
  )
}

export const ChatGPTAIProviderMiniSelector: FC = () => {
  const { provider } = useChatGPTProvider()
  return (
    <Box
      onMouseEnter={() => {
        triggetFixedAIProvider(true)
      }}
      onMouseLeave={() => {
        triggetFixedAIProvider(false)
      }}
    >
      <Select
        IconComponent={ArrowDropDownIconCustom}
        disabled
        sx={{
          fontSize: '14px',
          cursor: 'pointer !important',
          '& > div[role=button]': {
            cursor: 'pointer !important',
            padding: 1,
          },
        }}
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
        label=""
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
                noWrap
              >
                -
              </Typography>
            )
          }
          return (
            <Stack direction={'row'} alignItems={'center'} spacing={1}>
              {provider.logo}
            </Stack>
          )
        }}
      ></Select>
    </Box>
  )
}

export const triggetFixedAIProvider = (status: boolean) => {
  const event = new CustomEvent(FIXED_AI_PROVIDER, {
    detail: {
      status,
    },
  })
  window.dispatchEvent(event)
}

export { ChatGPTAIProviderSelector }
