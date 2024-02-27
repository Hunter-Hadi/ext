import { Typography } from '@mui/material'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import { inputBaseClasses } from '@mui/material/InputBase'
import Popover from '@mui/material/Popover'
import Stack from '@mui/material/Stack'
import React, { FC, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import { IOptionType } from '@/components/select/BaseSelect'
import LanguageCodeSelect from '@/components/select/LanguageCodeSelect'
import { useUserSettings } from '@/pages/settings/hooks/useUserSettings'
import { getAppMinimizeContainerElement } from '@/utils'

interface IPageTranslateAdvancedButtonProps {
  onOpen?: () => void
  onClose?: () => void
  onCodeChange?: (data: { fromCode?: string; toCode?: string }) => void
}

const LanguageCodeDefaultOption = {
  label: 'Detected language',
  value: '',
}

const PageTranslateAdvancedButton: FC<IPageTranslateAdvancedButtonProps> = ({
  onOpen,
  onClose,
  onCodeChange,
}) => {
  const { t } = useTranslation(['client'])
  const { userSettings, setUserSettings } = useUserSettings()
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null)

  const open = Boolean(anchorEl)

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handlePopoverClose = () => {
    setAnchorEl(null)
  }

  const expandOptionsHandler = useCallback((originalOptions: IOptionType[]) => {
    return [LanguageCodeDefaultOption, ...originalOptions]
  }, [])

  useEffect(() => {
    if (open) {
      onOpen?.()
    } else {
      onClose?.()
    }
  }, [open])

  useEffect(() => {
    if (
      userSettings?.pageTranslation?.targetLanguage === '' ||
      userSettings?.pageTranslation?.targetLanguage === undefined
    ) {
      if (userSettings?.preferredLanguage) {
        setUserSettings({
          ...userSettings,
          pageTranslation: {
            ...userSettings?.pageTranslation,
            targetLanguage: userSettings?.preferredLanguage,
          },
        })
      }
    }
  }, [
    userSettings?.pageTranslation?.targetLanguage,
    userSettings?.preferredLanguage,
  ])

  return (
    <Box>
      <Button
        sx={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          minWidth: 'unset',
          display: 'flex',
          color: 'primary.main',
          '&:hover': {
            color: 'primary.main',
            bgcolor: (t) =>
              t.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.16)'
                : 'rgba(144, 101, 176, 0.16)',
          },
        }}
        onClick={handlePopoverOpen}
      >
        <ContextMenuIcon
          sx={{
            color: 'text.secondary',
            fontSize: '20px',
          }}
          icon={'Tune'}
        />
      </Button>
      <Popover
        open={open}
        anchorEl={anchorEl}
        id="mouse-over-popover"
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'center',
          horizontal: 'right',
        }}
        disableScrollLock
        PaperProps={{
          sx: {
            ml: '-3px',
          },
        }}
      >
        <ClickAwayListener
          onClickAway={(event) => {
            const MaxAIAIPageTranslateAdvancedCard = getAppMinimizeContainerElement()?.querySelector(
              '#MaxAIAIPageTranslateAdvancedCard',
            ) as HTMLElement
            if (MaxAIAIPageTranslateAdvancedCard) {
              const rect = MaxAIAIPageTranslateAdvancedCard.getBoundingClientRect()
              const x = (event as MouseEvent).clientX
              const y = (event as MouseEvent).clientY
              if (
                x > rect.left &&
                x < rect.right &&
                y > rect.top &&
                y < rect.bottom
              ) {
                // 点击在卡片内部
                return
              }
              handlePopoverClose()
            }
          }}
        >
          <Box
            id={'MaxAIAIPageTranslateAdvancedCard'}
            sx={{
              borderRadius: '4px',
              boxShadow: '0px 4px 8px 0px rgba(0, 0, 0, 0.16)',
              width: 320,
              display: 'flex',
              alignItems: 'stretch',
              justifyContent: 'center',
              flexDirection: 'row',
            }}
          >
            <Stack spacing={2} p={2} width={'100%'}>
              <Stack spacing={1}>
                <Typography fontSize={16} fontWeight={500}>
                  {t('client:translation_advanced__title')}
                </Typography>
                <Stack
                  direction={'row'}
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography fontSize={14} color="text.secondary">
                    {t(
                      'client:translation_advanced__source_lang_select__label',
                    )}
                    :
                  </Typography>
                  <LanguageCodeSelect
                    sx={{
                      flexShrink: 0,
                      width: 0,
                      flex: 1,
                      ml: 2,
                      fontSize: 14,
                      [`.${inputBaseClasses.root} > fieldset`]: {
                        borderWidth: 0,
                      },
                      [`.${inputBaseClasses.root} > input`]: {
                        textAlign: 'right',
                        cursor: 'pointer',
                      },
                    }}
                    label={''}
                    expandOptionsHandler={expandOptionsHandler}
                    defaultValue={userSettings?.pageTranslation?.sourceLanguage}
                    onChange={async (newLanguage) => {
                      await setUserSettings({
                        ...userSettings,
                        pageTranslation: {
                          ...userSettings?.pageTranslation,
                          sourceLanguage: newLanguage,
                        },
                      })
                      handlePopoverClose()
                      onCodeChange?.({
                        fromCode: newLanguage,
                        toCode: userSettings?.pageTranslation?.targetLanguage,
                      })
                    }}
                  />
                </Stack>
                <Stack
                  direction={'row'}
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography fontSize={14} color="text.secondary">
                    {t(
                      'client:translation_advanced__target_lang_select__label',
                    )}
                  </Typography>
                  <LanguageCodeSelect
                    sx={{
                      flexShrink: 0,
                      width: 0,
                      flex: 1,
                      ml: 2,
                      fontSize: 14,
                      [`.${inputBaseClasses.root} > fieldset`]: {
                        borderWidth: 0,
                      },
                      [`.${inputBaseClasses.root} > input`]: {
                        textAlign: 'right',
                        cursor: 'pointer',
                      },
                    }}
                    label={''}
                    // 没有选择 targetLanguage 时，用 preferredLanguage 做默认值
                    defaultValue={
                      userSettings?.pageTranslation?.targetLanguage ??
                      userSettings?.preferredLanguage
                    }
                    onChange={async (newLanguage) => {
                      await setUserSettings({
                        ...userSettings,
                        pageTranslation: {
                          ...userSettings?.pageTranslation,
                          targetLanguage: newLanguage,
                        },
                      })
                      handlePopoverClose()
                      onCodeChange?.({
                        fromCode: userSettings?.pageTranslation?.sourceLanguage,
                        toCode: newLanguage,
                      })
                    }}
                  />
                </Stack>
              </Stack>
            </Stack>
          </Box>
        </ClickAwayListener>
      </Popover>
    </Box>
  )
}

export default PageTranslateAdvancedButton
