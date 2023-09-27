import { ReadIcon } from '@/components/CustomIcon'

import {
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import React from 'react'
import { FC, useCallback, useState } from 'react'

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
// import SearchWithAIFooter from './SearchWithAIFooter'
import SearchWithAIHeader from './SearchWithAIHeader'

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
    status,
    completedAnswer,
    isAnswering,
    conversation,
    handleResetStatus,
    handleAskQuestion,
    handleStopGenerate,
  } = useSearchWithAICore(question, siteName)

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
      {/* <h1>{currentAIProvider}</h1>
      <h1>status: {status}</h1> */}
      <SearchWithAIHeader
        status={status}
        isAnswering={isAnswering}
        handleStopGenerate={handleStopGenerate}
        handleClose={handleClose}
        handleResetStatus={handleResetStatus}
      />

      <AIProviderBar
        isAnswering={!!conversation.writingMessage}
        onProviderChange={handleResetStatus}
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
        {status !== 'idle' && <QuestionTitle question={question} />}

        <AISearchSources />

        {status === 'answering' || status === 'waitingAnswer' ? (
          <AnswerLabelTitle loading />
        ) : null}

        {status === 'success' ? <AnswerLabelTitle loading={false} /> : null}

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

      {/* {status === 'success' && (
        <>
          <Divider />
          <SearchWithAIFooter handleAskQuestion={handleAskQuestion} />
        </>
      )} */}
    </Paper>
  )
}

function AnswerLabelTitle({ loading }: { loading: boolean }) {
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
      }}
    >
      {question}
    </Typography>
  )
}

export default AISearchContentCard
