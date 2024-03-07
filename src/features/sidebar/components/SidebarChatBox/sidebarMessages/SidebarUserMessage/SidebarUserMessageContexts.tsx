import ArrowForwardIosOutlinedIcon from '@mui/icons-material/ArrowForwardIosOutlined'
import Chip from '@mui/material/Chip'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import { styled } from '@mui/material/styles'
import Tooltip, { tooltipClasses, TooltipProps } from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import React, { FC, Fragment, useMemo, useState } from 'react'

import CopyTooltipIconButton from '@/components/CopyTooltipIconButton'
import LazyLoadImage from '@/components/LazyLoadImage'
import { IUserChatMessage } from '@/features/chatgpt/types'

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
}> = (props) => {
  const { message } = props
  const [open, setOpen] = useState(false)

  const attachmentImages = useMemo(() => {
    return (message.meta?.attachments || []).filter(
      (attachment) =>
        attachment.fileType.startsWith('image') &&
        attachment.uploadStatus === 'success',
    )
  }, [message.meta?.attachments])
  const contexts = message.meta?.contexts
  if (!attachmentImages.length && !contexts?.length) {
    return null
  }
  return (
    <div>
      <ClickAwayListener
        onClickAway={() => {
          setOpen(false)
        }}
      >
        <div>
          <LightTooltip
            open={open}
            title={
              <Stack
                py={0.5}
                borderRadius={1}
                maxHeight={400}
                overflow={'auto'}
              >
                <Stack gap={1}>
                  {attachmentImages.map((attachment, index) => {
                    if (!attachment.uploadedUrl) {
                      return null
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
                        <Divider sx={{ my: 0.5 }} />
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
              onClick={() => setOpen(true)}
              p={1}
              sx={{
                borderRadius: '8px',
                width: 'max-content',
                maxWidth: 'calc(100% - 16px)',
                bgcolor: (t) =>
                  t.palette.mode === 'dark' ? '#393743' : '#F6F2F9',
                borderLeft: '4px solid #9065B0',
                cursor: 'pointer',
              }}
              ml={'auto'}
              mb={0.5}
              flexDirection={'row'}
              gap={1}
              alignItems={'flex-end'}
            >
              {/*// 主要展示的内容，如果有附件则展示附件，如果有上下文则展示上下文*/}
              {attachmentImages.length > 0 ? (
                <Stack
                  direction={'row'}
                  alignItems={'center'}
                  justifyContent={'flex-start'}
                  width={'100%'}
                  gap={0.5}
                >
                  {attachmentImages.map((attachment, index) => {
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
                  })}
                </Stack>
              ) : (
                <Typography
                  sx={{
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
                  {contexts?.[0]?.value}
                </Typography>
              )}
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
            </Stack>
          </LightTooltip>
        </div>
      </ClickAwayListener>
    </div>
  )
}

export default SidebarUserMessageContexts
