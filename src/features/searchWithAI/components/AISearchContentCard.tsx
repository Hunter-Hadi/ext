import {
  Button,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import React from 'react'
import { FC, useCallback, useState } from 'react'
import StopOutlinedIcon from '@mui/icons-material/StopOutlined'

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
import SearchWithAIGALoader from './SearchWithAIGALoader'
import SearchWithAIFooter from './SearchWithAIFooter'
import SearchWithAIHeader from './SearchWithAIHeader'
import { ReadIcon } from './SearchWithAIIcons'
import { SEARCH_WITH_AI_APP_NAME } from '../constants'

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
    loading,
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
      <SearchWithAIHeader
        status={status}
        isAnswering={isAnswering}
        handleStopGenerate={handleStopGenerate}
        handleClose={handleClose}
        handleResetStatus={handleResetStatus}
      />

      <AIProviderBar
        disabled={loading}
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

      {SEARCH_WITH_AI_APP_NAME === 'webchatgpt' && status === 'success' ? (
        <>
          <Divider />
          <SearchWithAIFooter handleAskQuestion={handleAskQuestion} />
        </>
      ) : null}

      {/* ga loader */}
      {status === 'answering' || status === 'success' ? (
        <SearchWithAIGALoader />
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
