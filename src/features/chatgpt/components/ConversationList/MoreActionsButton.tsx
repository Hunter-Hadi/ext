import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import IconButton from '@mui/material/IconButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import MenuItem from '@mui/material/MenuItem'
import Modal from '@mui/material/Modal'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { FC, memo, MouseEvent, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { IAIProviderType } from '@/background/provider/chat'
import { MAXAI_DEFAULT_AI_PROVIDER_CONFIG } from '@/background/utils/chromeExtensionStorage/chromeExtensionLocalStorage'
import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import MaxAIMenu from '@/components/MaxAIMenu'
import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import useSmoothConversationLoading from '@/features/chatgpt/hooks/useSmoothConversationLoading'
import { clientForceRemoveConversation } from '@/features/chatgpt/utils/chatConversationUtils'
import { ISidebarConversationType } from '@/features/sidebar/types'
import { getMaxAIFloatingContextMenuRootElement } from '@/utils'
import { isMaxAIImmersiveChatPage } from '@/utils/dataHelper/websiteHelper'

const MoreActionsButton: FC<{
  conversationId: string
  conversationAIProvider?: IAIProviderType
  conversationAIModel?: string
  conversationDisplaysText: string
  conversationType: ISidebarConversationType
  onRename?: () => void
  onDelete?: () => void
}> = (props) => {
  const {
    conversationDisplaysText,
    conversationType,
    conversationId,
    conversationAIProvider,
    conversationAIModel,
    onRename,
    onDelete,
  } = props
  const {
    resetConversation,
    createConversation,
    currentSidebarConversationType,
  } = useClientConversation()
  const { smoothConversationLoading } = useSmoothConversationLoading()
  const { t } = useTranslation(['client'])

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const moreActionsMenuOpen = Boolean(anchorEl)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const isContextWindow = currentSidebarConversationType === 'ContextMenu'

  const deleteModalTitle = useMemo(() => {
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

  const deleteButtonTitle = useMemo(() => {
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

  const handleClose = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setAnchorEl(null)
  }

  const isInImmersiveChat = isMaxAIImmersiveChatPage()

  return (
    <>
      <TextOnlyTooltip
        placement={'top'}
        title={t('client:immersive_chat__more_actions_button__title')}
      >
        <IconButton
          disabled={smoothConversationLoading}
          onClick={(event: MouseEvent<HTMLElement>) => {
            event.preventDefault()
            event.stopPropagation()
            setAnchorEl(event.currentTarget)
          }}
          sx={{
            p: 0.5,
          }}
        >
          <ContextMenuIcon icon={'More'} size={16} />
        </IconButton>
      </TextOnlyTooltip>

      <MaxAIMenu
        rootContainer={() => {
          return isContextWindow
            ? getMaxAIFloatingContextMenuRootElement()?.querySelector(
                'div[data-testid="maxai--context-window--chat-history--root"]',
              ) || undefined
            : undefined
        }}
        anchorEl={anchorEl}
        id={`${conversationId}_MORE_ACTIONS_MENU`}
        open={moreActionsMenuOpen}
        onClose={handleClose}
        onClick={handleClose}
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
          onClick={(event) => {
            onRename?.()
            handleClose(event)
          }}
        >
          <ListItemIcon>
            <ContextMenuIcon icon={'DefaultIcon'} size={16} />
          </ListItemIcon>
          <ListItemText sx={{ fontSize: '14px', color: 'text.primary' }}>
            <Typography
              sx={{
                fontSize: '14px',
                color: 'text.primary',
              }}
              component={'span'}
            >
              {t('client:immersive_chat__rename_chat__button__title')}
            </Typography>
          </ListItemText>
        </MenuItem>
        <MenuItem
          onClick={(event) => {
            setDeleteModalOpen(true)
            handleClose(event)
          }}
          sx={{
            color: '#f44336',
          }}
        >
          <ListItemIcon>
            <ContextMenuIcon
              icon={'Delete'}
              size={16}
              sx={{
                color: '#f44336',
              }}
            />
          </ListItemIcon>
          <ListItemText>
            <Typography
              sx={{
                fontSize: '14px',
              }}
              component={'span'}
            >
              {deleteButtonTitle}
            </Typography>
          </ListItemText>
        </MenuItem>
      </MaxAIMenu>

      <Modal
        disablePortal
        open={deleteModalOpen}
        onClose={(e: MouseEvent) => {
          e.stopPropagation()
          setDeleteModalOpen(false)
        }}
        sx={{
          position: isInImmersiveChat || isContextWindow ? 'fixed' : 'absolute',
        }}
        slotProps={{
          root: {
            onClick: (e: MouseEvent) => {
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
              {deleteModalTitle}
            </Typography>
            <Typography fontSize={'16px'} color={'text.primary'}>
              {`${t('client:immersive_chat__delete_chat__description1')} `}
              <b>
                {conversationDisplaysText.slice(0, 30)}
                {conversationDisplaysText.length > 30 ? '...' : ''}
              </b>
              {t('client:immersive_chat__delete_chat__description2')}
            </Typography>
            <Stack direction={'row'} spacing={1} justifyContent={'end'}>
              <Button
                variant={'outlined'}
                onClick={() => {
                  setDeleteModalOpen(false)
                }}
              >
                {t('client:immersive_chat__delete_chat__button__cancel__title')}
              </Button>
              <Button
                variant={'contained'}
                color={'error'}
                onClick={async () => {
                  await resetConversation()
                  await clientForceRemoveConversation(conversationId)
                  onDelete?.()
                  if (isInImmersiveChat) {
                    if (conversationAIProvider && conversationAIModel) {
                      await createConversation(
                        conversationType,
                        conversationAIProvider,
                        conversationAIModel,
                      )
                    } else {
                      await createConversation(
                        conversationType,
                        MAXAI_DEFAULT_AI_PROVIDER_CONFIG[conversationType]
                          .AIProvider,
                        MAXAI_DEFAULT_AI_PROVIDER_CONFIG[conversationType]
                          .AIModel,
                      )
                    }
                  }
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
export default memo(MoreActionsButton)
