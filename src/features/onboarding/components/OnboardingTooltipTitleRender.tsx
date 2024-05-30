import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp'
import { Typography } from '@mui/material'
import Stack from '@mui/material/Stack'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { IOnBoardingSceneType } from '@/features/onboarding/types'

interface IOnboardingTooltipTitleRenderProps {
  sceneType: IOnBoardingSceneType
}

const OnboardingTooltipTitleRender: FC<IOnboardingTooltipTitleRenderProps> = ({
  sceneType,
}) => {
  const { t } = useTranslation()

  console.log(`FLOATING_CONTEXT_MENU_LIST_BOX`, sceneType)

  if (sceneType === 'CONTEXT_MENU_CTA_BUTTON') {
    return (
      <>
        {
          'Click to ask AI to rewrite, translate, summarize, or explain the selected text.'
        }
      </>
    )
  }
  if (sceneType === 'FLOATING_CONTEXT_MENU_INPUT_BOX') {
    return (
      <Stack>
        <Typography
          fontSize={14}
          lineHeight={1.5}
        >{`Type "make shorter" to quickly find this option.`}</Typography>
        <Typography
          fontSize={14}
          lineHeight={1.5}
        >{`You can also ask AI to perform any action on the selected text.`}</Typography>
      </Stack>
    )
  }

  if (sceneType === 'FLOATING_CONTEXT_MENU_LIST_BOX') {
    return (
      <Stack spacing={1.5}>
        <Stack direction={'row'} alignItems="center" spacing={0.5}>
          <Typography fontSize={14} lineHeight={1.5}>{`Hit`}</Typography>
          <ShortcutKeyBox>
            <ArrowDropDownIcon />
          </ShortcutKeyBox>
          <Typography fontSize={14} lineHeight={1.5}>
            {`to go down.`}
          </Typography>
        </Stack>
        <Stack direction={'row'} alignItems="center" spacing={0.5}>
          <Typography fontSize={14} lineHeight={1.5}>{`Hit`}</Typography>
          <ShortcutKeyBox>
            <ArrowDropUpIcon />
          </ShortcutKeyBox>
          <Typography fontSize={14} lineHeight={1.5}>
            {`to go up.`}
          </Typography>
        </Stack>
        <Stack direction={'row'} alignItems="center" spacing={0.5}>
          <Typography fontSize={14} lineHeight={1.5}>{`Hit`}</Typography>
          <ShortcutKeyBox name={'Enter'} />
          <Typography fontSize={14} lineHeight={1.5}>
            {`to select the option.`}
          </Typography>
        </Stack>
      </Stack>
    )
  }

  if (sceneType === 'FLOATING_CONTEXT_MENU_REPLACE_SELECTION_MENUITEM') {
    return <>{'Click to replace selected text with AI-generated content.'}</>
  }

  return (
    <>
      ERROR!! You need to provide some content for
      OnboardingTooltipTitleRender!!
    </>
  )
}

export default OnboardingTooltipTitleRender

// TODO: refine
const ShortcutKeyBox: FC<{
  name?: string
  children?: React.ReactNode
}> = ({ name, children }) => {
  return (
    <Stack
      direction={'row'}
      alignItems="center"
      justifyContent="center"
      sx={{
        bgcolor: '#FFFFFF33',
        border: '1px solid',
        borderColor: '#FFFFFF29',
        color: '#FFFFFF',
        px: children ? 0 : 0.5,
        fontSize: 12,
        lineHeight: 1.5,
        borderRadius: 1,
      }}
    >
      {children ?? name}
    </Stack>
  )
}
