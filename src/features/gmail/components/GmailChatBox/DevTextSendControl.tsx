import React, { FC, useEffect } from 'react'
import DevContent from '@/components/DevContent'
import { Button, Stack, TextField } from '@mui/material'
import Browser from 'webextension-polyfill'
import { TEMP_SEND_TEXT_SETTINGS } from '@/types'

const DevTextSendControl: FC = () => {
  const [interval, setInterval] = React.useState('')
  const [rate, setRate] = React.useState('')
  useEffect(() => {
    Browser.storage.local.get(TEMP_SEND_TEXT_SETTINGS).then((res) => {
      const settings = res[TEMP_SEND_TEXT_SETTINGS] || {}
      setInterval(settings.interval || '100')
      setRate(settings.rate || '0.3')
    })
  }, [])
  return (
    <DevContent>
      <Stack direction={'row'} alignItems={'center'} spacing={1}>
        <TextField
          label={'interval'}
          size={'small'}
          value={interval}
          onChange={(e) => setInterval(e.target.value)}
        ></TextField>
        <TextField
          label={'rate'}
          size={'small'}
          value={rate}
          onChange={(e) => setRate(e.target.value)}
        ></TextField>
        <Button
          onClick={async () => {
            await Browser.storage.local.set({
              [TEMP_SEND_TEXT_SETTINGS]: {
                interval,
                rate,
              },
            })
          }}
        >
          Save
        </Button>
      </Stack>
    </DevContent>
  )
}
export default DevTextSendControl
