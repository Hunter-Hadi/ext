import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import React, { FC, useMemo } from 'react'

import {
  getRandomSamplePromptPoolList,
  ISidebarSamplePromptContainerProps,
} from '@/features/onboarding/components/SidebarSamplePrompt'
import SamplePromptItem from '@/features/onboarding/components/SidebarSamplePrompt//SamplePromptItem'
import discoverPool from '@/features/onboarding/constants/discover.json'
import useSearchWithAI from '@/features/sidebar/hooks/useSearchWithAI'

interface IProps extends ISidebarSamplePromptContainerProps {}

const SidebarSearchSamplePrompt: FC<IProps> = ({
  // isSettingVariables,
  promptItemXs,
  showLineClamp,
}) => {
  const { createSearchWithAI } = useSearchWithAI()

  const samplePromptList = useMemo(
    () => getRandomSamplePromptPoolList(discoverPool, 4),
    [],
  )

  return (
    <Stack>
      <Grid container spacing={1.5}>
        {samplePromptList.map((samplePrompt, index) => (
          <Grid key={samplePrompt.title} item xs={promptItemXs}>
            <SamplePromptItem
              promptData={samplePrompt}
              disabled={false}
              onClick={async (promptData) => {
                if (promptData.title) {
                  await createSearchWithAI(promptData.title, true)
                }
              }}
              order={index + 1}
              showLineClamp={showLineClamp}
            />
          </Grid>
        ))}
      </Grid>
    </Stack>
  )
}

export default SidebarSearchSamplePrompt
