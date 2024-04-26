import ArrowForwardIosOutlinedIcon from '@mui/icons-material/ArrowForwardIosOutlined'
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import { styled, SxProps } from '@mui/material/styles'
import Tooltip, { tooltipClasses, TooltipProps } from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import React, { FC, Fragment, useMemo, useState } from 'react'

import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import CopyTooltipIconButton from '@/components/CopyTooltipIconButton'
import LargeTextBox from '@/components/LargeTextBox'
import LazyLoadImage from '@/components/LazyLoadImage'
import MaxAIClickAwayListener from '@/components/MaxAIClickAwayListener'
import { IUserChatMessage } from '@/features/chatgpt/types'
import { safeGetAttachmentExtractedContent } from '@/features/sidebar/utils/chatMessagesHelper'
import { filesizeFormatter } from '@/utils/dataHelper/numberHelper'
const LightTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
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
 * 用于展示用户消息的上下文
 * @since 2024-02-28
 */
const SidebarUserMessageContexts: FC<{
  message: IUserChatMessage
  sx?: SxProps
  container?: HTMLElement
}> = (props) => {
  const { message, sx, container } = props
  const [open, setOpen] = useState(false)
  const attachments = useMemo(() => {
    return (message.meta?.attachments || []).filter(
      (attachment) => attachment.uploadStatus === 'success',
    )
  }, [message.meta?.attachments])
  const contexts = message.meta?.contexts
  const renderShortContent = useMemo(() => {
    return contexts?.[0]?.value?.slice(0, 500).trim() || ''
  }, [contexts])
  if (!attachments.length && !contexts?.length) {
    return null
  }
  const extractedContentAttachments = attachments.filter(
    (attachment) => attachment.extractedContent,
  )

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
        <Stack direction={'row'} maxWidth={'calc(100% - 16px)'}>
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
                    if (attachment.extractedContent) {
                      const extractedContent =
                        safeGetAttachmentExtractedContent(
                          attachment.extractedContent,
                        )
                      return (
                        <Stack
                          width={384}
                          height={384}
                          p={1}
                          borderRadius={1}
                          key={attachment.id}
                          border={'1px solid'}
                          borderColor="customColor.borderColor"
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
                            {`Formatting may be inconsistent from source.`}
                          </Typography>
                          <LargeTextBox
                            text={extractedContent}
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
                            size="small"
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
            <Stack
              onClick={() => {
                setOpen(true)
              }}
              gap={1}
              sx={{
                borderRadius: '8px',
                width: 'max-content',
                bgcolor: (t) =>
                  t.palette.mode === 'dark' ? '#393743' : '#F6F2F9',
                borderLeft: '4px solid #9065B0',
                cursor: 'pointer',
              }}
              p={1}
            >
              <Stack
                width={'100%'}
                ml={'auto'}
                mb={0.5}
                flexDirection={'row'}
                gap={1}
                alignItems={'flex-end'}
                justifyContent={'flex-end'}
              >
                {/*// 主要展示的内容，如果有附件则展示附件，如果有上下文则展示上下文*/}
                {attachments.length > 0 && (
                  <Stack
                    direction={'row'}
                    alignItems={'center'}
                    justifyContent={'flex-start'}
                    width={'100%'}
                    gap={0.5}
                  >
                    {attachments.map((attachment, index) => {
                      if (attachment.fileType.startsWith('image')) {
                        if (!attachment.uploadedUrl) {
                          return null
                        }
                        return (
                          <LazyLoadImage
                            imgStyle={{
                              borderRadius: '8px',
                              objectFit: 'cover',
                            }}
                            key={attachment.uploadedUrl}
                            src={attachment.uploadedUrl}
                            alt={attachment.fileName}
                            width={64}
                            height={48}
                          />
                        )
                      }
                      return null
                    })}
                  </Stack>
                )}
                {attachments.length === 0 && (
                  <Typography
                    data-testid={'user-message-short-contexts'}
                    sx={{
                      textAlign: 'left',
                      color: (t: any) =>
                        t.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.38)'
                          : 'rgba(0, 0, 0, 0.38)',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      wordBreak: 'break-word',
                      lineClamp: `2`,
                      boxOrient: 'vertical',
                      display: '-webkit-box',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                    fontSize={'14px'}
                    variant={'body2'}
                    lineHeight={'20px'}
                  >
                    {renderShortContent}
                  </Typography>
                )}
                {extractedContentAttachments.length === 0 && (
                  <Stack flexShrink={0}>
                    <ArrowForwardIosOutlinedIcon
                      sx={{
                        height: '20px',
                        fontSize: '16px',
                        color: (t: any) =>
                          t.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.38)'
                            : 'rgba(0, 0, 0, 0.38)',
                      }}
                    />
                  </Stack>
                )}
              </Stack>
              {attachments.length > 0 && (
                <Stack gap={1} width={'100%'}>
                  {extractedContentAttachments.map((attachment, index) => {
                    return (
                      <Stack
                        key={attachment.id}
                        border={'1px solid'}
                        borderColor="customColor.borderColor"
                        direction={'row'}
                        gap={1}
                        width={240}
                        borderRadius={1}
                        p={1}
                        ml={'auto'}
                      >
                        <Stack
                          flexShrink={0}
                          borderRadius={`8px`}
                          width={40}
                          height={40}
                          alignItems={'center'}
                          justifyContent={'center'}
                          bgcolor={'primary.main'}
                        >
                          <ContextMenuIcon
                            icon={'InsertDriveFile'}
                            sx={{
                              color: '#fff',
                              fontSize: `${28}px`,
                            }}
                          />
                        </Stack>
                        <Stack width={0} flex={1}>
                          <Typography
                            lineHeight={`20px`}
                            color={'text.primary'}
                            fontSize={'14px'}
                            noWrap
                          >
                            {attachment.fileName}
                          </Typography>
                          <Typography
                            lineHeight={`20px`}
                            color={'text.secondary'}
                            fontSize={'14px'}
                            noWrap
                          >
                            {attachment.fileType}
                          </Typography>
                        </Stack>
                        {extractedContentAttachments.length - 1 === index && (
                          <Stack flexShrink={0} mt={'auto'}>
                            <ArrowForwardIosOutlinedIcon
                              sx={{
                                height: '20px',
                                fontSize: '16px',
                                color: (t: any) =>
                                  t.palette.mode === 'dark'
                                    ? 'rgba(255, 255, 255, 0.38)'
                                    : 'rgba(0, 0, 0, 0.38)',
                              }}
                            />
                          </Stack>
                        )}
                      </Stack>
                    )
                  })}
                </Stack>
              )}
            </Stack>
          </LightTooltip>
        </Stack>
      </MaxAIClickAwayListener>
    </Stack>
  )
}

export default SidebarUserMessageContexts
