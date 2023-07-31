import React, { FC } from 'react'
import Stack from '@mui/material/Stack'
import FeatureChatGPTStableModeCard from '@/pages/settings/pages/chatgpt_stable_mode/FeatureChatGPTStableModeCard'
const SettingsChatGPTStableModePage: FC = () => {
  return (
    <Stack spacing={1}>
      <FeatureChatGPTStableModeCard />
    </Stack>
  )
}
export default SettingsChatGPTStableModePage
