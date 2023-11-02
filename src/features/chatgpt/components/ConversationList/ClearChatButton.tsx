import React, { FC } from 'react'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import Modal from '@mui/material/Modal'
import Container from '@mui/material/Container'
import { clientForceRemoveConversation } from '@/features/chatgpt/hooks/useInitClientConversationMap'
import IconButton from '@mui/material/IconButton'
import { useTranslation } from 'react-i18next'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'

const ClearChatButton: FC<{
  conversationId: string
  conversationTitle: string
  onDelete?: () => void
}> = (props) => {
  const { conversationTitle, conversationId, onDelete } = props
  const { cleanConversation } = useClientConversation()
  const { t } = useTranslation(['client', 'common'])
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <IconButton
        onClick={() => {
          setOpen(true)
        }}
      >
        <ContextMenuIcon icon={'Delete'} size={16} />
      </IconButton>
      <Modal
        open={open}
        onClose={() => {
          setOpen(false)
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
              {t('client:immersive_chat__delete_chat__title')}
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
                  await cleanConversation()
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
