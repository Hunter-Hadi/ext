import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import React, { FC, useEffect } from 'react'
import Browser from 'webextension-polyfill'

import DevContent from '@/components/DevContent'
import { BACKGROUND_SEND_TEXT_SPEED_SETTINGS } from '@/constants'

const DevTextSendControl: FC = () => {
  const [interval, setInterval] = React.useState('')
  const [rate, setRate] = React.useState('')
  useEffect(() => {
    Browser.storage.local
      .get(BACKGROUND_SEND_TEXT_SPEED_SETTINGS)
      .then((res) => {
        const settings = res[BACKGROUND_SEND_TEXT_SPEED_SETTINGS] || {}
        setInterval(settings.interval || '50')
        setRate(settings.rate || '0.5')
      })
  }, [])
  return (
    <DevContent>
      <Stack direction={'row'} alignItems={'center'} spacing={1} px={1}>
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
          variant={'outlined'}
          onClick={async () => {
            await Browser.storage.local.set({
              [BACKGROUND_SEND_TEXT_SPEED_SETTINGS]: {
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
