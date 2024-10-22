import RestartAltIcon from '@mui/icons-material/RestartAlt'
import LoadingButton from '@mui/lab/LoadingButton'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Modal from '@mui/material/Modal'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { FC, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import DropdownIconButton from '@/components/DropdownIconButton'
import useSyncConversation from '@/features/chatgpt/hooks/useSyncConversation'
import AppLoadingLayout from '@/features/common/components/AppLoadingLayout'
import { ClientConversationManager } from '@/features/indexed_db/conversations/ClientConversationManager'
import { IConversation } from '@/features/indexed_db/conversations/models/Conversation'
import { clientFetchMaxAIAPI } from '@/features/shortcuts/utils'

const ClearAllChatButtonMoreActions: FC<{ disablePortal?: boolean }> = ({
  disablePortal,
}) => {
  const {
    enabled,
    resetConversationSyncGlobalState,
    syncConversationsByIds,
    conversationSyncGlobalState,
    conversationSyncState,
  } = useSyncConversation()
  const { t } = useTranslation(['common', 'client'])
  const [open, setOpen] = useState(false)
  const [loadingRemoteConversations, setLoadingRemoteConversations] =
    useState(false)
  const [localConversationIds, setLocalConversationIds] = useState<string[]>([])
  const [dbConversationIds, setDbConversationIds] = useState<string[]>([])
  const totalConversationIds = useMemo<string[]>(() => {
    return [...new Set([...localConversationIds, ...dbConversationIds])]
  }, [localConversationIds, dbConversationIds])
  const handleOpen = async () => {
    setOpen(true)
  }
  const handleClose = () => {
    setOpen(false)
    setLocalConversationIds([])
    setDbConversationIds([])
    setLoadingRemoteConversations(false)
    resetConversationSyncGlobalState()
  }

  useEffect(() => {
    let isFree = false
    if (open) {
      setLoadingRemoteConversations(true)
      let total = 0
      let dbConversationIds: string[] = []
      const getPageConversations = async (page: number) => {
        const result = await clientFetchMaxAIAPI<{
          status: string
          data: IConversation[]
          total_page: number
        }>(`/conversation/get_conversations_basic`, {
          page_size: 10,
          page,
          isDelete: false,
        })
        if (result.data?.status === 'OK') {
          const remoteConversations = (result.data.data || []).filter(
            (conversation) => {
              return conversation.isDelete !== true
            },
          )
          dbConversationIds = dbConversationIds.concat(
            remoteConversations.map((conversation) => conversation.id),
          )
          total = result.data.total_page
          if (page < total) {
            if (isFree) {
              return
            }
            await getPageConversations(page + 1)
          }
        }
      }
      // 先获取本地的会话
      ClientConversationManager.getAllConversations().then(
        (userAllConversations) => {
          if (isFree) {
            return
          }
          // 过滤出没删除且消息数量大于0的会话
          setLocalConversationIds(
            userAllConversations
              .filter((conversation) => conversation.lastMessageId)
              .map((conversation) => conversation.id),
          )
          // 获取远程的会话
          getPageConversations(0)
            .then(() => {
              if (isFree) {
                return
              }
              setDbConversationIds(dbConversationIds)
            })
            .catch((e) => {
              console.error(e)
            })
            .finally(() => {
              setLoadingRemoteConversations(false)
            })
        },
      )
    }
    return () => {
      isFree = true
      setDbConversationIds([])
      setLocalConversationIds([])
      setLoadingRemoteConversations(false)
    }
  }, [open])
  if (!enabled) {
    return null
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
          if (
            conversationSyncGlobalState.syncConversationStatus === 'uploading'
          ) {
            return
          }
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
          {conversationSyncGlobalState.syncConversationStatus === 'idle' && (
            <Stack spacing={2}>
              <Typography
                fontSize={'20px'}
                fontWeight={700}
                lineHeight={'24px'}
                color={'text.primary'}
                whiteSpace={`pre-wrap`}
              >
                {t(
                  'client:immersive_chat__chat_history__restore_modal__idle__title',
                )}
              </Typography>
              <AppLoadingLayout loading={loadingRemoteConversations}>
                <Typography
                  fontSize={'16px'}
                  fontWeight={500}
                  lineHeight={'24px'}
                  color={'text.primary'}
                >
                  {`${t(
                    'client:immersive_chat__chat_history__restore_modal__idle__description',
                  )} ${totalConversationIds.length}`}
                </Typography>
              </AppLoadingLayout>
            </Stack>
          )}
          {conversationSyncGlobalState.syncConversationStatus ===
            'uploading' && (
            <Stack spacing={2}>
              <Typography
                fontSize={'20px'}
                fontWeight={700}
                lineHeight={'24px'}
                color={'text.primary'}
                whiteSpace={`pre-wrap`}
              >
                {t(
                  'client:immersive_chat__chat_history__restore_modal__uploading__title',
                )}
              </Typography>
              <Typography
                fontSize={'16px'}
                fontWeight={500}
                lineHeight={'24px'}
                color={'text.primary'}
              >
                {t(
                  'client:immersive_chat__chat_history__restore_modal__uploading__description1',
                )}
              </Typography>
              <Typography
                fontSize={'16px'}
                fontWeight={500}
                lineHeight={'24px'}
                color={'text.primary'}
              >
                {t(
                  'client:immersive_chat__chat_history__restore_modal__uploading__description2',
                  {
                    STEP: conversationSyncGlobalState.syncConversationStep,
                    TOTAL:
                      conversationSyncGlobalState.syncTotalConversationCount,
                  },
                )}
              </Typography>
              <Typography
                fontSize={'16px'}
                fontWeight={500}
                lineHeight={'24px'}
                color={'text.primary'}
              >
                {t(
                  'client:immersive_chat__chat_history__restore_modal__uploading__description3',
                  {
                    STEP: conversationSyncState.syncStep,
                    TOTAL: conversationSyncState.syncTotalCount,
                  },
                )}
              </Typography>
            </Stack>
          )}
          {conversationSyncGlobalState.syncConversationStatus === 'success' && (
            <Stack spacing={2}>
              <Typography
                fontSize={'20px'}
                fontWeight={700}
                lineHeight={'24px'}
                color={'text.primary'}
                whiteSpace={`pre-wrap`}
              >
                {t(
                  'client:immersive_chat__chat_history__restore_modal__success__title',
                  {
                    COUNT:
                      conversationSyncGlobalState.syncSuccessConversationCount,
                  },
                )}
              </Typography>
            </Stack>
          )}
          {conversationSyncGlobalState.syncConversationStatus === 'error' && (
            <Stack spacing={2}>
              <Typography
                fontSize={'20px'}
                fontWeight={700}
                lineHeight={'24px'}
                color={'text.primary'}
                whiteSpace={`pre-wrap`}
              >
                {t(
                  'client:immersive_chat__chat_history__restore_modal__error__title',
                  {
                    COUNT:
                      conversationSyncGlobalState.syncTotalConversationCount -
                      conversationSyncGlobalState.syncSuccessConversationCount,
                  },
                )}
              </Typography>
            </Stack>
          )}
          <Stack width={'100%'} sx={{ mt: 2 }}>
            <Stack direction={'row'} spacing={1} justifyContent={'end'}>
              {(conversationSyncGlobalState.syncConversationStatus ===
                'uploading' ||
                conversationSyncGlobalState.syncConversationStatus ===
                  'idle') && (
                <>
                  <LoadingButton
                    disabled={
                      conversationSyncGlobalState.syncConversationStatus ===
                      'uploading'
                    }
                    loading={
                      conversationSyncGlobalState.syncConversationStatus ===
                      'uploading'
                    }
                    variant={'outlined'}
                    onClick={async () => {
                      try {
                        await syncConversationsByIds(totalConversationIds)
                      } catch (e) {
                        console.error(e)
                      }
                    }}
                  >
                    {t(
                      'client:immersive_chat__chat_history__restore_modal__confirm_button__title',
                    )}
                  </LoadingButton>
                  <Button
                    disabled={
                      conversationSyncGlobalState.syncConversationStatus ===
                      'uploading'
                    }
                    variant={'contained'}
                    onClick={() => {
                      handleClose()
                    }}
                  >
                    {t(
                      'client:immersive_chat__chat_history__restore_modal__cancel_button__title',
                    )}
                  </Button>
                </>
              )}
              {(conversationSyncGlobalState.syncConversationStatus ===
                'success' ||
                conversationSyncGlobalState.syncConversationStatus ===
                  'error') && (
                <Button
                  variant={'contained'}
                  onClick={() => {
                    handleClose()
                  }}
                >
                  {t(
                    'client:immersive_chat__chat_history__restore_modal__close_button__title',
                  )}
                </Button>
              )}
            </Stack>
          </Stack>
        </Container>
      </Modal>
    </>
  )
}

export default ClearAllChatButtonMoreActions
