import StopOutlinedIcon from '@mui/icons-material/StopOutlined'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { useMemo } from 'react'
import { FC, useCallback, useState } from 'react'
import { v4 as uuidV4 } from 'uuid'

import { IAIResponseMessage } from '@/features/indexed_db/conversations/models/Message'
import useSearchWithAISources from '@/features/searchWithAI/hooks/useSearchWithAISources'

import useSearchWithAICore from '../hooks/useSearchWithAICore'
import useSearchWithAISettings from '../hooks/useSearchWithAISettings'
import useSearchWithProvider from '../hooks/useSearchWithProvider'
import { ISearchPageKey } from '../utils/SearchPageAdapter'
import AIAskTrigger from './AIAskTrigger'
import AIProviderBar from './AIProviderBar'
import AIResponseError from './AIResponseError'
import AIResponseMessage from './AIResponseMessage'
import AISearchingLoading from './AISearchingLoading'
import AISearchSources from './AISearchSources'
import SearchWithAIFooter from './SearchWithAIFooter'
import SearchWithAIHeader from './SearchWithAIHeader'
import { ReadIcon } from './SearchWithAIIcons'

interface IProps {
  question: string
  isDarkMode?: boolean
  siteName: ISearchPageKey
}

const AISearchContentCard: FC<IProps> = ({
  question,
  isDarkMode,
  siteName,
}) => {
  const [show, setShow] = useState(true)

  const { searchWithAISettings } = useSearchWithAISettings()

  const { loading: providerLoading } = useSearchWithProvider()

  const triggerMode = searchWithAISettings.triggerMode
  const currentAIProvider = searchWithAISettings.aiProvider

  const {
    // loading,
    status,
    completedAnswer,
    isAnswering,
    conversation,
    handleResetStatus,
    handleAskQuestion,
    handleStopGenerate,
  } = useSearchWithAICore(question, siteName)
  const { sources } = useSearchWithAISources()
  const memoAIResponseMessage = useMemo(() => {
    if (status === 'success') {
      const messageId = uuidV4()
      return {
        messageId,
        parentMessageId: '',
        text: question,
        type: 'ai',
        originalMessage: {
          includeHistory: false,
          id: messageId,
          create_time: new Date().toISOString(),
          content: {
            text: completedAnswer,
            contentType: 'text',
          },
          status: 'complete',
          metadata: {
            shareType: 'search',
            sourceWebpage: {
              url: window.location.href,
              title: document.title,
            },
            isComplete: true,
            copilot: {
              title: {
                title: 'Quick search',
                titleIcon: 'Bult',
              },
              steps: [
                {
                  title: 'Understanding question',
                  status: 'complete',
                  icon: 'CheckCircle',
                },
                {
                  title: 'Searching web',
                  status: 'complete',
                  icon: 'Search',
                  value: question,
                },
              ],
            },
            title: {
              title: question,
            },
            sources: {
              status: 'complete',
              links: sources as any,
            },
          },
        },
      } as IAIResponseMessage
    }
    return null
  }, [sources, status, completedAnswer, question])
  const handleClose = useCallback(() => {
    setShow(false)
  }, [])

  if (!show || !searchWithAISettings.loaded || !currentAIProvider) return null

  return (
    <Paper
      variant="outlined"
      sx={{
        mb: 2.5,
        bgcolor: 'transparent',
      }}
    >
      <SearchWithAIHeader
        status={status}
        isAnswering={isAnswering}
        handleStopGenerate={handleStopGenerate}
        handleClose={handleClose}
        handleResetStatus={handleResetStatus}
      />

      <AIProviderBar
        disabled={isAnswering}
        onProviderChange={async () => {
          await handleStopGenerate()
          await handleResetStatus()
        }}
        sx={{ mb: 1 }}
      />

      <Divider />

      <Stack
        sx={{
          px: 2,
          pb: 2,
          pt: 3,
        }}
      >
        {status !== 'idle' && status !== 'stop' ? (
          <QuestionTitle question={question} />
        ) : null}

        <AISearchSources />

        {status === 'answering' || status === 'waitingAnswer' ? (
          <AnswerLabelTitle loading handleStopGenerate={handleStopGenerate} />
        ) : null}

        {status === 'success' ? (
          <AnswerLabelTitle
            loading={false}
            handleStopGenerate={handleStopGenerate}
          />
        ) : null}

        {!providerLoading && (
          <AIAskTrigger
            status={status}
            triggerMode={triggerMode}
            question={question}
            handleAsk={handleAskQuestion}
          />
        )}

        {status === 'error' && conversation.errorMessage && (
          <AIResponseError
            message={conversation.errorMessage}
            provider={currentAIProvider}
            handleAsk={handleAskQuestion}
            isDarkMode={isDarkMode}
          />
        )}

        {status === 'success' && completedAnswer && (
          <AIResponseMessage
            message={completedAnswer}
            isDarkMode={isDarkMode}
          />
        )}

        {status === 'answering' && conversation.writingMessage && (
          <AIResponseMessage
            message={conversation.writingMessage}
            isDarkMode={isDarkMode}
          />
        )}

        {status === 'waitingAnswer' && <AISearchingLoading />}
      </Stack>

      {status === 'success' ? (
        <>
          <Divider />
          <SearchWithAIFooter
            aiMessage={memoAIResponseMessage}
            handleAskQuestion={handleAskQuestion}
            aiProvider={currentAIProvider}
          />
        </>
      ) : null}
    </Paper>
  )
}

function AnswerLabelTitle({
  loading,
  handleStopGenerate,
}: {
  loading: boolean
  handleStopGenerate: () => void
}) {
  if (loading) {
    return (
      <Stack direction={'row'} alignItems="center" spacing={1} mb={1}>
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

        <Button
          startIcon={<StopOutlinedIcon fontSize="inherit" />}
          color="inherit"
          size="small"
          onClick={handleStopGenerate}
          sx={{
            ml: 'auto !important',
          }}
        >
          Stop generating
        </Button>
      </Stack>
    )
  }

  return (
    <Stack direction={'row'} alignItems="center" spacing={1} mb={1}>
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
  )
}

function QuestionTitle({ question }: { question: string }) {
  return (
    <Typography
      sx={{
        fontSize: 28,
        lineHeight: 1.4,
        fontWeight: 500,
        mb: 3,
        overflowWrap: 'break-word',
      }}
    >
      {question}
    </Typography>
  )
}

export default AISearchContentCard
