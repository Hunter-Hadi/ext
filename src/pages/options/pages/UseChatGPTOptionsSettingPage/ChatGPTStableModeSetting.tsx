import React, { FC, useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Slider from '@mui/material/Slider'
import FormControl from '@mui/material/FormControl'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import LinearProgress, {
  LinearProgressProps,
} from '@mui/material/LinearProgress'
import CloseAlert from '@/components/CloseAlert'
import Browser from 'webextension-polyfill'
import { CHROME_EXTENSION_LOCAL_STOP_KEEP_CHAT_IFRAME_TIME_STAMP_SAVE_KEY } from '@/constants'
import dayjs from 'dayjs'
import useEffectOnce from '@/hooks/useEffectOnce'
import BulletList from '@/components/BulletList'
import { useFocus } from '@/hooks/useFocus'
import { sendLarkBotMessage } from '@/utils/larkBot'

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
  const showHoursOrMinutes =
    hours > 0
      ? `${hours} hour${hours > 1 ? 's' : ''}`
      : minutes > 1
      ? `${minutes} minutes`
      : '1 minute'
  return {
    formattedTime,
    timeLeft,
    isRunning: timeLeft > 0,
    showHoursOrMinutes,
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

const ChatGPTStableModeSetting: FC<{
  defaultValue?: number
  onChange?: (value: number) => void
}> = ({ defaultValue, onChange }) => {
  const [value, setValue] = useState(defaultValue || 30) // 分钟
  const [leftDuration, setLeftDuration] = useState(0) // 毫秒
  const [duration, setDuration] = useState(0) // 毫秒
  const { isRunning, formattedTime, timeLeft, showHoursOrMinutes } =
    useCountDown(leftDuration)
  const setStopTime = async () => {
    const setValue = value
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
  useFocus(() => {
    const update = async () => {
      try {
        const cache =
          (await Browser.storage.local.get(
            CHROME_EXTENSION_LOCAL_STOP_KEEP_CHAT_IFRAME_TIME_STAMP_SAVE_KEY,
          )) || {}
        const cacheTime =
          cache[
            CHROME_EXTENSION_LOCAL_STOP_KEEP_CHAT_IFRAME_TIME_STAMP_SAVE_KEY
          ]
        if (!cacheTime) {
          await Browser.storage.local.remove(
            CHROME_EXTENSION_LOCAL_STOP_KEEP_CHAT_IFRAME_TIME_STAMP_SAVE_KEY,
          )
          setLeftDuration(0)
          setDuration(0)
        }
      } catch (e) {
        console.error(e)
      }
    }
    update()
  })
  return (
    <>
      <Typography
        fontSize={20}
        fontWeight={700}
        color={'text.primary'}
        id={'chatgpt-stable-mode'}
        mb={2}
        component={'h2'}
      >
        ChatGPT stable mode
      </Typography>
      <CloseAlert icon={<></>} severity={'info'}>
        <Stack spacing={1}>
          <Typography fontSize={14} fontWeight={700} color={'text.primary'}>
            Benefits:
          </Typography>
          <BulletList
            textProps={{ fontSize: 14 }}
            textList={[
              'Reduced ChatGPT login interruptions',
              'Reduced ChatGPT network errors',
              'Reduced ChatGPT Cloudflare checks',
              'Reduced ChatGPT webpage refreshes',
            ]}
          />
          <Typography fontSize={14} fontWeight={700} color={'text.primary'}>
            Caveats:
          </Typography>
          <BulletList
            textProps={{ fontSize: 14 }}
            textList={[
              `We recommend enabling it only when you're experiencing frequent ChatGPT interruptions or network errors`,
            ]}
          />
        </Stack>
      </CloseAlert>
      <FormControl size="small" sx={{ my: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography>Disabled</Typography>
          <Switch
            checked={isRunning}
            onChange={async (event) => {
              if (event.target.checked) {
                await setStopTime()
                sendLarkBotMessage(
                  'Stable Mode Enabled',
                  `duration: ${value}`,
                  { uuid: 'dd385931-45f4-4de1-8e48-8145561b0f9d' },
                )
              } else {
                await stop()
              }
            }}
          />
          <Typography>Enabled</Typography>
        </Stack>
      </FormControl>
      {isRunning ? (
        <Typography fontSize={14} color={'text.primary'}>
          Stable Mode will be disabled in {showHoursOrMinutes}.
        </Typography>
      ) : (
        <Typography fontSize={14} color={'text.primary'}>
          Adjust the duration of automatic disabling for Stable Mode after it
          has been enabled.
        </Typography>
      )}
      {isRunning ? (
        <LinearProgressWithLabel
          value={(timeLeft / duration) * 100}
          label={formattedTime}
        />
      ) : (
        <MinutesSlider
          defaultValue={value}
          onChange={(newValue) => {
            setValue(newValue)
            onChange && onChange(newValue)
          }}
        />
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
      min={30}
      max={480}
    />
  )
}
export default ChatGPTStableModeSetting
