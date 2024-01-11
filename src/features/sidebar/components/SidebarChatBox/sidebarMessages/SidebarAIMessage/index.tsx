import CircularProgress from '@mui/material/CircularProgress'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import React, { FC, useMemo } from 'react'

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
import SidebarAIMessageCopilotStep from '@/features/sidebar/components/SidebarChatBox/sidebarMessages/SidebarAIMessage/SidebarAIMessageCopilotStep'
import SidebarAIMessageSourceLinks from '@/features/sidebar/components/SidebarChatBox/sidebarMessages/SidebarAIMessage/SidebarAIMessageSourceLinks'
import SidebarChatBoxAiTools from '@/features/sidebar/components/SidebarChatBox/sidebarMessages/SidebarAIMessage/SidebarChatBoxAiTools'

const CustomMarkdown = React.lazy(() => import('@/components/CustomMarkdown'))

const BaseSidebarAIMessage: FC<{
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
  const memoSx = useMemo(() => {
    return {
      whiteSpace: 'pre-wrap',
      width: '100%',
      p: 1,
      gap: 1,
      wordBreak: 'break-word',
      borderRadius: '8px',
      borderBottomLeftRadius: 0,
      color: isDarkMode ? '#FFFFFFDE' : 'rgba(0,0,0,0.87)',
      border: '1px solid',
      borderColor: isDarkMode ? 'customColor.borderColor' : 'transparent',
      bgcolor: isDarkMode
        ? 'rgba(255, 255, 255, 0.04)'
        : 'rgb(233,233,235)!important',
    } as SxProps
  }, [isDarkMode])
  const isWaitFirstAIResponseText = useMemo(() => {
    return !renderData.answer
  }, [renderData.answer])

  return (
    <Stack className={'chat-message--text'} sx={{ ...memoSx }}>
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
      <SidebarChatBoxAiTools message={message as IAIResponseMessage} />
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
