import CloseIcon from '@mui/icons-material/Close'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import { Typography } from '@mui/material'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'
import Browser from 'webextension-polyfill'

import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import { APP_VERSION } from '@/constants'
import { CHROME_EXTENSION_MAIL_TO } from '@/constants'
import SidebarReleaseNotesButton from '@/features/sidebar/components/SidebarNav/SidebarReleaseNotesButton'
import SidebarTabs from '@/features/sidebar/components/SidebarTabs'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import { hideChatBox } from '@/features/sidebar/utils/sidebarChatBoxHelper'
import useCommands from '@/hooks/useCommands'
import { chromeExtensionClientOpenPage } from '@/utils'
import { isMaxAIImmersiveChatPage } from '@/utils/dataHelper/websiteHelper'

interface IProps {
  sx?: SxProps
}

const SidebarNav: FC<IProps> = ({ sx }) => {
  const { t } = useTranslation(['common', 'client'])

  const { currentSidebarConversationType } = useSidebarSettings()
  const { chatBoxShortCutKey } = useCommands()

  // 在 immersive chat 页面, 有特殊的渲染逻辑
  const isInImmersiveChatPage = isMaxAIImmersiveChatPage()

  return (
    <Stack
      alignItems="center"
      spacing={2}
      sx={{
        width: isInImmersiveChatPage ? 80 : 60,
        [isInImmersiveChatPage ? 'borderRight' : 'borderLeft']: '1px solid',
        borderColor: 'divider',
        pb: 2,
        pt: 0.5,

        ...sx,
      }}
    >
      {/* close btn */}
      {!isInImmersiveChatPage && (
        <TextOnlyTooltip
          placement={'bottom'}
          title={t('client:sidebar__button__close_sidebar')}
          description={chatBoxShortCutKey}
        >
          <IconButton
            sx={{ flexShrink: 0 }}
            onClick={() => {
              if (isInImmersiveChatPage) {
                window.close()
                return
              }
              hideChatBox()
            }}
          >
            <CloseIcon sx={{ fontSize: '24px' }} />
          </IconButton>
        </TextOnlyTooltip>
      )}

      {/* nav content */}
      <Stack
        justifyContent={isInImmersiveChatPage ? 'start' : 'end'}
        sx={{
          width: '100%',
          height: 0,
          flex: 1,
        }}
      >
        <SidebarTabs />
      </Stack>

      {/* divider */}
      <Divider
        flexItem
        variant="middle"
        sx={{
          width: '80%',
          mx: 'auto !important',
        }}
      />

      {/* nav options */}
      <Stack
        spacing={1}
        alignItems="center"
        sx={{
          color: 'text.secondary',
          '& > button, & > a': {
            color: 'text.secondary',
          },
        }}
      >
        {/* full screen btn*/}
        {!isInImmersiveChatPage && (
          <TextOnlyTooltip
            title={t('client:sidebar__button__immersive_chat')}
            placement="left"
          >
            <IconButton
              onClick={() => {
                if (currentSidebarConversationType !== 'Summary') {
                  chromeExtensionClientOpenPage({
                    url: Browser.runtime.getURL(`/pages/chat/index.html`),
                    query: `?conversationType=${currentSidebarConversationType}`,
                  })
                } else {
                  chromeExtensionClientOpenPage({
                    url: Browser.runtime.getURL(`/pages/chat/index.html`),
                  })
                }
              }}
            >
              <ContextMenuIcon
                icon={'Fullscreen'}
                sx={{
                  // 由于 ContextMenuIcon 视觉上看起来比其他 icon 更小（不饱满）
                  // 所以为了视觉上的大小统一，这里设置为 24px
                  fontSize: 24,
                }}
              />
            </IconButton>
          </TextOnlyTooltip>
        )}

        {/* settings btn */}
        <TextOnlyTooltip title={t('common:settings')} placement="left">
          <IconButton
            sx={{ flexShrink: 0, width: 'max-content' }}
            onClick={() => {
              chromeExtensionClientOpenPage({
                key: 'options',
              })
            }}
          >
            <SettingsOutlinedIcon
              sx={{
                fontSize: '20px',
              }}
            />
          </IconButton>
        </TextOnlyTooltip>

        <SidebarReleaseNotesButton />

        {/* email btn */}
        <TextOnlyTooltip title={t('common:contact_us')} placement="left">
          <IconButton
            sx={{ flexShrink: 0, width: 'max-content' }}
            target={'_blank'}
            href={CHROME_EXTENSION_MAIL_TO}
          >
            <EmailOutlinedIcon
              sx={{
                fontSize: '20px',
              }}
            />
          </IconButton>
        </TextOnlyTooltip>

        {/* version */}
        <Typography fontSize={10}>{`v${APP_VERSION}`}</Typography>
      </Stack>
    </Stack>
  )
}

export default SidebarNav
