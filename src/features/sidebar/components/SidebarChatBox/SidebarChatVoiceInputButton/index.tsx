import MicIcon from '@mui/icons-material/Mic'
import MicNoneOutlinedIcon from '@mui/icons-material/MicNoneOutlined'
import LoadingButton from '@mui/lab/LoadingButton'
import Box from '@mui/material/Box'
import { styled, SxProps } from '@mui/material/styles'
import React, { FC, useEffect, useMemo, useRef, useState } from 'react'
import { useAudioRecorder } from 'react-audio-voice-recorder'
import { useTranslation } from 'react-i18next'

import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import useSmoothConversationLoading from '@/features/chatgpt/hooks/useSmoothConversationLoading'
import { maxAISpeechToText } from '@/features/sidebar/components/SidebarChatBox/SidebarChatVoiceInputButton/speechToText'
import { getInputMediator } from '@/store/InputMediator'

export interface ISidebarChatVoiceInputButtonProps {
  sx?: SxProps
}

const ButtonWithPulse = styled(LoadingButton)({
  position: 'relative',
  padding: '5px',
  minWidth: 'unset',
  border: '1px solid',
  '&.voice-input--recording-pulse': {
    '&:before': {
      content: '""',
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      border: '1px solid',
      borderColor: 'rgba(255,255,255,.87)',
      boxSizing: 'border-box',
      pointerEvents: 'none',
      animation: 'MaxAIChatVoiceInputButtonPulse 2s infinite',
    },
    '@keyframes MaxAIChatVoiceInputButtonPulse': {
      '0%': {
        transform: 'scale(0)',
        opacity: 1,
      },
      '75%': {
        transform: 'scale(1.25)',
        opacity: 0,
      },
      '100%': {
        transform: '0',
        opacity: 0,
      },
    },
  },
})

// 最大录音时长
const MAX_AI_CHAT_VOICE_INPUT_MAX_RECORDING_TIMES = 60 // 秒

enum VoiceInputStatus {
  IDLE = 0,
  RECORDING = 1,
  TRANSCRIPTING = 2,
  PERMISSION_DENIED = 3,
  NO_SPEECH_DETECTED = 4,
  TIMEOUT = 5,
  BAD_REQUEST = 6,
}

/**
 * 是否是错误的语音输入状态
 * @param voiceInputStatus
 */
const isErrorVoiceInputStatus = (voiceInputStatus: VoiceInputStatus) => {
  return (
    voiceInputStatus === VoiceInputStatus.PERMISSION_DENIED ||
    voiceInputStatus === VoiceInputStatus.NO_SPEECH_DETECTED ||
    voiceInputStatus === VoiceInputStatus.TIMEOUT ||
    voiceInputStatus === VoiceInputStatus.BAD_REQUEST
  )
}

