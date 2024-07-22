import { KeyboardArrowDown } from '@mui/icons-material'
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import { styled, SxProps } from '@mui/material/styles'
import Tooltip, { tooltipClasses, TooltipProps } from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import React, { FC, Fragment, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { getMessageAttachmentExtractedContent } from '@/background/src/chat/util'
import CopyTooltipIconButton from '@/components/CopyTooltipIconButton'
import LargeTextBox from '@/components/LargeTextBox'
import LazyLoadImage from '@/components/LazyLoadImage'
import MaxAIClickAwayListener from '@/components/MaxAIClickAwayListener'
import { MAXAI_FLOATING_CONTEXT_MENU_REFERENCE_ELEMENT_ID } from '@/features/common/constants'
import { isFloatingContextMenuVisible } from '@/features/contextMenu/utils'
import { IUserChatMessage } from '@/features/indexed_db/conversations/models/Message'
import { getMaxAIFloatingContextMenuRootElement } from '@/utils'
import { filesizeFormatter } from '@/utils/dataHelper/numberHelper'
const LightTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& > .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.mode === 'dark' ? '#393743' : '#ffffff',
    borderLeft: '4px solid #9065B0',
    color: 'rgba(0, 0, 0, 0.87)',
    fontSize: 12,
    boxShadow: `0px 4px 6px -2px rgba(16, 24, 40, 0.03), 0px 12px 16px -4px rgba(16, 24, 40, 0.08);`,
    maxWidth: 'none',
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.mode === 'dark' ? '#393743' : '#ffffff',
  },
}))

/**
 * fork from src/features/sidebar/components/SidebarChatBox/sidebarMessages/SidebarUserMessage/SidebarUserMessageContexts.tsx
 * 需要修改样式
 */
