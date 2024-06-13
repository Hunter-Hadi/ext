import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import shuffle from 'lodash-es/shuffle'
import React, { FC, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import useClientChat from '@/features/chatgpt/hooks/useClientChat'
import SamplePromptItem from '@/features/onboarding/components/SidebarSamplePrompt//SamplePromptItem'
import { SAMPLE_PROMPT_POOL } from '@/features/onboarding/constants/sample_prompt_pool'
import usePromptLibraryCardDetail from '@/features/prompt_library/hooks/usePromptLibraryCardDetail'
import { promptLibraryCardDetailDataToActions } from '@/features/shortcuts/utils/promptInterpreter'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import { useChatBoxStyles } from '@/hooks/useChatBoxWidth'
import { getMaxAISidebarRootElement } from '@/utils'
import { isMaxAIImmersiveChatPage } from '@/utils/dataHelper/websiteHelper'
//从 SAMPLE_PROMPT_POOL 随机 几个 sample prompt
const getRandomSamplePromptPoolList = (count: number) => {
  const shuffledSamplePromptList = shuffle(SAMPLE_PROMPT_POOL)
  return shuffledSamplePromptList.slice(0, count)
}

interface ISidebarSamplePromptPrompt {
  isSettingVariables?: boolean
}

const SidebarSamplePrompt: FC<ISidebarSamplePromptPrompt> = ({
  isSettingVariables,
}) => {
  const { t } = useTranslation(['client'])
  const theme = useTheme()

  const isDownMdWithWidow = useMediaQuery(theme.breakpoints.down('md')) // 窗口宽度小于 1024 时为 true

  const { currentSidebarConversationType, updateSidebarConversationType } =
    useSidebarSettings()
  const { askAIWIthShortcuts, shortCutsEngine } = useClientChat()

  const samplePromptList = useMemo(() => getRandomSamplePromptPoolList(4), [])

  const [selectSamplePromptId, setSelectSamplePromptId] =
    React.useState<string>('')

  const { visibleWidth: sidebarWidth } = useChatBoxStyles()

  const isInMaxAIImmersiveChat = isMaxAIImmersiveChatPage()

  const samplePromptItemXs = useMemo(() => {
    if (isInMaxAIImmersiveChat) {
      // 在 maxai immersive chat 页面，直接使用 窗口宽度的 breakpoint
      return isDownMdWithWidow ? 12 : 3
    } else {
      // 不在 maxai immersive chat 页面时，需要计算 sidebarWidth
      const themeBreakpoints = theme.breakpoints.values
      return sidebarWidth < themeBreakpoints.md ? 12 : 3
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

  const { data, isFetching } = usePromptLibraryCardDetail(
    selectSamplePromptId,
    'public',
  )

  const showExploreMore = useMemo(() => {
    return !isSettingVariables && !selectSamplePromptId
  }, [isSettingVariables, selectSamplePromptId])

  const handleExploreMore = () => {
    if (isFetching) {
      return
    }
    // 找到 prompt library btn, 模拟点击
    const timer = setInterval(() => {
      const promptLibraryBtn = getMaxAISidebarRootElement()?.querySelector(
        'button[data-testid="maxai-prompt-library-button"]',
      ) as HTMLButtonElement
      if (promptLibraryBtn) {
        clearInterval(timer)
        promptLibraryBtn.click()
      }
    }, 500)
  }

  useEffect(() => {
    if (selectSamplePromptId && data && isFetching === false) {
      const actions = promptLibraryCardDetailDataToActions(data)
      if (actions && shortCutsEngine?.status !== 'running') {
        updateSidebarConversationType('Chat')
        askAIWIthShortcuts(actions)
          .then()
          .catch()
          .finally(() => {
            setSelectSamplePromptId('')
          })
      }
    }
  }, [data, isFetching, selectSamplePromptId])

  // 现在只有 chat 会显示 sample prompt
  if (currentSidebarConversationType !== 'Chat') {
    return null
  }
  return (
    <Stack spacing={1.5} px={1.5} pt={2} pb={3} width='100%'>
      {showExploreMore && (
        <Typography
          fontSize={14}
          lineHeight={1.5}
          sx={{
            textDecoration: 'underline',
            width: 'max-content',
            mx: 'auto !important',
            cursor: 'pointer',
            color: isFetching ? 'text.disabled' : 'text.primary',
          }}
          onClick={handleExploreMore}
        >
          {t('client:home_view__sample_prompt__explore_more')}
        </Typography>
      )}
      <Stack>
        <Grid container spacing={1.5}>
          {samplePromptList.map((samplePrompt, index) => (
            <Grid key={samplePrompt.id} item xs={samplePromptItemXs}>
              <SamplePromptItem
                id={samplePrompt.id}
                title={samplePrompt.title}
                disabled={isFetching}
                onClick={setSelectSamplePromptId}
                order={index + 1}
                showLineClamp={samplePromptLineClamp}
              />
            </Grid>
          ))}
        </Grid>
      </Stack>
    </Stack>
  )
}

export default SidebarSamplePrompt
