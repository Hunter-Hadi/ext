import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { FC, useEffect, useState } from 'react'
import FormControl from '@mui/material/FormControl'
import Switch from '@mui/material/Switch'
import CloseAlert from '@/components/CloseAlert'
import Box from '@mui/material/Box'
import Browser from 'webextension-polyfill'
import useCommands from '@/hooks/useCommands'
import { newShortcutHint } from '@/features/contextMenu/utils/selectionHelper'

const ImageUrl = Browser.runtime.getURL(
  `/assets/USE_CHAT_GPT_AI/images/settings/shortcut-hint-example.png`,
)

const ChatGPTGmailAssistantSetting: FC<{
  defaultValue?: boolean
  onChange?: (value: boolean) => void
}> = ({ defaultValue, onChange }) => {
  const { shortCutKey } = useCommands()
  const shortHint = newShortcutHint(shortCutKey || '⌘J')
  const [checked, setChecked] = useState<boolean>(defaultValue ?? true)
  const onceRef = React.useRef<number>(0)
  useEffect(() => {
    // skip first render
    if (onceRef.current < 2) {
      onceRef.current = onceRef.current + 1
      return
    }
    onChange && onChange(checked)
  }, [checked])
  return (
    <Stack spacing={2}>
      <Typography
        fontSize={20}
        fontWeight={700}
        color={'text.primary'}
        component={'h2'}
        id={'gmail-assistant'}
      >
        Shortcut hint
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
            }}
          />
          <Typography>Visible</Typography>
        </Stack>
      </FormControl>
      <Box
        sx={{
          position: 'relative',
        }}
      >
        {checked && (
          <Typography
            color={'rgba(0,0,0,0.6)'}
            position="absolute"
            left={42}
            top={10}
          >
            {shortHint}
          </Typography>
        )}
        <img
          style={{
            width: '100%',
          }}
          src={ImageUrl}
          alt={'Gmail Assistant'}
        />
      </Box>
    </Stack>
  )
}
export default ChatGPTGmailAssistantSetting
