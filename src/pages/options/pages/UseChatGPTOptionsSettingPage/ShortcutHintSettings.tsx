import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { FC, useEffect, useState } from 'react'
import FormControl from '@mui/material/FormControl'
import Switch from '@mui/material/Switch'
import CloseAlert from '@/components/CloseAlert'
import Box from '@mui/material/Box'
import Browser from 'webextension-polyfill'
import { useChromeExtensionButtonSettings } from '@/background/utils/buttonSettings'

const hideImageUrl = Browser.runtime.getURL(
  `/assets/USE_CHAT_GPT_AI/images/gmail/gmail-assistant-hidden.png`,
)
const showImageUrl = Browser.runtime.getURL(
  `/assets/USE_CHAT_GPT_AI/images/gmail/gmail-assistant-visible.png`,
)

const ChatGPTGmailAssistantSetting: FC<{
  defaultValue?: boolean
  onChange?: (value: boolean) => void
}> = () => {
  const { buttonSettings, updateButtonSettings } =
    useChromeExtensionButtonSettings()
  const [checked, setChecked] = useState<boolean | undefined>(undefined)
  useEffect(() => {
    if (buttonSettings?.gmailButton) {
      setChecked(buttonSettings.gmailButton.visibility.whitelist.length > 0)
    }
  }, [buttonSettings])
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
      {typeof checked !== 'undefined' && (
        <FormControl size="small">
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography>Hidden</Typography>
            <Switch
              defaultChecked={checked}
              onChange={async (event) => {
                if (buttonSettings?.gmailButton) {
                  await updateButtonSettings('gmailButton', {
                    visibility: {
                      isWhitelistMode: true,
                      whitelist: event.target.checked
                        ? ['mail.google.com']
                        : [],
                      blacklist: [],
                    },
                    contextMenu: buttonSettings.gmailButton.contextMenu,
                  })
                  setChecked(event.target.checked)
                }
              }}
            />
            <Typography>Visible</Typography>
          </Stack>
        </FormControl>
      )}
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
