import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import IconButton from '@mui/material/IconButton'
import Modal from '@mui/material/Modal'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import React, { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import ClearAllChatButtonMoreActions from '@/features/chatgpt/components/ConversationList/ClearAllChatButtonMoreActions'
import { clientRemoveConversationsByType } from '@/features/chatgpt/utils/chatConversationUtils'
import { isMaxAIImmersiveChatPage } from '@/utils/dataHelper/websiteHelper'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import { ISidebarConversationType } from '@/features/sidebar/types'

interface IProps {
  variant?: 'icon' | 'buttonText'
  onDelete?: () => void
  sx?: SxProps
  conversationType?: ISidebarConversationType
}

const ClearAllChatButton: FC<IProps> = (props) => {
  const testid = 'maxai-clear-all-chat-button'
  const { onDelete, variant = 'buttonText', sx, conversationType } = props
  const { t } = useTranslation(['client', 'common'])
  const [open, setOpen] = React.useState(false)
  // const { currentSidebarConversationType } = useClientConversation()
  const { currentSidebarConversationType } = useSidebarSettings()
  const isContextWindow =
    (conversationType || currentSidebarConversationType) === 'ContextMenu'
  const currentDeleteAllButtonTitle = useMemo(() => {
    if (currentSidebarConversationType === 'Summary') {
      return t('client:immersive_chat__delete_all_summary__button__title')
    }
    if (currentSidebarConversationType === 'Search') {
      return t('client:immersive_chat__delete_all_search__button__title')
    }
    if (currentSidebarConversationType === 'Art') {
      return t('client:immersive_chat__delete_all_art__button__title')
    }
    if (currentSidebarConversationType === 'ContextMenu') {
      return t('client:immersive_chat__delete_all_context_menu__button__title')
    }
    return t('client:immersive_chat__delete_all_chat__button__title')
  }, [t, currentSidebarConversationType])

  const currentDeleteAllConfirmTitle = useMemo(() => {
    if (currentSidebarConversationType === 'Summary') {
      return t('client:immersive_chat__delete_all_summary__title')
    }
    if (currentSidebarConversationType === 'Search') {
      return t('client:immersive_chat__delete_all_search__title')
    }
    if (currentSidebarConversationType === 'Art') {
      return t('client:immersive_chat__delete_all_art__title')
    }
    if (currentSidebarConversationType === 'ContextMenu') {
      return t('client:immersive_chat__delete_all_context_menu__title')
    }
    return t('client:immersive_chat__delete_all_chat__title')
  }, [t, currentSidebarConversationType])

  const isInImmersiveChat = isMaxAIImmersiveChatPage()

  return (
    <>
      {variant === 'buttonText' && (
        <Box position={'relative'}>
          <Button
            variant={'text'}
            sx={{
              width: '100%',
              color: 'text.primary',
              padding: '12px 16px',
              ...sx,
            }}
            data-testid={testid}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation()
              setOpen(true)
            }}
          >
            <Stack
              direction={'row'}
              justifyContent={'start'}
              gap={2}
              width={'100%'}
            >
              <ContextMenuIcon icon={'Delete'} size={24} />
              <Typography
                fontSize={'16px'}
                color={'text.primary'}
                lineHeight={'24px'}
              >
                {currentDeleteAllButtonTitle}
              </Typography>
            </Stack>
          </Button>
          <ClearAllChatButtonMoreActions disablePortal={isContextWindow} />
        </Box>
      )}

      {variant === 'icon' && (
        <TextOnlyTooltip
          floatingMenuTooltip={currentSidebarConversationType === 'ContextMenu'}
          placement={'top'}
          title={currentDeleteAllButtonTitle}
        >
          <IconButton
            data-testid={testid}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation()
              setOpen(true)
            }}
            sx={sx}
          >
            <ContextMenuIcon icon={'Delete'} size={24} />
          </IconButton>
        </TextOnlyTooltip>
      )}

      <Modal
        disablePortal={isContextWindow}
        open={open}
        onClose={(e: React.MouseEvent) => {
          e.stopPropagation()
          setOpen(false)
        }}
        sx={{
          position: isInImmersiveChat || isContextWindow ? 'fixed' : 'absolute',
        }}
        slotProps={{
          root: {
            onClick: (e: React.MouseEvent) => {
              e.stopPropagation()
            },
          },
          backdrop: {
            sx: {
              position:
                isInImmersiveChat || isContextWindow ? 'fixed' : 'absolute',
            },
          },
        }}
      >
        <Container
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            borderRadius: '4px',
            bgcolor: (t) => (t.palette.mode === 'dark' ? '#3d3d3d' : '#fff'),
            maxWidth: '512px!important',
            width: isInImmersiveChat ? '100%' : '448px',
            p: 2,
          }}
        >
          <Stack spacing={2}>
            <Typography
              fontSize={'20px'}
              fontWeight={700}
              lineHeight={'24px'}
              color={'text.primary'}
            >
              {currentDeleteAllConfirmTitle}
            </Typography>
            <Stack direction={'row'} spacing={1} justifyContent={'end'}>
              <Button
                variant={'outlined'}
                onClick={() => {
                  setOpen(false)
                }}
              >
                {t(
                  'client:immersive_chat__delete_all_chat__button__cancel__title',
                )}
              </Button>
              <Button
                variant={'contained'}
                color={'error'}
                onClick={async () => {
                  try {
                    await clientRemoveConversationsByType(
                      currentSidebarConversationType,
                    )
                    onDelete?.()
                  } catch (e) {
                    console.error(e)
                  } finally {
                    setOpen(false)
                  }
                }}
                sx={{
                  bgcolor: '#f44336!important',
                  '&:hover': {
                    bgcolor: '#d32f2f!important',
                  },
                }}
              >
                {t(
                  'client:immersive_chat__delete_all_chat__button__delete__title',
                )}
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Modal>
    </>
  )
}
export default ClearAllChatButton
