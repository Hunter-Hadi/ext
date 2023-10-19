import React, { FC, useMemo } from 'react'
import { IAIResponseMessage } from '@/features/chatgpt/types'
import CustomMarkdown from '@/components/CustomMarkdown'
import { textHandler } from '@/features/shortcuts/utils/textHelper'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import {
  Box,
  Card,
  CircularProgress,
  Grid,
  Link,
  Skeleton,
} from '@mui/material'
import { SEARCH_WITH_AI_DEFAULT_CRAWLING_LIMIT } from '@/features/searchWithAI/constants'
import {
  CaptivePortalIcon,
  ReadIcon,
} from '@/features/searchWithAI/components/SearchWithAIIcons'
import sum from 'lodash-es/sum'

export const SidebarAIMessage: FC<{
  message: IAIResponseMessage
  isDarkMode?: boolean
}> = (props) => {
  const { message, isDarkMode } = props
  const renderData = useMemo(() => {
    const currentRenderData = {
      title: message.originalMessage?.metadata?.title,
      sources: message.originalMessage?.metadata?.sources || {
        links: [],
      },
      answer: message.text,
      isWriting: !message.originalMessage?.metadata?.isComplete,
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
  }, [message])
  const isWaitFirstAIResponseText = useMemo(() => {
    return !renderData.answer
  }, [renderData.answer])
  const isAIMessageHasSources = useMemo(() => {
    return sum(
      Object.values(renderData.sources).map((value) => {
        if (value instanceof Array) {
          return value.length
        }
        return 0
      }),
    )
  }, [renderData.sources])
  return (
    <>
      {isAIMessageHasSources ? (
        <Stack spacing={3}>
          {renderData.title && (
            <Typography
              sx={{
                fontWeight: 'bold',
                fontSize: 28,
              }}
            >
              {renderData.title}
            </Typography>
          )}
          {renderData.sources.links?.length ? (
            <Stack spacing={1}>
              <Stack direction={'row'} alignItems="center" spacing={1}>
                <CaptivePortalIcon
                  sx={{
                    color: 'primary.main',
                    fontSize: 20,
                  }}
                />
                <Typography
                  sx={{
                    color: 'primary.main',
                    fontSize: 18,
                  }}
                >
                  Sources
                </Typography>
              </Stack>
              <Grid container spacing={1}>
                {renderData.sources.links.map((source, index) => (
                  <Grid item xs={6} key={source.title}>
                    <Card variant="outlined">
                      <Link
                        href={source.url}
                        target={'_blank'}
                        underline="none"
                      >
                        <Stack p={1} spacing={0.5}>
                          <Typography
                            fontSize={14}
                            color="text.primary"
                            noWrap
                            sx={{
                              p: 0,
                            }}
                          >
                            {source.title}
                          </Typography>
                          <Stack
                            direction={'row'}
                            alignItems="center"
                            spacing={0.5}
                          >
                            <Box
                              width={16}
                              height={16}
                              borderRadius="50%"
                              overflow="hidden"
                              flexShrink={0}
                            >
                              <img
                                src={source.favicon}
                                alt={source?.from}
                                width="100%"
                                height="100%"
                              />
                            </Box>
                            <Typography
                              fontSize={12}
                              color="text.secondary"
                              noWrap
                            >
                              {source?.from}
                            </Typography>
                            <Typography
                              fontSize={12}
                              color="text.secondary"
                              flexShrink={0}
                            >
                              · {index + 1}
                            </Typography>
                          </Stack>
                        </Stack>
                      </Link>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Stack>
          ) : null}
          {isWaitFirstAIResponseText ? (
            <Grid container spacing={1}>
              {Array(SEARCH_WITH_AI_DEFAULT_CRAWLING_LIMIT)
                .fill('')
                .map((_, index) => (
                  <Grid item xs={6} key={index}>
                    <Skeleton variant="rounded" width={'100%'} height={60} />
                  </Grid>
                ))}
            </Grid>
          ) : (
            <Stack spacing={1}>
              {renderData.isWriting ? (
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
                  <ReadIcon
                    sx={{
                      color: 'primary.main',
                      fontSize: 20,
                    }}
                  />
                  <Typography
                    sx={{
                      color: 'primary.main',
                      fontSize: 18,
                      lineHeight: '20px',
                    }}
                  >
                    Answer
                  </Typography>
                </Stack>
              )}
              <div
                className={`markdown-body ${
                  isDarkMode ? 'markdown-body-dark' : ''
                }`}
              >
                <CustomMarkdown>{renderData.answer}</CustomMarkdown>
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
export default SidebarAIMessage
