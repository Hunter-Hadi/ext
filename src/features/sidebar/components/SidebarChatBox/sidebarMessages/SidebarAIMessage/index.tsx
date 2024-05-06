import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import React, { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import AppSuspenseLoadingLayout from '@/components/AppSuspenseLoadingLayout'
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
import SidebarAImessageBottomList from '@/features/sidebar/components/SidebarChatBox/sidebarMessages/SidebarAIMessage/SidebarAImessageBottomList'
import SidebarAIMessageContent from '@/features/sidebar/components/SidebarChatBox/sidebarMessages/SidebarAIMessage/SidebarAIMessageContent'
import SidebarAIMessageSkeletonContent from '@/features/sidebar/components/SidebarChatBox/sidebarMessages/SidebarAIMessage/SidebarAIMessageContent/SidebarAIMessageSkeletonContent'
import SidebarAIMessageCopilotStep from '@/features/sidebar/components/SidebarChatBox/sidebarMessages/SidebarAIMessage/SidebarAIMessageCopilotStep'
import SidebarAIMessageSourceLinks from '@/features/sidebar/components/SidebarChatBox/sidebarMessages/SidebarAIMessage/SidebarAIMessageSourceLinks'
import SidebarAIMessageTools from '@/features/sidebar/components/SidebarChatBox/sidebarMessages/SidebarAIMessage/SidebarAIMessageTools'
import { SwitchSummaryActionNav } from '@/features/sidebar/components/SidebarChatBox/sidebarMessages/SidebarAIMessage/SwitchSummaryActionNav'

const CustomMarkdown = React.lazy(() => import('@/components/CustomMarkdown'))

interface IProps {
  message: IAIResponseMessage
  order: number
  isDarkMode?: boolean
  liteMode?: boolean
  loading?: boolean
}

const BaseSidebarAIMessage: FC<IProps> = (props) => {
  const { t } = useTranslation(['client'])
  const { message, isDarkMode, liteMode = false, loading = false } = props

  const isContextCleared =
    message.originalMessage?.metadata?.includeHistory === false
  const isTriggeredContentReview =
    message.originalMessage?.metadata?.isTriggeredContentReview === true

  const isRichAIMessage = message.originalMessage !== undefined && !liteMode
  const isSummaryMessage = useMemo(
    () => message.originalMessage?.metadata?.shareType === 'summary',
    [message],
  )

  const renderData = useMemo(() => {
    console.log('simply message', message)
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
      } //nonsense:后面可以优化为数组根据type类型去渲染，并加载对应组件统一化更高

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
      boxSizing: 'border-box',
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
    <Box component={'div'} className={'chat-message--AI'}>
      {isContextCleared && !isTriggeredContentReview && props.order !== 1 && (
        <Divider sx={{ mb: 2 }}>
          <Typography color={'text.secondary'} fontSize={'12px'}>
            {t('client:sidebar__conversation__message__context_cleared')}
          </Typography>
        </Divider>
      )}
      <Stack className={'chat-message--text'} sx={{ ...memoSx }}>
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
                  {renderData.sourcesLoading &&
                    !renderData.messageIsComplete ? (
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
            {renderData.content &&
              renderData.content.title?.title !== 'noneShowContent' && (
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
                  {isWaitFirstAIResponseText &&
                    !renderData.messageIsComplete ? (
                    <SidebarAIMessageSkeletonContent
                      contentType={renderData.content.contentType}
                    />
                  ) : (
                    <SidebarAIMessageContent AIMessage={message} />
                  )}
                </Stack>
              )}
            {renderData.deepDive && (
              <SidebarAImessageBottomList
                data={renderData.deepDive}
                loading={coverLoading}
                isDarkMode={isDarkMode}
              />
            )}
          </Stack>
        ) : (
          <div
            className={`markdown-body ${isDarkMode ? 'markdown-body-dark' : ''
              }`}
          >
            <AppSuspenseLoadingLayout>
              <CustomMarkdown>{renderData.answer}</CustomMarkdown>
            </AppSuspenseLoadingLayout>
          </div>
        )}
        {!coverLoading ? (
          <SidebarAIMessageTools message={message as IAIResponseMessage} />
        ) : (
          <Box height={'26px'} />
        )}
      </Stack>
      {isTriggeredContentReview &&
        renderData.messageIsComplete &&
        props.order !== 1 && (
          <Divider sx={{ mt: 2 }}>
            <Typography color={'text.secondary'} fontSize={'12px'}>
              {t(
                'client:sidebar__conversation__message__context_triggered_content_review',
              )}
            </Typography>
          </Divider>
        )}
    </Box>
  )
}
export const MetadataTitleRender: FC<{
  title: IAIResponseOriginalMessageMetadataTitle
  fontSx?: SxProps
}> = (props) => {
  const { fontSx } = props
  const { title, titleIcon, titleIconSize } = props.title
  const titleIconSizeDefault = titleIcon === 'SummaryInfo' ? 20 : 16
  return (
    <Stack direction={'row'} alignItems="center" spacing={1}>
      {titleIcon && (
        <Stack
          alignItems={'center'}
          justifyContent={'center'}
          width={titleIconSizeDefault}
          height={titleIconSizeDefault}
        >
          {titleIcon === 'SummaryInfo' ? (
            <ReadIcon
              sx={{
                color: 'primary.main',
                fontSize: titleIconSize || 20,
              }}
            />
          ) : (
            <ContextMenuIcon
              sx={{
                color: 'primary.main',
                fontSize: titleIconSize || 18,
              }}
              icon={titleIcon}
            />
          )}
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
