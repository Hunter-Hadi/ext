import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { FC } from 'react'
import FormControl from '@mui/material/FormControl'
import Switch from '@mui/material/Switch'
import CloseAlert from '@/components/CloseAlert'
import Box from '@mui/material/Box'
import Browser from 'webextension-polyfill'

const hideImageUrl = Browser.runtime.getURL(
  `/assets/USE_CHAT_GPT_AI/images/gmail/gmail-assistant-hidden.png`,
)
const showImageUrl = Browser.runtime.getURL(
  `/assets/USE_CHAT_GPT_AI/images/gmail/gmail-assistant-visible.png`,
)
const ChatGPTGmailAssistantSetting: FC<{
  defaultValue?: boolean
  onChange?: (value: boolean) => void
}> = ({ defaultValue, onChange }) => {
  const [checked, setChecked] = React.useState(defaultValue)
  return (
    <Stack spacing={2}>
      <Typography
        fontSize={20}
        fontWeight={700}
        color={'text.primary'}
        component={'h2'}
        id={'gmail-assistant'}
      >
        Gmail Assistant
      </Typography>
      <CloseAlert icon={<></>} severity={'info'}>
        <Stack spacing={1}>
          <Typography fontSize={14} color={'text.primary'}>
            Change visibility
          </Typography>
        </Stack>
      </CloseAlert>
      <FormControl size="small">
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography>Hidden</Typography>
          <Switch
            defaultChecked={checked}
            onChange={(event) => {
              setChecked(event.target.checked)
              onChange && onChange(event.target.checked)
            }}
          />
          <Typography>Visible</Typography>
        </Stack>
      </FormControl>
      <Box
        sx={{
          p: 2,
          borderRadius: '4px',
          border: '1px solid',
          borderColor: 'customColor.borderColor',
          position: 'relative',
        }}
      >
        <img
          style={{
            width: '100%',
          }}
          src={checked ? showImageUrl : hideImageUrl}
          alt={'Gmail Assistant'}
        />
      </Box>
    </Stack>
  )
}
export default ChatGPTGmailAssistantSetting