const SidebarChatVoiceInputButton: FC<ISidebarChatVoiceInputButtonProps> = (
  props,
) => {
  const { t } = useTranslation(['client'])
  const { sx } = props
  const testid = 'max-ai__actions__button--voice-input'
  const { smoothConversationLoading } = useSmoothConversationLoading()
  const [backendAPIError, setBackendAPIError] = useState<string>('')
  const [open, setOpen] = useState(false)
  const [voiceInputStatus, setVoiceInputStatus] = useState<VoiceInputStatus>(
    VoiceInputStatus.IDLE,
  )
  const {
    startRecording,
    stopRecording,
    recordingBlob,
    isRecording,
    mediaRecorder,
  } = useAudioRecorder(undefined, (error) => {
    // if (error.message === 'Permission denied'|| error.message === 'Permission denied by system') {
    // }
    setVoiceInputStatus(VoiceInputStatus.PERMISSION_DENIED)
  })
  // tooltip
  const memoizedTooltip = useMemo(() => {
    return {
      // 未使用
      [VoiceInputStatus.IDLE]: t(
        'client:sidebar__chat__voice_input__idle__tooltip',
      ),
      // 正在录音
      [VoiceInputStatus.RECORDING]: t(
        'client:sidebar__chat__voice_input__recording__tooltip',
      ),
      // 正在转录
      [VoiceInputStatus.TRANSCRIPTING]: t(
        'client:sidebar__chat__voice_input__transcripting__tooltip',
      ),
      // 权限被拒绝
      [VoiceInputStatus.PERMISSION_DENIED]: t(
        'client:sidebar__chat__voice_input__permission_denied__tooltip',
      ),
      // 未检测到语音
      [VoiceInputStatus.NO_SPEECH_DETECTED]: t(
        'client:sidebar__chat__voice_input__no_speech__tooltip',
      ),
      // 超时
      [VoiceInputStatus.TIMEOUT]: t(
        'client:sidebar__chat__voice_input__timeout__tooltip',
      ),
      // 服务器错误
      [VoiceInputStatus.BAD_REQUEST]: backendAPIError,
    }[voiceInputStatus]
  }, [voiceInputStatus, t, backendAPIError])

  // 是否显示tooltip
  const memoizedTooltipShow = useMemo(() => {
    return isErrorVoiceInputStatus(voiceInputStatus) || open
  }, [voiceInputStatus, open])

  const isTranscriptingRef = useRef(false)
  const voiceInputStatusRef = useRef(voiceInputStatus)
  const handleClick = () => {
    if (!isRecording) {
      startRecording()
      setVoiceInputStatus(VoiceInputStatus.RECORDING)
    } else {
      stopRecording()
      setVoiceInputStatus(VoiceInputStatus.TRANSCRIPTING)
    }
  }
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      if (!isRecording) {
        startRecording()
        setVoiceInputStatus(VoiceInputStatus.RECORDING)
      } else {
        stopRecording()
        setVoiceInputStatus(VoiceInputStatus.TRANSCRIPTING)
      }
    } else if (event.key === 'Escape') {
      stopRecording()
      setVoiceInputStatus(VoiceInputStatus.IDLE)
    }
  }
  const handleOpen = () => {
    setOpen(true)
  }
  const handleClose = () => {
    setOpen(false)
  }

  useEffect(() => {
    voiceInputStatusRef.current = voiceInputStatus
    // 超时和权限被拒绝和未检测到语音的状态显示3秒后消失
    if (isErrorVoiceInputStatus(voiceInputStatus)) {
      const timer = setTimeout(() => {
        setVoiceInputStatus((prevState) => {
          if (isErrorVoiceInputStatus(prevState)) {
            return VoiceInputStatus.IDLE
          }
          return prevState
        })
      }, 3000)
      return () => {
        clearTimeout(timer)
      }
    }
    if (voiceInputStatus !== VoiceInputStatus.BAD_REQUEST) {
      setBackendAPIError('')
    }
  }, [voiceInputStatus])

  // 超时和检测说话
  useEffect(() => {
    if (isRecording && mediaRecorder) {
      let times = MAX_AI_CHAT_VOICE_INPUT_MAX_RECORDING_TIMES
      const timeoutTimer = setInterval(() => {
        times--
        if (times <= 0 && isRecording) {
          stopRecording()
          setVoiceInputStatus((prevState) => {
            if (prevState === VoiceInputStatus.RECORDING) {
              return VoiceInputStatus.TRANSCRIPTING
            }
            return prevState
          })
        }
      }, 1000)
      const cancel = { canceled: false }
      detectSpeechInDuration(mediaRecorder.stream, 5, cancel) // 检测5秒内是否有说话
        .then((isSpeechDetected) => {
          console.log(
            isSpeechDetected ? 'Detected speech!' : 'No speech detected.',
          )
          if (!isSpeechDetected) {
            setVoiceInputStatus((prevState) =>
              prevState === 1 ? VoiceInputStatus.NO_SPEECH_DETECTED : prevState,
            )
            stopRecording()
          }
        })
        .catch((error) => {
          console.error('Error detecting speech:', error)
        })
      return () => {
        cancel.canceled = true
        clearTimeout(timeoutTimer)
      }
    }
  }, [mediaRecorder, stopRecording, isRecording])

  useEffect(() => {
    if (
      recordingBlob &&
      voiceInputStatus === VoiceInputStatus.TRANSCRIPTING &&
      !isTranscriptingRef.current
    ) {
      isTranscriptingRef.current = true
      const file = new File([recordingBlob], 'audio.webm', {
        type: 'audio/webm',
      })
      console.log(
        'recordingBlob',
        recordingBlob,
        (file.size / 1024 / 1024).toFixed(3),
        'MB',
      )
      // webm
      maxAISpeechToText(file)
        .then((result) => {
          if (result.status === 'success') {
            const text = result.data.speechText
            console.log('Speech to text:', text)
            const previousInputValue = getInputMediator(
              'chatBoxInputMediator',
            ).getInputValue()
            getInputMediator('chatBoxInputMediator').updateInputValue(
              previousInputValue + ' ' + text,
            )
            setVoiceInputStatus(VoiceInputStatus.IDLE)
          } else if (result.status === 'timeout') {
            console.error('Speech to text timeout.')
            setVoiceInputStatus(VoiceInputStatus.TIMEOUT)
          } else {
            if (result.error) {
              setBackendAPIError(result.error)
              setVoiceInputStatus(VoiceInputStatus.BAD_REQUEST)
            } else {
              setVoiceInputStatus(VoiceInputStatus.IDLE)
            }
          }
        })
        .catch()
        .finally(() => {
          isTranscriptingRef.current = false
        })
    }
  }, [recordingBlob])

  return (
    <Box>
      <TextOnlyTooltip
        arrow
        title={memoizedTooltip}
        open={memoizedTooltipShow}
        onOpen={handleOpen}
        onClose={handleClose}
      >
        <div>
          <ButtonWithPulse
            onKeyDown={handleKeyDown}
            tabIndex={-1}
            loading={
              smoothConversationLoading ||
              voiceInputStatus === VoiceInputStatus.TRANSCRIPTING
            }
            variant={isRecording ? 'contained' : 'outlined'}
            className={isRecording ? 'voice-input--recording-pulse' : ''}
            onClick={handleClick}
            id={`MaxAISidebarVoiceInputButton`}
            sx={sx}
            data-testid={testid}
            disabled={smoothConversationLoading}
          >
            {isRecording ? (
              <MicIcon
                sx={{
                  fontSize: '20px',
                }}
              />
            ) : (
              <MicNoneOutlinedIcon
                sx={{
                  fontSize: '20px',
                }}
              />
            )}
          </ButtonWithPulse>
        </div>
      </TextOnlyTooltip>
    </Box>
  )
}

