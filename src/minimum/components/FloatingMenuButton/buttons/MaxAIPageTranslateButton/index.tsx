import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import TranslateOutlinedIcon from '@mui/icons-material/TranslateOutlined'
import Badge, { badgeClasses, BadgeProps } from '@mui/material/Badge'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import { styled, SxProps } from '@mui/material/styles'
import { random } from 'lodash-es'
import React, { FC, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useRecoilState } from 'recoil'

import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import { useUserInfo } from '@/features/chatgpt'
import PageTranslator from '@/features/pageTranslator/core'
import { pageTranslationEnableAtom } from '@/features/pageTranslator/store'
import { showChatBox } from '@/features/sidebar/utils/sidebarChatBoxHelper'
import PageTranslateAdvancedButton from '@/minimum/components/FloatingMenuButton/buttons/MaxAIPageTranslateButton/PageTranslateAdvancedButton'
import { useUserSettings } from '@/pages/settings/hooks/useUserSettings'

const CustomStyleBadge = styled(Badge)<BadgeProps>(({ theme }) => ({
  [`& .${badgeClasses.badge}`]: {
    right: 4,
    top: -5,
  },
}))

interface IMaxAIPageTranslateButtonProps {
  sx?: SxProps
}

const MaxAIPageTranslateButton: FC<IMaxAIPageTranslateButtonProps> = ({
  sx,
}) => {
  const { userInfo } = useUserInfo()
  const { t } = useTranslation(['common', 'client'])
  const { userSettings } = useUserSettings()

  const [isHover, setIsHover] = useState(false)

  const [translationEnable, setTranslationEnable] = useRecoilState(
    pageTranslationEnableAtom,
  )
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [firstLoading, setFirstLoading] = useState(true)
  const pageTranslatorRef = useRef(
    new PageTranslator(
      userSettings?.pageTranslation?.sourceLanguage,
      userSettings?.pageTranslation?.targetLanguage,
    ),
  )

  const showAdvancedButton = useMemo(() => isHover || advancedOpen, [
    isHover,
    advancedOpen,
  ])

  const isLogin = useMemo(() => !!userInfo, [userInfo])

  const toggleTranslation = async (flag?: boolean) => {
    if (!isLogin) {
      showChatBox()
      return
    }
    if (loading) {
      return
    }

    const newTranslationEnableValue = flag ?? !translationEnable

    if (newTranslationEnableValue && firstLoading) {
      // open translator
      setLoading(true)
      // only first time loading delay
      // fake loading delay
      setTimeout(
        () => {
          setTranslationEnable(newTranslationEnableValue)
          pageTranslatorRef.current.toggle(newTranslationEnableValue)
          setFirstLoading(false)
          setLoading(false)
        },
        newTranslationEnableValue ? random(300, 600) : 0,
      )
    } else {
      // close translator
      setTranslationEnable(newTranslationEnableValue)
      pageTranslatorRef.current.toggle(newTranslationEnableValue)
    }
  }

  useEffect(() => {
    if (!isLogin) {
      return
    }
    if (userSettings?.pageTranslation?.sourceLanguage) {
      pageTranslatorRef.current.updateFromCode(
        userSettings.pageTranslation.sourceLanguage,
      )
    }
  }, [userSettings?.pageTranslation?.sourceLanguage, isLogin])

  useEffect(() => {
    if (!isLogin) {
      return
    }
    if (userSettings?.pageTranslation?.targetLanguage) {
      pageTranslatorRef.current.updateToCode(
        userSettings.pageTranslation.targetLanguage,
      )
    }
  }, [userSettings?.pageTranslation?.targetLanguage, isLogin])

  return (
    <Box
      sx={{
        position: 'relative',
        bgcolor: 'background.paper',
        width: 32,
        height: showAdvancedButton ? '64px' : '32px',
        transition: 'height 0.3s',
        p: '2px',
        boxSizing: 'border-box',
        borderRadius: '32px',
        boxShadow:
          '0px 0px 0.5px 0px rgba(0, 0, 0, 0.40), 0px 1px 3px 0px rgba(0, 0, 0, 0.09), 0px 4px 8px 0px rgba(0, 0, 0, 0.09)',
        overflow: 'hidden',
        ...sx,
      }}
      onMouseEnter={() => {
        if (!isLogin) {
          return
        }
        setIsHover(true)
      }}
      onMouseLeave={() => {
        setIsHover(false)
      }}
    >
      <Stack
        sx={{
          position: 'absolute',
          top: '2px',
        }}
        spacing={0.5}
        alignItems={'center'}
        justifyContent={'center'}
      >
        <TextOnlyTooltip
          arrow
          minimumTooltip
          title={
            translationEnable
              ? t('common:show_original_text')
              : t('common:web_translation')
          }
          placement={'left'}
        >
          {loading ? (
            <Stack
              sx={{
                width: 28,
                height: 28,
                borderRadius: '50%',
              }}
              alignItems={'center'}
              justifyContent={'center'}
            >
              <CircularProgress size={20} sx={{ m: '0 auto' }} />
            </Stack>
          ) : (
            <Button
              sx={{
                position: 'relative',
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
              onClick={() => {
                toggleTranslation()
              }}
            >
              <CustomStyleBadge
                badgeContent={
                  translationEnable ? (
                    <CheckCircleIcon
                      sx={{
                        fontSize: 10,
                        color: 'rgba(52, 168, 83, 1)',
                        bgcolor: 'background.paper',
                        borderRadius: '50%',
                      }}
                    />
                  ) : null
                }
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
              >
                <TranslateOutlinedIcon
                  sx={{
                    fontSize: '20px',
                    color: 'inherit',
                  }}
                />
              </CustomStyleBadge>
            </Button>
          )}
        </TextOnlyTooltip>

        <PageTranslateAdvancedButton
          onOpen={() => {
            setAdvancedOpen(true)
          }}
          onClose={() => {
            setAdvancedOpen(false)
            setIsHover(false)
          }}
          onCodeChange={({ fromCode, toCode }) => {
            let isChange = false
            if (fromCode || fromCode === '') {
              isChange = true
              pageTranslatorRef.current.updateFromCode(fromCode)
            }
            if (toCode) {
              isChange = true
              pageTranslatorRef.current.updateToCode(toCode)
            }

            if (isChange) {
              pageTranslatorRef.current.retranslate()
              toggleTranslation(true)
            }
          }}
        />
      </Stack>
    </Box>
  )
}
export default MaxAIPageTranslateButton
