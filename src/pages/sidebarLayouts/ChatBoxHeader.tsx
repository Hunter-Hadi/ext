import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import React, { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { UseChatGptIcon } from '@/components/CustomIcon'
import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import { APP_USE_CHAT_GPT_HOST } from '@/constants'
import AuthUserRoleIconDropdown from '@/features/auth/components/AuthUserRoleIconDropdown'
import ConversationListDrawerButton from '@/features/chatgpt/components/ConversationList/ConversationListDrawerButton'
import HistoryShareButton from '@/features/chatgpt/components/share/HistoryShareButton'
import useCurrentBreakpoint from '@/features/sidebar/hooks/useCurrentBreakpoint'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import useCommands from '@/hooks/useCommands'
import { useCustomTheme } from '@/hooks/useCustomTheme'
import { chromeExtensionClientOpenPage } from '@/utils'
import { isMaxAIImmersiveChatPage } from '@/utils/dataHelper/websiteHelper'

const ChatBoxHeader: FC<{
  showConversationList?: boolean
}> = (props) => {
  const { showConversationList } = props
  const { t } = useTranslation(['common', 'client'])
  const { chatBoxShortCutKey } = useCommands()
  const { currentSidebarConversationType } = useSidebarSettings()
  const currentBreakpoint = useCurrentBreakpoint()
  const theme = useCustomTheme()
  const isDownSm = useMediaQuery(theme.customTheme.breakpoints.down('sm'))
  const isShowConversationListMenu = useMemo(() => {
    if (!showConversationList) {
      return false
    }
    if (isMaxAIImmersiveChatPage()) {
      return isDownSm
    } else {
      return currentBreakpoint === 'xs' || currentBreakpoint === 'sm'
    }
  }, [showConversationList, currentBreakpoint, isDownSm])
  return (
    <Stack
      flexDirection={'row'}
      flexShrink={0}
      height={48}
      gap={1}
      alignItems={'center'}
      px={1}
      borderBottom={'1px solid'}
      borderColor="customColor.borderColor"
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
          href={APP_USE_CHAT_GPT_HOST}
          target={'_blank'}
        >
          <Stack
            direction={'row'}
            alignItems={'center'}
            gap={1}
            justifyContent={'center'}
          >
            {isShowConversationListMenu ? (
              <ConversationListDrawerButton />
            ) : (
              <UseChatGptIcon
                sx={{
                  fontSize: 28,
                  color: 'inherit',
                }}
              />
            )}
            <TextOnlyTooltip title={t('client:sidebar__button__my_plan')}>
              <Typography
                color="text.primary"
                component="h1"
                fontSize={20}
                fontWeight={800}
              >
                {String(process.env.APP_NAME)}
              </Typography>
            </TextOnlyTooltip>
          </Stack>
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
        {!chatBoxShortCutKey && (
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
        <HistoryShareButton />
      </Stack>
    </Stack>
  )
}
export default ChatBoxHeader
