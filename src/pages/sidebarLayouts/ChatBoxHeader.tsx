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
import useCommands from '@/hooks/useCommands'
import AuthUserRoleIconDropdown from '@/features/auth/components/AuthUserRoleIconDropdown'
import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import { useTranslation } from 'react-i18next'
import { isMaxAINewTabPage } from '@/pages/chat/util'
import Button from '@mui/material/Button'
import Browser from 'webextension-polyfill'
import { ContextMenuIcon } from '@/components/ContextMenuIcon'

const ChatBoxHeader: FC = () => {
  const { t } = useTranslation(['common', 'client'])
  const { chatBoxShortCutKey } = useCommands()
  return (
    <Stack
      flexDirection={'row'}
      flexShrink={0}
      height={48}
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
          <TextOnlyTooltip title={t('client:sidebar__button__my_plan')}>
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
          </TextOnlyTooltip>
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
        {/*full screen*/}
        <TextOnlyTooltip title={t('client:sidebar__button__immersive_chat')}>
          <Button
            sx={{
              width: 36,
              height: 36,
              minWidth: 36,
            }}
            onClick={() => {
              chromeExtensionClientOpenPage({
                url: Browser.runtime.getURL(`/pages/chat/index.html`),
              })
            }}
          >
            <ContextMenuIcon
              icon={'Fullscreen'}
              sx={{
                color: 'text.secondary',
                fontSize: 24,
              }}
            />
          </Button>
        </TextOnlyTooltip>
        <TextOnlyTooltip title={t('common:settings')}>
          <IconButton
            sx={{ flexShrink: 0 }}
            onClick={() => {
              chromeExtensionClientOpenPage({
                key: 'options',
              })
            }}
          >
            <SettingsOutlinedIcon sx={{ fontSize: '20px' }} />
          </IconButton>
        </TextOnlyTooltip>
        {!isEzMailApp && !chatBoxShortCutKey && (
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
              {t('client:sidebar__button__set_up_shortcut')}
            </Link>
          </Typography>
        )}
        <TextOnlyTooltip
          placement={'bottom'}
          title={t('client:sidebar__button__close_sidebar')}
          description={chatBoxShortCutKey}
        >
          <IconButton
            sx={{ flexShrink: 0 }}
            onClick={() => {
              if (isMaxAINewTabPage()) {
                window.close()
                return
              }
              hideChatBox()
            }}
          >
            <CloseIcon sx={{ fontSize: '24px' }} />
          </IconButton>
        </TextOnlyTooltip>
      </Stack>
    </Stack>
  )
}
export default ChatBoxHeader
