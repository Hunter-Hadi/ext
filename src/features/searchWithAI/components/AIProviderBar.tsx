import { IAIProviderType } from '@/background/provider/chat'
import AIProviderIcon from '@/features/chatgpt/components/AIProviderSelectorCard/AIProviderIcon'
import AIProviderOptions from '@/features/chatgpt/components/AIProviderSelectorCard/AIProviderOptions'

import { IconButton, Stack, SxProps, Tooltip, Typography } from '@mui/material'
import React from 'react'
import { FC, useEffect } from 'react'
import { useSetRecoilState } from 'recoil'
import { AI_PROVIDER_NAME_MAP } from '../constants'
import useSearchWithProvider from '../hooks/useSearchWithProvider'
import { AutoTriggerAskEnableAtom } from '../store'

interface IProps {
  onProviderChange?: () => void
  isAnswering?: boolean
  sx?: SxProps
}

const AIProviderBar: FC<IProps> = ({ onProviderChange, isAnswering, sx }) => {
  // TODO: providerList 从 AIProviderOptions 配置中读取
  const providerList = AIProviderOptions

  const setAutoTriggerAskEnable = useSetRecoilState(AutoTriggerAskEnableAtom)

  const {
    provider: currentProvider,
    updateChatGPTProvider,
    loading,
  } = useSearchWithProvider()

  console.log(`currentProvider`, currentProvider)

  const isProviderActive = (provider: IAIProviderType) => {
    return currentProvider === provider
  }

  // useEffect(() => {
  //   // save provider
  //   if (currentProvider && !providerList.includes(currentProvider)) {
  //     updateChatGPTProvider(providerList[0])
  //     onProviderChange && onProviderChange()
  //   }
  // }, [currentProvider])

  return (
    <Stack
      direction="row"
      justifyContent="center"
      alignItems="center"
      py={1}
      spacing={1}
      sx={sx}
    >
      {providerList.map((provider) => {
        return (
          <Tooltip
            PopperProps={{
              disablePortal: true,
            }}
            key={provider.value}
            title={
              <Typography fontSize={12}>
                {AI_PROVIDER_NAME_MAP[provider.value]}
              </Typography>
            }
            placement="top"
          >
            <span>
              <IconButton
                sx={{
                  p: 0,
                  // p: isProviderActive(provider.value) ? 0 : 0.5,
                  borderRadius: 1,
                  // bgcolor: (t) =>
                  //   isProviderActive(provider)
                  //     ? t.palette.mode === 'dark'
                  //       ? '#6a6a6a !important'
                  //       : '#DADCE0 !important'
                  //     : 'transparent',
                  filter: `grayscale(${
                    isProviderActive(provider.value) ? '0' : '1'
                  })`,
                  color: isProviderActive(provider.value)
                    ? 'text.primary'
                    : '#9E9E9E',
                  // '&.Mui-disabled': {
                  //   cursor: 'not-allowed',
                  // },
                }}
                disabled={loading || isAnswering}
                onClick={() => {
                  updateChatGPTProvider(provider.value)
                  // 重置 auto trigger 状态
                  setAutoTriggerAskEnable(true)
                  onProviderChange && onProviderChange()
                }}
              >
                <AIProviderIcon aiProviderType={provider.value} />

                {/* <AIProviderIcon
                  aiProviderType={provider}
                  active={isProviderActive(provider)}
                  size={isProviderActive(provider) ? 32 : 24}
                ></AIProviderIcon> */}
              </IconButton>
            </span>
          </Tooltip>
        )
      })}
    </Stack>
  )
}

export default AIProviderBar
