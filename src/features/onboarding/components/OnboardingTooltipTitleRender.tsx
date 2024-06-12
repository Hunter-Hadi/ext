import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { IOnBoardingSceneType } from '@/features/onboarding/types'

interface IOnboardingTooltipTitleRenderProps {
  sceneType: IOnBoardingSceneType
}

const OnboardingTooltipTitleRender: FC<IOnboardingTooltipTitleRenderProps> = ({
  sceneType,
}) => {
  const { t } = useTranslation(['prompt', 'onboarding'])

  if (sceneType === 'FLOATING_CONTEXT_MENU_INPUT_BOX') {
    return (
      <Stack>
        <Typography fontSize={14} lineHeight={1.5}>
          {t(
            'onboarding:onboarding_tooltip__FLOATING_CONTEXT_MENU_INPUT_BOX__text1',
            {
              // Improve writing 的 i18n key
              // 这里的 improve writing 这个词，i18n的时候，有没有办法直接使用menu里的那个 Improve writing 的 i18n 的结果，
              // 这样能保证，tooltip里的 improve writing 的名字，和下拉菜单里的，一定是一样的，这样用户就一定能成功滤出来 - @huangsong
              KEY_TEXT: t('prompt:4e54395c-5e8b-4bbd-a309-b6057a4737d3'),
            },
          )}
        </Typography>
        <Typography fontSize={14} lineHeight={1.5}>
          {t(
            'onboarding:onboarding_tooltip__FLOATING_CONTEXT_MENU_INPUT_BOX__text2',
          )}
        </Typography>
      </Stack>
    )
  }

  if (sceneType === 'FLOATING_CONTEXT_MENU_LIST_BOX') {
    return (
      <Stack spacing={1.5}>
        <Stack direction={'row'} alignItems='center' spacing={0.5}>
          <Typography fontSize={14} lineHeight={1.5}>
            {t(
              'onboarding:onboarding_tooltip__FLOATING_CONTEXT_MENU_LIST_BOX__text1__part1',
            )}
          </Typography>
          <ShortcutKeyBox>
            <ArrowDropDownIcon />
          </ShortcutKeyBox>
          <Typography fontSize={14} lineHeight={1.5}>
            {t(
              'onboarding:onboarding_tooltip__FLOATING_CONTEXT_MENU_LIST_BOX__text1__part2',
            )}
          </Typography>
        </Stack>
        <Stack direction={'row'} alignItems='center' spacing={0.5}>
          <Typography fontSize={14} lineHeight={1.5}>
            {t(
              'onboarding:onboarding_tooltip__FLOATING_CONTEXT_MENU_LIST_BOX__text2__part1',
            )}
          </Typography>
          <ShortcutKeyBox>
            <ArrowDropUpIcon />
          </ShortcutKeyBox>
          <Typography fontSize={14} lineHeight={1.5}>
            {t(
              'onboarding:onboarding_tooltip__FLOATING_CONTEXT_MENU_LIST_BOX__text2__part2',
            )}
          </Typography>
        </Stack>
        <Stack direction={'row'} alignItems='center' spacing={0.5}>
          <Typography fontSize={14} lineHeight={1.5}>
            {t(
              'onboarding:onboarding_tooltip__FLOATING_CONTEXT_MENU_LIST_BOX__text3__part1',
            )}
          </Typography>
          <ShortcutKeyBox
            name={t(
              'onboarding:onboarding_tooltip__FLOATING_CONTEXT_MENU_LIST_BOX__text3__part2',
            )}
          />
          <Typography fontSize={14} lineHeight={1.5}>
            {t(
              'onboarding:onboarding_tooltip__FLOATING_CONTEXT_MENU_LIST_BOX__text3__part3',
            )}
          </Typography>
        </Stack>
      </Stack>
    )
  }

  if (sceneType === 'INSTANT_REPLY__GMAIL__COMPOSE_REPLY_BUTTON') {
    return (
      <>
        {t(
          'onboarding:onboarding_tooltip__INSTANT_REPLY__GMAIL__COMPOSE_REPLY_BUTTON__text',
        )}
      </>
    )
  }
  if (sceneType === 'INSTANT_REPLY__GMAIL__COMPOSE_NEW_BUTTON') {
    return (
      <>
        {t(
          'onboarding:onboarding_tooltip__INSTANT_REPLY__GMAIL__COMPOSE_NEW_BUTTON__text',
        )}
      </>
    )
  }

  return null
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
      alignItems='center'
      justifyContent='center'
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
