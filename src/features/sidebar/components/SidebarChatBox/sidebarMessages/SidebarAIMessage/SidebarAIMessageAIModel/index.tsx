import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { FC } from 'react'

import AIModelIcons from '@/features/chatgpt/components/icons/AIModelIcons'

const SidebarAIMessageAIModel: FC<{
  AIModel?: string
}> = (props) => {
  const { AIModel } = props
  if (!AIModel) {
    return null
  }
  return (
    <Stack
      sx={{
        height: '24px',
        mb: '8px',
        width: '100%',
      }}
      direction={'row'}
      alignItems={'center'}
      gap={'8px'}
    >
      <AIModelIcons size={24} aiModelValue={AIModel} />
      <Typography
        sx={{
          fontSize: '16px',
          lineHeight: '24px',
          color: (t) =>
            t.palette.mode === 'dark'
              ? 'rgba(255, 255, 255, 0.3)'
              : 'rgba(0, 0, 0, 0.38)',
          fontWeight: 500,
        }}
      >
        {AIModel}
      </Typography>
    </Stack>
  )
}
export default SidebarAIMessageAIModel
