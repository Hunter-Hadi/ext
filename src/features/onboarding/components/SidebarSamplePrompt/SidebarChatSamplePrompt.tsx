import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { FC, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import useClientChat from '@/features/chatgpt/hooks/useClientChat'
import {
  getRandomSamplePromptPoolList,
  ISidebarSamplePromptContainerProps,
} from '@/features/onboarding/components/SidebarSamplePrompt'
import SamplePromptItem from '@/features/onboarding/components/SidebarSamplePrompt//SamplePromptItem'
import { CHAT_SAMPLE_PROMPT_POOL } from '@/features/onboarding/constants/chatSamplePromptPool'
import usePromptLibraryCardDetail from '@/features/prompt_library/hooks/usePromptLibraryCardDetail'
import { promptLibraryCardDetailDataToActions } from '@/features/shortcuts/utils/promptInterpreter'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import { getMaxAISidebarRootElement } from '@/utils'

interface IProps extends ISidebarSamplePromptContainerProps {}

const SidebarChatSamplePrompt: FC<IProps> = ({
  isSettingVariables,
  promptItemXs,
  showLineClamp,
}) => {
  const { t } = useTranslation(['client'])

  const [selectSamplePromptId, setSelectSamplePromptId] =
    React.useState<string>('')

  const { updateSidebarConversationType } = useSidebarSettings()

  const { askAIWIthShortcuts, shortCutsEngine } = useClientChat()

  const { data, isFetching } = usePromptLibraryCardDetail(
    selectSamplePromptId,
    'public',
  )

  const samplePromptList = useMemo(
    () => getRandomSamplePromptPoolList(CHAT_SAMPLE_PROMPT_POOL, 4),
    [],
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

  return (
    <Stack spacing={1.5} width='100%'>
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
            <Grid key={samplePrompt.id} item xs={promptItemXs}>
              <SamplePromptItem
                promptData={samplePrompt}
                disabled={isFetching}
                onClick={(promptData) => {
                  promptData.id && setSelectSamplePromptId(promptData.id)
                }}
                order={index + 1}
                showLineClamp={showLineClamp}
              />
            </Grid>
          ))}
        </Grid>
      </Stack>
    </Stack>
  )
}

export default SidebarChatSamplePrompt
