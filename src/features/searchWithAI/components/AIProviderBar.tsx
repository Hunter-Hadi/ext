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
import React, { useCallback, useState } from 'react'
import { FC } from 'react'
import { ISearchWithAIProviderType } from '../constants'
import SearchWithAIProviderOptions, {
  ISearchWithAIProviderOptionsType,
} from '../constants/searchWithAIProviderOptions'
import useSearchWithProvider from '../hooks/useSearchWithProvider'
import SearchWIthAIProviderIcon from './SearchWIthAIProviderIcon'

interface IProps {
  onProviderChange: () => void
  disabled?: boolean
  sx?: SxProps
}

const AIProviderBar: FC<IProps> = ({ onProviderChange, disabled, sx }) => {
  // TODO: providerList 从 AIProviderOptions 配置中读取
  const providerList = SearchWithAIProviderOptions

  const {
    provider: currentProvider,
    updateChatGPTProvider,
    loading,
  } = useSearchWithProvider()

  const isProviderActive = (provider: ISearchWithAIProviderType) => {
    return currentProvider === provider
  }

  const renderIcon = (
    provider: ISearchWithAIProviderOptionsType,
    rightBorder = false,
  ) => {
    const providerIcon = (
      <IconButton
        sx={{
          p: 1,
          borderRadius: 0,
          borderRight: rightBorder ? '1px solid' : 'none',
          borderColor: (t) =>
            t.palette.mode === 'dark'
              ? 'rgba(255, 255, 255, 0.08)'
              : 'rgba(0, 0, 0, 0.08)',

          bgcolor: (t) => {
            if (isProviderActive(provider.value)) {
              return t.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.23) !important'
                : 'rgba(0, 0, 0, 0.12) !important'
            } else {
              return 'transparent'
            }
          },

          '&.Mui-disabled': {
            cursor: 'not-allowed',
          },
        }}
        disabled={loading || disabled}
        onClick={async () => {
          await updateChatGPTProvider(provider.value)
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
        border: '1px solid',
        borderColor: (t) =>
          t.palette.mode === 'dark'
            ? 'rgba(255, 255, 255, 0.08)'
            : 'rgba(0, 0, 0, 0.08)',
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

  return (
    <TextOnlyTooltip
      // arrow
      open={open}
      PopperProps={{
        disablePortal: true,
        sx: {
          '& > div': {
            bgcolor: (t) => {
              if (t.palette.mode === 'dark') {
                return 'rgba(97, 97, 97, 0.9)'
              } else {
                return '#fff'
              }
            },
            boxShadow: (t) => t.shadows[1],
          },
        },
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
