import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import React, { FC, useMemo } from 'react'

import useArtTextToImage from '@/features/art/hooks/useArtTextToImage'
import {
  getRandomSamplePromptPoolList,
  ISidebarSamplePromptContainerProps,
} from '@/features/onboarding/components/SidebarSamplePrompt'
import SamplePromptItem from '@/features/onboarding/components/SidebarSamplePrompt//SamplePromptItem'
import { ART_SAMPLE_PROMPT_POOL } from '@/features/onboarding/constants/artSamplePromptPool'

interface IProps extends ISidebarSamplePromptContainerProps {}

const SidebarArtSamplePrompt: FC<IProps> = ({
  // isSettingVariables,
  promptItemXs,
  showLineClamp,
}) => {
  const { startTextToImage } = useArtTextToImage()

  const samplePromptList = useMemo(
    () => getRandomSamplePromptPoolList(ART_SAMPLE_PROMPT_POOL, 4),
    [],
  )

  return (
    <Stack width={'100%'}>
      <Grid container spacing={1.5}>
        {samplePromptList.map((samplePrompt, index) => (
          <Grid key={samplePrompt.title} item xs={promptItemXs}>
            <SamplePromptItem
              promptData={samplePrompt}
              disabled={false}
              onClick={async (promptData) => {
                if (promptData && promptData.prompt) {
                  await startTextToImage(promptData.prompt, true)
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

export default SidebarArtSamplePrompt
