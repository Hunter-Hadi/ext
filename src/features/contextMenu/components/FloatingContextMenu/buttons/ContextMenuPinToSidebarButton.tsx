import { ViewSidebarOutlined } from '@mui/icons-material'
import { IconButton } from '@mui/material'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { SxProps, Theme } from '@mui/material/styles'
import React, { FC, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useRecoilCallback, useRecoilState, useSetRecoilState } from 'recoil'

import { PaginationConversationMessagesStateFamily } from '@/features/chatgpt/store'
import { useChatPanelContext } from '@/features/chatgpt/store/ChatPanelContext'
import AppLoadingLayout from '@/features/common/components/AppLoadingLayout'
import {
  DropdownMenu,
  LiteDropdownMenuItem,
} from '@/features/contextMenu/components/FloatingContextMenu/DropdownMenu'
import {
  ContextMenuPinedToSidebarState,
  PinToSidebarState,
} from '@/features/contextMenu/store'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import { getMaxAIFloatingContextMenuRootElement } from '@/utils'

const selectedSx: SxProps<Theme> = {
  bgcolor: (t) =>
    t.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.08)'
      : 'rgba(55, 53, 47, 0.08)',
}

const ContextMenuPinToSidebarButton: FC = () => {
  const { t } = useTranslation(['client'])
  const [loading, setLoading] = useState(true)
  const [root, setRoot] = useState<null | HTMLElement>(null)
  const [pinToSidebar, setPinToSidebar] = useRecoilState(PinToSidebarState)
  const { conversationId = '' } = useChatPanelContext()
  const { continueConversationInSidebar } = useSidebarSettings()
  const setContextMenuPinedToSidebar = useSetRecoilState(
    ContextMenuPinedToSidebarState,
  )

  /**
   * 设置pintosidebar，当已经有信息了之后，直接执行continue
   */
  const handlePinToSidebar = useRecoilCallback(
    ({ snapshot }) =>
      async (toggleOnce: boolean = true) => {
        const messages = await snapshot.getPromise(
          PaginationConversationMessagesStateFamily(conversationId),
        )
        let once = toggleOnce ? !pinToSidebar.once : false
        const always = toggleOnce ? false : !pinToSidebar.always

        if (messages.length > 0 && (once || always)) {
          await continueConversationInSidebar(
            conversationId,
            {},
            {
              syncConversationToDB: true,
              waitSync: true,
            },
          )

          if (always) {
            setContextMenuPinedToSidebar(true)
          } else {
            once = false
          }
        }

        setPinToSidebar({
          once,
          always,
        })
      },
    [conversationId, pinToSidebar],
  )

  useEffect(() => {
    if (root) {
      return
    }
    const rootEl = getMaxAIFloatingContextMenuRootElement()
    if (rootEl) {
      setRoot(rootEl)
    }
    setLoading(false)
  }, [])

  return (
    <AppLoadingLayout loading={loading}>
      {root && (
        <DropdownMenu
          defaultPlacement={'top-start'}
          defaultFallbackPlacements={['bottom-start']}
          hoverOpen
          zIndex={2147483610}
          label={''}
          root={root}
          menuSx={{
            width: '280px',
            marginBottom: '15px',
          }}
          referenceElement={
            <Box
              sx={{
                alignSelf: 'end',
              }}
            >
              <Button
                size={'small'}
                variant={'text'}
                sx={{
                  width: '28px',
                  height: '28px',
                  color: 'inherit',
                  minWidth: 'unset',
                  borderRadius: '8px',
                }}
              >
                {/* <ContextMenuIcon */}
                {/*   icon={'More'} */}
                {/*   sx={{ color: 'text.primary', fontSize: '16px' }} */}
                {/* /> */}
                <IconButton>
                  <ViewSidebarOutlined
                    sx={{
                      fontSize: 16,
                      color: 'text.primary',
                    }}
                  />
                </IconButton>
              </Button>
            </Box>
          }
        >
          <LiteDropdownMenuItem
            sx={pinToSidebar.always ? selectedSx : undefined}
            onClick={() => handlePinToSidebar(false)}
            label={t('client:floating_menu__always_pin_to_sidebar')}
          />
          <LiteDropdownMenuItem
            sx={pinToSidebar.once ? selectedSx : undefined}
            onClick={() => handlePinToSidebar(true)}
            label={t('client:floating_menu__pint_once_to_sidebar')}
          />
        </DropdownMenu>
      )}
    </AppLoadingLayout>
  )
}

export default ContextMenuPinToSidebarButton
