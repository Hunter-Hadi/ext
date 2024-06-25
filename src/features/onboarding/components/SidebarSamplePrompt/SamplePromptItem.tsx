import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import { SxProps } from '@mui/material/styles'
import React, { FC } from 'react'

import EllipsisTextWithTooltip from '@/features/common/components/EllipsisTextWithTooltip'

type ISamplePromptDataType = {
  title: string
  [key: string]: any
}

interface ISamplePromptItemProps {
  promptData: ISamplePromptDataType
  disabled?: boolean
  onClick?: (data: ISamplePromptDataType) => void
  order?: number
  sx?: SxProps
  showLineClamp?: number
}

const SamplePromptItem: FC<ISamplePromptItemProps> = ({
  promptData,
  disabled,
  onClick,
  order,
  showLineClamp = 1,
}) => {
  return (
    <Fade
      in
      style={{
        transitionDelay: order ? `${order * 150}ms` : '0ms',
      }}
    >
      <Paper
        component={'button'}
        sx={{
          width: '100%',
          px: 2,
          py: 1.5,
          bgcolor: disabled
            ? 'customColor.secondaryBackground'
            : 'background.paper',
          border: '1px solid',
          borderColor: 'customColor.borderColor',
          boxShadow: disabled ? 'none' : '0px 1px 2px 0px #0000000D',
          cursor: disabled ? 'default' : 'pointer',
          transition: 'border-color 0.3s',
          borderRadius: 2,
          flex: 1,
          '&:hover': {
            borderColor: disabled ? 'customColor.borderColor' : 'primary.main',
          },
        }}
        onClick={() => {
          if (disabled) {
            return
          }
          onClick && onClick(promptData)
        }}
      >
        <EllipsisTextWithTooltip
          textAlign={'left'}
          tip={promptData.title}
          resizeListener
          lineClamp={showLineClamp}
          sx={{
            fontSize: '14px',
            lineHeight: '21px',
            whiteSpace: 'normal',
            wordBreak: 'break-word',
            minHeight: showLineClamp * 21,
            color: disabled ? 'text.disabled' : 'text.primary',
          }}
        >
          {promptData.title}
        </EllipsisTextWithTooltip>
      </Paper>
    </Fade>
  )
}

export default SamplePromptItem
