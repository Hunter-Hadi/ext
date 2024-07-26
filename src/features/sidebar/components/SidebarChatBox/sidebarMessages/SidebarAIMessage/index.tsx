import PlayArrowIcon from '@mui/icons-material/PlayArrow'
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
import LazyLoadImage from '@/components/LazyLoadImage'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import {
  IAIResponseMessage,
  IAIResponseOriginalMessageMetadataTitle,
} from '@/features/indexed_db/conversations/models/Message'
import {
  CaptivePortalIcon,
  ReadIcon,
} from '@/features/searchWithAI/components/SearchWithAIIcons'
import { textHandler } from '@/features/shortcuts/utils/textHelper'
import messageWithErrorBoundary from '@/features/sidebar/components/SidebarChatBox/sidebarMessages/messageWithErrorBoundary'
import ImageWithDialog from '@/features/sidebar/components/SidebarChatBox/sidebarMessages/SidebarAIMessage/ImageWithDialog'
import KnowledgePanelContent from '@/features/sidebar/components/SidebarChatBox/sidebarMessages/SidebarAIMessage/KnowledgePanelContent'
import SidebarAIMessageAIModel from '@/features/sidebar/components/SidebarChatBox/sidebarMessages/SidebarAIMessage/SidebarAIMessageAIModel'
import SidebarAImessageBottomList from '@/features/sidebar/components/SidebarChatBox/sidebarMessages/SidebarAIMessage/SidebarAImessageBottomList'
import SidebarAIMessageContent from '@/features/sidebar/components/SidebarChatBox/sidebarMessages/SidebarAIMessage/SidebarAIMessageContent'
import SidebarAIMessageSkeletonContent from '@/features/sidebar/components/SidebarChatBox/sidebarMessages/SidebarAIMessage/SidebarAIMessageContent/SidebarAIMessageSkeletonContent'
import SidebarAIMessageCopilotStep from '@/features/sidebar/components/SidebarChatBox/sidebarMessages/SidebarAIMessage/SidebarAIMessageCopilotStep'
import SidebarAIMessageSourceLinks from '@/features/sidebar/components/SidebarChatBox/sidebarMessages/SidebarAIMessage/SidebarAIMessageSourceLinks'
import SidebarAIMessageTools from '@/features/sidebar/components/SidebarChatBox/sidebarMessages/SidebarAIMessage/SidebarAIMessageTools'
import { SwitchSummaryActionNav } from '@/features/sidebar/components/SidebarChatBox/sidebarMessages/SidebarAIMessage/SwitchSummaryActionNav'
import SidebarContextCleared from '@/features/sidebar/components/SidebarChatBox/sidebarMessages/SidebarContextCleared'
import { openGlobalVideoPopup } from '@/features/video_popup/utils'

const CustomMarkdown = React.lazy(() => import('src/components/MaxAIMarkdown'))

interface IProps {
  message: IAIResponseMessage
  order: number
  isDarkMode?: boolean
  liteMode?: boolean
  loading?: boolean
  hasError?: boolean
}

