import CancelRoundedIcon from '@mui/icons-material/CancelRounded'
import { SvgIcon } from '@mui/material'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import { SvgIconProps } from '@mui/material/SvgIcon'
import Typography from '@mui/material/Typography'
import React, { FC, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { atom, useRecoilState } from 'recoil'

import { useCreateClientMessageListener } from '@/background/utils'
import { getPageSummaryType } from '@/features/chat-base/summary/utils/pageSummaryHelper'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import useSmoothConversationLoading from '@/features/chatgpt/hooks/useSmoothConversationLoading'
import { checkWebpageIsArticlePage } from '@/minimum/utils'
import {
  isMaxAIPDFPage,
  websiteGetSeoMetaData,
} from '@/utils/dataHelper/websiteHelper'

const SidebarSummarySuggestionState = atom<{
  isArticlePage: boolean
  userManualHideOrStartChat: boolean
  articlePageInfo: {
    title: string
    url: string
    favicon: string
  } | null
}>({
  key: 'SidebarSummarySuggestionAtom',
  default: {
    isArticlePage: false,
    userManualHideOrStartChat: false,
    articlePageInfo: null,
  },
})

const SidebarSummarySuggestion: FC<{
  onClick?: () => void
}> = (props) => {
  const { t } = useTranslation(['onboarding'])
  const [sidebarSummarySuggestion, setSidebarSummarySuggestion] =
    useRecoilState(SidebarSummarySuggestionState)
  const { smoothConversationLoading } = useSmoothConversationLoading()
  const { currentSidebarConversationType, clientConversation } =
    useClientConversation()
  const { isArticlePage, articlePageInfo, userManualHideOrStartChat } =
    sidebarSummarySuggestion
  const handleClearSummarySuggestion = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    event.stopPropagation()
    setSidebarSummarySuggestion((prevState) => {
      return {
        ...prevState,
        userManualHideOrStartChat: true,
      }
    })
  }
  const handleClick = () => {
    setSidebarSummarySuggestion((prevState) => {
      return {
        ...prevState,
        userManualHideOrStartChat: true,
      }
    })
    props.onClick?.()
  }
  const handleUpdateArticlePageInfo = () => {
    setSidebarSummarySuggestion((prevState) => {
      return {
        ...prevState,
        isArticlePage:
          checkWebpageIsArticlePage() ||
          getPageSummaryType() !== 'PAGE_SUMMARY',
        articlePageInfo: websiteGetSeoMetaData(),
      }
    })
  }

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
  // 当用户开始聊天之后，隐藏这个提示
  const prevMessageIdRef = useRef('')
  useEffect(() => {
    if (clientConversation?.type === 'Chat' && clientConversation?.id) {
      const mergeConversationAndLassMessageId =
        clientConversation.id + (clientConversation.lastMessageId || '')
      // 如果conversationId变化了，说明用户切换了对话
      if (prevMessageIdRef.current.indexOf(clientConversation.id) === -1) {
        prevMessageIdRef.current = mergeConversationAndLassMessageId
      } else if (
        prevMessageIdRef.current !== mergeConversationAndLassMessageId
      ) {
        // lastMessageId 变化说明用户开始聊天了
        setSidebarSummarySuggestion((prevState) => {
          return {
            ...prevState,
            userManualHideOrStartChat: true,
          }
        })
      }
    }
  }, [clientConversation?.id, smoothConversationLoading])

  if (
    currentSidebarConversationType !== 'Chat' ||
    !isArticlePage ||
    smoothConversationLoading ||
    userManualHideOrStartChat
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
        data-button-clicked-name={'sidebar-summary-suggestion-button'}
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
        onClick={handleClick}
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
            {isMaxAIPDFPage() ? (
              <PDFIcon />
            ) : (
              <img
                src={articlePageInfo?.favicon}
                alt={articlePageInfo?.title || 'favicon'}
                width={16}
                height={16}
              />
            )}

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
                color: (t) =>
                  t.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.6)'
                    : 'rgba(0,0,0,.6)',
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

const PDFIcon: FC<SvgIconProps> = (props) => {
  return (
    <SvgIcon viewBox='0 0 20 20' sx={props.sx}>
      <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 36 36' fill='none'>
        <path
          d='M6.79663 33.7317V2.2707C6.79663 1.71399 7.24793 1.2627 7.80463 1.2627H23.7352L33.0714 10.5989V33.7317C33.0714 34.2884 32.6201 34.7397 32.0634 34.7397H7.80463C7.24793 34.7397 6.79663 34.2884 6.79663 33.7317Z'
          fill='#ED5050'
        />
        <path
          d='M23.735 1.2627L33.0712 10.5989H26.069C26.069 10.5989 25.0464 10.5766 24.4019 9.93205C23.7573 9.28752 23.735 8.26487 23.735 8.26487V1.2627Z'
          fill='#A63232'
        />
        <path
          d='M17.9441 25.764C18.415 24.8196 18.9503 23.7556 19.3787 22.6874L19.5481 22.2657C18.9885 20.0873 18.653 18.3387 18.9527 17.208C19.0334 16.9132 19.3672 16.7344 19.724 16.7344L19.9414 16.7376H19.9813C20.4698 16.73 20.6998 17.3657 20.7259 17.6128C20.769 18.0244 20.5829 18.721 20.5829 18.721C20.5829 18.4397 20.5936 17.9852 20.4201 17.5929C20.2181 17.1391 20.0251 16.8679 19.8521 16.8249C19.7648 16.8847 19.6798 17.0083 19.6508 17.246C19.5905 17.5794 19.5725 18.0001 19.5725 18.2171C19.5725 18.9834 19.72 19.995 20.0098 21.0378C20.0646 20.8763 20.1126 20.7212 20.1509 20.5759C20.2104 20.3468 20.5883 18.8284 20.5883 18.8284C20.5883 18.8284 20.4931 20.8496 20.36 21.4612C20.3315 21.5904 20.3001 21.7183 20.2673 21.8491C20.7454 23.2154 21.5156 24.4349 22.4345 25.3126C22.7967 25.6589 23.2543 25.9382 23.6873 26.1927C24.6331 26.0545 25.5038 25.9892 26.2302 25.9974C27.194 26.0105 27.9014 26.1562 28.1879 26.445C28.3282 26.5853 28.3851 26.7547 28.4028 26.9447C28.407 27.0186 28.3718 27.1922 28.3615 27.2358C28.3718 27.183 28.3718 26.9236 27.5982 26.671C26.9888 26.4718 25.8485 26.478 24.4801 26.627C26.0628 27.4192 27.6048 27.8127 28.0934 27.5768C28.2129 27.5172 28.3578 27.3141 28.3578 27.3141C28.3578 27.3141 28.2717 27.7144 28.2098 27.8145C28.1308 27.9232 27.976 28.041 27.8292 28.0807C27.0575 28.2914 25.0487 27.804 23.2975 26.7803C21.3409 27.0751 19.1922 27.6196 17.4697 28.1976C15.7771 31.2321 14.5046 32.6257 13.4694 32.0955L13.0888 31.8997C12.9341 31.8092 12.9105 31.5888 12.9462 31.4094C13.0669 30.8053 13.8074 29.8955 15.2947 28.987C15.4548 28.8878 16.1679 28.5021 16.1679 28.5021C16.1679 28.5021 15.64 29.0248 15.5163 29.1274C14.3292 30.1226 13.4529 31.3746 13.4748 31.86L13.4791 31.9023C14.4876 31.7553 15.9999 29.6556 17.9441 25.764ZM18.5602 26.0867C18.2355 26.7123 17.918 27.2924 17.625 27.8251C19.246 27.1303 20.9907 26.6857 22.6514 26.3699C22.4282 26.2122 22.2116 26.0452 22.0076 25.8687C21.0931 25.0766 20.3958 24.0884 19.8904 23.0486C19.57 23.9319 19.1888 24.8707 18.5602 26.0867Z'
          fill='white'
        />
        <path
          d='M23.5909 1.26272V8.26647L23.591 8.26804L23.7349 8.26489C23.591 8.26804 23.591 8.26804 23.591 8.26804L23.591 8.26826L23.591 8.26857L23.591 8.26948L23.5911 8.27241C23.5911 8.2739 23.5912 8.27576 23.5913 8.27797C23.5913 8.27936 23.5914 8.2809 23.5915 8.28258C23.5918 8.29123 23.5924 8.30358 23.5935 8.31929C23.5955 8.3507 23.5991 8.39558 23.6054 8.45118C23.6182 8.56223 23.6422 8.71682 23.6872 8.89253C23.7767 9.2417 23.9523 9.68623 24.3 10.0339C24.6477 10.3816 25.0922 10.5572 25.4414 10.6467C25.6171 10.6917 25.7717 10.7157 25.8827 10.7284C25.9383 10.7348 25.9832 10.7384 26.0146 10.7404C26.0303 10.7414 26.0427 10.7421 26.0513 10.7424C26.0556 10.7426 26.059 10.7427 26.0615 10.7428L26.0644 10.7429L26.0653 10.7429L26.0656 10.7429C26.0656 10.7429 26.0659 10.7429 26.069 10.599L26.0659 10.7429L26.0674 10.743H33.0712V10.599L32.9283 10.455H32.8524H32.6337H32.1961H31.3211H29.5711H26.071L26.0706 10.4549C26.0691 10.4549 26.0667 10.4548 26.0634 10.4547C26.0568 10.4544 26.0465 10.4539 26.033 10.453C26.006 10.4513 25.9659 10.4481 25.9156 10.4423C25.8147 10.4307 25.6734 10.4089 25.5128 10.3677C25.1896 10.2849 24.8005 10.1271 24.5036 9.83025C24.2068 9.53339 24.049 9.14433 23.9662 8.82104C23.925 8.66052 23.9031 8.51917 23.8916 8.41833C23.8858 8.36798 23.8826 8.32794 23.8809 8.3009C23.88 8.28739 23.8795 8.27714 23.8792 8.2705C23.8791 8.26718 23.879 8.26476 23.879 8.26329L23.8789 8.2629V1.40754L23.7349 1.2627L23.5909 1.26272Z'
          fill='white'
        />
        <path
          d='M3.59546 6.90705C3.59546 6.58894 3.85334 6.33105 4.17146 6.33105H21.1584C21.4765 6.33105 21.7344 6.58894 21.7344 6.90705V13.224C21.7344 13.5422 21.4765 13.8 21.1584 13.8H4.17146C3.85334 13.8 3.59546 13.5422 3.59546 13.224V6.90705Z'
          fill='white'
        />
        <path
          fillRule='evenodd'
          clipRule='evenodd'
          d='M9.29276 10.6986H8.28901V12.5033H7.45476V7.66406H9.29276C9.66723 7.66406 9.9852 7.73054 10.2467 7.86348C10.5103 7.99422 10.7109 8.17591 10.8482 8.40857C10.9856 8.63901 11.0543 8.90269 11.0543 9.1996C11.0543 9.51203 10.9856 9.78014 10.8482 10.0039C10.7109 10.2277 10.5103 10.3995 10.2467 10.5191C9.9852 10.6388 9.66723 10.6986 9.29276 10.6986ZM8.28901 8.3288V10.0372H9.29276C9.51212 10.0372 9.68939 10.0017 9.82455 9.93081C9.95971 9.85991 10.0583 9.76241 10.1204 9.63833C10.1846 9.51203 10.2167 9.368 10.2167 9.20625C10.2167 9.05336 10.1846 8.91044 10.1204 8.7775C10.0583 8.64233 9.95971 8.53376 9.82455 8.45178C9.68939 8.36979 9.51212 8.3288 9.29276 8.3288H8.28901Z'
          fill='#ED5050'
        />
        <path
          fillRule='evenodd'
          clipRule='evenodd'
          d='M13.2081 12.5033H11.8021V7.66406H13.238C13.5593 7.66406 13.8529 7.71835 14.1188 7.82692C14.3846 7.93328 14.614 8.08728 14.8068 8.28892C15.0017 8.49055 15.1513 8.73207 15.2555 9.01348C15.3596 9.29488 15.4117 9.60953 15.4117 9.9574V10.2133C15.4117 10.5612 15.3596 10.8758 15.2555 11.1573C15.1513 11.4387 15.0017 11.6802 14.8068 11.8818C14.6118 12.0812 14.3791 12.2352 14.1088 12.3438C13.8407 12.4502 13.5404 12.5033 13.2081 12.5033ZM13.2081 11.8419H12.6364V8.3288H13.238C13.4529 8.3288 13.6424 8.36425 13.8063 8.43516C13.9725 8.50606 14.1121 8.6102 14.2251 8.74758C14.3403 8.88496 14.4267 9.05447 14.4844 9.25611C14.5442 9.45774 14.5741 9.68929 14.5741 9.95076V10.2133C14.5741 10.5501 14.522 10.8404 14.4179 11.0841C14.316 11.3279 14.1631 11.5151 13.9592 11.6458C13.7576 11.7766 13.5072 11.8419 13.2081 11.8419Z'
          fill='#ED5050'
        />
        <path
          d='M17.0835 9.78125V8.3288H19.3336V7.66406H16.2492V12.5033H17.0835V10.4427H19.0577V9.78125H17.0835Z'
          fill='#ED5050'
        />
        <path
          d='M6.36075 12.5262C6.56214 12.5262 6.72541 12.3629 6.72541 12.1615C6.72541 11.9601 6.56214 11.7968 6.36075 11.7968C6.15936 11.7968 5.99609 11.9601 5.99609 12.1615C5.99609 12.3629 6.15936 12.5262 6.36075 12.5262Z'
          fill='#ED5050'
        />
      </svg>
    </SvgIcon>
  )
}

export default SidebarSummarySuggestion
