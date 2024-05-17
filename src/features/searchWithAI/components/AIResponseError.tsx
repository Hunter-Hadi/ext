import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import { FC, useEffect, useMemo, useState } from 'react'
import React from 'react'
import { v4 as uuidV4 } from 'uuid'

import AppSuspenseLoadingLayout from '@/components/AppSuspenseLoadingLayout'
import CustomMarkdown from '@/components/CustomMarkdown'
import { APP_USE_CHAT_GPT_HOST, CHATGPT_WEBAPP_HOST } from '@/constants'
import PermissionPricingHookCard from '@/features/auth/components/PermissionPricingHookCard'
import { usePermissionCard } from '@/features/auth/hooks/usePermissionCard'

import {
  ISearchWithAIProviderType,
  SEARCH_WITH_AI_PROVIDER_MAP,
} from '../constants'
import SearchWithAIProviderOptions from '../constants/searchWithAIProviderOptions'

import { ISystemChatMessage } from '@/features/indexed_db/conversations/models/Message';

interface IProps {
  message: string
  provider: ISearchWithAIProviderType
  handleAsk: () => void
  isDarkMode?: boolean
  // sx?: SxProps
}

const AIResponseError: FC<IProps> = ({
  message,
  provider,
  isDarkMode,
  handleAsk,
}) => {
  const text = message || 'Something went wrong. Please try again.'
  const permissionCard = usePermissionCard(message)
  const pricingHookMessage = useMemo(() => {
    if (permissionCard) {
      const systemMessage: ISystemChatMessage = {
        type: 'system',
        text: `You've reached this month's limit for fast text queries.`,
        messageId: uuidV4(),
        meta: {
          permissionSceneType: permissionCard.sceneType,
          systemMessageType: 'needUpgrade',
        },
      }
      return systemMessage
    }
    return null
  }, [permissionCard])

  const [errorStatus, setErrorStatus] = useState<'UNAUTHORIZED' | 'TRY_AGAIN'>()

  const providerOption = useMemo(() => {
    return (
      SearchWithAIProviderOptions.find((item) => item.value === provider) ||
      SearchWithAIProviderOptions[0]
    )
  }, [provider])

  const sxCache = useMemo<SxProps>(() => {
    return {
      wordBreak: 'break-word',
      whiteSpace: 'pre-wrap',
      '& .markdown-body': {
        // maxHeight: 'min(40vh, 320px)',
        // overflowY: 'auto',

        '*': {
          fontFamily: '"Roboto","Helvetica","Arial",sans-serif!important',
          color: '#DB4437 !important',
        },
        '& p:last-child': {
          mb: '1em',
        },

        '& .markdown-body > p:first-child': {
          mt: 0,
        },
      },
    }
  }, [])

  const authLink = useMemo(() => {
    if (provider === SEARCH_WITH_AI_PROVIDER_MAP.OPENAI) {
      return `https://${CHATGPT_WEBAPP_HOST}/auth/login`
    }
    if (provider === SEARCH_WITH_AI_PROVIDER_MAP.BING) {
      return `https://bing.com/chat`
    }
    if (provider === SEARCH_WITH_AI_PROVIDER_MAP.BARD) {
      return `https://gemini.google.com`
    }
    if (provider === SEARCH_WITH_AI_PROVIDER_MAP.CLAUDE) {
      return 'https://claude.ai/login'
    }
    if (provider === SEARCH_WITH_AI_PROVIDER_MAP.MAXAI_FREE) {
      return `${APP_USE_CHAT_GPT_HOST}/login`
    }
    return ''
  }, [provider])

  const textCover = useMemo(() => {
    if (text === 'UNAUTHORIZED' || text === 'CLOUDFLARE') {
      if (providerOption.label === 'ChatGPT web app') {
        return `Please log into [chatgpt.com](https://${CHATGPT_WEBAPP_HOST}) and try again.`
      }
      return `Please log into ${providerOption.label} and try again.`
    }

    // 兼容 claude.ai 的 500的错误提示
    if (text.startsWith('500')) {
      setErrorStatus('UNAUTHORIZED')
      return 'Something went wrong. Please try again.'
    }
    if (
      text.startsWith('403') &&
      provider === SEARCH_WITH_AI_PROVIDER_MAP.OPENAI
    ) {
      if (providerOption.label === 'ChatGPT web app') {
        return `Please log into [chatgpt.com](https://${CHATGPT_WEBAPP_HOST}) and try again.`
      }
      return `Please log into ${providerOption.label} and try again.`
    }

    if (
      errorStatus === 'UNAUTHORIZED' &&
      provider === SEARCH_WITH_AI_PROVIDER_MAP.MAXAI_FREE
    ) {
      return `Please log into [app.maxai.me](${APP_USE_CHAT_GPT_HOST}) and try again.`
    }
    // 如果不是inHouse的错误，提示用户切换到其他AI
    if (
      ![
        SEARCH_WITH_AI_PROVIDER_MAP.MAXAI_FREE,
        SEARCH_WITH_AI_PROVIDER_MAP.MAXAI_CLAUDE,
        SEARCH_WITH_AI_PROVIDER_MAP.USE_CHAT_GPT_PLUS,
      ].includes(provider as 'MAXAI_CLAUDE')
    ) {
      return (
        text +
        '\nAlternatively, you can switch to Free Al or other premium Al models managed by MaxAl for a more reliable experience.'
      )
    }
    // 如果是inHouse的错误，直接显示错误信息
    return text
  }, [text, provider, errorStatus, providerOption.label])

  useEffect(() => {
    if (
      textCover.includes('sign in') ||
      textCover.includes('log into') ||
      textCover.includes('Failed to access Bard') ||
      textCover.includes('log in')
    ) {
      setErrorStatus('UNAUTHORIZED')
      return
    }

    if (
      textCover.includes('Only one message at a time') ||
      (textCover.includes('try again') && !textCover.includes('log into'))
    ) {
      setErrorStatus('TRY_AGAIN')
      return
    }
    setErrorStatus('UNAUTHORIZED')
  }, [textCover])

  useEffect(() => {
    // if (errorStatus === 'UNAUTHORIZED') {
    //   // 如果报错了，则开始监听 onfocus 事件，在 Focus 时，自动重新 ask
    //   window.addEventListener('focus', handleAsk)
    // } else {
    //   window.removeEventListener('focus', handleAsk)
    // }
    // return () => {
    //   window.removeEventListener('focus', handleAsk)
    // }
  }, [errorStatus, handleAsk])

  const ErrorButton = useMemo(() => {
    if (errorStatus === 'UNAUTHORIZED' && authLink) {
      return (
        <Stack direction={'row'} spacing={1} alignItems="center">
          <Link
            href={authLink}
            target="_blank"
            sx={{
              width: 'max-content',
            }}
          >
            <Button variant="normalOutlined">
              Log into {providerOption.label}
            </Button>
          </Link>
          <Button
            variant="normalOutlined"
            onClick={handleAsk}
            sx={{
              color: (t) =>
                t.palette.mode === 'dark'
                  ? 'rgba(255,255,255,0.6)'
                  : 'rgba(0,0,0,0.6)',
            }}
          >
            Try again
          </Button>
        </Stack>
      )
    }

    return (
      <Button
        fullWidth
        variant="normalOutlined"
        startIcon={<SearchOutlinedIcon />}
        onClick={handleAsk}
      >
        Ask AI for this query
      </Button>
    )
  }, [errorStatus, provider, authLink])

  if (pricingHookMessage && pricingHookMessage.meta.permissionSceneType) {
    return (
      <Stack
        sx={{
          whiteSpace: 'pre-wrap',
          width: '100%',
          gap: 1,
          wordBreak: 'break-word',
          boxSizing: 'border-box',
          '& > div': {
            width: '100%',
            mx: 'auto!important',
            '& svg + p': {
              fontSize: '16px',
            },
          },
        }}
      >
        <PermissionPricingHookCard
          permissionSceneType={pricingHookMessage.meta.permissionSceneType}
          message={pricingHookMessage}
        />
      </Stack>
    )
  }
  return (
    <Stack spacing={2}>
      <Box className="search-with-ai--text" sx={sxCache}>
        <AppSuspenseLoadingLayout>
          <Box
            className={`markdown-body ${
              isDarkMode ? 'markdown-body-dark' : ''
            }`}
          >
            <CustomMarkdown>{textCover}</CustomMarkdown>
          </Box>
        </AppSuspenseLoadingLayout>
      </Box>
      {/* <Typography variant="body2" color="#DB4437" fontSize={16}>
        {textCover}
      </Typography> */}
      {ErrorButton}
    </Stack>
  )
}

export default AIResponseError