const detectSpeechInDuration = async (
  stream: MediaStream,
  seconds: number,
  single: {
    canceled: boolean
  } = { canceled: false },
): Promise<boolean> => {
  // 阈值
  const silenceThreshold = 10
  const range = new Set<number>()
  // 创建一个音频上下文
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext
  const audioContext = new AudioContext()

  // 创建一个媒体流源节点
  const mediaStreamSource = audioContext.createMediaStreamSource(stream)

  // 创建分析器节点
  const analyser = audioContext.createAnalyser()
  analyser.fftSize = 2048 // 设置FFT分辨率

  // 将媒体流源节点连接到分析器节点
  mediaStreamSource.connect(analyser)

  // 创建一个数据缓冲区来存储频率数据（大小与FFT大小的一半相同）
  const dataArray = new Uint8Array(analyser.frequencyBinCount)

  // 记录是否有声音的标志
  let detected = false

  // 定义检查声音活动的函数
  const detectSpeech = () => {
    // 填充数据缓冲区
    analyser.getByteTimeDomainData(dataArray)

    // 检查缓冲区内是否有声音活动
    for (let i = 0; i < dataArray.length; i++) {
      range.add(dataArray[i])
      // console.log(
      //   `detectSpeechInDuration ${audioContext.currentTime}`,
      //   Array.from(range),
      // )
      if (
        dataArray[i] > 128 + silenceThreshold ||
        dataArray[i] < 128 - silenceThreshold
      ) {
        detected = true
        break
      }
    }
  }

  // 设定检测时间
  const startTime = audioContext.currentTime
  const duration = seconds

  return new Promise((resolve) => {
    const checkSpeech = () => {
      // 执行检测
      detectSpeech()

      // 如果已经检测到或者超时, 或者取消操作
      if (
        detected ||
        audioContext.currentTime - startTime >= duration ||
        single.canceled
      ) {
        // 关闭音频上下文以节省资源
        audioContext.close()
        resolve(detected)

        // 如果需要停止媒体流，可以在外部处理，这里不再重复关闭
        // stream.getTracks().forEach((track) => track.stop());
        return
      }
      // 计划下一次检查
      setTimeout(checkSpeech, 100)
    }
    checkSpeech()
  })
}

export default SidebarChatVoiceInputButton
