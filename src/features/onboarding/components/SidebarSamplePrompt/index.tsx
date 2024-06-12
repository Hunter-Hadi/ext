import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import shuffle from 'lodash-es/shuffle'
import React, { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import useClientChat from '@/features/chatgpt/hooks/useClientChat'
import SamplePromptItem from '@/features/onboarding/components/SidebarSamplePrompt//SamplePromptItem'
import { SAMPLE_PROMPT_POOL } from '@/features/onboarding/constants/sample_prompt_pool'
import usePromptLibraryCardDetail from '@/features/prompt_library/hooks/usePromptLibraryCardDetail'
import { promptLibraryCardDetailDataToActions } from '@/features/shortcuts/utils/promptInterpreter'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
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
  const { t } = useTranslation('client')
  const { currentSidebarConversationType, updateSidebarConversationType } =
    useSidebarSettings()
  const { askAIWIthShortcuts, shortCutsEngine } = useClientChat()

  const samplePromptList = useMemo(() => getRandomSamplePromptPoolList(4), [])

  const [selectSamplePromptId, setSelectSamplePromptId] =
    React.useState<string>('')

  const isInMaxAIImmersiveChat = isMaxAIImmersiveChatPage()

  const { data, isFetching } = usePromptLibraryCardDetail(
    selectSamplePromptId,
    'public',
  )

  const handleExploreMore = () => {
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
    <Stack spacing={1.5} px={1.5} pt={1.5} pb={3} width='100%'>
      {!isSettingVariables && (
        <Typography
          fontSize={14}
          lineHeight={1.5}
          sx={{
            textDecoration: 'underline',
            width: 'max-content',
            mx: 'auto !important',
            cursor: 'pointer',
            color: 'text.primary',
          }}
          onClick={handleExploreMore}
        >
          {t('client:home_view__sample_prompt__explore_more')}
        </Typography>
      )}
      <Stack
        direction={isInMaxAIImmersiveChat ? 'row' : 'column'}
        spacing={1.5}
        sx={[isInMaxAIImmersiveChat ? {} : {}]}
      >
        {samplePromptList.map((samplePrompt, index) => (
          <SamplePromptItem
            key={samplePrompt.id}
            id={samplePrompt.id}
            title={samplePrompt.title}
            disabled={isFetching}
            onClick={setSelectSamplePromptId}
            order={index + 1}
          />
        ))}
      </Stack>
    </Stack>
  )
}

export default SidebarSamplePrompt
