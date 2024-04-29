import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import IconButton from '@mui/material/IconButton'
import Modal from '@mui/material/Modal'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { type FC, type MouseEvent, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import { clientForceRemoveConversation } from '@/features/chatgpt/utils/chatConversationUtils'
import { ISidebarConversationType } from '@/features/sidebar/types'
import { isMaxAIImmersiveChatPage } from '@/utils/dataHelper/websiteHelper'

const ClearChatButton: FC<{
  conversationId: string
  conversationTitle: string
  conversationType: ISidebarConversationType
  onDelete?: () => void
}> = (props) => {
  const { conversationTitle, conversationType, conversationId, onDelete } =
    props
  const { currentConversationId, resetConversation } = useClientConversation()
  const { t } = useTranslation(['client', 'common'])

  const removeButtonTitle = useMemo(() => {
    if (conversationType === 'Summary') {
      return t('client:immersive_chat__delete_summary__title')
    }
    if (conversationType === 'Search') {
      return t('client:immersive_chat__delete_search__title')
    }
    if (conversationType === 'Art') {
      return t('client:immersive_chat__delete_art__title')
    }
    return t('client:immersive_chat__delete_chat__title')
  }, [conversationType, t])
  const removeButtonTooltip = useMemo(() => {
    if (conversationType === 'Summary') {
      return t('client:immersive_chat__delete_summary__button__title')
    }
    if (conversationType === 'Search') {
      return t('client:immersive_chat__delete_search__button__title')
    }
    if (conversationType === 'Art') {
      return t('client:immersive_chat__delete_art__button__title')
    }
    return t('client:immersive_chat__delete_chat__button__title')
  }, [conversationType, t])
  const [open, setOpen] = useState(false)

  const isInImmersiveChat = isMaxAIImmersiveChatPage()

  return (
    <>
      <TextOnlyTooltip placement={'top'} title={removeButtonTooltip}>
        <IconButton
          onClick={(e: MouseEvent) => {
            e.stopPropagation()
            setOpen(true)
          }}
          sx={{
            p: 0.5,
          }}
        >
          <ContextMenuIcon icon={'Delete'} size={16} />
        </IconButton>
      </TextOnlyTooltip>

      <Modal
        open={open}
        onClose={(e: MouseEvent) => {
          e.stopPropagation()
          setOpen(false)
        }}
        sx={{
          position: isInImmersiveChat ? 'fixed' : 'absolute',
        }}
        slotProps={{
          root: {
            onClick: (e: MouseEvent) => {
              e.stopPropagation()
            },
          },
          backdrop: {
            sx: {
              position: isInImmersiveChat ? 'fixed' : 'absolute',
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
          onClick={(e: React.MouseEvent) => {
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
              {removeButtonTitle}
            </Typography>
            <Typography fontSize={'16px'} color={'text.primary'}>
              {`${t('client:immersive_chat__delete_chat__description1')} `}
              <b>
                {conversationTitle.slice(0, 30)}
                {conversationTitle.length > 30 ? '...' : ''}
              </b>
              {t('client:immersive_chat__delete_chat__description2')}
            </Typography>
            <Stack direction={'row'} spacing={1} justifyContent={'end'}>
              <Button
                variant={'outlined'}
                onClick={() => {
                  setOpen(false)
                }}
              >
                {t('client:immersive_chat__delete_chat__button__cancel__title')}
              </Button>
              <Button
                variant={'contained'}
                color={'error'}
                onClick={async () => {
                  if (currentConversationId === conversationId) {
                    await resetConversation()
                  }
                  await clientForceRemoveConversation(conversationId)
                  onDelete?.()
                }}
                sx={{
                  bgcolor: '#f44336!important',
                  '&:hover': {
                    bgcolor: '#d32f2f!important',
                  },
                }}
              >
                {t('client:immersive_chat__delete_chat__button__delete__title')}
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Modal>
    </>
  )
}
export default ClearChatButton
