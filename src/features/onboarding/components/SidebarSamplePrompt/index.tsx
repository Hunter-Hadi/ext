import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import shuffle from 'lodash-es/shuffle'
import React, { FC, useMemo } from 'react'

import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import { useChatBoxStyles } from '@/hooks/useChatBoxWidth'
import { isMaxAIImmersiveChatPage } from '@/utils/dataHelper/websiteHelper'

import SidebarArtSamplePrompt from './SidebarArtSamplePrompt'
import SidebarChatSamplePrompt from './SidebarChatSamplePrompt'
import SidebarSearchSamplePrompt from './SidebarSearchSamplePrompt'

//从 CHAT_SAMPLE_PROMPT_POOL 随机 几个 sample prompt
export function getRandomSamplePromptPoolList<T>(
  promptPool: T[],
  count: number,
): T[] {
  const shuffledSamplePromptList = shuffle(promptPool)
  return shuffledSamplePromptList.slice(0, count)
}

export interface ISidebarSamplePromptContainerProps
  extends ISidebarSamplePromptProps {
  promptItemXs?: number
  showLineClamp?: number
}

interface ISidebarSamplePromptProps {
  isSettingVariables?: boolean
}

const SidebarSamplePrompt: FC<ISidebarSamplePromptProps> = ({
  isSettingVariables,
}) => {
  const theme = useTheme()

  const isDownMdWithWidow = useMediaQuery(theme.breakpoints.down('md')) // 窗口宽度小于 1024 时为 true

  const { currentSidebarConversationType } = useSidebarSettings()

  const { visibleWidth: sidebarWidth } = useChatBoxStyles()

  const isInMaxAIImmersiveChat = isMaxAIImmersiveChatPage()

  const samplePromptItemXs = useMemo(() => {
    if (isInMaxAIImmersiveChat) {
      // 在 maxai immersive chat 页面，直接使用 窗口宽度的 breakpoint
      return isDownMdWithWidow ? 6 : 3
    } else {
      // 不在 maxai immersive chat 页面时，需要计算 sidebarWidth
      const themeBreakpoints = theme.breakpoints.values
      return sidebarWidth < themeBreakpoints.md ? 6 : 3
    }
  }, [
    isInMaxAIImmersiveChat,
    sidebarWidth,
    isDownMdWithWidow,
    theme.breakpoints.values,
  ])

  const samplePromptLineClamp = useMemo(() => {
    return samplePromptItemXs >= 12 ? 1 : 2
  }, [samplePromptItemXs])

  if (currentSidebarConversationType === 'Chat') {
    return (
      <SidebarChatSamplePrompt
        isSettingVariables={isSettingVariables}
        promptItemXs={samplePromptItemXs}
        showLineClamp={samplePromptLineClamp}
      />
    )
  }

  if (currentSidebarConversationType === 'Search') {
    return (
      <SidebarSearchSamplePrompt
        isSettingVariables={isSettingVariables}
        promptItemXs={samplePromptItemXs}
        showLineClamp={samplePromptLineClamp}
      />
    )
  }

  if (currentSidebarConversationType === 'Art') {
    return (
      <SidebarArtSamplePrompt
        isSettingVariables={isSettingVariables}
        promptItemXs={samplePromptItemXs}
        showLineClamp={samplePromptLineClamp}
      />
    )
  }

  return null
}

export default SidebarSamplePrompt
