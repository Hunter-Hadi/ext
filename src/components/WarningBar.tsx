import InfoIcon from '@mui/icons-material/Info'
import { Link, SxProps } from '@mui/material'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { FC, HTMLAttributeAnchorTarget } from 'react'

import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import { isMaxAIImmersiveChatPage } from '@/utils/dataHelper/websiteHelper'

interface IProps {
  title: string
  content: string
  href?: string
  target?: HTMLAttributeAnchorTarget | undefined
  onClick?: () => void
  onClose?: () => void
  sx?: SxProps
}

const WarningBar: FC<IProps> = (props) => {
  const {
    title,
    content,
    href,
    target = '_blank',
    onClick,
    onClose,
    sx,
  } = props

  const isImmersiveChat = isMaxAIImmersiveChatPage()

  return (
    <Stack
      direction="row"
      spacing={1}
      p={1.5}
      sx={{
        position: 'relative',
        bgcolor: 'rgba(255, 239, 188, 1)',
        color: 'rgba(132, 49, 0, 1)',
        pr: isImmersiveChat
          ? {
              xs: '60px',
              md: 1.5,
            }
          : '60px',
        justifyContent: isImmersiveChat
          ? {
              md: 'center',
            }
          : null,
        ...sx,
      }}
    >
      <InfoIcon sx={{ colo: 'inherit', fontSize: 20, mt: '2px' }} />
      <Stack spacing={1}>
        <Typography
          sx={{
            fontSize: 14,
          }}
        >
          {title}
        </Typography>
        <Link
          href={href}
          target={target}
          sx={{ color: 'inherit', fontSize: 16, fontWeight: 500 }}
          onClick={onClick}
        >
          {content}
        </Link>
      </Stack>

      <IconButton
        sx={{
          position: 'absolute',
          right: '8px',
          top: '50%',
          transform: 'translateY(-50%)',
        }}
        onClick={onClose}
      >
        <ContextMenuIcon
          icon="Close"
          sx={{
            color: 'rgba(0, 0, 0, 0.6)',
            fontSize: '24px',
          }}
        />
      </IconButton>
    </Stack>
  )
}

export default WarningBar
