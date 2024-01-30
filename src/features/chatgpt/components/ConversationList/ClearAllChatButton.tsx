import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import IconButton from '@mui/material/IconButton'
import Modal from '@mui/material/Modal'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import { removeConversationsByType } from '@/features/chatgpt/hooks/useInitClientConversationMap'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import { isMaxAIImmersiveChatPage } from '@/utils/dataHelper/websiteHelper'

interface IProps {
  variant?: 'icon' | 'buttonText'
  onDelete?: () => void
  sx?: SxProps
}

const ClearAllChatButton: FC<IProps> = (props) => {
  const testid = 'maxai-clear-all-chat-button'
  const { onDelete, variant = 'buttonText', sx } = props
  const { t } = useTranslation(['client', 'common'])
  const [open, setOpen] = React.useState(false)
  const { currentSidebarConversationType } = useSidebarSettings()

  const isInImmersiveChat = isMaxAIImmersiveChatPage()

  return (
    <>
      {variant === 'buttonText' && (
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
              {t('client:immersive_chat__delete_all_chat__button__title')}
            </Typography>
          </Stack>
        </Button>
      )}

      {variant === 'icon' && (
        <TextOnlyTooltip
          placement={'top'}
          title={t('client:immersive_chat__delete_all_chat__button__title')}
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
        open={open}
        onClose={(e: React.MouseEvent) => {
          e.stopPropagation()
          setOpen(false)
        }}
        sx={{
          position: isInImmersiveChat ? 'fixed' : 'absolute',
        }}
        slotProps={{
          root: {
            onClick: (e: React.MouseEvent) => {
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