const BaseSidebarAIMessage: FC<IProps> = (props) => {
  const { t } = useTranslation(['client'])
  const {
    message,
    isDarkMode,
    liteMode = false,
    loading = false,
    hasError = false,
  } = props

  const isContextCleared =
    message.originalMessage?.metadata?.includeHistory === false
  const isTriggeredContentReview =
    message.originalMessage?.metadata?.isTriggeredContentReview === true

  const isRichAIMessage =
    message.originalMessage !== undefined &&
    !message.originalMessage.liteMode &&
    !liteMode
  const isSummaryMessage = useMemo(
    () => message.originalMessage?.metadata?.shareType === 'summary',
    [message],
  )

  const { clientConversation } = useClientConversation()
  const renderData = useMemo(() => {
    try {
      const currentRenderData = {
        title: message.originalMessage?.metadata?.title,
        copilot: message.originalMessage?.metadata?.copilot,
        sources: message.originalMessage?.metadata?.sources,
        sourcesLoading:
          message.originalMessage?.metadata?.sources?.status === 'loading',
        imagesSources: message.originalMessage?.metadata?.sources?.images || [],
        videosSources: message.originalMessage?.metadata?.sources?.videos || [],
        knowledgeSources:
          message.originalMessage?.metadata?.sources?.knowledgePanel || null,
        sourcesHasContent: false,
        answer: message.text,
        content: message.originalMessage?.content,
        messageIsComplete: message.originalMessage?.metadata?.isComplete,
        deepDive: message.originalMessage?.metadata?.deepDive,
        sourceCitations: message.originalMessage?.metadata?.sourceCitations,
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
        sourceCitations: undefined,
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

  const renderMessageContentTitle = () => {
    if (!renderData.content) return null

    let icon: React.ReactNode = <CircularProgress size={18} />
    let title = ''

    if (!renderData.messageIsComplete) {
      if (renderData.content.contentType === 'text') {
        title = 'Writing'
      } else if (renderData.content.contentType === 'image') {
        title = 'Creating image'
      }
      if (renderData.content.title?.title) {
        title = renderData.content.title.title
      }
      if (
        renderData.content.title?.titleIcon &&
        renderData.content.title?.titleIcon !== 'Loading'
      ) {
        icon = renderData.content.title?.titleIcon
      }
      // TODO 这里需要整理
      // 目前summary下可能content.text内容已经输出完了，deepDive正在输出，这时候content.titleIcon应该是已完成状态
      if (
        isSummaryMessage &&
        renderData.content?.title?.titleIcon !== 'Loading'
      ) {
        icon = renderData.content.title?.titleIcon || (
          <ReadIcon
            sx={{
              color: 'primary.main',
              fontSize: 20,
            }}
          />
        )
        title = renderData.content.title?.title || 'Answer'
      }
    } else {
      icon =
        renderData.content.title?.titleIcon &&
        renderData.content.title?.titleIcon !== 'Loading' ? (
          renderData.content.title?.titleIcon
        ) : (
          <ReadIcon
            sx={{
              color: 'primary.main',
              fontSize: 20,
            }}
          />
        )
      title = renderData.content.title?.title || 'Answer'
    }

    return (
      <MetadataTitleRender
        title={{
          title,
          titleIcon: icon as any,
          titleIconSize: renderData.content.title?.titleIconSize || 18,
        }}
        fontSx={{ lineHeight: '20px' }}
      />
    )
  }

  return (
    <Box component={'div'} className={'chat-message--AI'}>
      {isContextCleared && !isTriggeredContentReview && props.order !== 1 && (
        <SidebarContextCleared message={message} />
      )}
      <Stack className={'chat-message--text'} sx={{ ...memoSx }}>
        {clientConversation?.id === message.conversationId &&
          clientConversation?.type === 'Chat' && (
            <SidebarAIMessageAIModel
              AIProvider={clientConversation?.meta?.AIProvider}
              AIModel={
                message.originalMessage?.metadata?.AIModel ||
                clientConversation?.meta.AIModel
              }
            />
          )}
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
                  whiteSpace:
                    // search和art板块的标题为用户输入
                    message.originalMessage?.metadata?.shareType === 'search' ||
                    message.originalMessage?.metadata?.shareType === 'art'
                      ? ''
                      : 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
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
                <Stack direction={'row'} alignItems='center' spacing={1}>
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
                <Stack spacing={2}>
                  {renderMessageContentTitle()}

                  {/* 图片、视频增强 */}
                  {(renderData?.imagesSources.length > 0 ||
                    renderData?.videosSources.length > 0) && (
                    <Stack className='media_sources' spacing={1}>
                      {renderData?.imagesSources.length > 0 && (
                        <Stack
                          spacing={1}
                          direction={'row'}
                          className='image_sources'
                          sx={{
                            overflowX: 'scroll',
                            '&::-webkit-scrollbar': {
                              display: 'none',
                              width: 0,
                              background: 'transparent',
                            },
                          }}
                        >
                          <ImageWithDialog
                            images={renderData?.imagesSources}
                          ></ImageWithDialog>
                        </Stack>
                      )}

                      {renderData?.videosSources.length > 0 && (
                        <Stack
                          spacing={1}
                          direction={'row'}
                          className='image_sources'
                          sx={{
                            overflowX: 'scroll',
                            '&::-webkit-scrollbar': {
                              display: 'none',
                              width: 0,
                              background: 'transparent',
                            },
                          }}
                        >
                          {renderData?.videosSources.map((video) => (
                            <Stack
                              sx={{
                                position: 'relative',
                                cursor: 'pointer',
                              }}
                              className='videoItem'
                              key={video.src}
                              onClick={() => {
                                openGlobalVideoPopup(video.src, true)
                              }}
                            >
                              <LazyLoadImage
                                width={114}
                                height={64}
                                imgStyle={{
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  objectFit: 'cover',
                                  display: 'block',
                                  overflow: 'hidden',
                                }}
                                src={video.imgSrc}
                                alt={''}
                              />
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: '50%',
                                  left: '50%',
                                  transform: 'translate(-50%, -50%)',
                                  height: 16,
                                  width: 16,
                                  color: 'white',
                                  p: 2,
                                  borderRadius: '50%',
                                  lineHeight: 0,
                                  bgcolor: '#00000080',
                                  backdropFilter: 'blur(4px)',
                                }}
                              >
                                <PlayArrowIcon
                                  sx={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    fontSize: 16,
                                  }}
                                />
                              </Box>
                            </Stack>
                          ))}
                        </Stack>
                      )}
                    </Stack>
                  )}

                  {/* knowledge资源增强 */}
                  {renderData?.knowledgeSources && (
                    <KnowledgePanelContent
                      knowledgeSources={renderData?.knowledgeSources}
                    ></KnowledgePanelContent>
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
          <Stack spacing={2}>
            <div
              className={`markdown-body ${
                isDarkMode ? 'markdown-body-dark' : ''
              }`}
            >
              <AppSuspenseLoadingLayout>
                <CustomMarkdown message={message}>
                  {renderData.answer}
                </CustomMarkdown>
              </AppSuspenseLoadingLayout>
            </div>
            {/* lite mode下也显示，避免结构导致的渲染报错，先加上hasError判断 */}
            {renderData.deepDive && !hasError && (
              <SidebarAImessageBottomList
                data={renderData.deepDive}
                loading={coverLoading}
                isDarkMode={isDarkMode}
              />
            )}
          </Stack>
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
  title: IAIResponseOriginalMessageMetadataTitle & {
    titleIcon?: React.ReactNode
  }
  fontSx?: SxProps
}> = (props) => {
  const { fontSx } = props
  const { title, titleIcon, titleIconSize } = props.title
  const currentTitleIconSize = titleIconSize || 20
  return (
    <Stack direction={'row'} alignItems='center' spacing={1}>
      {typeof titleIcon === 'string' && titleIcon ? (
        <Stack
          alignItems={'center'}
          justifyContent={'center'}
          width={currentTitleIconSize}
          height={currentTitleIconSize}
        >
          <ContextMenuIcon
            sx={{
              color: 'primary.main',
              fontSize: currentTitleIconSize,
            }}
            icon={titleIcon as any}
          />
        </Stack>
      ) : (
        titleIcon
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
