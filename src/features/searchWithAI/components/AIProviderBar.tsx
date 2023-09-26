import { getThirdProviderSettings } from '@/background/src/chat/util'
import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import PermissionWrapper from '@/features/auth/components/PermissionWrapper'

import {
  Box,
  ClickAwayListener,
  IconButton,
  Stack,
  SxProps,
  Tooltip,
  Typography,
} from '@mui/material'
import React, { useCallback, useEffect, useState } from 'react'
import { FC } from 'react'
import { useSetRecoilState } from 'recoil'
import { ISearchWithAIProviderType } from '../constants'
import SearchWithAIProviderOptions, {
  ISearchWithAIProviderOptionsType,
} from '../constants/searchWithAIProviderOptions'
import useSearchWithProvider from '../hooks/useSearchWithProvider'
import { AutoTriggerAskEnableAtom } from '../store'
import SearchWIthAIProviderIcon from './SearchWIthAIProviderIcon'

interface IProps {
  onProviderChange?: () => void
  isAnswering?: boolean
  sx?: SxProps
}

const AIProviderBar: FC<IProps> = ({ onProviderChange, isAnswering, sx }) => {
  // TODO: providerList 从 AIProviderOptions 配置中读取
  const providerList = SearchWithAIProviderOptions

  const setAutoTriggerAskEnable = useSetRecoilState(AutoTriggerAskEnableAtom)

  const {
    provider: currentProvider,
    updateChatGPTProvider,
    loading,
  } = useSearchWithProvider()

  console.log(`currentProvider`, currentProvider)

  const isProviderActive = (provider: ISearchWithAIProviderType) => {
    return currentProvider === provider
  }

  useEffect(() => {
    getThirdProviderSettings('OPENAI_API').then((settings) => {
      if (settings) {
        console.log(`OPENAI_API settings`, settings)
      }
    })
  }, [])

  const renderIcon = (
    provider: ISearchWithAIProviderOptionsType,
    rightBorder = false,
  ) => {
    const providerIcon = (
      <IconButton
        sx={{
          p: 1,
          borderRadius: 0,
          borderRight: rightBorder ? '1px solid rgba(0, 0, 0, 0.08)' : 'none',

          bgcolor: isProviderActive(provider.value)
            ? 'rgba(0, 0, 0, 0.12)'
            : 'transparent',
          // bgcolor: (t) =>
          //   isProviderActive(provider)
          //     ? t.palette.mode === 'dark'
          //       ? '#6a6a6a !important'
          //       : '#DADCE0 !important'
          //     : 'transparent',
          // filter: `grayscale(${isProviderActive(provider.value) ? '0' : '1'})`,
          // color: isProviderActive(provider.value)
          //   ? 'text.primary'
          //   : '#9E9E9E',
          '&.Mui-disabled': {
            cursor: 'not-allowed',
          },
        }}
        disabled={loading || isAnswering}
        onClick={() => {
          updateChatGPTProvider(provider.value)
          // 重置 auto trigger 状态
          setAutoTriggerAskEnable(true)
          onProviderChange && onProviderChange()
        }}
      >
        <SearchWIthAIProviderIcon
          aiProviderType={provider.value}
          isActive={isProviderActive(provider.value)}
        />

        {/* <AIProviderIcon
        aiProviderType={provider}
        active={isProviderActive(provider)}
        size={isProviderActive(provider) ? 32 : 24}
      ></AIProviderIcon> */}
      </IconButton>
    )

    if (provider.permission) {
      return (
        <PermissionWrapper
          TooltipProps={{
            placement: 'bottom',
            PopperProps: {
              disablePortal: true,
            },
          }}
          allowedRoles={provider.permission.allowedRoles}
          sceneType={provider.permission.sceneType}
        >
          {providerIcon}
        </PermissionWrapper>
      )
    }

    if (provider.preChangeChecker) {
      return (
        <PreChangeCheckerTooltip {...provider.preChangeChecker}>
          {providerIcon}
        </PreChangeCheckerTooltip>
      )
    }

    return providerIcon
  }

  return (
    <Stack
      direction="row"
      justifyContent="center"
      alignItems="center"
      sx={{
        borderRadius: 1,
        border: '1px solid rgba(0, 0, 0, 0.08)',
        width: 'max-content',
        mx: 'auto',
        overflow: 'hidden',
        ...sx,
      }}
    >
      {providerList.map((provider, index) => {
        return (
          <Tooltip
            PopperProps={{
              disablePortal: true,
            }}
            key={provider.value}
            title={<Typography fontSize={12}>{provider.label}</Typography>}
            placement="top"
          >
            <span>{renderIcon(provider, index < providerList.length - 1)}</span>
          </Tooltip>
        )
      })}
    </Stack>
  )
}

const PreChangeCheckerTooltip = (
  props: ISearchWithAIProviderOptionsType['preChangeChecker'] & {
    children: React.ReactNode
  },
) => {
  const [open, setOpen] = useState(false)

  const checkerFn = useCallback(async () => {
    if (props.checker) {
      return await props.checker()
    } else {
      return true
    }
  }, [props.checker])

  console.log(`PreChangeCheckerTooltip`, props)

  return (
    <TextOnlyTooltip
      arrow
      open={open}
      PopperProps={{
        disablePortal: true,
      }}
      placement="bottom"
      title={
        <ClickAwayListener
          mouseEvent={'onMouseDown'}
          onClickAway={() => {
            setOpen(false)
          }}
        >
          <Box>{props?.tooltip?.title}</Box>
        </ClickAwayListener>
      }
    >
      <Box>
        {
          React.Children.map(props.children, (child) => {
            // modify child props
            if (React.isValidElement(child)) {
              const newProps = {
                ...child.props,
                ...(child.props.onClick && {
                  onClick: async (event: any, ...args: any[]) => {
                    let isChecked = false
                    event?.stopPropagation?.()
                    event?.preventDefault?.()

                    if (await checkerFn()) {
                      isChecked = true
                    }

                    setOpen(!isChecked)
                    if (isChecked) {
                      child.props?.onClick?.(event, ...args)
                    }
                  },
                }),
              }
              return React.cloneElement(child, newProps)
            }
            return child
          }) as any
        }
      </Box>
    </TextOnlyTooltip>
  )
}

export default AIProviderBar
