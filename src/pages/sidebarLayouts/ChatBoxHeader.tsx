import Stack from '@mui/material/Stack'
import Link from '@mui/material/Link'
import {
  APP_USE_CHAT_GPT_HOST,
  CHROME_EXTENSION_HOMEPAGE_URL,
  isEzMailApp,
} from '@/constants'
import { EzMailAIIcon, UseChatGptIcon } from '@/components/CustomIcon'
import Typography from '@mui/material/Typography'
import { chromeExtensionClientOpenPage, hideChatBox } from '@/utils'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import React, { FC } from 'react'
import Tooltip from '@mui/material/Tooltip'
import useCommands from '@/hooks/useCommands'
import { ChatGPTAIProviderMiniSelector } from '@/features/chatgpt/components/ChatGPTAIProviderSelector'
import AuthUserRoleIconDropdown from '@/features/auth/components/AuthUserRoleIconDropdown'

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
      <Stack
        sx={{
          flexShrink: 0,
        }}
        direction={'row'}
        alignItems={'center'}
        gap={1}
        justifyContent={'center'}
      >
        <Link
          sx={{
            textDecoration: 'none!important',
          }}
          href={
            isEzMailApp
              ? CHROME_EXTENSION_HOMEPAGE_URL + '?invite=CHROME_EXTENSION'
              : APP_USE_CHAT_GPT_HOST
          }
          target={'_blank'}
        >
          <Tooltip title={'My account'}>
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
            </Stack>
          </Tooltip>
        </Link>
        <AuthUserRoleIconDropdown />
      </Stack>
      <Stack
        direction={'row'}
        flex={1}
        width={0}
        justifyContent={'end'}
        alignItems={'center'}
      >
        <ChatGPTAIProviderMiniSelector />
        <IconButton
          sx={{ flexShrink: 0 }}
          onClick={() => {
            chromeExtensionClientOpenPage({
              key: 'options',
            })
          }}
        >
          <Tooltip title="Settings">
            <SettingsOutlinedIcon sx={{ fontSize: '20px' }} />
          </Tooltip>
        </IconButton>
        {!isEzMailApp && !shortCutKey && (
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
              {`Set up shortcut`}
            </Link>
          </Typography>
        )}

        <IconButton
          sx={{ flexShrink: 0 }}
          onClick={() => {
            hideChatBox()
          }}
        >
          <Tooltip
            placement={'bottom'}
            title={shortCutKey ? `Shortcut: ${shortCutKey}` : ``}
          >
            <CloseIcon sx={{ fontSize: '24px' }} />
          </Tooltip>
        </IconButton>
      </Stack>
    </Stack>
  )
}
export default ChatBoxHeader
