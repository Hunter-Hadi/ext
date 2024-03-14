import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import throttle from 'lodash-es/throttle'
import React, { FC, useEffect, useMemo, useRef, useState } from 'react'

import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import {
  IAIResponseMessage,
  IAIResponseOriginalMessageMetadataTitle,
} from '@/features/chatgpt/types'
import {
  CaptivePortalIcon,
  ReadIcon,
} from '@/features/searchWithAI/components/SearchWithAIIcons'
import { textHandler } from '@/features/shortcuts/utils/textHelper'
import messageWithErrorBoundary from '@/features/sidebar/components/SidebarChatBox/sidebarMessages/messageWithErrorBoundary'
import SidebarAIMessageContent from '@/features/sidebar/components/SidebarChatBox/sidebarMessages/SidebarAIMessage/SidebarAIMessageContent'
import SidebarAIMessageSkeletonContent from '@/features/sidebar/components/SidebarChatBox/sidebarMessages/SidebarAIMessage/SidebarAIMessageContent/SidebarAIMessageSkeletonContent'
import SidebarAIMessageCopilotStep from '@/features/sidebar/components/SidebarChatBox/sidebarMessages/SidebarAIMessage/SidebarAIMessageCopilotStep'
import SidebarAIMessageSourceLinks from '@/features/sidebar/components/SidebarChatBox/sidebarMessages/SidebarAIMessage/SidebarAIMessageSourceLinks'
import SidebarAIMessageTools from '@/features/sidebar/components/SidebarChatBox/sidebarMessages/SidebarAIMessage/SidebarAIMessageTools'
import {
  allSummaryNavList,
  getPageSummaryType,
} from '@/features/sidebar/utils/pageSummaryHelper'

import { messageListContainerId } from '../../SidebarChatBoxMessageListContainer'
import { HeightUpdateScrolling } from './HeightUpdateScrolling'
import { SwitchSummaryActionNav } from './SwitchSummaryActionNav'

const CustomMarkdown = React.lazy(() => import('@/components/CustomMarkdown'))

interface IProps {
  message: IAIResponseMessage
  isDarkMode?: boolean
  liteMode?: boolean
  loading?: boolean
}

