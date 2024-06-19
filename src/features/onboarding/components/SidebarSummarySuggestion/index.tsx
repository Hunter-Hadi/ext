import CancelRoundedIcon from '@mui/icons-material/CancelRounded'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { FC, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { atom, useRecoilState } from 'recoil'

import { useCreateClientMessageListener } from '@/background/utils'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import { getPageSummaryType } from '@/features/sidebar/utils/pageSummaryHelper'
import { checkWebpageIsArticlePage } from '@/minimum/utils'

const SidebarSummarySuggestionState = atom<{
  isArticlePage: boolean
  userManualHide: boolean
  articlePageInfo: {
    title: string
    url: string
    favicon: string
  } | null
}>({
  key: 'SidebarSummarySuggestionAtom',
  default: {
    isArticlePage: false,
    userManualHide: false,
    articlePageInfo: null,
  },
})

const SidebarSummarySuggestion: FC<{
  onClick?: () => void
}> = (props) => {
  const { t } = useTranslation(['onboarding'])
  const [sidebarSummarySuggestion, setSidebarSummarySuggestion] =
    useRecoilState(SidebarSummarySuggestionState)
  // 当用户开始聊天之后，隐藏这个提示
  const [lastVisibleMessageId, setLastVisibleMessageId] = useState('')
  const { currentSidebarConversationType, clientConversation } =
    useClientConversation()
  const { isArticlePage, articlePageInfo, userManualHide } =
    sidebarSummarySuggestion
  const handleClearSummarySuggestion = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    event.stopPropagation()
    setSidebarSummarySuggestion((prevState) => {
      return {
        ...prevState,
        userManualHide: true,
      }
    })
  }
  const handleUpdateArticlePageInfo = () => {
    setSidebarSummarySuggestion((prevState) => {
      return {
        ...prevState,
        isArticlePage:
          checkWebpageIsArticlePage() ||
          getPageSummaryType() !== 'PAGE_SUMMARY',
        articlePageInfo: {
          title: document.title,
          url: window.location.href,
          favicon:
            document.querySelector('link[rel="icon"]')?.getAttribute('href') ||
            document
              .querySelector('link[rel="shortcut icon"]')
              ?.getAttribute('href') ||
            document
              .querySelector('link[rel="apple-touch-icon"]')
              ?.getAttribute('href') ||
            document
              .querySelector('link[rel="apple-touch-icon-precomposed"]')
              ?.getAttribute('href') ||
            document
              .querySelector('link[rel="mask-icon"]')
              ?.getAttribute('href') ||
            document
              .querySelector('link[rel="fluid-icon"]')
              ?.getAttribute('href') ||
            'https://www.google.com/s2/favicons?domain=' +
              new URL(window.location.href).hostname,
        },
      }
    })
  }
  const isUserStartChat = useMemo(() => {
    if (!clientConversation?.id) {
      return false
    }
    return (
      lastVisibleMessageId !==
      clientConversation.id + clientConversation.lastMessageId
    )
  }, [
    clientConversation?.id,
    clientConversation?.lastMessageId,
    lastVisibleMessageId,
  ])
  useCreateClientMessageListener(async (event) => {
    if (event === 'Client_listenTabUrlUpdate') {
      handleUpdateArticlePageInfo()
      return {
        success: true,
        message: 'ok',
        data: {},
      }
    }
    return undefined
  })
  useEffect(() => {
    handleUpdateArticlePageInfo()
  }, [])
  useEffect(() => {
    if (clientConversation?.type === 'Chat' && clientConversation?.id) {
      setLastVisibleMessageId((prevState) => {
        if (prevState.indexOf(clientConversation.id) === -1) {
          return clientConversation.id + clientConversation.lastMessageId
        }
        return prevState
      })
    }
  }, [clientConversation?.id])

  if (
    currentSidebarConversationType !== 'Chat' ||
    !isArticlePage ||
    userManualHide ||
    isUserStartChat
  ) {
    return null
  }
  return (
    <Stack
      alignItems='center'
      maxWidth={768}
      mx='auto'
      width='100%'
      p={1.5}
      pt={0}
      gap={1.5}
    >
      <Paper
        component={'button'}
        sx={{
          width: '100%',
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'customColor.borderColor',
          boxShadow: '0px 1px 2px 0px #0000000D',
          cursor: 'pointer',
          transition: 'border-color 0.3s',
          borderRadius: 2,
          p: 0,
          flex: 1,
          position: 'relative',
          '&:hover': {
            borderColor: 'primary.main',
          },
        }}
        onClick={props.onClick}
      >
        <Stack
          direction={'row'}
          alignItems={'center'}
          p={'4px'}
          width={'100%'}
          sx={{
            '&:hover': {
              '& > button': {
                visibility: 'visible',
              },
            },
          }}
        >
          <Stack
            width={0}
            flex={1}
            alignItems={'center'}
            px={'10px'}
            py={'8px'}
            gap={'8px'}
            direction={'row'}
          >
            <Typography
              color={'primary.main'}
              textAlign={'left'}
              fontSize={'14px'}
              fontWeight={500}
              lineHeight={'21px'}
            >
              {t(
                'onboarding:onboarding__sidebar__chat__suggest_summarize_button__title',
              )}
            </Typography>
            <img
              src={articlePageInfo?.favicon}
              alt={articlePageInfo?.title || 'favicon'}
              width={16}
              height={16}
            />
            <Typography
              width={0}
              flex={1}
              noWrap
              color={'text.primary'}
              textAlign={'left'}
              fontSize={'14px'}
              lineHeight={'21px'}
            >
              {articlePageInfo?.title || 'No title'}
            </Typography>
          </Stack>
          <IconButton
            sx={{
              position: 'absolute',
              right: -16,
              top: -16,
              visibility: 'hidden',
            }}
            onClick={handleClearSummarySuggestion}
          >
            <CancelRoundedIcon
              sx={{
                fontSize: '16px',
                color: 'rgba(0,0,0,.6)',
              }}
            />
          </IconButton>
          {/*<Button*/}
          {/*  sx={{*/}
          {/*    flexShrink: 0,*/}
          {/*    p: '8px 12px',*/}
          {/*    color: 'primary.main',*/}
          {/*    bgcolor: (t) =>*/}
          {/*      t.palette.mode === 'dark'*/}
          {/*        ? 'rgba(255, 255, 255, 0.16)'*/}
          {/*        : 'rgba(144, 101, 176, 0.16)',*/}
          {/*    fontSize: '14px',*/}
          {/*    fontWeight: 500,*/}
          {/*    lineHeight: '21px',*/}
          {/*    '&:hover': {*/}
          {/*      color: 'primary.main',*/}
          {/*      bgcolor: (t) =>*/}
          {/*        t.palette.mode === 'dark'*/}
          {/*          ? 'rgba(255, 255, 255, 0.16)'*/}
          {/*          : 'rgba(144, 101, 176, 0.16)',*/}
          {/*    },*/}
          {/*  }}*/}
          {/*>*/}
          {/*  Summary*/}
          {/*</Button>*/}
        </Stack>
      </Paper>
    </Stack>
  )
}
export default SidebarSummarySuggestion
