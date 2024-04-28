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
import globalSnackbar from '@/utils/globalSnackbar'

const ClearAllChatButtonMoreActions: FC<{ disablePortal?: boolean }> = ({
  disablePortal,
}) => {
  const { fetchPaginationConversations, setPaginationConversations } =
    usePaginationConversations()
  const { t } = useTranslation(['common', 'client'])
  const [open, setOpen] = useState(false)
  const [deletedConversations, setDeletedConversations] = useState<
    IChatConversation[]
  >([])
  const [loading, setLoading] = useState(false)
  const handleOpen = async () => {
    const userAllConversations = await clientGetUserAllConversations()
    setDeletedConversations(
      // 过滤出已删除且消息数量大于0的会话
      userAllConversations.filter(
        (conversation) =>
          conversation.isDelete && conversation.messages.length > 0,
      ),
    )
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
        disablePortal={disablePortal}
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
              )} ${deletedConversations.length}`}
            </Typography>
            <Stack direction={'row'} spacing={1} justifyContent={'end'}>
              <LoadingButton
                disabled={deletedConversations.length === 0}
                loading={loading}
                variant={'outlined'}
                onClick={async () => {
                  setLoading(true)
                  let successCount = 0
                  for (const deletedConversation of deletedConversations) {
                    try {
                      await clientUpdateChatConversation(
                        deletedConversation.id,
                        {
                          ...deletedConversation,
                          isDelete: false,
                        },
                        true,
                      )
                      successCount++
                    } catch (e) {
                      console.error(e)
                    }
                  }
                  const newConversations = await fetchPaginationConversations()
                  setPaginationConversations(newConversations)
                  globalSnackbar.success(
                    successCount > 1
                      ? t(
                          'client:immersive_chat__chat_history__restore_modal__toast2__title',
                          {
                            CONVERSATION_COUNT: successCount,
                          },
                        )
                      : t(
                          'client:immersive_chat__chat_history__restore_modal__toast1__title',
                        ),
                    {
                      autoHideDuration: 3000,
                      // 居中显示
                      anchorOrigin: {
                        vertical: 'top',
                        horizontal: 'center',
                      },
                    },
                  )
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
