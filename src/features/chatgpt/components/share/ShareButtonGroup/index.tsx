import LoadingButton from '@mui/lab/LoadingButton'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Menu from '@mui/material/Menu'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import CopyTooltipIconButton from '@/components/CopyTooltipIconButton'
import { WWW_PROJECT_HOST } from '@/constants'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import { ClientConversationManager } from '@/features/indexed_db/conversations/ClientConversationManager'
import {
  clientShareConversation,
  syncLocalConversationToRemote,
} from '@/features/indexed_db/conversations/clientService'
import globalSnackbar from '@/utils/globalSnackbar'

const createShareLink = (shareId: string) => {
  return `${WWW_PROJECT_HOST}/share?id=${shareId}`
}

const ShareButtonGroup: FC = () => {
  const { t } = useTranslation(['client'])
  const { clientConversation, clientConversationMessages } =
    useClientConversation()
  const [isUploadingConversation, setIsUploadingConversation] = useState(false)
  const [buttonLoading, setButtonLoading] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const isShareable = clientConversation?.share?.enable === true
  const shareId = clientConversation?.share?.id
  console.log(`ShareButtonGroup`, clientConversation)
  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }
  const switchShareType = async (enable: boolean) => {
    if (!clientConversation?.id) {
      return
    }
    try {
      setButtonLoading(true)
      const shareConfig = await clientShareConversation(
        clientConversation.id,
        enable,
      )
      if (shareConfig?.id) {
        await ClientConversationManager.addOrUpdateConversation(
          clientConversation.id,
          {
            share: {
              enable: shareConfig.enable,
              id: shareConfig.id,
            },
          },
          {
            syncConversationToDB: true,
            waitSync: true,
          },
        )
      } else {
        globalSnackbar.error(
          t('client:sidebar__conversation_share__share_panel__error_tip'),
          {
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'center',
            },
          },
        )
      }
    } catch (e) {
      globalSnackbar.error(
        t('client:sidebar__conversation_share__share_panel__error_tip'),
        {
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center',
          },
        },
      )
    } finally {
      setButtonLoading(false)
    }
  }
  const handleShareConversation = async (
    event: React.MouseEvent<HTMLElement>,
  ) => {
    if (!clientConversation?.id) {
      return
    }
    const parent = event.currentTarget.parentElement
    let currentCopyShareId = ''
    if (shareId) {
      if (isShareable) {
        // 打开dropdown并复制连接到剪贴板
      } else {
        // 如果是私有的, 切换为公开
        await switchShareType(true)
      }
      currentCopyShareId = shareId
    } else {
      const errorTips = () => {
        globalSnackbar.error(
          t('client:sidebar__conversation_share__share_panel__error_tip'),
          {
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'center',
            },
          },
        )
      }
      // 上传会话和消息
      try {
        if (!currentCopyShareId) {
          setIsUploadingConversation(true)
          const needShareConversation =
            await ClientConversationManager.getConversationById(
              clientConversation.id,
            )
          if (!needShareConversation) {
            errorTips()
            return
          }
          await syncLocalConversationToRemote(needShareConversation)
          // 上传完消息后, 获取分享链接
          const shareConfig = await clientShareConversation(
            needShareConversation.id,
            true,
          )
          if (shareConfig?.id && shareConfig.enable) {
            currentCopyShareId = shareConfig.id
            // 上传成功，写入数据库
            await ClientConversationManager.addOrUpdateConversation(
              needShareConversation.id,
              {
                share: {
                  enable: true,
                  id: shareConfig.id,
                },
              },
              {
                syncConversationToDB: true,
              },
            )
          }
        }
      } catch (e) {
        errorTips()
      } finally {
        setIsUploadingConversation(false)
      }
    }
    const shareLink = createShareLink(currentCopyShareId)
    navigator.clipboard.writeText(shareLink)
    // snackNotifications.success(
    //   t('client:sidebar__conversation_share__share_panel__success_tip'),
    //   {
    //     anchorOrigin: {
    //       vertical: 'top',
    //       horizontal: 'center',
    //     },
    //     // autoHideDuration: 3000,
    //   },
    // )
    const fallbackTarget = parent?.querySelector(
      'button[data-testid="maxai--conversation--share-button"]',
    ) as HTMLButtonElement
    handleOpen({
      currentTarget: event.currentTarget || fallbackTarget,
    } as any)
  }
  if (clientConversationMessages.length <= 0) {
    return null
  }
  return (
    <Stack direction={'row'} alignItems={'center'} gap={1} px={1}>
      {isShareable && shareId && (
        <CopyTooltipIconButton
          copyText={createShareLink(shareId)}
          copyToClipboardTooltip={
            'client:sidebar__conversation_share__copy_button__copy_link'
          }
          icon={<ContextMenuIcon icon={'Link'} />}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderColor: 'customColor.borderColor',
            border: '1px solid',
            borderRadius: '8px',
            minWidth: 'unset',
          }}
        />
      )}
      <LoadingButton
        data-testid={'maxai--conversation--share-button'}
        variant={'contained'}
        sx={{
          display: 'flex',
          alignItems: 'center',
          height: '32px',
          gap: 0.5,
        }}
        loading={isUploadingConversation}
        onClick={handleShareConversation}
      >
        {isShareable ? (
          <ContextMenuIcon
            sx={{
              fontSize: '16px',
            }}
            icon={'IosShare'}
          />
        ) : (
          <ContextMenuIcon
            sx={{
              fontSize: '16px',
            }}
            icon={'Lock'}
          />
        )}
        <Typography component={'span'} fontSize={'14px'}>
          {t('sidebar__conversation_share__share_button__title')}
        </Typography>
      </LoadingButton>
      <Menu
        PaperProps={{
          sx: {
            mt: 1,
          },
        }}
        elevation={1}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
      >
        <Stack py={1} px={2} width={320} gap={1}>
          <Typography fontSize={16} fontWeight={500}>
            {t('sidebar__conversation_share__share_panel__title')}
          </Typography>
          <Stack
            sx={{
              '& > button': {
                border: '1px solid',
                width: '100%',
                p: 1,
                borderColor: 'customColor.borderColor',
                borderRadius: '0 0 8px 8px',
                alignItems: 'center',
                justifyContent: 'start',
                '&:not(:last-child)': {
                  borderBottom: 'none',
                  borderRadius: '8px 8px 0 0',
                },
              },
            }}
          >
            <Button
              data-testid={'maxai--conversation--share-private-button'}
              disabled={buttonLoading}
              onClick={async () => {
                await switchShareType(false)
              }}
            >
              <Stack width={'100%'}>
                <Stack direction={'row'} alignItems={'center'} gap={1}>
                  {buttonLoading ? (
                    <CircularProgress size={16}></CircularProgress>
                  ) : (
                    <ContextMenuIcon
                      icon={'Lock'}
                      sx={{
                        fontSize: '16px',
                      }}
                    />
                  )}
                  <Typography
                    textAlign={'left'}
                    fontSize={'14px'}
                    color={'text.primary'}
                  >
                    {t(
                      'client:sidebar__conversation_share__share_panel__private_button__title',
                    )}
                  </Typography>
                  {!isShareable && (
                    <ContextMenuIcon
                      icon={'GreenCircleCheck'}
                      sx={{ ml: 'auto', mr: 0, fontSize: '20px' }}
                    />
                  )}
                </Stack>
                <Typography
                  textAlign={'left'}
                  fontSize={'12px'}
                  color={'text.secondary'}
                >
                  {t(
                    'client:sidebar__conversation_share__share_panel__private_button__description',
                  )}
                </Typography>
              </Stack>
            </Button>
            <Button
              disabled={buttonLoading}
              onClick={async () => {
                await switchShareType(true)
              }}
            >
              <Stack width={'100%'}>
                <Stack direction={'row'} alignItems={'center'} gap={1}>
                  {buttonLoading ? (
                    <CircularProgress size={16}></CircularProgress>
                  ) : (
                    <ContextMenuIcon
                      icon={'Share'}
                      sx={{
                        fontSize: '16px',
                      }}
                    />
                  )}
                  <Typography
                    textAlign={'left'}
                    fontSize={'14px'}
                    color={'text.primary'}
                  >
                    {t(
                      'client:sidebar__conversation_share__share_panel__public_button__title',
                    )}
                  </Typography>
                  {isShareable && (
                    <ContextMenuIcon
                      icon={'GreenCircleCheck'}
                      sx={{ ml: 'auto', mr: 0, fontSize: '20px' }}
                    />
                  )}
                </Stack>
                <Typography
                  textAlign={'left'}
                  fontSize={'12px'}
                  color={'text.secondary'}
                >
                  {t(
                    'client:sidebar__conversation_share__share_panel__public_button__description',
                  )}
                </Typography>
              </Stack>
            </Button>
          </Stack>
          {isShareable && (
            <Stack direction={'row'} alignItems={'center'} gap={1}>
              <ContextMenuIcon
                icon={'GreenCircleCheck'}
                sx={{ fontSize: '16px' }}
              />
              <Typography
                textAlign={'left'}
                fontSize={'12px'}
                color={'#379837'}
              >
                {t(
                  'client:sidebar__conversation_share__share_panel__copied_tip',
                )}
              </Typography>
            </Stack>
          )}
        </Stack>
      </Menu>
    </Stack>
  )
}
export default ShareButtonGroup
