import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { FC, useEffect } from 'react'
import React from 'react'
import { useRecoilState } from 'recoil'

import { IAIForSearchStatus } from '@/features/searchWithAI/types'

import { AutoTriggerAskEnableAtom } from '../store'
import { endsWithQuestionMark } from '../utils'
import { ISearchWithAISettings } from '../utils/searchWithAISettings'

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

  if (status === 'stop') {
    return (
      <Button
        fullWidth
        variant='normalOutlined'
        startIcon={<SearchOutlinedIcon />}
        onClick={handleAsk}
      >
        Ask AI for this query
      </Button>
    )
  }

  if (status !== 'idle') {
    return null
  }

  if (triggerMode === 'manual') {
    return (
      <Button
        fullWidth
        variant='normalOutlined'
        startIcon={<SearchOutlinedIcon />}
        onClick={() => {
          // 兼容 开始是 manual，随后配置改成了 always 的情况
          // 这种情况也不再自动触发
          setAutoTriggerAskEnable(false)
          handleAsk()
        }}
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
          variant='normalOutlined'
          startIcon={<SearchOutlinedIcon />}
          onClick={handleAsk}
        >
          Ask AI for this query
        </Button>
        <Divider> OR </Divider>
        <Typography variant='body2' fontSize={14}>
          End your search with a question mark to get an AI response
          automatically.
        </Typography>
      </Stack>
    )
  }

  return <></>
}

export default AIAskTrigger