const BaseSidebarAIMessage: FC<IProps> = (props) => {
  const { message, isDarkMode, liteMode = false, loading = false } = props
  const [summaryViewMaxHeight, setSummaryViewMaxHeight] = useState(260)
  const [IsSummaryAutoScroll, setIsSummaryAutoScroll] = useState(false)

  const isRichAIMessage = message.originalMessage !== undefined && !liteMode
  const chatMessageRef = useRef<HTMLDivElement>(null)
  const isSummaryMessage = useMemo(
    () => message.originalMessage?.metadata?.shareType === 'summary',
    [message],
  )
  useEffect(() => {
    if (isSummaryMessage) {
      const otherViewHeight = 400 //临时简单计算，待优化
      const minViewHeight = 200
      const parentElement = chatMessageRef.current?.closest(
        `#${messageListContainerId}`,
      )
      const messageListContainerHeight = parentElement?.clientHeight
      if (
        messageListContainerHeight &&
        messageListContainerHeight > otherViewHeight
      ) {
        const currentHeight = messageListContainerHeight - otherViewHeight
        setSummaryViewMaxHeight(
          currentHeight > minViewHeight ? currentHeight : minViewHeight,
        )
      }
    }
  }, [chatMessageRef])
  const getIsSummaryAutoScroll = () => {
    //fixing第二版该逻辑抽离出去
    const summaryType = getPageSummaryType()
    const messageNavTitle = message.originalMessage?.metadata?.title?.title
    if (messageNavTitle && allSummaryNavList[summaryType]) {
      const isAutoScroll = allSummaryNavList[summaryType].find(
        (item) => item.title === messageNavTitle,
      )?.config?.isAutoScroll
      if (isAutoScroll === false) {
        return false
      } else {
        return true
      }
    } else {
      return true
    }
  }

  useEffect(() => {
    const fetchAndSetIsSummaryAutoScroll = throttle(() => {
      const isScroll = getIsSummaryAutoScroll()
      setIsSummaryAutoScroll(!!isScroll)
    }, 100)
    fetchAndSetIsSummaryAutoScroll()
  }, [message.originalMessage?.metadata?.title?.title])
  const renderData = useMemo(() => {
    try {
      const currentRenderData = {
        title: message.originalMessage?.metadata?.title,
        copilot: message.originalMessage?.metadata?.copilot,
        sources: message.originalMessage?.metadata?.sources,
        sourcesLoading:
          message.originalMessage?.metadata?.sources?.status === 'loading',
        sourcesHasContent: false,
        answer: message.text,
        content: message.originalMessage?.content,
        messageIsComplete: message.originalMessage?.metadata?.isComplete,
        deepDive: message.originalMessage?.metadata?.deepDive,
      }
      if (Object.keys(currentRenderData?.sources || {}).length > 1) {
        currentRenderData.sourcesHasContent = true
      }
      if (message.originalMessage?.content?.text) {
        currentRenderData.answer =
          textHandler(message.originalMessage.content.text, {
            noResponseTag: true,
            noSummaryTag: true,
          }) || message.text
      }
      currentRenderData.answer = currentRenderData.answer.replace(/^\s+/, '')
      return currentRenderData
    } catch (e) {
      return {
        title: undefined,
        copilot: undefined,
        sources: undefined,
        sourcesLoading: false,
        sourcesHasContent: false,
        answer: message.text,
        content: undefined,
        messageIsComplete: false,
        deepDive: undefined,
      }
    }
  }, [message])
  const coverLoading = useMemo(() => {
    // 如果是 rich ai message，需要判断 messageIsComplete
    if (isRichAIMessage) {
      return !renderData.messageIsComplete || loading
    }
    return loading
  }, [loading, renderData.messageIsComplete, isRichAIMessage])
  const memoSx = useMemo(() => {
    return {
      whiteSpace: 'pre-wrap',
      width: '100%',
      p: 1,
      gap: 1,
      wordBreak: 'break-word',
      borderRadius: '8px',
      borderBottomLeftRadius: 0,
      color: 'text.primary',
      // border: '1px solid',
      // borderColor: isDarkMode ? 'customColor.borderColor' : 'transparent',
      bgcolor: 'customColor.secondaryBackground',
    } as SxProps
  }, [isDarkMode])
  const isWaitFirstAIResponseText = useMemo(() => {
    return !renderData.answer
  }, [renderData.answer])

  return (
    <Stack
      ref={chatMessageRef}
      className={'chat-message--text'}
      sx={{ ...memoSx }}
    >
      {isSummaryMessage && (
        <SwitchSummaryActionNav message={message} loading={coverLoading} />
      )}
      {isRichAIMessage ? (
        <Stack spacing={2}>
          {renderData.title && (
            <MetadataTitleRender
              title={renderData.title}
              fontSx={{
                fontWeight: 'bold',
                fontSize: '28px',
                color: 'text.primary',
              }}
            />
          )}
          {renderData.copilot && (
            <Stack spacing={1}>
              {renderData.copilot?.title && (
                <MetadataTitleRender title={renderData.copilot.title} />
              )}
              <Stack spacing={1}>
                {renderData.copilot.steps.map((copilotStep) => {
                  return (
                    <SidebarAIMessageCopilotStep
                      messageIsComplete={renderData.messageIsComplete}
                      copilot={copilotStep}
                      key={copilotStep.title}
                    />
                  )
                })}
              </Stack>
            </Stack>
          )}
          {renderData.sources && renderData.sourcesHasContent && (
            <Stack spacing={1}>
              <Stack direction={'row'} alignItems="center" spacing={1}>
                {renderData.sourcesLoading && !renderData.messageIsComplete ? (
                  <CircularProgress size={18} />
                ) : (
                  <CaptivePortalIcon
                    sx={{
                      color: 'primary.main',
                      fontSize: 20,
                    }}
                  />
                )}
                <Typography
                  sx={{
                    color: 'primary.main',
                    fontSize: 18,
                  }}
                >
                  Sources
                </Typography>
              </Stack>
              <SidebarAIMessageSourceLinks
                sourceLinks={renderData.sources.links || []}
                loading={renderData.sourcesLoading}
              />
            </Stack>
          )}
          {renderData.content && (
            <Stack>
              {!renderData.messageIsComplete ? (
                <Stack direction={'row'} alignItems="center" spacing={1}>
                  <CircularProgress size={18} />
                  <Typography
                    sx={{
                      color: 'primary.main',
                      fontSize: 18,
                      lineHeight: '20px',
                    }}
                  >
                    {renderData.content.contentType === 'text' && 'Writing'}
                    {renderData.content.contentType === 'image' &&
                      'Creating image'}
                  </Typography>
                </Stack>
              ) : (
                <Stack direction={'row'} alignItems="center" spacing={1}>
                  {renderData.content.title?.titleIcon ? (
                    <Stack
                      alignItems={'center'}
                      justifyContent={'center'}
                      width={16}
                      height={16}
                    >
                      <ContextMenuIcon
                        sx={{
                          color: 'primary.main',
                          fontSize:
                            renderData.content.title?.titleIconSize || 18,
                        }}
                        icon={renderData.content.title?.titleIcon}
                      />
                    </Stack>
                  ) : (
                    <ReadIcon
                      sx={{
                        color: 'primary.main',
                        fontSize: 20,
                      }}
                    />
                  )}
                  <Typography
                    sx={{
                      color: 'primary.main',
                      fontSize: 18,
                      lineHeight: '20px',
                    }}
                  >
                    {renderData.content.title?.title || 'Answer'}
                  </Typography>
                </Stack>
              )}
              {isWaitFirstAIResponseText && !renderData.messageIsComplete ? (
                <SidebarAIMessageSkeletonContent
                  contentType={renderData.content.contentType}
                />
              ) : isSummaryMessage ? (
                <HeightUpdateScrolling
                  height={summaryViewMaxHeight}
                  update={IsSummaryAutoScroll ? message.text : ''}
                >
                  <SidebarAIMessageContent AIMessage={message} />
                </HeightUpdateScrolling>
              ) : (
                <SidebarAIMessageContent AIMessage={message} />
              )}
            </Stack>
          )}
          {renderData.deepDive && renderData.deepDive.title && (
            <Stack spacing={1}>
              {renderData.deepDive.title && (
                <MetadataTitleRender title={renderData.deepDive.title} />
              )}
              <div
                className={`markdown-body ${
                  isDarkMode ? 'markdown-body-dark' : ''
                }`}
              >
                <CustomMarkdown>{renderData.deepDive.value}</CustomMarkdown>
              </div>
            </Stack>
          )}
        </Stack>
      ) : (
        <div
          className={`markdown-body ${isDarkMode ? 'markdown-body-dark' : ''}`}
        >
          <CustomMarkdown>{renderData.answer}</CustomMarkdown>
        </div>
      )}
      {!coverLoading ? (
        <SidebarAIMessageTools message={message as IAIResponseMessage} />
      ) : (
        <Box height={'26px'} />
      )}
    </Stack>
  )
}
const MetadataTitleRender: FC<{
  title: IAIResponseOriginalMessageMetadataTitle
  fontSx?: SxProps
}> = (props) => {
  const { fontSx } = props
  const { title, titleIcon, titleIconSize } = props.title
  return (
    <Stack direction={'row'} alignItems="center" spacing={1}>
      {titleIcon && (
        <Stack
          alignItems={'center'}
          justifyContent={'center'}
          width={16}
          height={16}
        >
          <ContextMenuIcon
            sx={{
              color: 'primary.main',
              fontSize: titleIconSize || 18,
            }}
            icon={titleIcon}
          />
        </Stack>
      )}
      <Typography
        sx={{
          color: 'primary.main',
          fontSize: 18,
          ...fontSx,
        }}
      >
        {title}
      </Typography>
    </Stack>
  )
}
export const SidebarAIMessage = messageWithErrorBoundary(BaseSidebarAIMessage)
