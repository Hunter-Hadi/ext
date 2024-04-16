import RestartAltIcon from '@mui/icons-material/RestartAlt'
import LoadingButton from '@mui/lab/LoadingButton'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Modal from '@mui/material/Modal'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { IChatConversation } from '@/background/src/chatConversations'
import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import DropdownIconButton from '@/components/DropdownIconButton'
import usePaginationConversations from '@/features/chatgpt/hooks/usePaginationConversations'
import { clientGetUserAllConversations } from '@/features/chatgpt/utils/chatConversationUtils'
import { clientUpdateChatConversation } from '@/features/chatgpt/utils/clientChatConversation'

const ClearAllChatButtonMoreActions: FC = () => {
  const { fetchPaginationConversations, setPaginationConversations } =
    usePaginationConversations()
  const { t } = useTranslation(['common', 'client'])
  const [open, setOpen] = useState(false)
  const [conversations, setConversations] = useState<IChatConversation[]>([])
  const [loading, setLoading] = useState(false)
  const handleOpen = async () => {
    setConversations(await clientGetUserAllConversations())
    setOpen(true)
  }
  return (
    <>
      <DropdownIconButton
        IconButtonProps={{
          sx: {
            position: 'absolute',
            right: 0,
            top: '4px',
            width: '40px',
            height: '40px',
          },
        }}
        icon={<ContextMenuIcon icon={'More'} size={24} />}
        options={[
          {
            icon: <RestartAltIcon />,
            text: t(
              'client:immersive_chat__chat_history__restore_button__title',
            ),
            onClick: handleOpen,
          },
        ]}
        tooltipTitle={t('common:more')}
      />
      <Modal
        open={open}
        onClose={(e: React.MouseEvent) => {
          e.stopPropagation()
          setOpen(false)
        }}
        sx={{
          position: 'fixed',
        }}
        slotProps={{
          root: {
            onClick: (e: React.MouseEvent) => {
              e.stopPropagation()
            },
          },
          backdrop: {
            sx: {
              position: 'fixed',
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
            width: '100%',
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
              {t('client:immersive_chat__chat_history__restore_modal__title')}
            </Typography>
            <Typography
              fontSize={'16px'}
              fontWeight={500}
              lineHeight={'24px'}
              color={'text.primary'}
            >
              {`${t(
                'client:immersive_chat__chat_history__restore_modal__description',
              )} ${conversations.length}`}
            </Typography>
            <Stack direction={'row'} spacing={1} justifyContent={'end'}>
              <LoadingButton
                loading={loading}
                variant={'outlined'}
                onClick={async () => {
                  setLoading(true)
                  for (const conversation of conversations) {
                    try {
                      await clientUpdateChatConversation(
                        conversation.id,
                        {
                          ...conversation,
                          isDelete: false,
                        },
                        false,
                      )
                    } catch (e) {
                      console.error(e)
                    }
                  }
                  const newConversations = await fetchPaginationConversations()
                  setPaginationConversations(newConversations)
                  setLoading(false)
                  setOpen(false)
                }}
              >
                {t(
                  'client:immersive_chat__chat_history__restore_modal__confirm_button__title',
                )}
              </LoadingButton>
              <Button
                variant={'contained'}
                onClick={() => {
                  setOpen(false)
                }}
              >
                {t(
                  'client:immersive_chat__chat_history__restore_modal__cancel_button__title',
                )}
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Modal>
    </>
  )
}

export default ClearAllChatButtonMoreActions
