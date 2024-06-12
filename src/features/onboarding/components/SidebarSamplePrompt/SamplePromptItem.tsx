import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import { SxProps } from '@mui/material/styles'
import React, { FC } from 'react'

import EllipsisTextWithTooltip from '@/features/common/components/EllipsisTextWithTooltip'
import { isMaxAIImmersiveChatPage } from '@/utils/dataHelper/websiteHelper'

interface ISamplePromptItemProps {
  id: string
  title: string
  disabled?: boolean
  onClick?: (id: string) => void
  order?: number
  sx?: SxProps
}

const SamplePromptItem: FC<ISamplePromptItemProps> = ({
  id,
  title,
  disabled,
  onClick,
  order,
}) => {
  const isInMaxAIImmersiveChat = isMaxAIImmersiveChatPage()
  return (
    <Fade
      in
      style={{
        transitionDelay: order ? `${order * 150}ms` : '0ms',
      }}
    >
      <Paper
        sx={{
          px: 2,
          py: 1.5,
          border: '1px solid',
          borderColor: 'customColor.borderColor',
          boxShadow: '0px 1px 2px 0px #0000000D',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'border-color 0.3s',
          flex: 1,
          '&:hover': {
            borderColor: 'primary.main',
          },
        }}
        onClick={() => {
          if (disabled) {
            return
          }
          onClick && onClick(id)
        }}
      >
        <EllipsisTextWithTooltip
          tip={title}
          resizeListener
          lineClamp={isInMaxAIImmersiveChat ? 2 : 1}
          sx={{
            fontSize: '14px',
            lineHeight: '21px',
            whiteSpace: 'normal',
            wordBreak: 'break-word',
            minHeight: isInMaxAIImmersiveChat ? '42px' : '21px',
            color: 'text.primary',
          }}
        >
          {title}
        </EllipsisTextWithTooltip>
      </Paper>
    </Fade>
  )
}

export default SamplePromptItem
