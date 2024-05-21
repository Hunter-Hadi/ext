import CloseIcon from '@mui/icons-material/Close'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useRecoilValue } from 'recoil'

import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import { AuthState } from '@/features/auth//store'
import SignUpCard from '@/features/auth/components/SignUpCard'
import { hideChatBox } from '@/features/sidebar/utils/sidebarChatBoxHelper'
import useCommands from '@/hooks/useCommands'
import { isMaxAIImmersiveChatPage } from '@/utils/dataHelper/websiteHelper'

const UnLoginOverlay = () => {
  const { t } = useTranslation()
  const { isLogin } = useRecoilValue(AuthState)
  const { chatBoxShortCutKey } = useCommands()
  const isInImmersiveChatPage = isMaxAIImmersiveChatPage()

  if (isLogin) {
    return null
  }

  return (
    <Box
      sx={{
        position: isInImmersiveChatPage ? 'fixed' : 'absolute',
        inset: 0,
        m: 0,
        bgcolor: (t) => (t.palette.mode === 'dark' ? '#444444' : '#F8F6FF'),
        px: 1.5,
        zIndex: 2147483631,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
        }}
      >
        <TextOnlyTooltip
          placement={'bottom'}
          title={t('client:sidebar__button__close_sidebar')}
          description={chatBoxShortCutKey}
        >
          <IconButton
            sx={{ flexShrink: 0, color: 'text.secondary' }}
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
      </Box>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'max-content',
        }}
      >
        <SignUpCard />
      </Box>
    </Box>
  )
}

export default UnLoginOverlay
