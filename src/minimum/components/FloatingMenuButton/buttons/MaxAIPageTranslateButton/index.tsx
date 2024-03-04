import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import TranslateOutlinedIcon from '@mui/icons-material/TranslateOutlined'
import Badge, { badgeClasses, BadgeProps } from '@mui/material/Badge'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import { styled, SxProps } from '@mui/material/styles'
import debounce from 'lodash-es/debounce'
import React, { FC, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useRecoilState } from 'recoil'

import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import { useUserInfo } from '@/features/chatgpt'
import useEffectOnce from '@/features/common/hooks/useEffectOnce'
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
  onAdvancedOpen?: () => void
  onAdvancedClose?: () => void
}

const MaxAIPageTranslateButton: FC<IMaxAIPageTranslateButtonProps> = ({
  sx,
  onAdvancedClose,
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
  const firstLoading = useRef(true)
  const pageTranslatorRef = useRef(PageTranslator)

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

    pageTranslatorRef.current.toggle(newTranslationEnableValue)
    // set timeout 是为了等待 pageTranslator 设置 loading 状态
    // 只有第一次加载时才有延迟
    setTimeout(
      () => {
        setTranslationEnable(newTranslationEnableValue)
        if (firstLoading.current) {
          firstLoading.current = false
        }
      },
      firstLoading.current ? 600 : 0,
    )
  }

  const showTranslatedBadge = useMemo(() => {
    return (
      translationEnable &&
      document.querySelectorAll('maxai-trans:not(.maxai-trans-hide)').length > 0
    )
  }, [translationEnable])

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

  useEffectOnce(() => {
    pageTranslatorRef.current.setOnFetchingChange(debounce(setLoading, 400))
  })

  return (
    <Box
      sx={{
        position: 'relative',
        width: 32,
        height: 32,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          right: 0,
          width: showAdvancedButton ? 64 : 32,
          height: 32,
          overflow: 'hidden',
          borderRadius: '32px',
          p: '2px',
          boxSizing: 'border-box',
          boxShadow:
            '0px 0px 0.5px 0px rgba(0, 0, 0, 0.40), 0px 1px 3px 0px rgba(0, 0, 0, 0.09), 0px 4px 8px 0px rgba(0, 0, 0, 0.09)',
          bgcolor: 'background.paper',
          transition: 'width 0.3s',

          ...sx,
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            right: 0,
            width: 64,
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
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
          <TextOnlyTooltip
            arrow
            open={isHover}
            minimumTooltip
            title={
              translationEnable
                ? t('common:show_original_text')
                : t('common:web_translation')
            }
            placement={'left'}
          >
            <Box />
          </TextOnlyTooltip>
          <Stack
            direction="row"
            spacing={0.5}
            alignItems={'center'}
            justifyContent={'center'}
          >
            <PageTranslateAdvancedButton
              onOpen={() => {
                setAdvancedOpen(true)
              }}
              onClose={() => {
                setAdvancedOpen(false)
                setIsHover(false)

                onAdvancedClose && onAdvancedClose()
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
                    showTranslatedBadge ? (
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
          </Stack>
        </Box>
      </Box>
    </Box>
  )
}
export default MaxAIPageTranslateButton
