import CloseIcon from '@mui/icons-material/Close'
import type { Theme } from '@mui/material'
import { PopoverVirtualElement } from '@mui/material'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Fade from '@mui/material/Fade'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Popper from '@mui/material/Popper'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import React, { FC, useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import LazyLoadImage from '@/components/LazyLoadImage'
import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import ConversationList from '@/features/chatgpt/components/ConversationList'
import ClearAllChatButton from '@/features/chatgpt/components/ConversationList/ClearAllChatButton'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import { getMaxAISidebarRootElement } from '@/utils'
import { isMaxAIImmersiveChatPage } from '@/utils/dataHelper/websiteHelper'
import { getChromeExtensionAssetsURL } from '@/utils/imageHelper'

const SidebarHistoryButton: FC<{
  sx?: SxProps<Theme>
  iconSx?: SxProps<Theme>
}> = ({ sx, iconSx }) => {
  const { t } = useTranslation(['client'])
  const [modalOpen, setModalOpen] = React.useState(false)
  const [anchorEl, setAnchorEl] = React.useState<
    null | HTMLElement | PopoverVirtualElement
  >(null)
  const isImmersiveChatPage = useMemo(() => isMaxAIImmersiveChatPage(), [])
  const paperRef = useRef<HTMLDivElement>()

  const {
    clientConversation,
    currentConversationId,
    updateConversationId,
    createConversation,
  } = useClientConversation()
  const currentConversationType = clientConversation?.type

  const currentI18nTitle = useMemo(() => {
    if (currentConversationType === 'Search') {
      return t('client:sidebar__speed_dial__search_history__button')
    }
    if (currentConversationType === 'Summary') {
      return t('client:sidebar__speed_dial__summary_history__button')
    }
    if (currentConversationType === 'Art') {
      return t('client:sidebar__speed_dial__art_history__button')
    }
    if (currentConversationType === 'ContextMenu') {
      return t('client:sidebar__speed_dial__rewrite_history__button')
    }
    return t('client:sidebar__speed_dial__chat_history__button')
  }, [t, currentConversationType])

  const currentI18nEmptyContent = useMemo(() => {
    if (currentConversationType === 'Search') {
      return t('client:immersive_chat__search_no_conversation__title')
    }
    if (currentConversationType === 'Summary') {
      return t('client:immersive_chat__summary_no_conversation__title')
    }
    if (currentConversationType === 'Art') {
      return t('client:immersive_chat__art_no_conversation__title')
    }
    if (currentConversationType === 'ContextMenu') {
      return t('client:immersive_chat__rewrite_no_conversation__title')
    }
    return t('client:immersive_chat__chat_no_conversation__title')
  }, [t, currentConversationType])

  const handleCloseModal = () => {
    setModalOpen(false)
    setAnchorEl(null)
  }

  const handleClick = () => {
    const container = (
      getMaxAISidebarRootElement() || document.body
    ).getBoundingClientRect()

    setAnchorEl({
      getBoundingClientRect: () => {
        const x = container.x + container.width / 2
        const y = 70

        return new DOMRect(x, y, 0, 0)
      },
    } as PopoverVirtualElement)
    setTimeout(() => {
      paperRef.current?.focus()
    }, 100)
    // setIsClickOpenOnce(true)
    setModalOpen(true)
  }

  useEffect(() => {
    if (modalOpen) {
      // 为了方便esc
      setTimeout(() => {
        paperRef.current?.focus()
      }, 100)
    }
  }, [modalOpen])

  if (!currentConversationType) return null

  return (
    <>
      <TextOnlyTooltip placement={'top'} title={currentI18nTitle}>
        <Button
          onClick={handleClick}
          data-testid={'maxai-chat-history-button'}
          sx={{
            p: '5px',
            minWidth: 'unset',
            border: '1px solid',
            ...sx,
          }}
          variant={modalOpen ? 'contained' : 'outlined'}
        >
          <ContextMenuIcon
            icon={'History'}
            sx={{
              fontSize: '20px',
              ...iconSx,
            }}
          />
        </Button>
      </TextOnlyTooltip>

      {modalOpen && (
        <Box
          onClick={() => {
            handleCloseModal()
          }}
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 1050,
            bgcolor: 'rgba(0,0,0,0.5)',
          }}
        />
      )}
      <Popper
        open={modalOpen}
        anchorEl={anchorEl}
        placement={'bottom'}
        transition
        sx={{
          zIndex: 2147483620,
          width: '100%',
        }}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <div>
              <Paper
                tabIndex={-1}
                onKeyDown={(event) => {
                  if (modalOpen && event.key === 'Escape') {
                    handleCloseModal()
                  }
                }}
                ref={(ref) => {
                  if (ref) {
                    paperRef.current = ref
                  }
                }}
                elevation={4}
                sx={{
                  boxSizing: 'border-box',
                  width: isImmersiveChatPage
                    ? 'calc(100vw - 128px)'
                    : `calc(100% - 32px)`,
                  height: 'calc(100vh - 140px)',
                  maxHeight: '1067px',
                  minWidth: 402,
                  marginLeft: isImmersiveChatPage ? '64px' : '16px',
                }}
              >
                {modalOpen && (
                  <Stack height={'100%'}>
                    <Stack
                      direction='row'
                      spacing={1}
                      alignItems='center'
                      px={2}
                      py={2}
                      position='relative'
                    >
                      <IconButton onClick={handleCloseModal} size='small'>
                        <CloseIcon
                          sx={{
                            fontSize: '24px',
                          }}
                        />
                      </IconButton>
                      <Typography
                        fontSize={16}
                        fontWeight={500}
                        lineHeight={2}
                        flex={1}
                        textAlign={'center'}
                      >
                        {currentI18nTitle}
                      </Typography>
                      <ClearAllChatButton
                        variant='icon'
                        sx={{
                          p: '5px',
                        }}
                        onDelete={() => {
                          createConversation(currentConversationType)
                          handleCloseModal()
                        }}
                      />
                    </Stack>
                    <Divider />
                    <Box height={0} flex={1} overflow='auto'>
                      <ConversationList
                        key={currentConversationType}
                        conversationType={currentConversationType}
                        hideClearAllButton
                        divider
                        onSelectConversation={(conversation) => {
                          if (
                            conversation &&
                            conversation.id !== currentConversationId
                          ) {
                            updateConversationId(conversation.id)
                            handleCloseModal()
                          }
                        }}
                        sx={{
                          p: 0,
                          '.conversation-list': {
                            px: 2,
                            py: 1,
                          },
                        }}
                        emptyFeedback={
                          <Stack
                            alignItems='center'
                            justifyContent='center'
                            height='100%'
                          >
                            <LazyLoadImage
                              height={160}
                              src={`${getChromeExtensionAssetsURL(
                                '/images/common/data-empty.png',
                              )}`}
                              imgStyle={{
                                objectFit: 'contain',
                              }}
                              alt={'no_conversation'}
                            />
                            <Typography
                              fontSize={14}
                              lineHeight={1.5}
                              textAlign={'center'}
                            >
                              {currentI18nEmptyContent}
                            </Typography>
                          </Stack>
                        }
                      />
                    </Box>
                  </Stack>
                )}
              </Paper>
            </div>
          </Fade>
        )}
      </Popper>
    </>
  )
}
export default SidebarHistoryButton
