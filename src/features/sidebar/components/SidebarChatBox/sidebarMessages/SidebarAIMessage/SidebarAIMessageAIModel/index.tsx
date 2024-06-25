import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { FC, useMemo } from 'react'

import { IAIProviderType } from '@/background/provider/chat'
import { getAIModelShowLabel } from '@/features/chatgpt/components/AIProviderModelSelectorCard/AIProviderModelSelectorOptions'
import AIModelIcons from '@/features/chatgpt/components/icons/AIModelIcons'

const SidebarAIMessageAIModel: FC<{
  AIProvider?: IAIProviderType
  AIModel?: string
}> = (props) => {
  const { AIModel, AIProvider } = props
  const memoAIModelShowLabel = useMemo(() => {
    return getAIModelShowLabel(AIModel || '')
  }, [AIModel])

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
      <AIModelIcons size={24} aiProvider={AIProvider} aiModelValue={AIModel} />
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
        {memoAIModelShowLabel}
      </Typography>
    </Stack>
  )
}
export default SidebarAIMessageAIModel
