import Stack from '@mui/material/Stack'
import Link from '@mui/material/Link'
import {
  APP_USE_CHAT_GPT_HOST,
  CHROME_EXTENSION_HOMEPAGE_URL,
  isEzMailApp,
} from '@/types'
import { EzMailAIIcon, UseChatGptIcon } from '@/components/CustomIcon'
import Typography from '@mui/material/Typography'
import TooltipButton from '@/components/TooltipButton'
import { chromeExtensionClientOpenPage, hideChatBox } from '@/utils'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import React, { FC } from 'react'
import useCommands from '@/hooks/useCommands'

const ChatBoxHeader: FC = () => {
  const { shortCutKey } = useCommands()
  return (
    <Stack
      flexDirection={'row'}
      flexShrink={0}
      mt={1}
      height={44}
      gap={1}
      alignItems={'center'}
      px={1}
    >
      <Link
        sx={{
          flexShrink: 0,
          textDecoration: 'none!important',
        }}
        href={
          isEzMailApp
            ? CHROME_EXTENSION_HOMEPAGE_URL + '?invite=CHROME_EXTENSION'
            : APP_USE_CHAT_GPT_HOST
        }
        target={'_blank'}
      >
        <Stack
          direction={'row'}
          alignItems={'center'}
          gap={1}
          justifyContent={'center'}
        >
          {isEzMailApp ? (
            <EzMailAIIcon sx={{ fontSize: 28, color: 'inherit' }} />
          ) : (
            <UseChatGptIcon
              sx={{
                fontSize: 28,
                color: 'inherit',
              }}
            />
          )}
          <Typography
            color="text.primary"
            component="h1"
            fontSize={20}
            fontWeight={800}
          >
            {String(process.env.APP_NAME)}
          </Typography>
          <TooltipButton
            title={'Settings'}
            size={'small'}
            variant={'text'}
            sx={{
              width: 32,
              height: 32,
              color: 'inherit',
              minWidth: 'unset',
            }}
            onClick={(event) => {
              event.stopPropagation()
              event.preventDefault()
              chromeExtensionClientOpenPage({
                key: 'options',
              })
            }}
          >
            <SettingsOutlinedIcon
              sx={{ fontSize: 16, color: 'text.primary' }}
            />
          </TooltipButton>
        </Stack>
      </Link>
      <Stack
        direction={'row'}
        flex={1}
        width={0}
        spacing={1}
        justifyContent={'end'}
        alignItems={'center'}
      >
        {!isEzMailApp && (
          <Typography fontSize={12}>
            <Link
              color={'text.primary'}
              sx={{ cursor: 'pointer' }}
              underline={'always'}
              target={'_blank'}
              href={'chrome://extensions/shortcuts'}
              onClick={() => {
                chromeExtensionClientOpenPage({ key: 'shortcuts' })
              }}
            >
              {shortCutKey ? `Shortcut: ${shortCutKey}` : `Set up shortcut`}
            </Link>
          </Typography>
        )}
      </Stack>
      <IconButton
        sx={{ flexShrink: 0 }}
        onClick={() => {
          hideChatBox()
        }}
      >
        <CloseIcon sx={{ fontSize: '24px' }} />
      </IconButton>
    </Stack>
  )
}
export default ChatBoxHeader
