import React, { FC, useEffect, useState } from 'react'
import SettingsFeatureCardLayout from '@/pages/settings/layout/SettingsFeatureCardLayout'
import { useTranslation } from 'react-i18next'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import LinearProgress, {
  LinearProgressProps,
} from '@mui/material/LinearProgress'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Browser from 'webextension-polyfill'
import { CHROME_EXTENSION_LOCAL_STOP_KEEP_CHAT_IFRAME_TIME_STAMP_SAVE_KEY } from '@/constants'
import dayjs from 'dayjs'
import useEffectOnce from '@/hooks/useEffectOnce'
import { useFocus } from '@/hooks/useFocus'
import { sendLarkBotMessage } from '@/utils/larkBot'
import Switch from '@mui/material/Switch'
import ListItemButton from '@mui/material/ListItemButton'
import Stack from '@mui/material/Stack'
import PermissionWrapper from '@/features/auth/components/PermissionWrapper'
import Slider from '@mui/material/Slider'

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

  const formattedTime = `${hours
    .toString()
    .padStart(2, '0')}:${minutes
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

const LinearProgressWithLabel: FC<
  LinearProgressProps & { value: number; label?: string }
> = (props) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
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

const FeatureChatGPTStableModeCard: FC = () => {
  const { t } = useTranslation(['settings', 'common'])
  const [value, setValue] = useState(30) // 默认30分钟
  const [leftDuration, setLeftDuration] = useState(0) // 毫秒
  const [duration, setDuration] = useState(0) // 毫秒
  const {
    isRunning,
    formattedTime,
    timeLeft,
    showHoursOrMinutes,
  } = useCountDown(leftDuration)
  const setStopTime = async () => {
    const durationValue = value
    await Browser.storage.local.set({
      [CHROME_EXTENSION_LOCAL_STOP_KEEP_CHAT_IFRAME_TIME_STAMP_SAVE_KEY]: JSON.stringify(
        {
          start: dayjs().utc(),
          end: dayjs().utc().add(durationValue, 'minutes'),
        },
      ),
    })
    setDuration(durationValue * 60 * 1000)
    setLeftDuration(durationValue * 60 * 1000)
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
    <SettingsFeatureCardLayout
      title={t('settings:feature_card__chatgpt_stable_mode__title')}
      id={'chatgpt-stable-mode'}
    >
      <List
        sx={{
          bgcolor: (theme) =>
            theme.palette.mode === 'dark'
              ? 'rgb(32, 33, 36)'
              : 'rgb(255,255,255)',
          p: '0 !important',
          borderRadius: '4px',
          border: (t) =>
            t.palette.mode === 'dark'
              ? '1px solid rgba(255, 255, 255, 0.12)'
              : '1px solid rgba(0, 0, 0, 0.12)',
          '& > * + .MuiListItem-root': {
            borderTop: '1px solid',
            borderColor: 'customColor.borderColor',
          },
        }}
      >
        <ListItemButton
          onClick={async () => {
            const newChecked = !isRunning
            if (newChecked) {
              await setStopTime()
              sendLarkBotMessage('Stable Mode Enabled', `duration: ${value}`, {
                uuid: 'dd385931-45f4-4de1-8e48-8145561b0f9d',
              })
            } else {
              await stop()
            }
          }}
        >
          <ListItemText
            primary={t(
              'settings:feature_card__chatgpt_stable_mode__field_chatgpt_stable_mode__switch_title',
            )}
          />
          <Switch checked={isRunning} />
        </ListItemButton>
        <ListItem>
          <ListItemText
            primary={
              isRunning
                ? t(
                    'settings:feature_card__chatgpt_stable_mode__field_chatgpt_stable_mode__slider_running_title',
                  ) + ` ${showHoursOrMinutes}`
                : t(
                    'settings:feature_card__chatgpt_stable_mode__field_chatgpt_stable_mode__slider_title',
                  )
            }
            secondary={
              <Stack mt={1}>
                {isRunning ? (
                  <LinearProgressWithLabel
                    value={(timeLeft / duration) * 100}
                    label={formattedTime}
                  />
                ) : (
                  <Stack px={2}>
                    <MinutesSlider
                      defaultValue={value}
                      onChange={(newValue) => {
                        setValue(newValue)
                      }}
                    />
                  </Stack>
                )}
              </Stack>
            }
          />
        </ListItem>
      </List>
    </SettingsFeatureCardLayout>
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
    <PermissionWrapper
      allowedRoles={['elite', 'pro', 'pro_gift', 'new_user']}
      sceneType={'CHATGPT_STABLE_MODE'}
      onPermission={async (currentPlan, cardSettings, [event, newValue]) => {
        if (newValue > 30) {
          if (value > 30) {
            // 重置回30分钟
            setValue(30)
            onChange && onChange(30)
          }
          return {
            success: false,
          }
        }
        return {
          success: true,
        }
      }}
    >
      <Slider
        valueLabelFormat={(value) => (value > 0 ? `${value} minutes` : '0')}
        disabled={disabled}
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
    </PermissionWrapper>
  )
}
export default FeatureChatGPTStableModeCard
