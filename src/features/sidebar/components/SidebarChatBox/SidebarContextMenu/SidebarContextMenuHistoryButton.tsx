import ArrowBackIcon from '@mui/icons-material/ArrowBack'
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
import React, { FC, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'

import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import LazyLoadImage from '@/components/LazyLoadImage'
import TextOnlyTooltip, {
  TextOnlyTooltipProps,
} from '@/components/TextOnlyTooltip'
import ConversationList from '@/features/chatgpt/components/ConversationList'
import ClearAllChatButton from '@/features/chatgpt/components/ConversationList/ClearAllChatButton'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import SidebarChatBoxMessageListContainer from '@/features/sidebar/components/SidebarChatBox/SidebarChatBoxMessageListContainer'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import { getChromeExtensionAssetsURL } from '@/utils/imageHelper'

const HistoryMessageList: FC<{
  conversationId?: string
  onDuplicateConversation?: (conversationId: string) => void
  container: HTMLElement
}> = ({ conversationId, onDuplicateConversation, container }) => {
  const { t } = useTranslation(['client'])
  const { continueConversationInSidebar } = useSidebarSettings()
  if (!conversationId) {
    return null
  }
  return (
    <>
      <SidebarChatBoxMessageListContainer
        conversationId={conversationId}
        isAIResponding={false}
        writingMessage={null}
        sx={{
          textAlign: 'left',
        }}
      />
      <Stack
        direction={'row'}
        justifyContent={'center'}
        alignItems={'center'}
        mb={2}
      >
        <Button
          variant={'contained'}
          color={'primary'}
          onClick={async () => {
            await continueConversationInSidebar(conversationId, {
              type: 'Chat',
            })
            onDuplicateConversation?.(conversationId)
          }}
        >
          {t('client:context_window__chat_history__continue_in_chat__title')}
        </Button>
      </Stack>
    </>
  )
}

const SidebarContextMenuHistoryButton: FC<{
  sx?: SxProps
  TooltipProps?: Omit<TextOnlyTooltipProps, 'title' | 'children'>
  container: HTMLElement
}> = ({ sx, TooltipProps, container }) => {
  const { createConversation } = useClientConversation()
  const { t } = useTranslation(['client'])
  const [modalOpen, setModalOpen] = React.useState(false)
  // 因为有keepMounted，所以需要这个来控制点击一次才能渲染
  const [isClickOpenOnce, setIsClickOpenOnce] = React.useState(false)
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const [placement, setPlacement] = React.useState<PopperPlacementType>()
  const paperRef = useRef<HTMLDivElement>()
  const [selectedConversationId, setSelectedConversationId] =
    useState<string>('')
  const handleOpenModal = () => {
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    if (selectedConversationId) {
      // 只需要返回到列表
      setSelectedConversationId('')
      return
    }
    setModalOpen(false)
    setAnchorEl(null)
  }

  const handleClick =
    (newPlacement: PopperPlacementType) =>
    (_: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl({
        getBoundingClientRect: () => {
          const left = window.innerWidth / 2
          const top = 140 / 2
          const virtualRect = {
            top,
            left,
            right: left,
            bottom: top,
            width: 0,
            height: 0,
            x: left,
            y: top,
          } as DOMRect
          return virtualRect
        },
      } as any)
      setTimeout(() => {
        paperRef.current?.focus()
      }, 100)
      setIsClickOpenOnce(true)
      handleOpenModal()
      setPlacement(newPlacement)
    }

  useEffect(() => {
    if (modalOpen) {
      // 为了方便esc
      const timer = setTimeout(() => {
        paperRef.current?.focus()
      }, 100)
      // 禁止document.body的滚动
      // 在onWheel里去阻止冒泡并不能完全解决，因为有滚动穿透的问题，这里先判断更改body的overflow
      if (document.body.clientHeight !== window.innerHeight) {
        document.body.style.overflow = 'hidden'
        return () => {
          clearTimeout(timer)
          document.body.style.overflow = ''
        }
      }
      return () => {
        clearTimeout(timer)
      }
    }
  }, [modalOpen])

  return (
    <>
      <Box>
        <TextOnlyTooltip
          title={t('client:context_window__chat_history__button__title')}
          placement={'bottom'}
          {...TooltipProps}
        >
          <IconButton
            onClick={handleClick('top')}
            data-testid={'maxai-context-window-history-button'}
            sx={{
              width: '28px',
              height: '28px',
              color: 'text.primary',
              minWidth: 'unset',
              borderRadius: '8px',
              border: '1px solid',
              borderColor: 'customColor.borderColor',
              ...sx,
            }}
          >
            <ContextMenuIcon
              icon={'History'}
              sx={{
                fontSize: '20px',
              }}
            />
          </IconButton>
        </TextOnlyTooltip>
      </Box>

      {/* mask */}
      {modalOpen &&
        container &&
        createPortal(
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
              zIndex: 2147483619,
              bgcolor: 'rgba(0,0,0,0.5)',
            }}
          />,
          container,
        )}
      <Popper
        container={container}
        open={modalOpen}
        anchorEl={anchorEl}
        placement={placement}
        transition
        sx={{
          width: '100vw',
          maxWidth: '768px',
          zIndex: 2147483620,
        }}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <div data-testid={`maxai--context-window--chat-history--root`}>
              <Paper
                tabIndex={-1}
                onMouseDown={(event) => {
                  event.stopPropagation()
                }}
                onMouseUp={(event) => {
                  event.stopPropagation()
                }}
                onClick={(event) => {
                  event.stopPropagation()
                }}
                onKeyDown={(event) => {
                  event.stopPropagation()
                }}
                onKeyUp={(event) => {
                  if (modalOpen && event.key === 'Escape') {
                    handleCloseModal()
                  }
                  event.stopPropagation()
                }}
                onWheel={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                }}
                onTouchMove={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                }}
                ref={(ref) => {
                  if (ref) {
                    paperRef.current = ref
                  }
                }}
                elevation={4}
                sx={{
                  boxSizing: 'border-box',
                  width: '100%',
                  height: 'calc(100vh - 140px)',
                  maxHeight: '1067px',
                  minWidth: 402,
                }}
              >
                {isClickOpenOnce && (
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
                        {selectedConversationId ? (
                          <ArrowBackIcon
                            sx={{
                              fontSize: '24px',
                            }}
                          />
                        ) : (
                          <CloseIcon
                            sx={{
                              fontSize: '24px',
                            }}
                          />
                        )}
                      </IconButton>
                      <Typography
                        fontSize={16}
                        fontWeight={500}
                        lineHeight={2}
                        flex={1}
                        textAlign={'center'}
                      >
                        {t(
                          'client:context_window__chat_history__button__title',
                        )}
                      </Typography>
                      <ClearAllChatButton
                        variant='icon'
                        sx={{
                          p: '5px',
                          pointerEvents: selectedConversationId
                            ? 'none'
                            : 'auto',
                          opacity: selectedConversationId ? 0 : 1,
                        }}
                        conversationType='ContextMenu'
                        onDelete={async () => {
                          await createConversation('ContextMenu')
                          handleCloseModal()
                        }}
                      />
                    </Stack>
                    <Divider />
                    <HistoryMessageList
                      conversationId={selectedConversationId}
                      onDuplicateConversation={handleCloseModal}
                      container={container}
                    />
                    <Box
                      height={0}
                      flex={1}
                      overflow='auto'
                      sx={{
                        display: selectedConversationId ? 'none' : 'flex',
                      }}
                    >
                      <ConversationList
                        conversationType={'ContextMenu'}
                        hideClearAllButton
                        divider
                        onSelectConversation={(conversation) => {
                          setSelectedConversationId(conversation.id)
                        }}
                        sx={{
                          width: '100%',
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
                              {t(
                                'client:context_window__chat_history__empty__title',
                              )}
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

export default SidebarContextMenuHistoryButton