const MessageContexts: FC<{
  message: IUserChatMessage
  sx?: SxProps
  container?: HTMLElement
}> = (props) => {
  const { t } = useTranslation(['client'])
  const { message, sx, container } = props
  const [open, setOpen] = useState(false)
  const attachments = useMemo(() => {
    return (message.meta?.attachments || []).filter(
      (attachment) => attachment.uploadStatus === 'success',
    )
  }, [message.meta?.attachments])
  const contexts = message.meta?.contexts

  useEffect(() => {
    if (open) {
      const contextWindowRoot = getMaxAIFloatingContextMenuRootElement()
      if (isFloatingContextMenuVisible() && contextWindowRoot) {
        const clickEvent = new MouseEvent('click', {
          view: window,
          bubbles: true,
          cancelable: true,
        })
        contextWindowRoot.dispatchEvent(clickEvent)

        // 临时解决在context window下click away失效
        // 因为ClickAwayListener绑定在了最外层的dom，点击context window阻止了冒泡
        const contextWindowReference = contextWindowRoot.querySelector(
          `#${MAXAI_FLOATING_CONTEXT_MENU_REFERENCE_ELEMENT_ID}`,
        )
        if (contextWindowReference) {
          const clickListener = () => {
            setOpen(false)
          }
          contextWindowReference.addEventListener('click', clickListener)
          return () =>
            contextWindowReference.removeEventListener('click', clickListener)
        }
      }
    }
  }, [open])
  if (!attachments.length && !contexts?.length) {
    return null
  }

  return (
    <Stack
      direction={'row'}
      justifyContent={'end'}
      component={'div'}
      sx={{
        ...sx,
      }}
    >
      <MaxAIClickAwayListener
        onClickAway={() => {
          setOpen(false)
        }}
      >
        <Box
          component={'div'}
          sx={{
            display: 'flex',
            flexDirection: 'row',
            maxWidth: 'calc(100% - 16px)',
          }}
        >
          <LightTooltip
            open={open}
            PopperProps={{
              container,
              style: {
                zIndex: 2147483647,
              },
            }}
            title={
              <Stack
                py={0.5}
                borderRadius={1}
                maxHeight={520}
                overflow={'auto'}
              >
                <Stack gap={1}>
                  {attachments.map((attachment, index) => {
                    let showDivider = false
                    if (
                      index !== attachments.length - 1 ||
                      (contexts && contexts?.length > 0)
                    ) {
                      showDivider = true
                    }
                    const attachmentExtractedContent =
                      getMessageAttachmentExtractedContent(attachment, message)
                    if (attachmentExtractedContent) {
                      return (
                        <Stack
                          width={384}
                          height={384}
                          p={1}
                          borderRadius={1}
                          key={attachment.id}
                          border={'1px solid'}
                          borderColor='customColor.borderColor'
                        >
                          <Typography
                            textAlign={'left'}
                            lineHeight={'22.5px'}
                            color={'text.primary'}
                            fontSize={'18px'}
                            noWrap
                            fontWeight={500}
                            flexShrink={0}
                          >
                            {attachment.fileName}
                          </Typography>
                          <Typography
                            textAlign={'left'}
                            fontSize={'14px'}
                            color={'text.secondary'}
                            noWrap
                            flexShrink={0}
                          >
                            {`${filesizeFormatter(
                              attachment.fileSize || 0,
                            )} • ${attachment.fileType}`}
                          </Typography>
                          <Typography
                            textAlign={'left'}
                            fontSize={'12px'}
                            color={'text.secondary'}
                            noWrap
                            flexShrink={0}
                            display={'flex'}
                            alignItems={'center'}
                            gap={1}
                          >
                            <ErrorOutlineOutlinedIcon
                              sx={{ fontSize: '12px', color: 'inherit' }}
                            />
                            {t(
                              `client:chat__user_message__contexts__file__preview__tips`,
                            )}
                          </Typography>
                          <LargeTextBox
                            text={attachmentExtractedContent}
                            sx={{
                              mt: 1,
                            }}
                            fontSx={{
                              whiteSpace: 'pre-wrap',
                              wordBreak: 'break-word',
                              fontSize: '14px',
                              color: 'text.primary',
                              textAlign: 'left',
                              lineHeight: '20px',
                            }}
                          />
                        </Stack>
                      )
                    }
                    if (!attachment.uploadedUrl) {
                      return null
                    }
                    {
                      /*// 图片展示*/
                    }
                    return (
                      <Fragment key={attachment.uploadedUrl}>
                        <LazyLoadImage
                          imgStyle={{
                            borderRadius: '8px',
                            border: '1px solid #00000014',
                            objectFit: 'contain',
                            boxSizing: 'border-box',
                          }}
                          src={attachment.uploadedUrl}
                          fileId={attachment.uploadedFileId}
                          alt={attachment.fileName}
                          width={384}
                          height={384}
                        />
                        {showDivider && <Divider sx={{ my: 0.5 }} />}
                      </Fragment>
                    )
                  })}
                  {contexts?.map((context, index) => {
                    return (
                      <Fragment key={index}>
                        <Stack direction={'row'} gap={1} alignItems={'center'}>
                          <Chip
                            variant={'outlined'}
                            label={context.key}
                            color={'primary'}
                            size='small'
                            sx={{
                              fontSize: '14px',
                              width: 'max-content',
                              bgcolor: (t) =>
                                t.palette.mode === 'dark'
                                  ? 'rgba(249,244,255)'
                                  : 'rgba(249,244,255)',
                            }}
                          />
                          <CopyTooltipIconButton
                            PopperProps={{
                              disablePortal: true,
                            }}
                            copyText={context.value?.trim() ?? ''}
                          />
                        </Stack>
                        <Typography
                          width={384}
                          whiteSpace={'pre-wrap'}
                          key={index}
                          color={'text.primary'}
                          textAlign={'left'}
                          lineHeight={'24px'}
                          fontSize={'16px'}
                        >
                          {context.value?.trim() ?? ''}
                        </Typography>
                        {
                          // 最后一个不需要分割线
                          index !== contexts.length - 1 && (
                            <Divider sx={{ my: 0.5 }} />
                          )
                        }
                      </Fragment>
                    )
                  })}
                </Stack>
              </Stack>
            }
            placement={'top'}
            arrow
            disableFocusListener
            disableHoverListener
            disableTouchListener
            onClose={() => setOpen(false)}
          >
            <Box
              sx={{
                display: 'flex',
                gap: '4px',
                borderRadius: '8px',
                border: '1px solid rgba(0, 0, 0, 0.12)',
                padding: '2px 6px',
                alignItems: 'center',
                userSelect: 'none',
                cursor: 'pointer',
              }}
              onClick={() => {
                setOpen(!open)
              }}
            >
              <Box color='text.primary' fontSize={'14px'}>
                {t('floating_menu__button__show_detail')}
              </Box>

              <KeyboardArrowDown
                sx={{
                  color: '#D9D9D9',
                  height: '16px',
                  width: '16px',
                  transition: 'all 0.2s',
                  transform: `rotate(${open ? 0.5 : 0}turn)`,
                }}
              />
            </Box>
          </LightTooltip>
        </Box>
      </MaxAIClickAwayListener>
    </Stack>
  )
}

export default MessageContexts
