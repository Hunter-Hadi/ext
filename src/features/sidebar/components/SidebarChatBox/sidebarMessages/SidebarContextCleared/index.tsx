import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Divider from '@mui/material/Divider'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Modal from '@mui/material/Modal'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { FC, MouseEvent, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import { useChatPanelContext } from '@/features/chatgpt/store/ChatPanelContext'
import { IChatMessage } from '@/features/chatgpt/types'
import { clientChatConversationModifyChatMessages } from '@/features/chatgpt/utils/clientChatConversation'
import { isMaxAIImmersiveChatPage } from '@/utils/dataHelper/websiteHelper'

const SidebarContextCleared: FC<{
  message: IChatMessage
}> = (props) => {
  const { t } = useTranslation(['client', 'common'])
  const { message } = props

  const { conversationId } = useChatPanelContext()

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const menuOpen = Boolean(anchorEl)
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleMenuClose = () => {
    setAnchorEl(null)
  }
  const handleModalOpen = () => {
    setModalOpen(true)
  }
  const handleModalClose = () => {
    setModalOpen(false)
  }

  const handleDelete = async () => {
    if (!conversationId) return
    const newMessage = {
      messageId: message.messageId,
      meta: {
        includeHistory: true,
      },
    } as IChatMessage
    await clientChatConversationModifyChatMessages(
      'update',
      conversationId,
      0,
      [newMessage],
    )
  }

  // const onClear = async () => {
  //   handleClose()
  //   await clientChatConversationModifyChatMessages(
  //     'add',
  //     conversationId,
  //     0,
  //     [
  //       {
  //         type: 'user',
  //         text: '',
  //         messageId: uuidV4(),
  //         parentMessageId: '',
  //         meta: {
  //           includeHistory: false
  //         }
  //       },
  //     ],
  //   )
  // }

  const isInImmersiveChat = isMaxAIImmersiveChatPage()

  return (
    <Divider sx={{ mb: 2 }}>
      <Stack direction="row" alignItems="center">
        <Typography color={'text.secondary'} fontSize={'12px'}>
          {t('client:sidebar__conversation__message__context_cleared')}
        </Typography>
        <Button
          variant="text"
          sx={{
            width: '30px',
            height: '30px',
            color: 'inherit',
            minWidth: 'unset',
            borderRadius: '8px',
            ml: 'auto!important',
          }}
          onClick={handleClick}
        >
          <ContextMenuIcon
            icon={'More'}
            sx={{ color: 'text.primary', fontSize: '16px' }}
          />
        </Button>
      </Stack>

      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1,
            },
          },
        }}
        transformOrigin={{ horizontal: 'left', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'left', vertical: 'center' }}
      >
        <MenuItem
          onClick={() => {
            handleMenuClose()
            handleModalOpen()
          }}
          sx={{
            color: '#f44336',
          }}
        >
          <ContextMenuIcon icon="Delete" size={16} sx={{ mr: 1 }} />
          {t('common:delete')}
        </MenuItem>
      </Menu>

      <Modal
        open={modalOpen}
        onClose={(e: MouseEvent) => {
          e.stopPropagation()
          handleModalClose()
        }}
        sx={{
          position: isMaxAIImmersiveChatPage() ? 'fixed' : 'absolute',
        }}
      >
        <Container
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            borderRadius: '4px',
            bgcolor: 'background.paper',
            maxWidth: '512px!important',
            width: isInImmersiveChat ? '100%' : '448px',
            p: 2,
          }}
          onClick={(e: MouseEvent) => {
            e.stopPropagation()
          }}
        >
          <Stack spacing={2}>
            <Typography
              fontSize={'20px'}
              fontWeight={700}
              lineHeight={'24px'}
              color={'text.primary'}
            >
              {t('client:sidebar__context_clear__delete__title')}
            </Typography>
            <Typography fontSize={'16px'} color={'text.primary'}>
              {t('client:sidebar__context_clear__delete__description')}
            </Typography>
            <Stack direction={'row'} spacing={1} justifyContent={'end'}>
              <Button
                variant={'outlined'}
                onClick={() => {
                  handleModalClose()
                }}
              >
                {t('common:cancel')}
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={() => {
                  handleModalClose()
                  handleDelete()
                }}
                sx={{
                  bgcolor: '#f44336!important',
                  '&:hover': {
                    bgcolor: '#d32f2f!important',
                  },
                }}
              >
                {t('common:confirm')}
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Modal>
    </Divider>
  )
}

export default SidebarContextCleared
