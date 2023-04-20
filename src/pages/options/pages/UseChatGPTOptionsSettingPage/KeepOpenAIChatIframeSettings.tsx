import React, { FC, useEffect, useState } from 'react'
import {
  Button,
  Box,
  LinearProgress,
  LinearProgressProps,
  Slider,
  Typography,
} from '@mui/material'
import CloseAlert from '@/components/CloseAlert'
import Browser from 'webextension-polyfill'
import { CHROME_EXTENSION_LOCAL_STOP_KEEP_CHAT_IFRAME_TIME_STAMP_SAVE_KEY } from '@/types'
import dayjs from 'dayjs'
import useEffectOnce from '@/hooks/useEffectOnce'

const useCountDown = (duration: number) => {
  const [timeLeft, setTimeLeft] = useState(duration)

  useEffect(() => {
    setTimeLeft(duration)
  }, [duration])

  useEffect(() => {
    let interval: any = null

    if (timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1000)
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [timeLeft])

  const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((timeLeft / (1000 * 60)) % 60)
  const seconds = Math.floor((timeLeft / 1000) % 60)

  const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`

  return {
    formattedTime,
    timeLeft,
    isRunning: timeLeft > 0,
  }
}

function LinearProgressWithLabel(
  props: LinearProgressProps & { value: number; label?: string },
) {
  return (
    <Box sx={{ display: 'flex', my: 2, alignItems: 'center' }}>
      <Box sx={{ minWidth: 64 }}>
        <Typography variant="body2" color="text.secondary">
          {props.label || `${Math.round(props.value)}%`}
        </Typography>
      </Box>
      <Box sx={{ width: '100%', mr: 1 }}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
    </Box>
  )
}

const KeepOpenAIChatIframeSettings: FC = () => {
  const [value, setValue] = useState(30) // 分钟
  const [leftDuration, setLeftDuration] = useState(0) // 毫秒
  const [duration, setDuration] = useState(0) // 毫秒
  const { isRunning, formattedTime, timeLeft } = useCountDown(leftDuration)
  const setStopTime = async () => {
    // const setValue = value
    const setValue = 2
    await Browser.storage.local.set({
      [CHROME_EXTENSION_LOCAL_STOP_KEEP_CHAT_IFRAME_TIME_STAMP_SAVE_KEY]:
        JSON.stringify({
          start: dayjs().utc(),
          end: dayjs().utc().add(setValue, 'minutes'),
        }),
    })
    setDuration(setValue * 60 * 1000)
    setLeftDuration(setValue * 60 * 1000)
  }
  const stop = async () => {
    await Browser.storage.local.remove(
      CHROME_EXTENSION_LOCAL_STOP_KEEP_CHAT_IFRAME_TIME_STAMP_SAVE_KEY,
    )
    setValue(30)
    setLeftDuration(0)
    setDuration(0)
  }
  useEffectOnce(() => {
    const getCacheTime = async () => {
      try {
        const cache =
          (await Browser.storage.local.get(
            CHROME_EXTENSION_LOCAL_STOP_KEEP_CHAT_IFRAME_TIME_STAMP_SAVE_KEY,
          )) || {}
        const cacheTime =
          cache[
            CHROME_EXTENSION_LOCAL_STOP_KEEP_CHAT_IFRAME_TIME_STAMP_SAVE_KEY
          ]
        if (cacheTime) {
          const { start, end } = JSON.parse(cacheTime)
          const cacheTimeStartValueDayjs = dayjs(start).utc()
          const cacheTimeEndValueDayjs = dayjs(end).utc()
          const originalDuration = cacheTimeEndValueDayjs.diff(
            cacheTimeStartValueDayjs,
            'seconds',
          )
          const currentDuration = cacheTimeEndValueDayjs.diff(
            dayjs().utc(),
            'seconds',
          )
          if (currentDuration > 0) {
            setLeftDuration(currentDuration * 1000)
            setDuration(originalDuration * 1000)
          }
        }
      } catch (e) {
        console.error(e)
      }
    }
    getCacheTime()
  })
  return (
    <>
      <Typography
        fontSize={20}
        fontWeight={700}
        color={'text.primary'}
        id={'text-select-popup'}
        mb={2}
      >
        Keep iframe Chat Settings
      </Typography>
      <CloseAlert severity={'warning'}>
        <Typography fontSize={14} color={'text.primary'}>
          {`If you select "Auto", the Al will respond in the same language variety or dialect as the selected text.`}
        </Typography>
      </CloseAlert>
      {isRunning ? (
        <LinearProgressWithLabel
          value={(timeLeft / duration) * 100}
          label={formattedTime}
        />
      ) : (
        <MinutesSlider defaultValue={30} onChange={setValue} />
      )}
      <p>
        {timeLeft} / {duration}
      </p>
      <p>{formattedTime}</p>
      {isRunning ? (
        <Button
          disabled={value === 0}
          variant={'contained'}
          color={'primary'}
          sx={{ mt: 2, width: 160 }}
          onClick={stop}
        >
          Stop Keep Chat
        </Button>
      ) : (
        <Button
          disabled={value === 0}
          variant={'outlined'}
          color={'primary'}
          sx={{ mt: 2, width: 160 }}
          onClick={setStopTime}
        >
          Keep Chat Open
        </Button>
      )}
    </>
  )
}

const marks = [
  {
    value: 0,
    label: '0',
  },
  {
    value: 30,
    label: '0.5h',
  },
  {
    value: 60,
    label: '1h',
  },
  {
    value: 90,
    label: '1.5h',
  },
  {
    value: 120,
    label: '2h',
  },
  {
    value: 150,
    label: '2.5h',
  },
  {
    value: 180,
    label: '3h',
  },
  {
    value: 210,
    label: '3.5h',
  },
  {
    value: 240,
    label: '4h',
  },
  {
    value: 270,
    label: '4.5h',
  },
  {
    value: 300,
    label: '5h',
  },
  {
    value: 330,
    label: '5.5h',
  },
  {
    value: 360,
    label: '6h',
  },
  {
    value: 390,
    label: '6.5h',
  },
  {
    value: 420,
    label: '7h',
  },
  {
    value: 450,
    label: '7.5h',
  },
  {
    value: 480,
    label: '8h',
  },
]

const MinutesSlider: FC<{
  disabled?: boolean
  defaultValue?: number
  onChange?: (newValue: number) => void
}> = (props) => {
  const { defaultValue, onChange, disabled } = props
  const [value, setValue] = useState<number>(defaultValue || 30)
  return (
    <Slider
      valueLabelFormat={(value) => (value > 0 ? `${value} minutes` : '0')}
      disabled={disabled}
      sx={{ my: 2 }}
      value={value}
      onChange={(event, newValue) => {
        setValue(newValue as number)
        onChange && onChange(newValue as number)
      }}
      valueLabelDisplay="auto"
      step={30}
      marks={marks}
      min={0}
      max={480}
    />
  )
}
export default KeepOpenAIChatIframeSettings
