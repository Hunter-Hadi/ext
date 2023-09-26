import { Button, Divider, Stack, Typography } from '@mui/material'
import { FC, useEffect } from 'react'
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import { endsWithQuestionMark } from '../utils'
import React from 'react'
import { ISearchWithAISettings } from '../utils/searchWithAISettings'
import { IAIForSearchStatus } from '../hooks/useSearchWithAICore'
import { useRecoilState } from 'recoil'
import { AutoTriggerAskEnableAtom } from '../store'

interface IProps {
  status: IAIForSearchStatus
  triggerMode?: ISearchWithAISettings['triggerMode']
  question: string
  handleAsk: () => void
}

const AIAskTrigger: FC<IProps> = ({
  status,
  question,
  triggerMode = 'manual',
  handleAsk,
}) => {
  const [autoTriggerAskEnable, setAutoTriggerAskEnable] = useRecoilState(
    AutoTriggerAskEnableAtom,
  )

  useEffect(() => {
    // 自动触发时 只允许触发一次
    if (triggerMode === 'always' && autoTriggerAskEnable) {
      setAutoTriggerAskEnable(false)
      setTimeout(handleAsk, 100)
      // handleAsk()
    }
  }, [triggerMode, autoTriggerAskEnable])

  useEffect(() => {
    // 带有 question-mark 自动触发时 只允许触发一次
    if (
      triggerMode === 'question-mask' &&
      endsWithQuestionMark(question) &&
      autoTriggerAskEnable
    ) {
      setAutoTriggerAskEnable(false)
      setTimeout(handleAsk, 100)
    }
  }, [triggerMode, question, autoTriggerAskEnable])

  if (status !== 'idle') {
    return null
  }

  if (triggerMode === 'manual') {
    return (
      <Button
        fullWidth
        variant="normalOutlined"
        startIcon={<SearchOutlinedIcon />}
        onClick={handleAsk}
      >
        Ask AI for this query
      </Button>
    )
  }

  // question-mask 模式时，又没有达到条件显示提示
  if (triggerMode === 'question-mask' && !endsWithQuestionMark(question)) {
    return (
      <Stack spacing={2}>
        <Button
          fullWidth
          variant="normalOutlined"
          startIcon={<SearchOutlinedIcon />}
          onClick={handleAsk}
        >
          Ask AI for this query
        </Button>
        <Divider> OR</Divider>
        <Typography variant="body2">
          End your search with a question mark to get an AI response
          automatically.
        </Typography>
      </Stack>
    )
  }

  return <></>
}

export default AIAskTrigger
