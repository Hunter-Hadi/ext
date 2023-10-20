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
import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import isArray from 'lodash-es/isArray'

export const SidebarAIMessage: FC<{
  message: IAIResponseMessage
  isDarkMode?: boolean
}> = (props) => {
  const { message, isDarkMode } = props
  const isRichAIMessage = message.originalMessage !== undefined
  const renderData = useMemo(() => {
    const currentRenderData = {
      title: message.originalMessage?.metadata?.title,
      quickSearch: message.originalMessage?.metadata?.quickSearch,
      sources: message.originalMessage?.metadata?.sources,
      sourcesLoading:
        message.originalMessage?.metadata?.sources?.status === 'loading',
      answer: message.text,
      content: message.originalMessage?.content,
      messageIsComplete: !message.originalMessage?.metadata?.isComplete,
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

  return (
    <>
      {isRichAIMessage ? (
        <Stack spacing={2}>
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
          {renderData.quickSearch && (
            <Stack spacing={1}>
              <Stack direction={'row'} alignItems="center" spacing={1}>
                <Stack
                  alignItems={'center'}
                  justifyContent={'center'}
                  width={16}
                  height={16}
                >
                  <ContextMenuIcon
                    sx={{
                      color: 'primary.main',
                      fontSize: 24,
                    }}
                    icon={'Bolt'}
                  />
                </Stack>
                <Typography
                  sx={{
                    color: 'primary.main',
                    fontSize: 18,
                  }}
                >
                  Quick search
                </Typography>
              </Stack>
              <Stack spacing={1}>
                {renderData.quickSearch.map((item) => {
                  return (
                    <Stack key={item.status + item.title} spacing={0.5}>
                      <Stack
                        spacing={1}
                        direction={'row'}
                        alignItems={'center'}
                      >
                        <Stack
                          alignItems={'center'}
                          justifyContent={'center'}
                          width={16}
                          height={16}
                        >
                          {item.status === 'loading' &&
                          !renderData.messageIsComplete ? (
                            <CircularProgress size={16} />
                          ) : (
                            <ContextMenuIcon
                              sx={{
                                color: 'primary.main',
                                fontSize: 16,
                              }}
                              icon={item.icon}
                            />
                          )}
                        </Stack>
                        <Typography
                          fontSize={16}
                          color="text.primary"
                          noWrap
                          sx={{
                            p: 0,
                          }}
                        >
                          {item.title}
                        </Typography>
                      </Stack>
                      {item.value && (
                        <Stack
                          spacing={1}
                          direction={'row'}
                          alignItems={'center'}
                        >
                          <Stack
                            alignItems={'center'}
                            justifyContent={'center'}
                            width={16}
                            height={16}
                          />
                          {isArray(item.value) &&
                            item.value.map((tag) => {
                              return (
                                <Card
                                  key={tag}
                                  variant="outlined"
                                  sx={{ px: 1 }}
                                >
                                  <Typography
                                    fontSize={14}
                                    color={'text.primary'}
                                  >
                                    {tag}
                                  </Typography>
                                </Card>
                              )
                            })}
                          {typeof item.value === 'string' && (
                            <Card variant="outlined" sx={{ px: 1 }}>
                              <Typography fontSize={14} color={'text.primary'}>
                                {item.value}
                              </Typography>
                            </Card>
                          )}
                        </Stack>
                      )}
                    </Stack>
                  )
                })}
              </Stack>
            </Stack>
          )}
          {renderData.sources && (
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
              {renderData.sources.links && (
                <Grid
                  container
                  spacing={1}
                  sx={{
                    ml: `-8px!important`,
                  }}
                >
                  {renderData.sourcesLoading
                    ? Array(SEARCH_WITH_AI_DEFAULT_CRAWLING_LIMIT)
                        .fill('')
                        .map((_, index) => (
                          <Grid item xs={6} key={index}>
                            <Skeleton
                              variant="rounded"
                              width={'100%'}
                              height={60}
                            />
                          </Grid>
                        ))
                    : renderData.sources.links.map((source, index) => (
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
              )}
            </Stack>
          )}
          {renderData.content && (
            <Stack>
              {renderData.messageIsComplete ? (
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
              {isWaitFirstAIResponseText ? (
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
