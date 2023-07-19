/**
 * @deprecated - use AIProviderSelector instead it
 * @see src/features/chatgpt/components/AIProviderSelector/index.tsx
 */
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

import { APP_USE_CHAT_GPT_HOST, AI_PROVIDER_MAP } from '@/constants'
import { ChatGPTOpenAIModelSelector } from '@/features/chatgpt/components/ChatGPTOpenAIModelSelector'
import { IAIProviderType } from '@/background/provider/chat'
import useChatGPTProvider from '@/features/chatgpt/hooks/useChatGPTProvider'
import { useRecoilValue } from 'recoil'
import { ChatGPTConversationState } from '@/features/sidebar/store'
// import UseChatGPTAIQuotaLeft from '@/features/chatgpt/components/UseChatGPTAIQuotaLeft'
import { ChatGPTClientState } from '@/features/chatgpt/store'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import {
  BardIcon,
  BingIcon,
  ChatGPTBlackIcon,
  ChatGPTIcon,
  ClaudeIcon,
  OpenAIIcon,
} from '@/components/CustomIcon'
// import BulletList from '@/components/BulletList'
// import TextIcon from '@/components/TextIcon'
import IconDropdown from '@/components/IconDropdown'
import Link from '@mui/material/Link'
import { ChatGPTBingConversationStyleSelector } from '@/features/chatgpt/components/BingConversationStyleSelector'

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
    value: AI_PROVIDER_MAP.USE_CHAT_GPT_PLUS,
    shortDescription: `Use ChatGPT to power the extension.`,
    description: `As fast as ChatGPT Plus. No country restrictions. Powered by gpt-3.5-turbo.`,
    features: [
      `[ThumbUp] Free to use`,
      `[Done] No OpenAI account required`,
      `[Done] No country restrictions`,
      `[Done] No ChatGPT interruptions`,
      `[Done] Always available`,
      `[Done] Fast response speed`,
      `[Incorrect] GPT-4 unavailable`,
    ],
    logo: <ChatGPTIcon sx={{ fontSize: 20 }} />,
  },
  {
    beta: false,
    label: 'OpenAI API',
    value: AI_PROVIDER_MAP.OPENAI_API,
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
    label: 'ChatGPT web app',
    value: AI_PROVIDER_MAP.OPENAI,
    logo: (
      <ChatGPTBlackIcon
        sx={{
          fontSize: 20,
        }}
      />
    ),
    shortDescription: `Use your own ChatGPT web app to power the extension.`,
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
    label: 'Bard',
    value: AI_PROVIDER_MAP.BARD,
    logo: (
      <BardIcon
        sx={{
          fontSize: 20,
        }}
      />
    ),
    shortDescription: `Use your own Bard to power the extension.`,
    description: `You need to log into your own Google account that has access to Bard. If your Google account does not have access to Bard, you can join the waitlist at bard.google.com.`,
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
    value: AI_PROVIDER_MAP.BING,
    logo: (
      <BingIcon
        sx={{
          fontSize: 20,
        }}
      />
    ),
    shortDescription: `Use your own Bing AI to power the extension.`,
    description: `You need to log into your own Microsoft account that has access to the New Bing Chat. If your Microsoft account does not have access to the New Bing Chat, you can join the waitlist at bing.com/chat.`,
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
    value: AI_PROVIDER_MAP.CLAUDE,
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

const ChatGPTAIProviderSelector: FC<{
  menuItemWidth?: number
}> = (props) => {
  const { menuItemWidth = 160 } = props
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
            await updateChatGPTProvider(value as IAIProviderType)
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
                  width={menuItemWidth - 30}
                  noWrap
                >
                  Select provider
                </Typography>
              )
            }
            return (
              <Stack
                width={menuItemWidth - 30}
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
                  {menuItemWidth === 160
                    ? provider.label.replace('ChatGPT web app', 'ChatGPT web')
                    : provider.label}
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
                  PopperProps={{
                    sx: {
                      zIndex: 2147483620,
                    },
                  }}
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
                    <Stack width={menuItemWidth} component={'div'}>
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
                      <Link
                        href={`${APP_USE_CHAT_GPT_HOST}/get-started#ai-provider`}
                        target={'_blank'}
                      >
                        <Typography
                          fontSize={'12px'}
                          color={'text.primary'}
                          textAlign={'left'}
                        >
                          Learn more
                        </Typography>
                      </Link>
                      {/*<BulletList*/}
                      {/*  pointProps={{*/}
                      {/*    display: 'none',*/}
                      {/*  }}*/}
                      {/*  textProps={{*/}
                      {/*    fontSize: '12px',*/}
                      {/*    color: 'text.primary',*/}
                      {/*    textAlign: 'left',*/}
                      {/*  }}*/}
                      {/*  textList={provider.features.map((feature) => {*/}
                      {/*    // feature text:*/}
                      {/*    // [ThumbUp] Free to use*/}
                      {/*    // match: [icon]*/}
                      {/*    const match = feature.match(/\[(.*?)\]/)*/}
                      {/*    const icon = match ? match[1] : ''*/}
                      {/*    const text = feature.replace(/\[(.*?)\]/, '')*/}
                      {/*    return (*/}
                      {/*      <Stack*/}
                      {/*        key={feature}*/}
                      {/*        width={'100%'}*/}
                      {/*        direction={'row'}*/}
                      {/*        spacing={1}*/}
                      {/*        alignItems={'start'}*/}
                      {/*      >*/}
                      {/*        {icon && (*/}
                      {/*          <TextIcon*/}
                      {/*            sx={{*/}
                      {/*              position: 'relative',*/}
                      {/*              fontSize: 14,*/}
                      {/*              top: 2,*/}
                      {/*            }}*/}
                      {/*            icon={icon as any}*/}
                      {/*          />*/}
                      {/*        )}*/}
                      {/*        <Typography*/}
                      {/*          fontSize={'12px'}*/}
                      {/*          color={'text.primary'}*/}
                      {/*          textAlign={'left'}*/}
                      {/*        >*/}
                      {/*          {text}*/}
                      {/*        </Typography>*/}
                      {/*      </Stack>*/}
                      {/*    )*/}
                      {/*  })}*/}
                      {/*/>*/}
                    </Stack>
                  }
                >
                  <Stack
                    width={menuItemWidth}
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
      {provider === AI_PROVIDER_MAP.OPENAI &&
        clientState.status === 'success' && <ChatGPTOpenAIModelSelector />}
      {provider === AI_PROVIDER_MAP.BING &&
        clientState.status === 'success' && (
          <ChatGPTBingConversationStyleSelector />
        )}
    </Stack>
  )
}
export const ChatGPTAIProviderMiniSelector: FC = () => {
  const { provider } = useChatGPTProvider()
  const currentProvider = providerOptions.find(
    (providerOption) => providerOption.value === provider,
  )
  if (!currentProvider) {
    return null
  }
  return (
    <IconDropdown
      icon={currentProvider.logo}
      dropdownSx={{
        pt: '13px',
      }}
    >
      <ChatGPTAIProviderSelector />
    </IconDropdown>
  )
}

export { ChatGPTAIProviderSelector }
