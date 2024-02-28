import ArrowForwardIosOutlinedIcon from '@mui/icons-material/ArrowForwardIosOutlined'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Stack from '@mui/material/Stack'
import { styled } from '@mui/material/styles'
import Tooltip, { tooltipClasses, TooltipProps } from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import React, { FC, useMemo, useState } from 'react'

import LazyLoadImage from '@/components/LazyLoadImage'
import { IUserChatMessage } from '@/features/chatgpt/types'

const LightTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.background.paper,
    color: 'rgba(0, 0, 0, 0.87)',
    fontSize: 12,
    boxShadow: theme.shadows[1],
    maxWidth: 'none',
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.background.paper,
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
                p={1}
                borderRadius={1}
                width={280}
                maxHeight={400}
                overflow={'auto'}
              >
                <Stack gap={1}>
                  {attachmentImages.map((attachment, index) => {
                    if (!attachment.uploadedUrl) {
                      return null
                    }
                    return (
                      <LazyLoadImage
                        imgStyle={{
                          borderRadius: 1,
                          objectFit: 'contain',
                          border: '1px solid rgba(0, 0, 0, 0.12)',
                          padding: '8px',
                        }}
                        key={attachment.uploadedUrl}
                        src={attachment.uploadedUrl}
                        alt={attachment.fileName}
                        width={240}
                        height={240}
                      />
                    )
                  })}
                  {contexts?.map((context, index) => {
                    return (
                      <Typography
                        key={index}
                        variant={'body2'}
                        lineHeight={'20px'}
                      >
                        {context.key}: {context.value}
                      </Typography>
                    )
                  })}
                </Stack>
              </Stack>
            }
            placement={'left'}
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
                borderRadius: 1,
                width: 'max-content',
                maxWidth: 'calc(100% - 16px)',
                backgroundColor: 'rgba(235, 235, 235, 1)',
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
                          borderRadius: 1,
                        }}
                        key={attachment.uploadedUrl}
                        src={attachment.uploadedUrl}
                        alt={attachment.fileName}
                        width={72}
                        height={54}
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
                  variant={'body2'}
                  lineHeight={'20px'}
                >
                  {open ? '点击收起' : '点击展开'}
                  {contexts?.[0]?.key}: {contexts?.[0]?.value}
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
