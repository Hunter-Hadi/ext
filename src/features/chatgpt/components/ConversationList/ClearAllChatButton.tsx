import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Modal from '@mui/material/Modal'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import { removeConversationsByType } from '@/features/chatgpt/hooks/useInitClientConversationMap'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'

const ClearAllChatButton: FC<{
  onDelete?: () => void
}> = (props) => {
  const { onDelete } = props
  const { t } = useTranslation(['client', 'common'])
  const [open, setOpen] = React.useState(false)
  const { currentSidebarConversationType } = useSidebarSettings()

  return (
    <>
      <Button
        variant={'text'}
        sx={{
          width: '100%',
          color: 'text.primary',
          padding: '12px 16px',
        }}
        onClick={() => {
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
            {t('client:immersive_chat__delete_all_chat__button__title')}
          </Typography>
        </Stack>
      </Button>
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
              {t('client:immersive_chat__delete_all_chat__title')}
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
                    await removeConversationsByType(
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
