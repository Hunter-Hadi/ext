import CloseIcon from '@mui/icons-material/Close'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Fade from '@mui/material/Fade'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Popper from '@mui/material/Popper'
import { PopperPlacementType } from '@mui/material/Popper'
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

const SidebarChatHistoryButton: FC<{
  sx?: SxProps
}> = (props) => {
  const { sx } = props
  const { t } = useTranslation(['client'])
  const [modalOpen, setModalOpen] = React.useState(false)
  // 因为有keepMounted，所以需要这个来控制点击一次才能渲染
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const [placement, setPlacement] = React.useState<PopperPlacementType>()
  const isImmersiveChatPage = isMaxAIImmersiveChatPage()
  const paperRef = useRef<HTMLDivElement>()

  const { clientConversation, currentConversationId, updateConversationId } =
    useClientConversation()
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
    return t('client:immersive_chat__chat_no_conversation__title')
  }, [t, currentConversationType])

  const handleCloseModal = () => {
    setModalOpen(false)
    setAnchorEl(null)
  }

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const containerElement = (getMaxAISidebarRootElement()?.querySelector(
      '#maxAISidebarChatBox',
    ) || document.body) as HTMLDivElement
    const targetElement = event.currentTarget as HTMLButtonElement
    // 高度取决于targetElement的高度
    // 宽度取决于containerElement的中心
    const rect = targetElement.getBoundingClientRect()
    const containerRect = containerElement.getBoundingClientRect()
    setAnchorEl({
      getBoundingClientRect: () => {
        const left = isImmersiveChatPage
          ? document.body.offsetWidth / 2 + 8
          : containerRect.x + containerRect.width / 2
        const virtualRect = {
          x: left,
          y: rect.y - 8,
          width: isImmersiveChatPage ? 1 : 58,
          height: 1,
          top: rect.top - 8,
          left: left,
          bottom: rect.top + 1,
          right: left + 1,
        } as DOMRect
        return virtualRect
      },
    } as any)
    setTimeout(() => {
      paperRef.current?.focus()
    }, 100)
    // setIsClickOpenOnce(true)
    setPlacement('top')
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
        placement={placement}
        transition
        sx={{
          width: '100%',
          zIndex: 2147483620,
        }}

        // keepMounted
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
                  ml: isImmersiveChatPage ? 0 : 2,
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
                          // fetchPaginationConversations().then(
                          //   (conversations) => {
                          //     setPaginationConversations(conversations)
                          //     const needCleanConversationType =
                          //       currentSidebarConversationType.toLowerCase()
                          //     updateSidebarSettings({
                          //       [needCleanConversationType]: {
                          //         conversationId: '',
                          //       },
                          //     }).then(() => {
                          //       updateSidebarConversationType('Chat')
                          //     })
                          //   },
                          // )
                        }}
                      />
                    </Stack>
                    <Divider />
                    <Box height={0} flex={1} overflow='auto'>
                      <ConversationList
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
export default SidebarChatHistoryButton
