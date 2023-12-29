import CircularProgress from '@mui/material/CircularProgress'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import React, { Component, ComponentType, FC, useMemo } from 'react'

import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import CustomMarkdown from '@/components/CustomMarkdown'
import {
  IAIResponseMessage,
  IAIResponseOriginalMessageMetadataTitle,
} from '@/features/chatgpt/types'
import {
  CaptivePortalIcon,
  ReadIcon,
} from '@/features/searchWithAI/components/SearchWithAIIcons'
import { textHandler } from '@/features/shortcuts/utils/textHelper'
import SidebarAIMessageCopilotStep from '@/features/sidebar/components/SidebarChatBox/sidebarMessages/SidebarAIMessage/SidebarAIMessageCopilotStep'
import SidebarAIMessageSourceLinks from '@/features/sidebar/components/SidebarChatBox/sidebarMessages/SidebarAIMessage/SidebarAIMessageSourceLinks'

interface ErrorBoundaryState {
  hasError: boolean
}

const withErrorBoundary = <P extends object>(
  WrappedComponent: ComponentType<P>,
) => {
  return class ErrorBoundary extends Component<P, ErrorBoundaryState> {
    constructor(props: P) {
      super(props)
      this.state = { hasError: false }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      // 处理错误，例如记录错误信息
      console.error(error, errorInfo)
      // 更新状态以渲染降级的 UI
      this.setState({ hasError: true })
    }

    render() {
      if (this.state.hasError) {
        // 渲染降级的 UI
        return <WrappedComponent {...this.props} liteMode />
      }
      return <WrappedComponent {...this.props} />
    }
  }
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

export const SidebarAIMessage: FC<{
  liteMode?: boolean
  message: IAIResponseMessage
  isDarkMode?: boolean
}> = (props) => {
  const { message, isDarkMode, liteMode = false } = props
  const isRichAIMessage = message.originalMessage !== undefined && !liteMode
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
  const isWaitFirstAIResponseText = useMemo(() => {
    return !renderData.answer
  }, [renderData.answer])

  return (
    <>
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
                    Writing
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
                <Stack>
                  <Skeleton animation="wave" height={10} />
                  <Skeleton animation="wave" height={10} />
                  <Skeleton animation="wave" height={10} />
                  <Skeleton animation="wave" height={10} />
                  <Skeleton animation="wave" height={10} />
                  <Skeleton animation="wave" height={10} />
                </Stack>
              ) : (
                <div
                  className={`markdown-body ${
                    isDarkMode ? 'markdown-body-dark' : ''
                  }`}
                >
                  <CustomMarkdown>{renderData.answer}</CustomMarkdown>
                </div>
              )}
            </Stack>
          )}
          {renderData.deepDive && (
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
    </>
  )
}
export default withErrorBoundary(SidebarAIMessage)
